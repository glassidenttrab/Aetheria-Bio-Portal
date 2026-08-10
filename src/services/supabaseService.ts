import { supabase } from '../lib/supabase';
import { UserProfile, UserPlanTier } from '../types';
import { PLAN_QUOTA_CAP } from '../utils/quota';

export interface SkillAuditLogItem {
  id?: string;
  user_id?: string;
  skill_id: string;
  skill_name: string;
  category: string;
  query_target: string;
  execution_time_ms?: number;
  is_bookmarked?: boolean;
  created_at?: string;
}

export interface ApiKeyItem {
  id?: string;
  company_name: string;
  key_name: string;
  api_key_hash: string;
  rate_limit_per_min?: number;
  allowed_ip_range?: string;
  is_active?: boolean;
}

/**
 * 1. Fetch User Profile from Supabase DB
 *
 * 진짜로 프로필이 없는 경우(PGRST116: 0 rows)에만 null을 반환한다.
 * 그 외의 오류(네트워크, RLS 권한 거부 등)는 그대로 throw해서, 호출부가
 * "신규 가입자"로 오판해 기존 프로필을 빈 값으로 덮어쓰는 사고를 방지한다.
 */
export async function fetchUserProfileDB(email: string): Promise<UserProfile | null> {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('email', email)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      return null; // 실제로 해당 이메일의 행이 없는 경우
    }
    throw error; // 네트워크/권한 등 다른 오류는 호출부가 처리하도록 전파
  }
  if (!data) return null;

  return {
    id: data.id,
    name: data.name,
    email: data.email,
    plan: data.plan as UserPlanTier,
    institution: data.institution,
    title: data.title,
    queriesRemaining: data.queries_remaining,
  };
}

/**
 * 2. Upsert User Profile to Supabase DB
 *
 * 호출부가 실제로 넘겨준 필드만 upsert 대상에 포함한다. 예전에는 넘기지
 * 않은 필드까지 항상 기본값(plan은 'free', queries_remaining은 3 등)으로
 * 채워서 매번 전체 행을 덮어썼기 때문에, 예를 들어 쿼터만 갱신하려고
 * queriesRemaining 하나만 넘긴 호출이 plan을 조용히 'free'로 되돌려버리는
 * 사고(결제 직후 플랜이 다시 free로 리셋됨)가 있었다. 신규 가입으로 행이
 * 아예 없을 때는 DB 컬럼 자체의 DEFAULT 값(schema.sql 참고)이 적용된다.
 */
export async function upsertUserProfileDB(profile: Partial<UserProfile> & { email: string; authUid?: string }): Promise<UserProfile | null> {
  try {
    const upsertPayload: Record<string, unknown> = {
      email: profile.email,
      updated_at: new Date().toISOString(),
    };
    if (profile.name !== undefined) upsertPayload.name = profile.name;
    if (profile.institution !== undefined) upsertPayload.institution = profile.institution;
    if (profile.title !== undefined) upsertPayload.title = profile.title;
    if (profile.plan !== undefined) upsertPayload.plan = profile.plan;
    if (profile.queriesRemaining !== undefined) upsertPayload.queries_remaining = profile.queriesRemaining;
    if (profile.authUid) upsertPayload.auth_uid = profile.authUid;

    const { data, error } = await supabase
      .from('users')
      .upsert(upsertPayload, { onConflict: 'email' })
      .select()
      .single();

    if (error || !data) {
      console.warn('Supabase DB upsert notice:', error);
      return null;
    }

    return {
      id: data.id,
      name: data.name,
      email: data.email,
      plan: data.plan as UserPlanTier,
      institution: data.institution,
      title: data.title,
      queriesRemaining: data.queries_remaining,
    };
  } catch (err) {
    console.warn('Supabase DB upsert exception:', err);
    return null;
  }
}

export interface QuotaStatus {
  plan: UserPlanTier;
  queriesRemaining: number;
  quotaCap: number;
}

