# Aetheria Bio Portal

AI 바이오/제약 SaaS 포털 프론트엔드 (React + TypeScript + Vite).

## 현재 상태 요약

프론트엔드 UI/UX와 8개국어 다국어화는 실제로 완성되어 있습니다. 다만 "AI 분석 엔진"은 아직 실제 외부 API(AlphaFold/ChEMBL/PubMed 등)와 연동되어 있지 않고 데모용 정적 데이터를 반환하며, 실서비스 전환 전 처리해야 할 항목이 남아 있습니다. 상세 내용은 [`WorkLog/SYSTEM_GAP_ANALYSIS_AND_ROADMAP_2026-08-09.md`](./WorkLog/SYSTEM_GAP_ANALYSIS_AND_ROADMAP_2026-08-09.md)를 참고하세요.

## 시작하기

```bash
npm install
cp .env.example .env   # 값을 채운 뒤 저장
npm run dev             # http://localhost:3000
```

## 스크립트

| 명령어 | 설명 |
|---|---|
| `npm run dev` | 개발 서버 실행 |
| `npm run build` | 타입체크 + 프로덕션 빌드 (`dist/`) |
| `npm run preview` | 빌드 결과 로컬 미리보기 |
| `npm run test` | Vitest 테스트 1회 실행 |
| `npm run test:watch` | Vitest watch 모드 |
| `npm run lint` | ESLint 검사 |

## 환경 변수

`.env.example`을 참고하세요. 필요한 값:

- **Google OAuth**: [console.cloud.google.com](https://console.cloud.google.com/) — `VITE_GOOGLE_CLIENT_ID`
- **Supabase**: [supabase.com/dashboard](https://supabase.com/dashboard) — `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`
- **PayPal**: [developer.paypal.com](https://developer.paypal.com/) — `VITE_PAYPAL_CLIENT_ID` (현재 Sandbox 전용)
- **VITE_ADMIN_EMAILS**: 마스터 관리자 콘솔 접근을 허용할 이메일 목록 (쉼표 구분)
- **VITE_SENTRY_DSN**: (선택) 설정 시 프로덕션 에러가 [Sentry](https://sentry.io)로 자동 리포팅됨

## 데이터베이스

Supabase(PostgreSQL) 스키마는 [`server/db/schema.sql`](./server/db/schema.sql)에 정의되어 있습니다. Supabase SQL Editor에서 실행해 4개 테이블(`users`, `subscriptions`, `api_keys`, `skill_audit_logs`)을 생성하세요.

⚠️ 현재 RLS 정책은 전면 공개(`USING (true)`) 상태입니다. [`server/db/rls_hardening_migration.sql`](./server/db/rls_hardening_migration.sql)에 강화된 정책이 준비되어 있으나, 적용 전 파일 상단의 필수 선행 조건(Supabase Third-Party Auth 연동)을 반드시 먼저 처리해야 합니다. 선행 조건 없이 그대로 실행하면 로그인 관련 기능이 전부 깨집니다.

## 배포

`Dockerfile` / `docker-compose.yml` / `nginx.conf`로 멀티스테이지 Docker 빌드가 구성되어 있습니다.

```bash
docker compose up -d --build
```

## 작업 기록

프로젝트의 의사결정 및 변경 이력은 [`WorkLog/`](./WorkLog/) 폴더의 날짜별 문서에 기록되어 있습니다.
