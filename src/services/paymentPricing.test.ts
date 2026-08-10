import { describe, it, expect } from 'vitest';
import { PLAN_QUOTA_CAP } from '../utils/quota';
import {
  PRICE_TABLE,
  SERVER_PLAN_QUOTA_CAP,
  isPaidTier,
  resolvePrice,
  toCents,
  readServerConfig,
} from '../../api/_lib/config';
import type { EnvSource } from '../../api/_lib/config';

/**
 * 결제 검증 서버는 프론트엔드 번들을 끌어오지 않으려고 가격/쿼터 상수를 따로
 * 들고 있다. 두 벌이 어긋나면 "결제는 됐는데 쿼터가 다르다" 같은 사고로
 * 이어지므로, 여기서 강제로 동기화 상태를 확인한다.
 */
describe('서버 쿼터 상수', () => {
  it('클라이언트 PLAN_QUOTA_CAP과 정확히 일치한다', () => {
    expect(SERVER_PLAN_QUOTA_CAP.free).toBe(PLAN_QUOTA_CAP.free);
    expect(SERVER_PLAN_QUOTA_CAP.pro).toBe(PLAN_QUOTA_CAP.pro);
    expect(SERVER_PLAN_QUOTA_CAP.enterprise).toBe(PLAN_QUOTA_CAP.enterprise);
  });
});

describe('서버 가격표', () => {
  it('체크아웃 화면에 표시되는 정가와 일치한다', () => {
    expect(PRICE_TABLE.pro.monthly.amount).toBe('490.00');
    expect(PRICE_TABLE.enterprise.monthly.amount).toBe('2500.00');
    expect(PRICE_TABLE.pro.annual.amount).toBe('4998.00');
    expect(PRICE_TABLE.enterprise.annual.amount).toBe('25500.00');
  });

  it('연간 결제는 1년치 이용 기간을 부여한다', () => {
    expect(resolvePrice('pro', true).entitlementDays).toBe(365);
    expect(resolvePrice('pro', false).entitlementDays).toBe(30);
  });

  it('유료 플랜만 통과시킨다', () => {
    expect(isPaidTier('pro')).toBe(true);
    expect(isPaidTier('enterprise')).toBe(true);
    expect(isPaidTier('free')).toBe(false);
    expect(isPaidTier('ENTERPRISE')).toBe(false);
    expect(isPaidTier(undefined)).toBe(false);
  });
});

describe('금액 비교', () => {
  it('표기 방식이 달라도 같은 금액으로 취급한다', () => {
    expect(toCents('490.00')).toBe(toCents('490'));
    expect(toCents('2500.00')).toBe(250000);
  });

  it('1센트라도 모자라면 다른 금액으로 판정한다', () => {
    expect(toCents('489.99')).not.toBe(toCents('490.00'));
  });
});

describe('서버 환경변수 검증', () => {
  it('값이 없으면 결제를 통과시키지 않고 누락 목록을 돌려준다', () => {
    const result = readServerConfig({});
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.missing).toContain('PAYPAL_CLIENT_ID');
      expect(result.missing).toContain('PAYPAL_SECRET_KEY');
      expect(result.missing).toContain('SUPABASE_URL');
      expect(result.missing).toContain('SUPABASE_SERVICE_ROLE_KEY');
    }
  });

  it('기본값은 sandbox이고 PAYPAL_ENV=live일 때만 실서버로 붙는다', () => {
    const base: EnvSource = {
      PAYPAL_CLIENT_ID: 'id',
      PAYPAL_SECRET_KEY: 'secret',
      SUPABASE_URL: 'https://example.supabase.co',
      SUPABASE_SERVICE_ROLE_KEY: 'service-key',
    };

    const sandbox = readServerConfig(base);
    expect(sandbox.ok).toBe(true);
    if (sandbox.ok) {
      expect(sandbox.config.paypalApiBase).toBe('https://api-m.sandbox.paypal.com');
    }

    const live = readServerConfig({ ...base, PAYPAL_ENV: 'live' });
    expect(live.ok).toBe(true);
    if (live.ok) {
      expect(live.config.paypalApiBase).toBe('https://api-m.paypal.com');
    }
  });
});