/**
 * 2-1. 로그인한 사용자의 현재 쿼터 상태를 서버에서 조회한다(주기가 바뀌었으면
 * 서버가 리셋까지 반영). 차감은 하지 않는다 — 화면 마운트/플랜 변경 시 정확한
 * 잔여 횟수를 표시하기 위해 쓴다. server/db/quota_enforcement_migration.sql의
 * get_quota_status() RPC를 호출한다.
 */
interface QuotaStatusRpcRow {
  plan: string;
  queries_remaining: number;
  quota_cap: number;
}

export async function getQuotaStatusDB(): Promise<QuotaStatus | null> {
  try {
    const { data, error } = await supabase.rpc('get_quota_status').single<QuotaStatusRpcRow>();
    if (error || !data) {
      console.warn('Supabase get_quota_status notice:', error);
      return null;
    }
    return {
      plan: data.plan as UserPlanTier,
      queriesRemaining: data.queries_remaining,
      quotaCap: data.quota_cap,
    };
  } catch (err) {
    console.warn('Supabase get_quota_status exception:', err);
    return null;
  }
}

/**
 * 2-2. 로그인한 사용자의 쿼터를 서버에서 원자적으로 체크·차감한다(consume_quota()
 * RPC). 한도 소진 시 success:false와 함께 현재 상태를 그대로 반환하며, 이 경우는
 * 예외가 아니라 정상 응답이다. 네트워크/권한 오류일 때만 null을 반환한다.
 */
interface ConsumeQuotaRpcRow extends QuotaStatusRpcRow {
  success: boolean;
}

export async function consumeQuotaDB(): Promise<{ success: boolean; status: QuotaStatus } | null> {
  try {
    const { data, error } = await supabase.rpc('consume_quota').single<ConsumeQuotaRpcRow>();
    if (error || !data) {
      console.warn('Supabase consume_quota notice:', error);
      return null;
    }
    return {
      success: data.success,
      status: {
        plan: data.plan as UserPlanTier,
        queriesRemaining: data.queries_remaining,
        quotaCap: data.quota_cap,
      },
    };
  } catch (err) {
    console.warn('Supabase consume_quota exception:', err);
    return null;
  }
}

/**
 * 3. Save Skill Query Audit Log / Bookmark to Supabase DB
 *
 * user_id를 채우지 않고 insert하면, RLS 하드닝(skill_audit_logs_own_or_admin)이
 * 적용된 상태에서는 USING 절의 user_id IN (...) 조건이 NULL과 절대 매치되지
 * 않아 insert 자체가 조용히 실패한다(에러는 console.warn으로만 삼켜짐). 그래서
 * 호출부가 로그인한 사용자의 users.id를 반드시 함께 넘기도록 한다.
 */
export async function saveSkillAuditLogDB(logItem: SkillAuditLogItem): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('skill_audit_logs')
      .insert({
        user_id: logItem.user_id,
        skill_id: logItem.skill_id,
        skill_name: logItem.skill_name,
        category: logItem.category,
        query_target: logItem.query_target,
        execution_time_ms: logItem.execution_time_ms || 120,
        is_bookmarked: logItem.is_bookmarked ?? true,
      });

    if (error) {
      console.warn('Supabase log insert notice:', error);
      return false;
    }
    return true;
  } catch (err) {
    console.warn('Supabase log insert exception:', err);
    return false;
  }
}

/**
 * 4. Fetch User Skill Audit Logs / Bookmarks
 */
export async function fetchSkillAuditLogsDB(): Promise<SkillAuditLogItem[]> {
  try {
    const { data, error } = await supabase
      .from('skill_audit_logs')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(50);

    if (error || !data) return [];
    return data as SkillAuditLogItem[];
  } catch (err) {
    console.warn('Supabase log fetch exception:', err);
    return [];
  }
}

/**
 * 5. (제거됨) 클라이언트에서의 구독 기록 / 플랜 변경
 *
 * 예전 recordSubscriptionDB는 브라우저에서 직접 users.plan을 올리고
 * subscriptions 행을 넣었다. 결제 사실을 서버가 전혀 확인하지 않았기 때문에
 * 결제 없이 상위 플랜을 취득할 수 있었고, user_id 없이 insert하는 탓에 RLS를
 * 조이는 순간 결제 이력이 조용히 저장되지 않는 문제도 있었다.
 *
 * 이제 이 역할은 서버가 담당한다.
 *   - 엔드포인트: api/paypal/capture-order.ts
 *   - DB 함수:   server/db/payment_verification_migration.sql 의
 *                apply_paid_subscription()
 * 클라이언트에서는 src/services/paymentService.ts를 사용할 것.
 */

