-- =============================================================================
-- 서버 측 쿼터 집계 마이그레이션 (2026-08-10)
--
-- 목적: queries_remaining이 브라우저 localStorage(src/utils/quota.ts) 주기 판별에만
--       의존하지 않고, 로그인 계정 기준으로 서버에서 원자적으로 체크·차감되도록 한다.
--       기존에는 클라이언트가 "남은 횟수 - 1"을 스스로 계산해 그대로 DB에 써넣었기
--       때문에, 같은 계정으로 다른 브라우저/시크릿창에서 로그인하면 그 브라우저의
--       localStorage 리셋 기록이 없어 쿼터가 마치 새로 찬 것처럼 보이는 문제가 있었다
--       (SUBSCRIPTION_LAUNCH_RISK_REVIEW_2026-08-10.md 2.2 항목).
--
--       ⚠️ 익명 게스트(로그인하지 않은 방문자)의 무료 체험은 이 마이그레이션의 대상이
--       아니다. 계정이 없으면 서버에 귀속시킬 행 자체가 없기 때문에, 게스트는 지금처럼
--       브라우저 로컬 저장(src/utils/quota.ts의 resolveQuota)으로 남는다. 로그인한
--       계정(Free/Pro/Enterprise 전부 포함)만 이 마이그레이션이 적용된다.
--
-- 선행 조건:
--   1. rls_hardening_migration.sql 적용 완료 (is_current_user_admin() 재사용).
--   2. payment_verification_migration.sql 적용 완료 (guard_entitlement_columns()
--      트리거를 여기서 재정의해 queries_remaining 잠금을 마저 활성화한다).
--
-- 이 파일은 몇 번을 다시 실행해도 안전하다 (CREATE OR REPLACE / IF NOT EXISTS).
-- 적용 방법: Supabase 대시보드 > SQL Editor에 붙여넣고 실행.
-- =============================================================================

-- -----------------------------------------------------------------------------
-- 1. 마지막으로 쿼터가 리셋된 주기를 기록하는 컬럼
--    Free는 'YYYY-MM-DD'(일 단위), Pro/Enterprise는 'YYYY-MM'(월 단위) 문자열을 저장.
-- -----------------------------------------------------------------------------
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS quota_period_key VARCHAR(10);

-- -----------------------------------------------------------------------------
-- 2. 요금제별 한도.
--    ⚠️ src/utils/quota.ts의 PLAN_QUOTA_CAP, api/_lib/config.ts의
--    SERVER_PLAN_QUOTA_CAP과 반드시 같은 값으로 유지할 것 (free 3 / pro 30 / enterprise 500).
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.plan_quota_cap(p_plan TEXT)
RETURNS INT
LANGUAGE sql
IMMUTABLE
AS $$
  SELECT CASE p_plan
    WHEN 'pro' THEN 30
    WHEN 'enterprise' THEN 500
    ELSE 3 -- free 및 알 수 없는 값은 안전하게 free 취급
  END;
$$;

-- 현재 시각 기준 주기 키. Free=일 단위, Pro/Enterprise=월 단위.
CREATE OR REPLACE FUNCTION public.current_quota_period_key(p_plan TEXT)
RETURNS TEXT
LANGUAGE sql
STABLE
AS $$
  SELECT CASE WHEN p_plan = 'free'
    THEN to_char(NOW(), 'YYYY-MM-DD')
    ELSE to_char(NOW(), 'YYYY-MM')
  END;
$$;

-- -----------------------------------------------------------------------------
-- 3. 조회 전용 — 주기가 바뀌었으면 리셋까지 반영한 뒤 현재 상태를 반환한다(차감 없음).
--    화면 마운트/플랜 변경 시 정확한 잔여 횟수를 표시하기 위해 쓴다.
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.get_quota_status()
RETURNS TABLE(plan TEXT, queries_remaining INT, quota_cap INT)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user   public.users%ROWTYPE;
  v_period TEXT;
  v_cap    INT;
BEGIN
  SELECT * INTO v_user FROM public.users WHERE auth_uid = auth.uid()::text FOR UPDATE;
  IF NOT FOUND THEN
    RAISE EXCEPTION '로그인한 사용자를 찾을 수 없습니다' USING ERRCODE = 'insufficient_privilege';
  END IF;

  v_cap := public.plan_quota_cap(v_user.plan);
  v_period := public.current_quota_period_key(v_user.plan);

  IF v_user.quota_period_key IS DISTINCT FROM v_period THEN
    UPDATE public.users
      SET queries_remaining = v_cap, quota_period_key = v_period, updated_at = NOW()
      WHERE id = v_user.id
      RETURNING * INTO v_user;
  END IF;

  -- public.users.plan은 VARCHAR(20)이라 RETURNS TABLE의 TEXT 컬럼과 타입이 정확히
  -- 일치하지 않으면 "structure of query does not match function result type"
  -- (42804) 오류가 난다. RETURN QUERY는 SELECT와 달리 varchar→text 암묵적 캐스팅을
  -- 해주지 않으므로 명시적으로 캐스팅한다.
  RETURN QUERY SELECT v_user.plan::TEXT, v_user.queries_remaining, v_cap;
END;
$$;

