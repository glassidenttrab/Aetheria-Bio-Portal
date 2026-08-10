# 다음 단계 보고서 — 감사 문서 재검증 및 실행 계획
**작성일**: 2026-08-10
**기준 커밋**: `b8d1d4c` (`fix(auth): always show Google account chooser on sign-in/sign-up`)
**대상 문서**: `PRODUCTION_READINESS_AND_SUBSCRIPTION_AUDIT_2026-08-10.md`, `SUBSCRIPTION_LAUNCH_RISK_REVIEW_2026-08-10.md`

---

## 1. 이 문서의 목적

두 감사 문서는 병렬 세션(Cursor + Claude Opus 5)이 결제 검증 시스템을 GitHub에 푸시한 직후, commit `693c62f` 기준으로 작성됐습니다. 그 뒤로 저희가 `git pull`로 그 작업을 받아 통합했고(`2fcb969`, `a2e1768` 등), Google 로그인 버그도 추가로 고쳤습니다(`b8d1d4c`). 즉 두 문서는 이미 한 세대 전 상태를 기준으로 쓰여졌습니다.

그래서 문서를 그대로 "다음 단계"로 옮기지 않고, **각 지적 사항을 현재 코드에서 직접 grep/read로 재확인**한 뒤, 상태를 RESOLVED / PARTIALLY RESOLVED / STILL OPEN 세 가지로 재분류했습니다. 아래 표가 그 결과이고, 3장이 여기서 나온 실행 계획입니다.

---

## 2. 감사 항목별 재검증 결과

### ✅ RESOLVED (해결 완료, 코드로 확인됨)

| 항목 | 근거 |
|---|---|
| OAuth 클라이언트 시크릿 노출 | 이전 세션에서 이미 수정·재발급 완료 |
| 클라이언트가 결제를 자체 승인(`recordSubscriptionDB`) | 해당 함수 완전 제거. `supabaseService.ts:155-168` 주석에 사유 명시. 이제 `api/paypal/capture-order.ts`가 PayPal REST API로 직접 캡처 후 서버가 검증 |
| `users.plan`을 클라이언트가 직접 변경 가능 | `rls_hardening_migration.sql`의 `guard_entitlement_columns()` 트리거로 `anon`/`authenticated` 세션의 `plan`/`is_admin` 변경을 차단. `apply_paid_subscription()` RPC(service_role 전용)만 plan을 올릴 수 있음 |
| 로그아웃 상태에서 결제 버튼 노출 | **직접 재확인**: `SubscriptionCheckoutModal.tsx:329-360` — `isLoggedIn`이 false면 PayPal 버튼 자체를 렌더링하지 않고 "로그인하고 결제 진행하기" 버튼으로 대체. 주석: "돈은 빠져나갔는데 아무것도 받지 못하는 상태" 방지 목적 명시 |
| Pro→Enterprise 20일 고정 프로레이션(부정확한 임의 할인) | **직접 재확인**: `SubscriptionCheckoutModal.tsx:53-58` — 로직 완전 제거, 주석으로 제거 사유(서버 가격표에 없는 금액이라 검증 불가) 명시. 실제 비례 정산은 향후 PayPal 정기구독 도입 시 별도 처리 예정으로 보류 |
| Google OAuth "같은 계정으로만 로그인됨" | `AuthContext.tsx:42` — `queryParams: { prompt: 'select_account' }` 추가로 해결 (`b8d1d4c`) |

### 🟡 PARTIALLY RESOLVED (부분 해결 — 후속 조치 필요)

| 항목 | 현재 상태 |
|---|---|
| 구독 만료 처리 | `payment_verification_migration.sql`이 결제 시 `expires_at`을 정확히 기록하도록 고쳐졌음(진전). 그러나 `expire_stale_subscriptions()` 함수는 정의만 되어 있고 **실제로 호출하는 곳이 없음**(주석 처리된 예시 1줄뿐). 즉 만료 시각은 저장되지만, 만료가 지나도 자동으로 `plan`이 강등되지 않음 |
| 쿼터 잠금 | `guard_entitlement_columns()`가 `plan`/`is_admin`은 잠갔지만, 마이그레이션 주석에 "`queries_remaining`은 아직 잠그지 않는다"고 명시. 서버 쿼터 체계가 없는 임시 상태로, 클라이언트가 여전히 `queries_remaining`을 직접 upsert 가능 |

### 🔴 STILL OPEN (미해결 — 원 지적 그대로 유효)

| 항목 | 근거 |
|---|---|
| 쿼터가 계정이 아닌 브라우저(localStorage)에 귀속 | `src/utils/quota.ts` 전체 미변경 확인. `resolveQuota()`가 `localStorage.getItem('aetheria_quota_period_' + email)`로만 동작 — 로그아웃 후 다른 브라우저/시크릿창에서 로그인하면 쿼터가 리셋됨. 유료 서비스로는 치명적 |
| Enterprise 가격 불일치 ($1,990 표기 vs 실제 청구 $2,500) | grep 재확인 결과 **8개 언어 전부**에 여전히 잔존: `MyResearchPortalView.tsx:60,225`, `SaaSPlatformView.tsx:79`, `i18n/translations.ts`의 `mypage.b2b_upgrade_confirm`/`mypage.b2b_apply_btn` (ko/en/ja/zh/es/de/it/fr, 총 16곳). 실제 결제 모달(`SubscriptionCheckoutModal.tsx`)의 `MONTHLY_PRICE.enterprise = 2500`은 정확하지만, B2B 콘솔 안내 문구만 구버전 가격($1,990)을 그대로 노출 중 |

