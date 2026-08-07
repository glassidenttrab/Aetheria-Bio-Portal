# DeepTech AI Bio Portal - 상세 기술 아키텍처 및 시스템 사양서 (Technical Note)

- **문서 버전**: v1.0.0
- **작성일자**: 2026년 8월 6일
- **작성자**: 코즈 AI 개발부장 (Coz Dev Manager)
- **대상 레포지토리**: `glassidenttrab/Aetheria-Bio-Portal` (`d:\ProJectHome\Aetheria-Bio-Portal`)

---

## 1. 🏗️ 전체 시스템 아키텍처 개요

Aetheria Bio Portal은 전신 10대 의학과(Neurosurgery, Neurology, Oncology, Cardiology 등)를 대상으로 38+ 라이브 사이언스 스킬과 AlphaFold 3D 분자 구조 시뮬레이션, ChEMBL 결합력 예측, FTO 특허 침해 판단 및 B2B 감사를 실시간 제공하는 **DeepTech AI 생명공학 SaaS 포털 플랫폼**입니다.

```
+-----------------------------------------------------------------------------------+
|                            Client UI (React 18 + Vite 5)                          |
|  [SaaSPlatformView]  [PlanPricingDetailsModal]  [MyResearchPortalView]            |
|  [Protein3DViewer]   [B2BSenoScanService]       [AuthCheckoutModal]               |
+-----------------------------------------------------------------------------------+
                                         |
                                         v
+-----------------------------------------------------------------------------------+
|                        Core Context & State Management                            |
|   - LanguageContext (8개 국어 i18n 동적 사상 엔진)                                   |
|   - UserPlanContext (Free / Pro / Enterprise 권한 제어)                           |
+-----------------------------------------------------------------------------------+
                                         |
                                         v
+-----------------------------------------------------------------------------------+
|                     NeuroLongevity AI Engine Services                             |
|   - neuroLongevityEngine.ts (10대 의학과 표적 스캐너 & AlphaFold 파이프라인)       |
|   - 3Dmol.js Canvas Renderer (AlphaFold 2억+ 3D PDB 분자 가시화)                 |
+-----------------------------------------------------------------------------------+
                                         |
                                         v
+-----------------------------------------------------------------------------------+
|                       External Live Science Data APIs                             |
|  [AlphaFold EBI DB]  [NCBI PubMed]  [OpenAlex Graph]  [ChEMBL DB]  [OpenTargets]  |
+-----------------------------------------------------------------------------------+
```

---

## 2. 🧬 핵심 기술 모듈 사양 (Technical Specifications)

### 2.1. AlphaFold 3D 분자 구조 & pLDDT 신뢰도 연동 엔진

