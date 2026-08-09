import * as Sentry from '@sentry/react';

// VITE_SENTRY_DSN이 설정되지 않으면 완전히 비활성 상태로 남는다.
// 무료 Sentry 계정(sentry.io)을 만들고 프로젝트 DSN을 .env에 넣기만 하면 바로 활성화된다.
const dsn = import.meta.env.VITE_SENTRY_DSN as string | undefined;

export function initSentry() {
  if (!dsn) return;
  Sentry.init({
    dsn,
    environment: import.meta.env.MODE,
    tracesSampleRate: 0.1,
  });
}

export function captureException(error: unknown, context?: Record<string, unknown>) {
  console.error(error, context);
  if (!dsn) return;
  Sentry.captureException(error, context ? { extra: context } : undefined);
}
