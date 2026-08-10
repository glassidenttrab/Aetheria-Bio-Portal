-- ====================================================================
-- Aetheria Bio Portal - RLS Hardening Migration (Supabase Auth 기준)
-- 작성일: 2026-08-09 (Firebase → Supabase Auth 전환 이후 재작성)
--
-- ⚠️ 실행 전 필독 — 아래 3가지가 먼저 끝나 있어야 한다:
--   1. 앱 코드가 Firebase Auth가 아닌 Supabase Auth로 로그인/회원가입을
--      처리하도록 이미 전환되어 있어야 한다 (src/contexts/AuthContext.tsx).
--   2. Supabase 대시보드 → Authentication → Providers → Google 에서
--      Google 로그인이 활성화되어 있어야 한다 (기존 .env의
--      VITE_GOOGLE_CLIENT_ID / Client Secret을 그대로 붙여넣으면 됨,
--      새 OAuth 앱을 만들 필요 없음).
--   3. server/db/schema.sql을 다시 실행해 users 테이블에 is_admin 컬럼이
--      추가되어 있어야 한다.
--
-- 위 조건이 갖춰지면, 로그인된 모든 요청에 Supabase 세션의 auth.uid()가
-- supabase-js에 의해 자동으로 실려오므로, 별도의 JWT 브릿지 코드 없이
-- 아래 정책이 바로 작동한다.
-- ====================================================================

-- 1. 관리자 여부 판별 헬퍼 함수
--    SECURITY DEFINER로 선언해 RLS를 우회하여 "나 자신의 is_admin 값"을
--    조회할 수 있게 한다 (그렇지 않으면 정책이 자기 자신을 참조하며 순환됨).
CREATE OR REPLACE FUNCTION public.is_current_user_admin()
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT COALESCE(
    (SELECT is_admin FROM public.users WHERE auth_uid = auth.uid()::text),
    false
  );
$$;

-- 2. 기존 정책 제거
--    전면 공개 정책뿐 아니라 이 파일이 만드는 정책들도 함께 DROP한다.
--    PostgreSQL에는 CREATE POLICY IF NOT EXISTS가 없어서, 이렇게 먼저
--    지워두지 않으면 두 번째 실행부터 42710(already exists)으로 실패한다.
DROP POLICY IF EXISTS "Public Read/Write for Users" ON public.users;
DROP POLICY IF EXISTS "Public Read/Write for Subscriptions" ON public.subscriptions;
DROP POLICY IF EXISTS "Public Read/Write for API Keys" ON public.api_keys;
DROP POLICY IF EXISTS "Public Read/Write for Audit Logs" ON public.skill_audit_logs;

DROP POLICY IF EXISTS "users_insert_signup" ON public.users;
DROP POLICY IF EXISTS "users_select_own_or_admin" ON public.users;
DROP POLICY IF EXISTS "users_update_own_or_admin" ON public.users;
DROP POLICY IF EXISTS "subscriptions_select_own_or_admin" ON public.subscriptions;
DROP POLICY IF EXISTS "subscriptions_insert_own_or_admin" ON public.subscriptions;
DROP POLICY IF EXISTS "api_keys_own_or_admin" ON public.api_keys;
DROP POLICY IF EXISTS "skill_audit_logs_own_or_admin" ON public.skill_audit_logs;

-- 3. users: 회원가입(INSERT)은 누구나, 조회는 본인 행 또는 관리자만.
--    수정은 본인 행 또는 관리자만 가능하되, WITH CHECK로 "본인이 스스로
--    is_admin을 true로 바꾸는 권한 상승"만은 명시적으로 차단한다.
CREATE POLICY "users_insert_signup" ON public.users
  FOR INSERT WITH CHECK (true);

CREATE POLICY "users_select_own_or_admin" ON public.users
  FOR SELECT USING (auth_uid = auth.uid()::text OR public.is_current_user_admin());

CREATE POLICY "users_update_own_or_admin" ON public.users
  FOR UPDATE
  USING (auth_uid = auth.uid()::text OR public.is_current_user_admin())
  WITH CHECK (
    (auth_uid = auth.uid()::text AND is_admin = false)
    OR public.is_current_user_admin()
  );

