# Aetheria Bio Portal — 시스템 현황 정밀 분석 및 기술 로드맵

- **작성일자**: 2026년 8월 9일
- **분석 방법**: 코드베이스 전수 조사 (grep/read 기반 실측, 자기평가 아님)
- **선행 문서와의 관계**: `WorkLog/SERVICE_GAP_ANALYSIS_REPORT_2026-08-07.md` (8/7 작성)가 "AI 엔진 90%, 백엔드 35%"로 평가한 부분을, 이번에 실제 소스코드 라인 단위로 재검증한 결과 상당 부분 과대평가였음을 확인. 본 문서가 최신 실측 기준.

---

## 1. 요약 (Executive Summary)

**프론트엔드 UI/UX와 8개국어 다국어화는 실제로 완성도가 높다.** 반면 "AI 바이오 분석 포털"이라는 제품의 핵심 가치인 **실제 분석 엔진은 사실상 존재하지 않으며**, 결제·인증·DB 보안에는 실서비스 오픈 시 사고로 직결될 수 있는 **긴급 보안 결함이 다수** 발견되었다. 좋은 소식은 `.agents/skills/` 폴더에 AlphaFold·ChEMBL·PubMed·UniProt 등 실제 생물정보 DB 20종 이상에 대한 API 연동 참고 문서가 이미 준비되어 있어, 실제 백엔드를 구축할 때 처음부터 리서치할 필요 없이 이를 그대로 활용할 수 있다는 점이다.

| 영역 | 8/7 리포트 평가 | 이번 실측 결과 | 비고 |
|---|---|---|---|
| UI/UX | 95% | **90%** | 실제로 잘 만들어짐. 접근성(a11y)만 별도 감점 요인 |
| 다국어(i18n) | 98% | **95%** | 이번 세션에서 누락분 다수 수정 완료 |
| AI 뷰어/엔진 | 90% | **15%** | 3D 좌표 다운로드 1건만 실제, 나머지 전부 하드코딩·허위 문구 |
| SaaS 요금제/과금 | 95% | **40%** | UI는 완성, 실제 정기결제·쿼터 서버 강제는 미비 |
| 백엔드/보안 | 35% | **20%** | RLS 사실상 무방비, 관리자 인증 평문 하드코딩 |

---

## 2. 기능별 Real vs Mock 실측 매트릭스

| 기능 | 실제 동작 여부 | 근거 |
|---|---|---|
| AI 표적 스캐닝 결과 | ❌ 완전 하드코딩 | `neuroLongevityEngine.ts`의 부서별 정적 객체(TAU, BACE1, PCSK9 등)를 500ms 딜레이 후 반환. 조회/생성 로직 없음 |
| AlphaFold 3D 구조 렌더링 | ✅ 실제 | `Protein3DViewer.tsx`가 3dmol.js로 RCSB PDB에서 실제 좌표 다운로드 |
| AlphaFold pLDDT 신뢰도 점수 | ❌ 하드코딩 | 위 정적 객체의 고정값. AlphaFold DB 조회 없음 |
| "3D 뷰어 확장 모달"(`Mol3DViewerModal.tsx`) | ❌ 완전 허위 | 문자열 해시 기반 캔버스 애니메이션으로 좌표를 조작(fabricate)하면서, 화면에는 **"AlphaFold 200M+ & RCSB PDB Live API 연결됨"**이라는 문구를 표시 — 실제 네트워크 호출 없음. 사용자를 기만하는 문구이므로 최우선 수정 대상 |
| ChEMBL IC50 결합친화도 | ❌ 하드코딩 | `affinityIC50: '4.2 nM'` 등 정적 문자열, 실제 ChEMBL API 호출 없음 |
| PubMed/OpenAlex 문헌검색 | ❌ 미구현 | `ScienceSkillsCatalogModal.tsx`는 카탈로그 소개 카드만 존재. 클릭하면 검색이 아니라 Pro 결제 유도로 연결됨 |
| FTO 특허 판단 | ❌ 완전 하드코딩 | 모든 타겟이 예외 없이 `"High (Clear FTO)"` 고정값. Enterprise B2B 콘솔 FTO API도 입력값과 무관하게 항상 동일한 통과 판정 반환 |
| SenoScan™ 항노화 감사 | ❌ 죽은 코드 | `B2BSenoScanService.tsx`가 어디에도 렌더링되지 않음. 실서비스에서 도달 불가 |

**결론**: 현재 라이브 데모에서 "실제 외부 데이터"로 부를 수 있는 건 3D 단백질 좌표 렌더링 1건뿐이며, 그마저도 신뢰도 점수는 가짜다.

---

## 3. 🔴 긴급 보안 이슈 (실서비스 오픈 전 필수 조치)

