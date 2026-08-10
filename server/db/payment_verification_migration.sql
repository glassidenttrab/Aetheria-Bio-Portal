-- =============================================================================
-- 결제 검증 서버 도입 마이그레이션 (2026-08-10)
--
-- 목적: "브라우저가 결제 성공을 주장하면 플랜이 올라가는" 구조를 끝낸다.
--       플랜 부여는 오직 서버(service_role)가 호출하는 apply_paid_subscription()
--       한 경로로만 가능해지고, 일반 사용자는 자신의 plan을 직접 바꿀 수 없게 된다.
--
-- 선행 조건:
--   1. server/db/schema.sql이 이미 적용되어 있을 것.
--   2. rls_hardening_migration.sql을 반드시 "먼저" 적용할 것.
--      이 파일은 컬럼 단위 보호를 담당하고 행 단위 접근 제어는 그쪽이 담당하며,
--      아래 트리거가 그쪽에서 만드는 is_current_user_admin() 함수를 사용한다.
--
-- 이 파일은 몇 번을 다시 실행해도 안전하다 (CREATE OR REPLACE / IF NOT EXISTS).
--
-- 적용 방법: Supabase 대시보드 > SQL Editor에 붙여넣고 실행.
-- 되돌리기: 파일 맨 아래 롤백 스니펫 참고.
-- =============================================================================

-- -----------------------------------------------------------------------------
-- 1. subscriptions 테이블에 결제 추적/멱등성 컬럼 추가
--
--    paypal_order_id에 UNIQUE를 걸어두면, 같은 주문으로 두 번 요청이 들어와도
--    두 번째 INSERT가 DB 레벨에서 거절되므로 중복 권한 부여가 원천 차단된다.
-- -----------------------------------------------------------------------------
ALTER TABLE public.subscriptions ADD COLUMN IF NOT EXISTS paypal_order_id VARCHAR(64);
ALTER TABLE public.subscriptions ADD COLUMN IF NOT EXISTS paypal_capture_id VARCHAR(64);
ALTER TABLE public.subscriptions ADD COLUMN IF NOT EXISTS expires_at TIMESTAMPTZ;

CREATE UNIQUE INDEX IF NOT EXISTS subscriptions_paypal_order_id_key
  ON public.subscriptions (paypal_order_id)
  WHERE paypal_order_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS subscriptions_user_id_idx ON public.subscriptions (user_id);
CREATE INDEX IF NOT EXISTS subscriptions_expires_at_idx ON public.subscriptions (expires_at);

-- -----------------------------------------------------------------------------
-- 2. plan / is_admin 컬럼을 서버 전용으로 잠근다
--
--    PostgREST는 요청 주체에 따라 anon / authenticated 역할로 실행되고,
--    service_role 키로 들어온 요청과 SECURITY DEFINER 함수 내부는 그렇지 않다.
--    그 차이를 이용해 "일반 사용자가 자기 plan을 직접 바꾸는 것"만 막는다.
--
--    ⚠️ 이 파일이 처음 작성됐을 때는 queries_remaining을 아직 잠그지 않았다(쿼터
--       차감이 클라이언트에서 일어났기 때문). 서버 쿼터가 도입된 뒤로는
--       server/db/quota_enforcement_migration.sql이 guard_entitlement_columns()를
--       재정의해 queries_remaining까지 잠근다 — 이 파일 다음에 반드시 적용할 것.
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.guard_entitlement_columns()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  -- 관리자는 예외로 둔다. 관리자 콘솔(SuperAdminDashboardModal)이 브라우저에서
  -- 회원 플랜을 직접 조정하는 기능을 쓰고 있어, 이걸 막으면 정상 운영 기능이
  -- 깨진다. is_current_user_admin()은 rls_hardening_migration.sql이 만든다.
  IF current_user IN ('anon', 'authenticated') AND NOT public.is_current_user_admin() THEN
    IF NEW.plan IS DISTINCT FROM OLD.plan THEN
      RAISE EXCEPTION 'plan은 결제 검증 서버만 변경할 수 있습니다'
        USING ERRCODE = 'insufficient_privilege';
    END IF;

    IF NEW.is_admin IS DISTINCT FROM OLD.is_admin THEN
      RAISE EXCEPTION 'is_admin은 클라이언트에서 변경할 수 없습니다'
        USING ERRCODE = 'insufficient_privilege';
    END IF;

    -- queries_remaining 잠금은 server/db/quota_enforcement_migration.sql이
    -- 이 함수를 CREATE OR REPLACE하면서 추가한다(이 파일만 적용한 시점에는 아직 잠기지 않음).
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS guard_entitlement_columns_trigger ON public.users;
CREATE TRIGGER guard_entitlement_columns_trigger
  BEFORE UPDATE ON public.users
  FOR EACH ROW
  EXECUTE FUNCTION public.guard_entitlement_columns();

