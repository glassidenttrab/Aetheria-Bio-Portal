import { UserPlanTier } from '../types';

// 최종 확정 스펙: Free 일 3회 / Pro 월 30회 / Enterprise 월 500회
export const PLAN_QUOTA_CAP: Record<UserPlanTier, number> = {
  free: 3,
  pro: 30,
  enterprise: 500,
};

// Free는 일 단위, Pro/Enterprise는 월 단위로 쿼터가 초기화됨
function getPeriodKey(plan: UserPlanTier, date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  if (plan === 'free') {
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }
  return `${y}-${m}`;
}

function quotaPeriodStorageKey(email: string): string {
  return `aetheria_quota_period_${email || 'guest'}`;
}

/**
 * 로그인 계정(email) + 플랜 기준으로 현재 주기(일/월)가 바뀌었으면
 * 남은 횟수를 플랜 한도로 리셋해서 돌려준다. 브라우저 localStorage에
 * 마지막으로 리셋된 주기를 기록해두고 비교하는 방식이라 별도 DB 스키마
 * 변경 없이 기존 queries_remaining 컬럼만으로 동작한다.
 */
export function resolveQuota(
  email: string,
  plan: UserPlanTier,
  queriesRemaining: number
): { queriesRemaining: number; didReset: boolean } {
  try {
    const key = quotaPeriodStorageKey(email);
    const currentPeriod = getPeriodKey(plan, new Date());
    const storedPeriod = localStorage.getItem(key);
    if (storedPeriod !== currentPeriod) {
      localStorage.setItem(key, currentPeriod);
      return { queriesRemaining: PLAN_QUOTA_CAP[plan], didReset: true };
    }
    return { queriesRemaining, didReset: false };
  } catch {
    return { queriesRemaining, didReset: false };
  }
}
