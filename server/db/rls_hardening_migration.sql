-- ====================================================================
-- Aetheria Bio Portal - RLS Hardening Migration (Phase 0 후속 / Phase 1 선행)
-- 작성일: 2026-08-09
--
-- ⚠️ 실행 전 필독:
-- 현재 schema.sql의 정책은 4개 테이블 모두 `USING (true)`로 사실상 전체 공개다.
-- 이 파일은 "이상적인 목표 상태"의 auth.uid() 기반 정책을 정의하지만,
-- 지금 이 파일을 그대로 실행하면 앱이 즉시 망가진다. 이유:
--
--   이 앱은 로그인을 Firebase Auth로 처리하고, Supabase는 그냥
--   anon key로만 REST 호출한다 (Supabase Auth 세션이 없음).
--   즉 지금은 요청에 Supabase가 이해하는 auth.uid()/auth.jwt()가 전혀 없다.
--   그 상태에서 정책을 auth.jwt() 기준으로 바꾸면 모든 요청이 거부되어
--   로그인/마이페이지/결제 등 전 기능이 즉시 중단된다.
--
-- ✅ 이 마이그레이션을 안전하게 적용하려면 아래 두 가지를 먼저 해야 한다:
--   1. Supabase 대시보드 → Authentication → Sign In / Providers →
--      Third Party Auth 에서 Firebase를 연동 등록한다.
--      (Supabase가 Firebase가 발급한 ID Token을 검증할 수 있게 됨)
--   2. src/lib/supabase.ts의 createClient 옵션에
--      `accessToken: () => auth.currentUser?.getIdToken() ?? null` 를 추가해서
--      매 요청마다 로그인된 Firebase 사용자의 ID Token을 Supabase에 실어 보내도록
--      코드를 수정한다.
--
-- 위 두 단계가 준비되면 이 파일을 Supabase SQL Editor에서 실행할 것.
-- 준비되기 전까지는 참고용 문서로만 보관.
-- ====================================================================

-- 1. 기존의 전면 공개 정책 제거
DROP POLICY IF EXISTS "Public Read/Write for Users" ON public.users;
DROP POLICY IF EXISTS "Public Read/Write for Subscriptions" ON public.subscriptions;
DROP POLICY IF EXISTS "Public Read/Write for API Keys" ON public.api_keys;
DROP POLICY IF EXISTS "Public Read/Write for Audit Logs" ON public.skill_audit_logs;

-- 2. users: 회원가입(INSERT)은 누구나, 이후 조회/수정은 본인 행만
CREATE POLICY "users_insert_signup" ON public.users
  FOR INSERT WITH CHECK (true);

CREATE POLICY "users_select_own" ON public.users
  FOR SELECT USING (auth.jwt() ->> 'sub' = auth_uid);

CREATE POLICY "users_update_own" ON public.users
  FOR UPDATE USING (auth.jwt() ->> 'sub' = auth_uid);

-- 3. subscriptions: 본인 구독 이력만 조회, 결제 완료 시 서버(또는 본인)만 기록
CREATE POLICY "subscriptions_select_own" ON public.subscriptions
  FOR SELECT USING (
    user_id IN (SELECT id FROM public.users WHERE auth_uid = auth.jwt() ->> 'sub')
  );

CREATE POLICY "subscriptions_insert_own" ON public.subscriptions
  FOR INSERT WITH CHECK (
    user_id IN (SELECT id FROM public.users WHERE auth_uid = auth.jwt() ->> 'sub')
  );

-- 4. api_keys / skill_audit_logs:
--    ⚠️ 관리자 콘솔(SuperAdminDashboardModal)이 여전히 anon key로 전체 회원의
--    api_keys/skill_audit_logs를 조회하므로, 이 두 테이블에 본인-행 제한을 걸면
--    관리자 콘솔이 깨진다. 진짜 해결책은 관리자 조회를 서버(service_role)
--    경유로 옮기는 것 (Phase 1 백엔드 구축 시 처리). 그 전까지는 최소한
--    "로그인한 사용자만" 접근 가능하도록만 제한 (완전 비로그인 익명 접근 차단).
CREATE POLICY "api_keys_authenticated_only" ON public.api_keys
  FOR ALL USING (auth.jwt() ->> 'sub' IS NOT NULL);

CREATE POLICY "skill_audit_logs_authenticated_only" ON public.skill_audit_logs
  FOR ALL USING (auth.jwt() ->> 'sub' IS NOT NULL);
