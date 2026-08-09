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

- **Supabase**: [supabase.com/dashboard](https://supabase.com/dashboard) — `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`. 로그인/회원가입(Supabase Auth)과 DB를 모두 이 프로젝트가 담당합니다.
- **Google OAuth**: [console.cloud.google.com](https://console.cloud.google.com/) — `VITE_GOOGLE_CLIENT_ID`. 동일한 Client ID/Secret을 Supabase 대시보드 → Authentication → Providers → Google 에도 등록해야 구글 로그인이 실제로 작동합니다.
- **PayPal**: [developer.paypal.com](https://developer.paypal.com/) — `VITE_PAYPAL_CLIENT_ID` (현재 Sandbox 전용)
- **VITE_ADMIN_EMAILS**: 마스터 관리자 콘솔 진입 화면(클라이언트 게이트)을 허용할 이메일 목록 (쉼표 구분). 실제 데이터 접근 권한은 DB의 `users.is_admin` 플래그가 결정합니다.
- **VITE_SENTRY_DSN**: (선택) 설정 시 프로덕션 에러가 [Sentry](https://sentry.io)로 자동 리포팅됨

## 인증 & 데이터베이스

로그인/회원가입은 Supabase Auth(이메일·비밀번호, Google OAuth)로 처리하고, Supabase(PostgreSQL)를 DB로 사용합니다. 스키마는 [`server/db/schema.sql`](./server/db/schema.sql)에 정의되어 있으며, Supabase SQL Editor에서 실행해 4개 테이블(`users`, `subscriptions`, `api_keys`, `skill_audit_logs`)과 `is_admin` 컬럼을 생성하세요.

RLS(Row Level Security) 강화 정책은 [`server/db/rls_hardening_migration.sql`](./server/db/rls_hardening_migration.sql)에 준비되어 있습니다 (파일 상단에 실행 전 선행 조건 명시). 적용 후에는 아래 한 줄로 본인 계정에 관리자 권한을 부여하세요:

```sql
UPDATE public.users SET is_admin = true WHERE email = 'your-email@example.com';
```

## 배포

`Dockerfile` / `docker-compose.yml` / `nginx.conf`로 멀티스테이지 Docker 빌드가 구성되어 있습니다.

```bash
docker compose up -d --build
```

## 작업 기록

프로젝트의 의사결정 및 변경 이력은 [`WorkLog/`](./WorkLog/) 폴더의 날짜별 문서에 기록되어 있습니다.
