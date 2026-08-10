import { supabase } from '../lib/supabase';
import { UserPlanTier } from '../types';

export interface VerifiedPaymentResult {
  alreadyProcessed: boolean;
  plan: Exclude<UserPlanTier, 'free'>;
  queriesRemaining: number;
  amountUSD: number;
  isAnnual: boolean;
  expiresAt: string | null;
  transactionId: string;
}

export class PaymentVerificationError extends Error {
  readonly code: string;

  constructor(code: string, message: string) {
    super(message);
    this.name = 'PaymentVerificationError';
    this.code = code;
  }
}

/**
 * PayPal 주문을 서버에서 캡처·검증하고 그 결과로 플랜을 부여받는다.
 *
 * 예전에는 브라우저가 직접 캡처한 뒤 스스로 plan을 올렸기 때문에, 결제 없이도
 * 상위 플랜을 취득할 수 있었다. 이제 브라우저는 orderId만 서버로 넘기고,
 * 실제 승인 여부·금액 일치·권한 부여는 전부 서버가 판단한다. 따라서 이
 * 함수가 성공을 반환하기 전까지는 어떤 화면도 유료 상태로 바꾸면 안 된다.
 */
export async function captureAndVerifyPayPalOrder(params: {
  orderId: string;
  tier: Exclude<UserPlanTier, 'free'>;
  isAnnual: boolean;
}): Promise<VerifiedPaymentResult> {
  const { data: sessionData } = await supabase.auth.getSession();
  const accessToken = sessionData.session?.access_token;

  if (!accessToken) {
    throw new PaymentVerificationError('unauthorized', '로그인 세션이 만료되었습니다. 다시 로그인해 주세요.');
  }

  let response: Response;
  try {
    response = await fetch('/api/paypal/capture-order', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({
        orderId: params.orderId,
        tier: params.tier,
        isAnnual: params.isAnnual,
      }),
    });
  } catch {
    throw new PaymentVerificationError(
      'network_error',
      '결제 검증 서버에 연결하지 못했습니다. 결제가 승인되었다면 고객지원에 문의해 주세요.'
    );
  }

  const payload = await response.json().catch(() => null);

  if (!response.ok) {
    const code = (payload as { error?: string } | null)?.error || 'verification_failed';
    const message =
      (payload as { message?: string } | null)?.message ||
      '결제 검증에 실패했습니다. 고객지원에 문의해 주세요.';
    throw new PaymentVerificationError(code, message);
  }

  return payload as VerifiedPaymentResult;
}
