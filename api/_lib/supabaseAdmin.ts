import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import type { ServerConfig } from './config.js';

/**
 * service_role 키를 사용하는 서버 전용 클라이언트.
 *
 * 이 키는 RLS를 우회하므로 브라우저로 절대 내려가면 안 된다. 오직 이
 * 서버리스 함수 안에서만 생성한다.
 *
 * PayPal 관련 값 없이 Supabase 자격 증명만 필요한 호출부(예: 만료 처리 cron)도
 * 쓸 수 있도록 ServerConfig 전체가 아니라 필요한 두 필드만 요구한다.
 */
export function createAdminClient(
  config: Pick<ServerConfig, 'supabaseUrl' | 'supabaseServiceRoleKey'>
): SupabaseClient {
  return createClient(config.supabaseUrl, config.supabaseServiceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

export interface AuthedUser {
  authUid: string;
  email: string;
}

/**
 * Authorization 헤더의 Supabase 액세스 토큰을 검증해 실제 로그인 사용자를
 * 확인한다. 클라이언트가 보내온 이메일/사용자 ID는 신뢰하지 않는다.
 */
export async function getAuthedUser(
  admin: SupabaseClient,
  authorizationHeader: string | undefined
): Promise<AuthedUser | null> {
  const token = authorizationHeader?.startsWith('Bearer ')
    ? authorizationHeader.slice('Bearer '.length).trim()
    : '';

  if (!token) return null;

  const { data, error } = await admin.auth.getUser(token);
  if (error || !data?.user?.email) return null;

  return { authUid: data.user.id, email: data.user.email };
}
