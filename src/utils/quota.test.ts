import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { PLAN_QUOTA_CAP, resolveQuota } from './quota';

describe('PLAN_QUOTA_CAP', () => {
  it('matches the finalized pricing spec (Free 3/day, Pro 30/mo, Enterprise 500/mo)', () => {
    expect(PLAN_QUOTA_CAP.free).toBe(3);
    expect(PLAN_QUOTA_CAP.pro).toBe(30);
    expect(PLAN_QUOTA_CAP.enterprise).toBe(500);
  });
});

describe('resolveQuota', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('keeps the existing count within the same period', () => {
    // First call for a never-seen email always establishes (and resets) the period.
    resolveQuota('user@test.com', 'pro', 12);

    // Second call within the same period should pass the count through unchanged.
    const { queriesRemaining, didReset } = resolveQuota('user@test.com', 'pro', 12);
    expect(queriesRemaining).toBe(12);
    expect(didReset).toBe(false);
  });

  it('resets to the plan cap when the period changes', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-08-01T12:00:00Z'));
    resolveQuota('user@test.com', 'pro', 0);

    vi.setSystemTime(new Date('2026-09-01T12:00:00Z'));
    const { queriesRemaining, didReset } = resolveQuota('user@test.com', 'pro', 0);

    expect(didReset).toBe(true);
    expect(queriesRemaining).toBe(PLAN_QUOTA_CAP.pro);
  });

  it('resets daily for the Free plan even within the same month', () => {
    vi.useFakeTimers();
    // Two days apart (well clear of any timezone's local-midnight boundary).
    vi.setSystemTime(new Date('2026-08-09T12:00:00Z'));
    resolveQuota('user@test.com', 'free', 0);

    vi.setSystemTime(new Date('2026-08-11T12:00:00Z'));
    const { queriesRemaining, didReset } = resolveQuota('user@test.com', 'free', 0);

    expect(didReset).toBe(true);
    expect(queriesRemaining).toBe(PLAN_QUOTA_CAP.free);
  });

  it('tracks reset periods independently per email', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-08-09T12:00:00Z'));
    resolveQuota('a@test.com', 'pro', 5);

    // a@test.com already has this period recorded -> no reset
    const resultForA = resolveQuota('a@test.com', 'pro', 5);
    expect(resultForA.didReset).toBe(false);

    // b@test.com has never been recorded -> first call always resets
    const resultForB = resolveQuota('b@test.com', 'pro', 5);
    expect(resultForB.didReset).toBe(true);
  });
});
