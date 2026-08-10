import { headerValue, type ApiRequest, type ApiResponse } from '../_lib/http.js';
import {
  isPaidTier,
  readServerConfig,
  resolvePrice,
  toCents,
  SERVER_PLAN_QUOTA_CAP,
} from '../_lib/config.js';
import {
  captureOrder,
  findCompletedCapture,
  getAccessToken,
  getOrder,
  PayPalError,
} from '../_lib/paypal.js';
import { createAdminClient, getAuthedUser } from '../_lib/supabaseAdmin.js';

/**
 * POST /api/paypal/capture-order
 *
 * 브라우저가 결제 성공을 "주장"하면 플랜을 올려주던 기존 구조를 대체한다.
 * 이 엔드포인트는 다음을 서버에서 직접 확인한 뒤에만 권한을 부여한다.
 *
 *  1. 요청자가 실제로 로그인한 사용자인가 (Supabase 액세스 토큰 검증)
 *  2. PayPal 주문이 실재하고 승인 상태인가
 *  3. 주문 금액/통화가 서버 가격표와 일치하는가 (클라이언트 금액은 무시)
 *  4. (설정 시) 수취인이 우리 판매자 계정인가
 *  5. 캡처가 실제로 COMPLETED로 완료되었는가
 *
 * 권한 부여는 service_role로 실행되는 RPC 한 번에 원자적으로 처리하며,
 * paypal_order_id UNIQUE 제약으로 같은 주문이 두 번 적용되지 않게 한다.
 */
export default async function handler(req: ApiRequest, res: ApiResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'method_not_allowed' });
  }

  const configResult = readServerConfig(process.env);
  if (!configResult.ok) {
    // 아직 키가 준비되지 않은 상태에서는 "검증 없이 통과"시키지 않고 명확히 실패시킨다.
    return res.status(503).json({
      error: 'payment_verification_unconfigured',
      message: '결제 검증 서버가 아직 구성되지 않았습니다. 관리자에게 문의해 주세요.',
      missing: configResult.missing,
    });
  }
  const { config } = configResult;

  const body = (typeof req.body === 'string' ? safeParse(req.body) : req.body) as
    | { orderId?: unknown; tier?: unknown; isAnnual?: unknown }
    | undefined;

  const orderId = typeof body?.orderId === 'string' ? body.orderId.trim() : '';
  const tier = body?.tier;
  const isAnnual = body?.isAnnual === true;

  if (!orderId || !isPaidTier(tier)) {
    return res.status(400).json({ error: 'invalid_request', message: 'orderId와 tier가 필요합니다.' });
  }

  const admin = createAdminClient(config);

  const authedUser = await getAuthedUser(admin, headerValue(req.headers.authorization));
  if (!authedUser) {
    return res.status(401).json({
      error: 'unauthorized',
      message: '로그인 후 결제를 진행해 주세요.',
    });
  }

  const expected = resolvePrice(tier, isAnnual);

  try {
    // 같은 주문이 이미 적용되었으면 결제를 다시 캡처하지 않고 기존 결과를 그대로 돌려준다.
    const { data: existing } = await admin
      .from('subscriptions')
      .select('tier, amount_usd, is_annual, expires_at, paypal_capture_id')
      .eq('paypal_order_id', orderId)
      .maybeSingle();

    if (existing) {
      return res.status(200).json({
        alreadyProcessed: true,
        plan: existing.tier,
        queriesRemaining: SERVER_PLAN_QUOTA_CAP[existing.tier as 'pro' | 'enterprise'],
        amountUSD: Number(existing.amount_usd),
        isAnnual: Boolean(existing.is_annual),
        expiresAt: existing.expires_at,
        transactionId: existing.paypal_capture_id || orderId,
      });
    }

    const accessToken = await getAccessToken(config);
    const order = await getOrder(config, accessToken, orderId);

    const unit = order.purchase_units?.[0];
    const orderAmount = unit?.amount;

    if (toCents(orderAmount?.value ?? '0') !== toCents(expected.amount)) {
      return res.status(409).json({
        error: 'amount_mismatch',
        message: '주문 금액이 요금제 가격과 일치하지 않습니다.',
      });
    }
    if ((orderAmount?.currency_code || '') !== expected.currency) {
      return res.status(409).json({ error: 'currency_mismatch', message: '결제 통화가 올바르지 않습니다.' });
    }
    if (config.paypalPayeeMerchantId && unit?.payee?.merchant_id !== config.paypalPayeeMerchantId) {
      return res.status(409).json({ error: 'payee_mismatch', message: '수취인 계정이 올바르지 않습니다.' });
    }
    if (order.status !== 'APPROVED' && order.status !== 'COMPLETED') {
      return res.status(409).json({
        error: 'order_not_approved',
        message: `결제가 승인되지 않은 주문입니다 (status: ${order.status ?? 'unknown'}).`,
      });
    }

    let capturedOrder = order;
    if (order.status === 'APPROVED') {
      const result = await captureOrder(config, accessToken, orderId, `aetheria-${orderId}`);
      capturedOrder = result.order ?? (await getOrder(config, accessToken, orderId));
    }

    const capture = findCompletedCapture(capturedOrder);
    if (!capture) {
      return res.status(409).json({
        error: 'capture_not_completed',
        message: '결제 캡처가 완료되지 않았습니다.',
      });
    }
    // 캡처된 실제 금액도 다시 대조한다 (주문 조회 이후 변경 가능성 차단).
    if (toCents(capture.amount?.value ?? '0') !== toCents(expected.amount)) {
      return res.status(409).json({
        error: 'captured_amount_mismatch',
        message: '실제 승인 금액이 요금제 가격과 일치하지 않습니다.',
      });
    }

    const { data: applied, error: applyError } = await admin.rpc('apply_paid_subscription', {
      p_auth_uid: authedUser.authUid,
      p_email: authedUser.email,
      p_tier: tier,
      p_amount_usd: Number(expected.amount),
      p_is_annual: isAnnual,
      p_entitlement_days: expected.entitlementDays,
      p_quota_cap: SERVER_PLAN_QUOTA_CAP[tier],
      p_paypal_order_id: orderId,
      p_paypal_capture_id: capture.id,
    });

    if (applyError) {
      // 결제는 성사됐는데 권한 반영에 실패한 상태이므로 반드시 로그로 남겨 수동 보정이 가능해야 한다.
      console.error('[capture-order] 권한 반영 실패', {
        orderId,
        captureId: capture.id,
        email: authedUser.email,
        error: applyError,
      });
      return res.status(500).json({
        error: 'entitlement_apply_failed',
        message: '결제는 완료되었으나 플랜 반영에 실패했습니다. 고객지원에 문의해 주세요.',
        transactionId: capture.id,
      });
    }

    return res.status(200).json({
      alreadyProcessed: false,
      plan: tier,
      queriesRemaining: SERVER_PLAN_QUOTA_CAP[tier],
      amountUSD: Number(expected.amount),
      isAnnual,
      expiresAt: (applied as { expires_at?: string } | null)?.expires_at ?? null,
      transactionId: capture.id,
    });
  } catch (err) {
    if (err instanceof PayPalError) {
      console.error('[capture-order] PayPal 오류', { orderId, status: err.status, detail: err.detail });
      return res.status(502).json({ error: 'paypal_error', message: err.message });
    }
    console.error('[capture-order] 예기치 못한 오류', err);
    return res.status(500).json({ error: 'internal_error', message: '결제 처리 중 오류가 발생했습니다.' });
  }
}

function safeParse(value: string): unknown {
  try {
    return JSON.parse(value);
  } catch {
    return undefined;
  }
}
