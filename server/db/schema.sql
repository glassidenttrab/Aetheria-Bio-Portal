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

-- 이미 배포된 DB에 스키마를 다시 적용하는 경우를 위한 안전한 컬럼 추가 (신규 설치에는 영향 없음)
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS is_admin BOOLEAN DEFAULT FALSE;

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

-- 6. Enable Row Level Security (RLS) for Security
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.api_keys ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.skill_audit_logs ENABLE ROW LEVEL SECURITY;

-- 7. RLS Policies (Allow public/auth users to access data)
CREATE POLICY "Public Read/Write for Users" ON public.users FOR ALL USING (true);
CREATE POLICY "Public Read/Write for Subscriptions" ON public.subscriptions FOR ALL USING (true);
CREATE POLICY "Public Read/Write for API Keys" ON public.api_keys FOR ALL USING (true);
CREATE POLICY "Public Read/Write for Audit Logs" ON public.skill_audit_logs FOR ALL USING (true);

-- 8. Insert Default Sample Data (테스트용 샘플 데이터)
INSERT INTO public.users (auth_uid, email, name, institution, title, plan, queries_remaining)
VALUES 
  ('user-001', 'scientist@aetheria.bio', 'Dr. Seung-Woo Kim', 'Aetheria BioTech Institute', 'Senior Principal Researcher', 'free', 3)
ON CONFLICT (email) DO NOTHING;
