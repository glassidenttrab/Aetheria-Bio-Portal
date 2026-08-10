import type { ServerConfig } from './config.js';

export interface PayPalAmount {
  currency_code?: string;
  value?: string;
}

export interface PayPalOrder {
  id: string;
  intent?: string;
  status?: string;
  purchase_units?: Array<{
    custom_id?: string;
    amount?: PayPalAmount;
    payee?: { merchant_id?: string; email_address?: string };
    payments?: {
      captures?: Array<{
        id: string;
        status?: string;
        amount?: PayPalAmount;
      }>;
    };
  }>;
}

export class PayPalError extends Error {
  readonly status: number;
  readonly detail: unknown;

  constructor(message: string, status: number, detail?: unknown) {
    super(message);
    this.name = 'PayPalError';
    this.status = status;
    this.detail = detail;
  }
}

async function readError(res: FetchLikeResponse): Promise<unknown> {
  try {
    return await res.json();
  } catch {
    return await res.text().catch(() => null);
  }
}

export async function getAccessToken(config: ServerConfig): Promise<string> {
  const basic = Buffer.from(`${config.paypalClientId}:${config.paypalSecret}`).toString('base64');
  const res = await fetch(`${config.paypalApiBase}/v1/oauth2/token`, {
    method: 'POST',
    headers: {
      Authorization: `Basic ${basic}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: 'grant_type=client_credentials',
  });

  if (!res.ok) {
    throw new PayPalError('PayPal 인증 토큰 발급 실패', res.status, await readError(res));
  }

  const data = (await res.json()) as { access_token?: string };
  if (!data.access_token) {
    throw new PayPalError('PayPal 응답에 access_token이 없음', 502, data);
  }
  return data.access_token;
}

export async function getOrder(
  config: ServerConfig,
  accessToken: string,
  orderId: string
): Promise<PayPalOrder> {
  const res = await fetch(`${config.paypalApiBase}/v2/checkout/orders/${encodeURIComponent(orderId)}`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (!res.ok) {
    throw new PayPalError('PayPal 주문 조회 실패', res.status, await readError(res));
  }
  return (await res.json()) as PayPalOrder;
}

/**
 * 주문을 서버에서 캡처한다.
 *
 * 캡처를 브라우저가 아니라 서버에서 수행해야, "결제가 실제로 승인되었다"는
 * 사실을 서버가 직접 확인한 뒤에만 권한을 부여할 수 있다. PayPal은 같은
 * 주문에 대한 중복 캡처를 ORDER_ALREADY_CAPTURED로 거절하므로, 이 경우는
 * 오류가 아니라 "이미 처리됨"으로 취급하고 호출부가 주문을 다시 조회한다.
 */
export async function captureOrder(
  config: ServerConfig,
  accessToken: string,
  orderId: string,
  idempotencyKey: string
): Promise<{ alreadyCaptured: boolean; order: PayPalOrder | null }> {
  const res = await fetch(
    `${config.paypalApiBase}/v2/checkout/orders/${encodeURIComponent(orderId)}/capture`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
        'PayPal-Request-Id': idempotencyKey,
      },
      body: '{}',
    }
  );

  if (res.ok) {
    return { alreadyCaptured: false, order: (await res.json()) as PayPalOrder };
  }

  const detail = await readError(res);
  if (res.status === 422 && JSON.stringify(detail).includes('ORDER_ALREADY_CAPTURED')) {
    return { alreadyCaptured: true, order: null };
  }

  throw new PayPalError('PayPal 결제 캡처 실패', res.status, detail);
}

/** 주문에서 완료된 캡처 1건을 찾아 반환한다. */
export function findCompletedCapture(order: PayPalOrder): {
  id: string;
  amount: PayPalAmount | undefined;
} | null {
  for (const unit of order.purchase_units || []) {
    for (const capture of unit.payments?.captures || []) {
      if (capture.status === 'COMPLETED') {
        return { id: capture.id, amount: capture.amount };
      }
    }
  }
  return null;
}