-- -----------------------------------------------------------------------------
-- 4. 실제 소비 — 위와 같은 리셋 로직을 적용한 뒤, 남은 횟수가 있으면 1 차감한다.
--    같은 행을 FOR UPDATE로 잠그고 처리하므로 동시 요청이 들어와도 이중 차감이
--    일어나지 않는다. 한도 소진 시에는 예외를 던지지 않고 success:false로 반환한다
--    (클라이언트가 업그레이드 안내 UX를 보여줄 수 있도록).
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.consume_quota()
RETURNS TABLE(success BOOLEAN, plan TEXT, queries_remaining INT, quota_cap INT)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user   public.users%ROWTYPE;
  v_period TEXT;
  v_cap    INT;
BEGIN
  SELECT * INTO v_user FROM public.users WHERE auth_uid = auth.uid()::text FOR UPDATE;
  IF NOT FOUND THEN
    RAISE EXCEPTION '로그인한 사용자를 찾을 수 없습니다' USING ERRCODE = 'insufficient_privilege';
  END IF;

  v_cap := public.plan_quota_cap(v_user.plan);
  v_period := public.current_quota_period_key(v_user.plan);

  IF v_user.quota_period_key IS DISTINCT FROM v_period THEN
    UPDATE public.users
      SET queries_remaining = v_cap, quota_period_key = v_period, updated_at = NOW()
      WHERE id = v_user.id
      RETURNING * INTO v_user;
  END IF;

  IF v_user.queries_remaining <= 0 THEN
    RETURN QUERY SELECT false, v_user.plan::TEXT, v_user.queries_remaining, v_cap;
    RETURN;
  END IF;

  UPDATE public.users
    SET queries_remaining = queries_remaining - 1, updated_at = NOW()
    WHERE id = v_user.id
    RETURNING * INTO v_user;

  RETURN QUERY SELECT true, v_user.plan::TEXT, v_user.queries_remaining, v_cap;
END;
$$;

-- 로그인한 사용자만 호출 가능(익명 anon 키는 auth.uid()가 NULL이라 위에서 예외 발생).
REVOKE ALL ON FUNCTION public.get_quota_status() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_quota_status() TO authenticated;

REVOKE ALL ON FUNCTION public.consume_quota() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.consume_quota() TO authenticated;

-- -----------------------------------------------------------------------------
-- 5. queries_remaining을 서버 전용으로 잠근다.
--    payment_verification_migration.sql에 "서버 쿼터 도입 후 활성화할 것"으로 남겨둔
--    주석 블록을 여기서 실제로 켠다. guard_entitlement_columns_trigger는 이미 그
--    마이그레이션에서 걸려 있으므로 함수만 CREATE OR REPLACE하면 된다(재부착 불필요).
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.guard_entitlement_columns()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  -- 관리자와 SECURITY DEFINER 함수(apply_paid_subscription, consume_quota 등) 내부는
  -- current_user가 'anon'/'authenticated'가 아니므로 아래 검사를 그대로 통과한다.
  IF current_user IN ('anon', 'authenticated') AND NOT public.is_current_user_admin() THEN
    IF NEW.plan IS DISTINCT FROM OLD.plan THEN
      RAISE EXCEPTION 'plan은 결제 검증 서버만 변경할 수 있습니다'
        USING ERRCODE = 'insufficient_privilege';
    END IF;

    IF NEW.is_admin IS DISTINCT FROM OLD.is_admin THEN
      RAISE EXCEPTION 'is_admin은 클라이언트에서 변경할 수 없습니다'
        USING ERRCODE = 'insufficient_privilege';
    END IF;

    IF NEW.queries_remaining IS DISTINCT FROM OLD.queries_remaining THEN
      RAISE EXCEPTION 'queries_remaining은 get_quota_status()/consume_quota() RPC를 통해서만 변경할 수 있습니다'
        USING ERRCODE = 'insufficient_privilege';
    END IF;
  END IF;

  RETURN NEW;
END;
$$;

-- ====================================================================
-- 적용 결과 확인 — 로그인 세션(예: 대시보드 SQL Editor가 아니라 실제 클라이언트)에서
-- 아래 두 함수를 호출해 정상적으로 상태가 반환되는지 확인할 것.
-- ====================================================================
-- SELECT * FROM public.get_quota_status();
-- SELECT * FROM public.consume_quota();

-- ====================================================================
-- 롤백: 문제가 생기면 queries_remaining 잠금만 다시 풀 수 있다(함수/컬럼은 남겨도 무해).
-- ====================================================================
-- CREATE OR REPLACE FUNCTION public.guard_entitlement_columns()
-- RETURNS TRIGGER LANGUAGE plpgsql AS $$
-- BEGIN
--   IF current_user IN ('anon', 'authenticated') AND NOT public.is_current_user_admin() THEN
--     IF NEW.plan IS DISTINCT FROM OLD.plan THEN
--       RAISE EXCEPTION 'plan은 결제 검증 서버만 변경할 수 있습니다' USING ERRCODE = 'insufficient_privilege';
--     END IF;
--     IF NEW.is_admin IS DISTINCT FROM OLD.is_admin THEN
--       RAISE EXCEPTION 'is_admin은 클라이언트에서 변경할 수 없습니다' USING ERRCODE = 'insufficient_privilege';
--     END IF;
--   END IF;
--   RETURN NEW;
-- END;
-- $$;