1. **관리자 콘솔 인증이 클라이언트 코드에 평문 하드코딩** — `SuperAdminDashboardModal.tsx`. 브라우저 devtools로 즉시 추출 가능하며, 로그인 실패 시 에러 메시지가 정답 아이디/비밀번호를 그대로 노출한다. 로그인 성공 후에는 전체 회원 이메일/플랜/B2B API 키를 조회·수정할 수 있는 실제 Supabase 쿼리가 실행된다.
2. **Supabase RLS(Row Level Security)가 사실상 전면 공개** — `server/db/schema.sql`에 4개 테이블 모두 정책이 `USING (true)`로 설정되어, anon key만 있으면(모든 클라이언트 번들에 포함됨) 누구나 전체 회원 정보·구독 내역·B2B API 키 해시를 읽고 쓰고 지울 수 있다.
3. **Google OAuth Client Secret이 `VITE_` 접두사로 선언** — Vite는 `VITE_` 접두사 변수를 클라이언트 번들에 그대로 인라인한다. 서버 전용이어야 할 시크릿이 실제로 참조되는 순간 퍼블릭 노출된다.
4. **B2B API 키 생성이 `Math.random()` 기반** — 암호학적으로 안전하지 않아 예측·추측 공격에 취약.
5. **신용카드 결제가 완전히 가짜** — `SubscriptionCheckoutModal.tsx`는 카드번호 검증 없이 무조건 결제 성공 처리하고 고정된 `cardLast4: '4242'`를 발급한다. 매출 없이 Enterprise 등급을 획득할 수 있는 결제 우회 취약점이다.
6. **소셜 로그인 3중 폴백의 마지막 단계가 가짜 계정 자동 로그인** — Firebase/Supabase 로그인이 모두 실패하면 하드코딩된 `plan: 'pro'` 게스트 객체로 조용히 로그인 처리되어 DB에 저장된다.

> 다행히 `.env`, Google client secret 파일, GitHub 복구코드 파일은 모두 `.gitignore`로 커밋 이력에서 제외되어 있어 **깃허브 원격 저장소로의 유출은 없음**이 확인됨. 다만 위 항목들은 로컬 코드 자체의 구조적 결함이라 실서비스 배포 시점에는 반드시 해결이 필요.

---

## 4. 부족한 서비스/기술 (카테고리별)

### 4.1 AI/과학 데이터 백엔드 — 가장 큰 공백이자 가장 큰 기회
- 실제 외부 생물정보 API 연동이 전무하다는 게 핵심 문제이지만, **`.agents/skills/` 폴더에 AlphaFold, ChEMBL, ClinVar, dbSNP, Ensembl, gnomAD, GTEx, Human Protein Atlas, InterPro, JASPAR, OpenFDA, OpenTargets, PDB, PubChem, PubMed, Reactome, STRING, UniProt, 임상시험(ClinicalTrials.gov), 문헌검색(arXiv/bioRxiv/Europe PMC/OpenAlex) 등 20종 이상의 실제 API 사용법이 이미 문서화되어 있다.** 이는 현재 AI 개발 어시스턴트(코즈)가 리서치할 때만 참고하는 자료이고 실제 웹 서비스 백엔드와는 연결되어 있지 않은데, 이 자료를 그대로 서버리스 함수의 API 연동 스펙으로 재활용하면 조사 비용 없이 빠르게 실제 데이터 연동이 가능하다.
- 필요 기술: 서버(FastAPI 또는 Node/Express 등) + 비동기 작업 큐(무거운 분석은 즉시 응답 불가하므로), 결과 캐싱/영속화 DB.

### 4.2 인증/보안
- 관리자 인증을 서버사이드로 이전 (최소한 하드코딩 제거 + 환경변수화 + 실패 메시지에서 정답 노출 제거)
- Supabase RLS를 `auth.uid()` 및 역할(role) 기반으로 재설계
- 서버 전용 시크릿과 클라이언트 노출용 키 분리 (`VITE_` 접두사 감사)
- Rate limiting, 입력 검증

### 4.3 결제/구독
- PayPal Subscriptions API(정기결제) 또는 Stripe Billing으로 전환 — 현재는 1회성 캡처만 있고 자동 갱신·해지·만료 로직이 전무
- 결제 웹훅 수신 서버 엔드포인트
- 가짜 신용카드 결제 경로 제거 또는 실제 PG 연동
- 이번 세션에서 구축한 쿼터 카운트(`src/utils/quota.ts`)는 **클라이언트 localStorage 기반**이라 devtools로 우회 가능 — 실서비스 전환 시 서버사이드(Supabase RPC/Edge Function 등)로 재구현 필요