/**
 * 6. Fetch API Keys from Supabase DB
 */
export async function fetchApiKeysDB(): Promise<ApiKeyItem[]> {
  try {
    const { data, error } = await supabase
      .from('api_keys')
      .select('*')
      .order('created_at', { ascending: false });

    if (error || !data) return [];
    return data as ApiKeyItem[];
  } catch (err) {
    console.warn('Supabase api_keys fetch notice:', err);
    return [];
  }
}

/**
 * 7. Create API Key in Supabase DB
 */
export async function createApiKeyDB(keyItem: ApiKeyItem): Promise<ApiKeyItem | null> {
  try {
    const { data, error } = await supabase
      .from('api_keys')
      .insert({
        company_name: keyItem.company_name,
        key_name: keyItem.key_name,
        api_key_hash: keyItem.api_key_hash,
        rate_limit_per_min: keyItem.rate_limit_per_min || 1000,
        allowed_ip_range: keyItem.allowed_ip_range || '*',
        is_active: true
      })
      .select()
      .single();

    if (error || !data) {
      console.warn('Supabase api_keys insert notice:', error);
      return null;
    }
    return data as ApiKeyItem;
  } catch (err) {
    console.warn('Supabase api_keys insert exception:', err);
    return null;
  }
}

/**
 * 8. Delete API Key from Supabase DB
 */
export async function deleteApiKeyDB(id: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('api_keys')
      .delete()
      .eq('id', id);

    return !error;
  } catch (err) {
    console.warn('Supabase api_keys delete exception:', err);
    return false;
  }
}

export interface SubscriptionItem {
  id?: string;
  user_id?: string;
  stripe_customer_id?: string;
  tier: string;
  is_annual?: boolean;
  amount_usd: number;
  status: string;
  started_at?: string;
  expires_at?: string;
}

/**
 * 9. Fetch Subscriptions Payment History from Supabase DB
 */
export async function fetchSubscriptionsDB(): Promise<SubscriptionItem[]> {
  try {
    const { data, error } = await supabase
      .from('subscriptions')
      .select('*')
      .order('started_at', { ascending: false });

    if (error || !data) return [];
    return data as SubscriptionItem[];
  } catch (err) {
    console.warn('Supabase subscriptions fetch notice:', err);
    return [];
  }
}

export interface TargetVaultItem {
  id?: string;
  user_id?: string;
  target_key: string;
  created_at?: string;
}

/**
 * 10. Fetch the logged-in user's saved target vault (bookmarks) from Supabase DB
 */
export async function fetchTargetVaultDB(): Promise<TargetVaultItem[]> {
  try {
    const { data, error } = await supabase
      .from('target_vault')
      .select('*')
      .order('created_at', { ascending: false });

    if (error || !data) return [];
    return data as TargetVaultItem[];
  } catch (err) {
    console.warn('Supabase target_vault fetch exception:', err);
    return [];
  }
}

/**
 * 11. Add a target to the logged-in user's vault (no-op if already saved)
 */
export async function addTargetVaultItemDB(userId: string, targetKey: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('target_vault')
      .upsert({ user_id: userId, target_key: targetKey }, { onConflict: 'user_id,target_key', ignoreDuplicates: true });

    if (error) {
      console.warn('Supabase target_vault insert notice:', error);
      return false;
    }
    return true;
  } catch (err) {
    console.warn('Supabase target_vault insert exception:', err);
    return false;
  }
}

/**
 * 12. Remove a target from the logged-in user's vault
 */
export async function removeTargetVaultItemDB(userId: string, targetKey: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('target_vault')
      .delete()
      .eq('user_id', userId)
      .eq('target_key', targetKey);

    return !error;
  } catch (err) {
    console.warn('Supabase target_vault delete exception:', err);
    return false;
  }
}

