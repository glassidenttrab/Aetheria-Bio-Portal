export type PaidTier = 'pro' | 'enterprise';

export interface PriceSpec {
  /** PayPal에 전달/검증할 금액 문자열 (소수점 2자리 고정) */
  amount: string;
  currency: 'USD';
  /** 이 결제 1건으로 부여되는 이용 기간(일) */
  entitlementDays: number;
}

/**
 * 서버가 단독으로 신뢰하는 가격표.
 *
 * 클라이언트가 보내온 금액은 절대 사용하지 않는다. 클라이언트는 tier와
 * 결제주기만 보내고, 실제 청구 금액은 이 표에서 서버가 결정한 뒤 PayPal
 * 주문의 실제 금액과 일치하는지 대조한다.
 */
export const PRICE_TABLE: Record<PaidTier, Record<'monthly' | 'annual', PriceSpec>> = {
  pro: {
    monthly: { amount: '490.00', currency: 'USD', entitlementDays: 30 },
    annual: { amount: '4998.00', currency: 'USD', entitlementDays: 365 },
  },
  enterprise: {
    monthly: { amount: '2500.00', currency: 'USD', entitlementDays: 30 },
    annual: { amount: '25500.00', currency: 'USD', entitlementDays: 365 },
  },
};

/**
 * 플랜별 쿼터 상한. src/utils/quota.ts의 PLAN_QUOTA_CAP과 반드시 같아야 하며,
 * 두 값이 어긋나면 src/utils/quota.test.ts가 실패한다. 서버리스 함수 번들에
 * 프론트엔드 코드를 끌어오지 않으려고 의도적으로 값을 따로 둔다.
 */
export const SERVER_PLAN_QUOTA_CAP = { free: 3, pro: 30, enterprise: 500 } as const;

export function isPaidTier(value: unknown): value is PaidTier {
  return value === 'pro' || value === 'enterprise';
}

export function resolvePrice(tier: PaidTier, isAnnual: boolean): PriceSpec {
  return PRICE_TABLE[tier][isAnnual ? 'annual' : 'monthly'];
}

/** 문자열/숫자 금액을 센트 단위 정수로 바꿔 부동소수점 비교 오차를 없앤다. */
export function toCents(amount: string | number): number {
  return Math.round(Number(amount) * 100);
}

export interface ServerConfig {
  paypalApiBase: string;
  paypalClientId: string;
  paypalSecret: string;
  /** 설정 시 주문의 수취인(payee)이 본인 계정인지까지 검증한다. */
  paypalPayeeMerchantId: string | null;
  supabaseUrl: string;
  supabaseServiceRoleKey: string;
}

export type ConfigResult =
  | { ok: true; config: ServerConfig }
  | { ok: false; missing: string[] };

/** process.env와 호환되는 최소 형태. @types/node 없이 쓰려고 직접 정의한다. */
export type EnvSource = Record<string, string | undefined>;

/**
 * 서버 전용 환경변수를 읽는다. VITE_ 접두사가 붙은 값은 클라이언트 번들에
 * 그대로 노출되므로 시크릿 계열은 절대 VITE_ 이름을 쓰지 않는다.
 *
 * 이 파일은 테스트를 통해 프론트엔드 tsconfig로도 컴파일되므로 Node 전역
 * (process 등)을 참조하지 않고 env를 인자로만 받는다.
 */
export function readServerConfig(env: EnvSource): ConfigResult {
  const missing: string[] = [];

  const paypalClientId = env.PAYPAL_CLIENT_ID?.trim() || '';
  const paypalSecret = env.PAYPAL_SECRET_KEY?.trim() || '';
  const supabaseUrl = env.SUPABASE_URL?.trim() || '';
  const supabaseServiceRoleKey = env.SUPABASE_SERVICE_ROLE_KEY?.trim() || '';

  if (!paypalClientId) missing.push('PAYPAL_CLIENT_ID');
  if (!paypalSecret) missing.push('PAYPAL_SECRET_KEY');
  if (!supabaseUrl) missing.push('SUPABASE_URL');
  if (!supabaseServiceRoleKey) missing.push('SUPABASE_SERVICE_ROLE_KEY');

  if (missing.length > 0) {
    return { ok: false, missing };
  }

  const isLive = (env.PAYPAL_ENV?.trim().toLowerCase() || 'sandbox') === 'live';

  return {
    ok: true,
    config: {
      paypalApiBase: isLive ? 'https://api-m.paypal.com' : 'https://api-m.sandbox.paypal.com',
      paypalClientId,
      paypalSecret,
      paypalPayeeMerchantId: env.PAYPAL_PAYEE_MERCHANT_ID?.trim() || null,
      supabaseUrl,
      supabaseServiceRoleKey,
    },
  };
}