-- -----------------------------------------------------------------------------
-- 3. 결제 반영 RPC (서버 전용)
--
--    사용자 행 갱신 + 구독 이력 기록을 한 트랜잭션에서 처리한다.
--    같은 주문이 이미 기록되어 있으면 아무것도 바꾸지 않고 기존 값을 돌려준다.
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.apply_paid_subscription(
  p_auth_uid          TEXT,
  p_email             TEXT,
  p_tier              TEXT,
  p_amount_usd        NUMERIC,
  p_is_annual         BOOLEAN,
  p_entitlement_days  INTEGER,
  p_quota_cap         INTEGER,
  p_paypal_order_id   TEXT,
  p_paypal_capture_id TEXT
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id    UUID;
  v_expires_at TIMESTAMPTZ;
  v_existing   public.subscriptions%ROWTYPE;
BEGIN
  IF p_tier NOT IN ('pro', 'enterprise') THEN
    RAISE EXCEPTION '허용되지 않은 요금제: %', p_tier;
  END IF;

  -- 이미 처리된 주문이면 그대로 반환 (멱등성)
  SELECT * INTO v_existing
  FROM public.subscriptions
  WHERE paypal_order_id = p_paypal_order_id;

  IF FOUND THEN
    RETURN json_build_object(
      'already_processed', true,
      'tier', v_existing.tier,
      'expires_at', v_existing.expires_at
    );
  END IF;

  -- 사용자 행 확보 (없으면 생성). 이메일이 아니라 auth_uid를 신원 기준으로 맞춘다.
  INSERT INTO public.users (auth_uid, email, plan, queries_remaining)
  VALUES (p_auth_uid, p_email, p_tier, p_quota_cap)
  ON CONFLICT (email) DO UPDATE
    SET plan              = EXCLUDED.plan,
        queries_remaining = EXCLUDED.queries_remaining,
        auth_uid          = COALESCE(public.users.auth_uid, EXCLUDED.auth_uid),
        updated_at        = NOW()
  RETURNING id INTO v_user_id;

  v_expires_at := NOW() + make_interval(days => p_entitlement_days);

  INSERT INTO public.subscriptions (
    user_id, tier, amount_usd, is_annual, status,
    started_at, expires_at, paypal_order_id, paypal_capture_id
  )
  VALUES (
    v_user_id, p_tier, p_amount_usd, p_is_annual, 'active',
    NOW(), v_expires_at, p_paypal_order_id, p_paypal_capture_id
  );

  RETURN json_build_object(
    'already_processed', false,
    'tier', p_tier,
    'expires_at', v_expires_at
  );
END;
$$;

-- 이 함수는 서버(service_role)만 호출할 수 있어야 한다.
REVOKE ALL ON FUNCTION public.apply_paid_subscription(
  TEXT, TEXT, TEXT, NUMERIC, BOOLEAN, INTEGER, INTEGER, TEXT, TEXT
) FROM PUBLIC, anon, authenticated;

GRANT EXECUTE ON FUNCTION public.apply_paid_subscription(
  TEXT, TEXT, TEXT, NUMERIC, BOOLEAN, INTEGER, INTEGER, TEXT, TEXT
) TO service_role;

-- -----------------------------------------------------------------------------
-- 4. 만료 처리
--
--    현재 결제는 1회 캡처이므로 자동 갱신이 없다. 따라서 기간이 지나면
--    반드시 권한을 회수해야 "한 번 결제 = 평생 이용"이 되지 않는다.
--
--    Supabase 대시보드 > Database > Cron 에서 하루 1회 실행하도록 등록할 것:
--      SELECT public.expire_stale_subscriptions();
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.expire_stale_subscriptions()
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_count INTEGER;
BEGIN
  WITH expired AS (
    UPDATE public.subscriptions
    SET status = 'expired'
    WHERE status = 'active'
      AND expires_at IS NOT NULL
      AND expires_at < NOW()
    RETURNING user_id
  ),
  -- 유효한 유료 구독이 하나도 남지 않은 사용자만 free로 되돌린다.
  downgraded AS (
    UPDATE public.users u
    SET plan = 'free', queries_remaining = 3, updated_at = NOW()
    WHERE u.id IN (SELECT user_id FROM expired WHERE user_id IS NOT NULL)
      AND NOT EXISTS (
        SELECT 1 FROM public.subscriptions s
        WHERE s.user_id = u.id
          AND s.status = 'active'
          AND (s.expires_at IS NULL OR s.expires_at > NOW())
      )
    RETURNING u.id
  )
  SELECT COUNT(*) INTO v_count FROM downgraded;

  RETURN v_count;
END;
$$;

REVOKE ALL ON FUNCTION public.expire_stale_subscriptions() FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.expire_stale_subscriptions() TO service_role;

-- =============================================================================
-- 적용 후 확인 쿼리
-- =============================================================================
-- 1) 전면 공개 정책이 남아 있지 않은지:
--    SELECT tablename, policyname, qual FROM pg_policies WHERE schemaname = 'public';
--
-- 2) 트리거가 실제로 막는지 (일반 사용자 세션에서 실행하면 예외가 발생해야 정상):
--    UPDATE public.users SET plan = 'enterprise' WHERE email = '본인이메일';
--
-- =============================================================================
-- 롤백
-- =============================================================================
-- DROP TRIGGER IF EXISTS guard_entitlement_columns_trigger ON public.users;
-- DROP FUNCTION IF EXISTS public.guard_entitlement_columns();
-- DROP FUNCTION IF EXISTS public.apply_paid_subscription(TEXT, TEXT, TEXT, NUMERIC, BOOLEAN, INTEGER, INTEGER, TEXT, TEXT);
-- DROP FUNCTION IF EXISTS public.expire_stale_subscriptions();