- **소스 모듈**: [neuroLongevityEngine.ts](file:///d:/ProJectHome/DeepTech/src/services/neuroLongevityEngine.ts), [Protein3DViewer.tsx](file:///d:/ProJectHome/DeepTech/src/components/Protein3DViewer.tsx)
- **동작 원리**:
  1. UniProt Accession ID(예: MAPT `P10636`, SNCA `P37840`, BACE1 `P56817`) 기반 EBI AlphaFold 예측 3D 구조 PDB URL 생성 (`https://alphafold.ebi.ac.uk/files/AF-{UniProtID}-F1-model_v4.pdb`).
  2. Canvas 기반 3Dmol.js 라이브러리를 사용해 Cartoon/Stick 스타일 렌더링.
  3. 잔기별 pLDDT(predicted Local Distance Difference Test) 구조 신뢰도 점수를 실시간 가공하여 90+ (Very High), 70-90 (Confident), <70 (Low) 구간으로 정밀 색상 매핑.

### 2.2. 라이브 빅데이터 & 특허 FTO 평가 파이프라인

- **학술 DB 라이브 연결**:
  - **NCBI PubMed E-utilities API**: 3,500만+ 논문 메타데이터 연동 및 메디컬 메쉬(MeSH) 키워드 검색.
  - **OpenAlex REST API**: 2억 5,000만+ 학술 논문 인용 그래프 및 저자/연구기관 식별 연동.
- **FTO (Free-To-Operate) 특허 침해 AI 리스크 판별**:
  - 타겟 약물 분자(SMILES) 및 특허 청구항 간의 구조적 유사도 및 선행 기술 침해 여부를 AI 리스크 스코어링(Clear FTO / Caution / High Risk)으로 판별.

### 2.3. SenoScan™ 노화/장기 세포사멸 B2B 감사 리포트 엔진

- **소스 모듈**: [B2BSenoScanService.tsx](file:///d:/ProJectHome/DeepTech/src/components/B2BSenoScanService.tsx)
- **기능 사양**:
  - 장기별(뇌, 심장, 피부, 관절 등) 세노리틱(Senolytic) 타겟 인자 세포 사멸 비율 감사.
  - 항노화 임상 지표 및 약물 재창출(Drug Repurposing) 타당성 B2B 감사 보고서 자동 생성.

---

## 3. 🌐 다국어 (i18n) 번역 및 국제화 엔진 사양

- **소스 모듈**: [LanguageContext.tsx](file:///d:/ProJectHome/DeepTech/src/contexts/LanguageContext.tsx), [translations.ts](file:///d:/ProJectHome/DeepTech/src/i18n/translations.ts)
- **지원 언어 8종**: `ko` (한국어), `en` (영어), `ja` (일본어), `zh` (중국어), `es` (스페인어), `de` (독일어), `it` (이탈리아어), `fr` (프랑스어).
- **Fallback 메커니즘**: `t(key, fallbackText)` 함수를 호출하여 활성 언어 사전에 매핑된 텍스트가 없을 경우 기본값 및 한국어 사전을 순차 참조하여 UI 단절을 방지.

---

## 4. 💳 SaaS 구독 요금제 & 연간 할인 토글 사양

- **소스 모듈**: [PlanPricingDetailsModal.tsx](file:///d:/ProJectHome/DeepTech/src/components/PlanPricingDetailsModal.tsx)
- **구독 티어별 스펙 매트릭스**:

| 구분                      | Free Starter  | Pro Professional          | Enterprise VIP                  |
| :------------------------ | :------------ | :------------------------ | :------------------------------ |
| **월간 가격**             | $0            | **$490 / 월**             | **$2,500 / 월**                 |
| **연간 결제가 (15% OFF)** | $0            | **$416 / 월** ($4,998/년) | **$2,125 / 월** ($25,500/년)    |
| **10대 의학과 스캐닝**    | 기초 3개 과   | 전신 10개 과 전체         | 전신 10개 과 + 커스텀 과        |
| **AlphaFold 3D & pLDDT**  | 기본 점수     | 실시간 3D 정밀 시뮬레이션 | 고해상도 3D & 도메인 도킹       |
| **ChEMBL IC50 결합력**    | 상위 1개      | 전체 억제제 결합력 계산   | 무제한 스크리닝 & 약물 재창출   |
| **파이프라인 리포트**     | 월 3회        | 월 100회                  | 무제한 (99,999회+)              |
| **학술 DB 라이브 연동**   | PubMed 기초   | PubMed + OpenAlex API     | 라이브 연동 + AI 자동 요약      |
| **FTO 특허 AI 평가**      | 미지원        | AI 침해 리스크 판별       | 특허 전문 보고서 & IP 가이드    |
| **REST/GraphQL SDK**      | 미지원        | 미지원                    | 무제한 API 접근 제공            |
| **서브넷 / 온프레미스**   | 미지원        | 미지원                    | 단독 서브넷 & 온프레미스 지원   |
| **고객 지원 서비스**      | 커뮤니티 지원 | 우선 이메일 지원 (24h)    | 1:1 전담 컨설턴트 & 24/7 핫라인 |

---

## 5. 🏢 Enterprise ($2,500) B2B 구축 모듈 사양 (Architectural Spec)

Enterprise 결제 고객 발생 시 가동되는 3대 전용 시스템 설계 사양입니다.

1. **Enterprise B2B Onboarding Module**:
   - 기관/기업명, 연구 과제, 기술 담당자 정보 및 API Key 발급 신청.
   - 인프라 배포 방식 선택 (REST/GraphQL API Cloud vs AWS/GCP 단독 VPC 서브넷 vs On-Premise Docker Container).
2. **Developer API Key & SDK Documentation Console**:
   - REST API Bearer Token & GraphQL Endpoint 발급.
   - Python / Node.js / cURL용 인터랙티브 API 호출 코드 샘플 및 스키마 탐색기 제공.
3. **Enterprise Deep Audit Center**:
   - 특허 청구항 입력 시 20+ 페이지 분량의 FTO IP Protection PDF 보고서 자동 발급.
   - 장기 세포사멸 감사 B2B 심층 리포트 무제한 생성.

**포털 진입 경로 (Entry Points)**: [SaaSPlatformView.tsx](file:///d:/ProJectHome/DeepTech/src/components/SaaSPlatformView.tsx) 상단 라이선스 상태 박스, [MyResearchPortalView.tsx](file:///d:/ProJectHome/DeepTech/src/components/MyResearchPortalView.tsx) 프로필 헤더 및 구독/결제(billing) 탭 — 두 곳 모두 `user.plan === 'enterprise'` 조건부 렌더링으로 노출.

---

**기술 사양서 보완 완료**: 코즈 AI 개발부장 🫡🔥