-- 4. subscriptions: 본인 구독 이력 또는 관리자만 조회/기록.
--    ⚠️ 중요: 아래 INSERT 정책은 user_id가 채워진 행만 통과시킨다. 예전
--    클라이언트 코드(recordSubscriptionDB)는 user_id 없이 insert했기 때문에,
--    이 정책이 적용된 뒤로는 결제 이력이 조용히 저장되지 않았을 수 있다.
--    그래서 이 파일은 반드시 payment_verification_migration.sql과 함께
--    적용해야 한다. 그쪽에서 서버(service_role)가 user_id를 채워 기록하는
--    apply_paid_subscription() 경로를 만들고, users.plan을 클라이언트가
--    직접 바꾸지 못하도록 컬럼 단위로 잠근다.
CREATE POLICY "subscriptions_select_own_or_admin" ON public.subscriptions
  FOR SELECT USING (
    public.is_current_user_admin()
    OR user_id IN (SELECT id FROM public.users WHERE auth_uid = auth.uid()::text)
  );

CREATE POLICY "subscriptions_insert_own_or_admin" ON public.subscriptions
  FOR INSERT WITH CHECK (
    public.is_current_user_admin()
    OR user_id IN (SELECT id FROM public.users WHERE auth_uid = auth.uid()::text)
  );

-- 5. api_keys / skill_audit_logs: 본인 소유 행 또는 관리자만 전체 CRUD 허용
CREATE POLICY "api_keys_own_or_admin" ON public.api_keys
  FOR ALL USING (
    public.is_current_user_admin()
    OR user_id IN (SELECT id FROM public.users WHERE auth_uid = auth.uid()::text)
  );

CREATE POLICY "skill_audit_logs_own_or_admin" ON public.skill_audit_logs
  FOR ALL USING (
    public.is_current_user_admin()
    OR user_id IN (SELECT id FROM public.users WHERE auth_uid = auth.uid()::text)
  );

-- 6. 본인 계정을 관리자로 지정 (이메일을 실제 값으로 바꾼 뒤 이 한 줄만 별도 실행)
-- UPDATE public.users SET is_admin = true WHERE email = 'your-email@example.com';

-- ====================================================================
-- 적용 결과 확인 — 실행 후 아래 쿼리로 현재 정책 목록을 눈으로 확인할 것.
-- qual 컬럼에 "true"만 있는 행(전면 공개)이 남아 있으면 안 된다.
-- ====================================================================
-- SELECT tablename, policyname, cmd, qual, with_check
--   FROM pg_policies
--  WHERE schemaname = 'public'
--  ORDER BY tablename, policyname;

-- ====================================================================
-- 롤백: 적용 후 문제가 생기면 아래 주석을 해제해서 실행 — 원래의
-- 전면 공개 정책(USING (true))으로 즉시 되돌릴 수 있다.
-- ====================================================================
-- DROP POLICY IF EXISTS "users_insert_signup" ON public.users;
-- DROP POLICY IF EXISTS "users_select_own_or_admin" ON public.users;
-- DROP POLICY IF EXISTS "users_update_own_or_admin" ON public.users;
-- DROP POLICY IF EXISTS "subscriptions_select_own_or_admin" ON public.subscriptions;
-- DROP POLICY IF EXISTS "subscriptions_insert_own_or_admin" ON public.subscriptions;
-- DROP POLICY IF EXISTS "api_keys_own_or_admin" ON public.api_keys;
-- DROP POLICY IF EXISTS "skill_audit_logs_own_or_admin" ON public.skill_audit_logs;
-- CREATE POLICY "Public Read/Write for Users" ON public.users FOR ALL USING (true);
-- CREATE POLICY "Public Read/Write for Subscriptions" ON public.subscriptions FOR ALL USING (true);
-- CREATE POLICY "Public Read/Write for API Keys" ON public.api_keys FOR ALL USING (true);
-- CREATE POLICY "Public Read/Write for Audit Logs" ON public.skill_audit_logs FOR ALL USING (true);
