-- ====================================================================
-- Aetheria Bio Portal - Supabase PostgreSQL Database Master Schema
-- Project Reference: egyvolruecjtmazwmqzn
-- URL: https://egyvolruecjtmazwmqzn.supabase.co
-- ====================================================================

-- 1. Enable UUID Extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Create 'users' Table (회원 계정 & 구독 프로필)
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  auth_uid VARCHAR(255) UNIQUE, -- Supabase Auth 세션의 auth.uid() (text)를 저장. RLS 본인 행 판별 기준.
  email VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(100) DEFAULT 'Dr. Seung-Woo Kim',
  institution VARCHAR(255) DEFAULT 'Aetheria BioTech Institute',
  title VARCHAR(100) DEFAULT 'Senior Principal Researcher',
  plan VARCHAR(20) DEFAULT 'free', -- 'free', 'pro', 'enterprise'
  queries_remaining INT DEFAULT 3,
  avatar_url TEXT,
  is_admin BOOLEAN DEFAULT FALSE, -- true인 계정은 RLS에서 전체 회원 데이터 접근 허용 (관리자 콘솔용)
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Create 'subscriptions' Table (결제 & 정기 구독 이력)
CREATE TABLE IF NOT EXISTS public.subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  stripe_customer_id VARCHAR(100),
  paypal_subscription_id VARCHAR(100),
  tier VARCHAR(20) NOT NULL, -- 'pro', 'enterprise'
  is_annual BOOLEAN DEFAULT FALSE,
  amount_usd NUMERIC(10, 2) NOT NULL,
  status VARCHAR(20) DEFAULT 'active', -- 'active', 'cancelled', 'expired'
  started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE
);

-- 4. Create 'api_keys' Table (B2B 제약사 전용 API Key & Rate Limit)
CREATE TABLE IF NOT EXISTS public.api_keys (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  company_name VARCHAR(150) NOT NULL,
  key_name VARCHAR(100) NOT NULL,
  api_key_hash VARCHAR(255) NOT NULL,
  rate_limit_per_min INT DEFAULT 1000,
  allowed_ip_range VARCHAR(100) DEFAULT '*',
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Create 'skill_audit_logs' Table (38개 바이오 스킬 실행 & 연구 보관함 로그)
CREATE TABLE IF NOT EXISTS public.skill_audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  skill_id VARCHAR(100) NOT NULL,
  skill_name VARCHAR(150) NOT NULL,
  category VARCHAR(100) NOT NULL,
  query_target VARCHAR(255) NOT NULL,
  execution_time_ms INT DEFAULT 120,
  is_bookmarked BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. Create 'target_vault' Table (마이페이지 관심 표적 보관함 — 계정별 북마크)
CREATE TABLE IF NOT EXISTS public.target_vault (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  target_key VARCHAR(100) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, target_key)
);
ALTER TABLE public.target_vault ENABLE ROW LEVEL SECURITY;
-- 신규 테이블이라 처음부터 본인 소유 행만 접근 가능하도록 하드닝된 정책으로 생성
-- (is_current_user_admin() 헬퍼 함수가 아직 없는 환경에서도 독립적으로 동작하도록 auth_uid를 직접 비교)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='target_vault') THEN
    CREATE POLICY "target_vault_own_rows_only" ON public.target_vault
      FOR ALL USING (
        user_id IN (SELECT id FROM public.users WHERE auth_uid = auth.uid()::text)
      )
      WITH CHECK (
        user_id IN (SELECT id FROM public.users WHERE auth_uid = auth.uid()::text)
      );
  END IF;
END $$;