### 🆕 신규 발견 (감사 문서에는 없던 항목, 이번 재검증 중 발견)

| 항목 | 근거 |
|---|---|
| `saveSkillAuditLogDB`가 `user_id`를 insert하지 않음 | `supabaseService.ts:112-134` — insert payload에 `user_id` 필드가 아예 없음. `rls_hardening_migration.sql:97-101`의 `skill_audit_logs_own_or_admin` 정책은 `FOR ALL USING (... OR user_id IN (SELECT id FROM users WHERE auth_uid = auth.uid()::text))`이며 별도 `WITH CHECK`가 없어 `USING`이 INSERT에도 적용됨. `user_id`가 NULL이면 `NULL IN (...)`은 항상 false이므로, **RLS 하드닝이 실제로 적용된 상태라면 이 insert는 항상 실패**하고 `console.warn`으로 조용히 삼켜짐. 이는 제가 이전 세션에서 연결한 "38개 스킬 쿼리 & 감사 로그" 기능(`7751c77`)이 지금 이 순간 RLS 상태에 따라 조용히 죽어 있을 수 있다는 뜻입니다 — 관리자 콘솔에서 실제 분석을 실행해도 로그 건수가 계속 0으로 보인다면 이게 원인일 가능성이 높습니다 |

---

## 3. 다음 단계 실행 계획 (우선순위 순)

### ✅ P0 — 완료 (2026-08-10 처리, WORK_LOG 20번 항목)

1. **`saveSkillAuditLogDB`에 `user_id` 채우기** — 완료. insert 페이로드에 `user_id` 추가, 호출부(`SaaSPlatformView.tsx`, `ContactSupportModal.tsx`)와 `App.tsx`까지 전달 경로 연결.
2. **Enterprise 가격 문구 통일** — 완료. `$1,990` → `$2,500`로 소스 2곳 + i18n 8개 언어 16곳 수정. 부수적으로 `SaaSPlatformView.tsx`의 미번역 하드코딩 confirm 문구도 `t()`로 교체해 다국어 버그까지 함께 해결.
   - typecheck/build/vitest/eslint 전체 통과 확인.

### ✅ P1-A — 완료 (2026-08-10 처리, WORK_LOG 21번 항목)

3. **서버 측 쿼터 집계 도입** — 완료. `server/db/quota_enforcement_migration.sql` 신규 작성(`get_quota_status()`/`consume_quota()` SECURITY DEFINER RPC, `queries_remaining` 잠금 활성화), 클라이언트를 로그인 계정 기준 서버 RPC로 전환(게스트는 기존 로컬 방식 유지). **다만 이 마이그레이션은 아직 Supabase에 적용되지 않았습니다 — 대표님이 SQL Editor에서 직접 실행해주셔야 합니다** (선행 조건인 `rls_hardening_migration.sql`, `payment_verification_migration.sql`은 이미 적용 완료 상태로 확인됨).
   - typecheck/build/vitest/eslint 전체 통과 확인.

### ✅ P1-B — 완료 (2026-08-10 처리, WORK_LOG 22번 항목)

4. **구독 만료 자동 강제** — 완료. `api/cron/expire-subscriptions.ts` 신규 작성 + `vercel.json`에 매일 00:00 UTC 실행되는 cron 등록, `expire_stale_subscriptions()` RPC를 호출하도록 연결. **`CRON_SECRET` 환경변수를 Vercel 대시보드에 새로 등록해주셔야 합니다** — 별도 SQL 실행은 불필요합니다(관련 함수/권한은 이미 적용되어 있음).
   - typecheck/build/vitest/eslint 전체 통과 확인.

이것으로 이 문서에 정리했던 P0~P1 항목은 모두 코드 조치가 끝났습니다. 남은 것은 대표님이 Vercel에 `CRON_SECRET`을 등록하시는 것뿐입니다.

### P2 — 출시 전 최종 점검

5. Supabase 대시보드에서 `pg_policies` 조회로 RLS 정책이 실제로 위 마이그레이션대로 적용돼 있는지 최종 확인 (지금까지의 대화만으로는 "적용했다"는 보고를 신뢰하고 있을 뿐, 직접 조회 결과는 아직 못 봤습니다).
6. 두 감사 문서의 "출시 승인 체크리스트" 항목을 이 문서의 재검증 결과로 갱신해, 실제 출시 가능 여부를 재산정.

---

## 4. 대표님이 확인해주시면 좋은 것

- P0 두 건은 처리 완료했습니다. 실제 배포 후 관리자 콘솔의 "38개 스킬 쿼리 & 감사 로그" 탭에 로그가 실제로 쌓이는지, Enterprise B2B 콘솔 신청 문구가 $2,500으로 보이는지 확인 부탁드립니다.
- P1의 서버 쿼터 설계는 스키마 변경이 필요해서, 방향을 먼저 짧게 논의하고 싶습니다.