### 4.4 테스트/CI
- 테스트 프레임워크 전무 (Vitest + React Testing Library 권장)
- GitHub Actions 등 CI 파이프라인 없음 — 현재는 매 배포마다 수동 `npm run build` 확인에 의존
- ESLint/Prettier 미설정 (`tsconfig.json`도 `noUnusedLocals` 등 비활성화되어 있어 죽은 코드가 컴파일 경고 없이 통과됨)

### 4.5 관측성/에러 핸들링
- React Error Boundary 없음 — 렌더링 에러 1건이 전체 화면을 white-screen으로 만들 수 있음
- Sentry 등 에러 모니터링 없음 — 운영 중 장애가 발생해도 대표님이 알 방법이 없음 (콘솔 로그만 남고 조용히 삼켜짐)

### 4.6 접근성(A11y)
- `aria-*`, `role`, 키보드 포커스 트랩이 사실상 전무. 스크린리더/키보드 전용 사용자는 서비스 이용이 사실상 불가능한 수준

### 4.7 정리 대상 죽은 코드 (Dead Code)
- `PipelineRunner.tsx`, `B2BSenoScanService.tsx`, `MonetizationDashboard.tsx`, `ResultViewer.tsx` — 어디에서도 import/렌더링되지 않음. 삭제하거나 실제로 연결할지 결정 필요
- `Protein3DViewer.tsx`의 `import $ from 'jquery'` — jquery는 설치조차 되어 있지 않고 사용되지도 않음 (미사용 import 검사가 꺼져 있어 통과됨). 향후 `$` 참조 시 즉시 빌드 깨짐

### 4.8 저장소 위생
- `README.md` 부재 — 신규 환경 셋업 시 참고할 문서 없음
- `.env.example` 부재 — 필요한 환경변수 목록을 소스코드 폴백값에서 역추적해야 함
- 단일 JS 번들 2.28MB(gzip 598KB), 코드 스플리팅 미적용

---

## 5. 우선순위 로드맵

### Phase 0 — 이번 주 내 (긴급 보안·신뢰성 패치, 코드 수정만으로 가능)
1. 관리자 로그인 하드코딩 제거 + 에러 메시지 정답 노출 제거
2. Supabase RLS 정책을 실제 소유자 기반으로 재작성
3. `VITE_` 접두사 시크릿 감사 및 서버 전용 분리
4. "AlphaFold Live API 연결됨" 등 허위 UI 문구를 "베타/프리뷰 데이터" 등으로 정정 (실제 연동 전까지)
5. 가짜 신용카드 결제 경로 비활성화
6. 죽은 컴포넌트 4종 삭제 또는 연결 여부 결정

### Phase 1 — 2~3주 (실제 백엔드 MVP)
1. `.agents/skills/` 참고 자료를 기반으로 UniProt/PDB/PubMed/OpenTargets 등 3~4종 우선 실제 연동
2. 결과 캐싱·영속화용 DB 테이블 설계 및 RLS 재정비
3. PayPal Subscriptions API 전환 + 웹훅 서버
4. 리포트 생성 쿼터를 서버사이드(Edge Function 등)로 이전해 우회 방지

### Phase 2 — 3~4주 (안정성/신뢰성)
1. Vitest + RTL 기본 테스트 스위트, GitHub Actions CI(lint+build+test)
2. Sentry 연동 + React Error Boundary
3. 모달 포커스 트랩, `aria-label` 등 접근성 기본 개선
4. 코드 스플리팅으로 번들 최적화

### Phase 3 — 지속 진행 (실사용 확장)
1. 상용 도메인/SSL, 트랜잭션 이메일(SendGrid/SES) — 8/7 리포트 항목 유지
2. B2B SSO, HIPAA/GDPR 등 규제 준수는 실제 고객 확보 이후 순차 진행
3. AI 파이프라인 비동기 큐(대용량 도킹/구조예측 작업 대응)

---

## 6. 결론

프론트엔드·다국어·요금제 UI는 실제로 상용 수준에 근접해 있으나, **"AI 분석"이라는 제품의 본질적 가치는 현재 데모용 정적 데이터로 대체되어 있고, 이 사실이 UI 문구상 사용자에게 실제 라이브 연동인 것처럼 표시되고 있다는 점이 가장 시급히 바로잡아야 할 부분**이다. 다행히 실제 데이터 연동에 필요한 API 리서치 자료는 이미 프로젝트 내에 준비되어 있으므로(`.agents/skills/`), Phase 1의 실행 난이도는 예상보다 낮을 수 있다. 보안 이슈(3장)는 실서비스 오픈 여부와 무관하게 현재 상태로도 위험하므로 최우선 처리를 권장한다.
