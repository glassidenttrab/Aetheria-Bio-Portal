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
 */
export async function upsertUserProfileDB(profile: Partial<UserProfile> & { email: string; authUid?: string }): Promise<UserProfile | null> {
  try {
    const upsertPayload: Record<string, unknown> = {
      email: profile.email,
      name: profile.name || '',
      institution: profile.institution || '',
      title: profile.title || '',
      plan: profile.plan || 'free',
      queries_remaining: profile.queriesRemaining ?? 3,
      updated_at: new Date().toISOString(),
    };
    if (profile.authUid) {
      upsertPayload.auth_uid = profile.authUid;
    }

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

/**
 * 3. Save Skill Query Audit Log / Bookmark to Supabase DB
 */
export async function saveSkillAuditLogDB(logItem: SkillAuditLogItem): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('skill_audit_logs')
      .insert({
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
 * 5. Record Subscription Payment History in Supabase DB
 */
export async function recordSubscriptionDB(sub: {
  email: string;
  tier: UserPlanTier;
  amountUSD: number;
  isAnnual?: boolean;
  stripeCustomerId?: string;
}): Promise<boolean> {
  try {
    // Update user plan in DB
    await upsertUserProfileDB({ email: sub.email, plan: sub.tier, queriesRemaining: PLAN_QUOTA_CAP[sub.tier] });

    // Insert Subscription record
    const { error } = await supabase
      .from('subscriptions')
      .insert({
        tier: sub.tier,
        amount_usd: sub.amountUSD,
        is_annual: sub.isAnnual || false,
        stripe_customer_id: sub.stripeCustomerId || `CUST-PAYPAL-${Date.now()}`,
        status: 'active',
        started_at: new Date().toISOString(),
      });

    return !error;
  } catch (err) {
    console.warn('Supabase subscription record exception:', err);
    return false;
  }
}

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