-- 7. 이미 배포된 DB를 최신 스키마에 맞춰 재조정 (컬럼이 이미 있으면 건너뜀 — 몇 번을 다시 실행해도 안전)
--    2026-08-09 실사용 DB 점검 결과, 초기에 배포된 테이블이 이후 추가된 컬럼들을
--    전혀 반영하지 못한 채로 운영되고 있었음이 확인되어 전체 컬럼을 재점검함.
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS institution VARCHAR(255) DEFAULT 'Aetheria BioTech Institute';
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS title VARCHAR(100) DEFAULT 'Senior Principal Researcher';
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS avatar_url TEXT;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS is_admin BOOLEAN DEFAULT FALSE;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS auth_uid VARCHAR(255) UNIQUE;

ALTER TABLE public.subscriptions ADD COLUMN IF NOT EXISTS paypal_subscription_id VARCHAR(100);
ALTER TABLE public.subscriptions ADD COLUMN IF NOT EXISTS amount_usd NUMERIC(10, 2) DEFAULT 0;
ALTER TABLE public.subscriptions ADD COLUMN IF NOT EXISTS started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
ALTER TABLE public.subscriptions ADD COLUMN IF NOT EXISTS expires_at TIMESTAMP WITH TIME ZONE;

ALTER TABLE public.api_keys ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES public.users(id) ON DELETE CASCADE;
ALTER TABLE public.api_keys ADD COLUMN IF NOT EXISTS key_name VARCHAR(100) DEFAULT '';
ALTER TABLE public.api_keys ADD COLUMN IF NOT EXISTS allowed_ip_range VARCHAR(100) DEFAULT '*';
ALTER TABLE public.api_keys ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT TRUE;
-- 예전 배포본의 'rate_limit' 컬럼을 코드가 실제로 쓰는 'rate_limit_per_min'으로 이름 변경 (1회만 실행됨)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='api_keys' AND column_name='rate_limit')
     AND NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='api_keys' AND column_name='rate_limit_per_min') THEN
    ALTER TABLE public.api_keys RENAME COLUMN rate_limit TO rate_limit_per_min;
  END IF;
END $$;
ALTER TABLE public.api_keys ADD COLUMN IF NOT EXISTS rate_limit_per_min INT DEFAULT 1000;

ALTER TABLE public.skill_audit_logs ADD COLUMN IF NOT EXISTS skill_name VARCHAR(150) DEFAULT '';
ALTER TABLE public.skill_audit_logs ADD COLUMN IF NOT EXISTS category VARCHAR(100) DEFAULT '';
ALTER TABLE public.skill_audit_logs ADD COLUMN IF NOT EXISTS is_bookmarked BOOLEAN DEFAULT FALSE;

-- 8. Enable Row Level Security (RLS) for Security
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.api_keys ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.skill_audit_logs ENABLE ROW LEVEL SECURITY;

-- 9. RLS Policies — 신규 설치 시 최초 1회만 임시로 전면 공개 정책을 만든다.
--    실제 운영 중인 DB라면 이 블록은 건너뛰고 바로 rls_hardening_migration.sql을
--    적용할 것 (그 파일이 아래 정책들을 DROP하고 본인 행/관리자 기준 정책으로 교체한다).
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='users') THEN
    CREATE POLICY "Public Read/Write for Users" ON public.users FOR ALL USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='subscriptions') THEN
    CREATE POLICY "Public Read/Write for Subscriptions" ON public.subscriptions FOR ALL USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='api_keys') THEN
    CREATE POLICY "Public Read/Write for API Keys" ON public.api_keys FOR ALL USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='skill_audit_logs') THEN
    CREATE POLICY "Public Read/Write for Audit Logs" ON public.skill_audit_logs FOR ALL USING (true);
  END IF;
END $$;

-- 10. Insert Default Sample Data (테스트용 샘플 데이터)
INSERT INTO public.users (auth_uid, email, name, institution, title, plan, queries_remaining)
VALUES 
  ('user-001', 'scientist@aetheria.bio', 'Dr. Seung-Woo Kim', 'Aetheria BioTech Institute', 'Senior Principal Researcher', 'free', 3)
ON CONFLICT (email) DO NOTHING;
