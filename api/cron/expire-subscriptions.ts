import { headerValue, type ApiRequest, type ApiResponse } from '../_lib/http.js';
import { createAdminClient } from '../_lib/supabaseAdmin.js';

/**
 * GET /api/cron/expire-subscriptions
 *
 * vercel.json의 crons 설정으로 매일 1회 Vercel이 직접 호출한다. 결제는 1회
 * 캡처(정기 자동결제 아님)라서, 기간이 지나도 아무도 부르지 않으면
 * expires_at이 지난 뒤에도 plan이 영원히 유료로 남는다. 이 엔드포인트는 그저
 * server/db/payment_verification_migration.sql에 이미 정의돼 있던
 * expire_stale_subscriptions() RPC(service_role 전용)를 주기적으로 호출하는
 * 트리거 역할만 한다 — 만료 판정/강등 로직 자체는 DB 함수 안에 있다.
 *
 * Vercel Cron 호출에는 CRON_SECRET을 Authorization: Bearer 헤더로 자동으로
 * 실어 보낸다(Vercel 대시보드에 CRON_SECRET 환경변수를 등록해두면 됨). 이
 * 값을 검증해, 이 URL을 알아낸 외부에서 함부로 반복 호출하지 못하게 막는다.
 */
export default async function handler(req: ApiRequest, res: ApiResponse) {
  if (req.method !== 'GET' && req.method !== 'POST') {
    res.setHeader('Allow', 'GET, POST');
    return res.status(405).json({ error: 'method_not_allowed' });
  }

  const cronSecret = process.env.CRON_SECRET;
  if (!cronSecret) {
    return res.status(503).json({
      error: 'cron_unconfigured',
      message: 'CRON_SECRET이 설정되지 않았습니다. Vercel 환경변수를 확인해 주세요.',
    });
  }

  const authHeader = headerValue(req.headers.authorization);
  if (authHeader !== `Bearer ${cronSecret}`) {
    return res.status(401).json({ error: 'unauthorized' });
  }

  const supabaseUrl = process.env.SUPABASE_URL?.trim() || '';
  const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim() || '';
  if (!supabaseUrl || !supabaseServiceRoleKey) {
    return res.status(503).json({
      error: 'supabase_unconfigured',
      message: 'SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY가 설정되지 않았습니다.',
    });
  }

  const admin = createAdminClient({ supabaseUrl, supabaseServiceRoleKey });

  try {
    const { data, error } = await admin.rpc('expire_stale_subscriptions');
    if (error) {
      console.error('[cron/expire-subscriptions] RPC 실패', error);
      return res.status(500).json({ error: 'rpc_failed', message: error.message });
    }
    return res.status(200).json({ ok: true, downgradedCount: data });
  } catch (err) {
    console.error('[cron/expire-subscriptions] 예기치 못한 오류', err);
    return res.status(500).json({ error: 'internal_error' });
  }
}
