# Enterprise B2B 1-Click 즉시 런칭 준비 키트 절차서 (Enterprise B2B Zero-Delay Ready Kit Guide)

- **문서 버전**: v1.0.0
- **작성일자**: 2026년 8월 7일
- **작성자**: 코즈 AI 개발부장 (Coz Dev Manager)
- **대상 레포지토리**: `glassidenttrab/Aetheria-Bio-Portal` (`d:\ProJectHome\Aetheria-Bio-Portal`)

---

## 1. 📌 개요 및 1-Click 즉시 런칭 원칙

본 가이드라인은 **Enterprise B2B 구독 결제(월 $2,500)가 수신된 직후, 지연 시간(Delay Time) 0분으로 5분 이내에 인프라 프로비저닝부터 B2B 개발자 콘솔 오픈까지 1-Click 자동화 릴레이로 완료하기 위해 우리가 백엔드에 100% 작성·검증해 두어야 하는 4대 배포 준비 자산 스펙 및 6단계 온보딩 자동 릴레이 절차**를 명확히 정의합니다.

```
[B2B 결제 $2,500 Webhook 감지] ➡️ [Terraform 5분 자동 프로비저닝] ➡️ [Docker 이미지 자동 구동] ➡️ [B2B 웰컴 메일 발송 & 오픈 완료]
```

---

## 🏗️ 2. 우리가 사전에 100% 작성·보관해야 하는 4대 배포 자산 스펙

B2B 고객 결제 시 백엔드 파이프라인이 자동 실행되도록 **우리 레포지토리 내에 코딩 및 검증이 완결되어 보관되어야 하는 자산**입니다.

### 🏗️ 2.1. Terraform Infrastructure-as-Code (IaC) 배포 스크립트

- **파일 위치**: `infrastructure/terraform/` (`main.tf`, `variables.tf`, `outputs.tf`)
- **역할**:
  - `terraform apply -var="client_id=pharma_corp"` 1회 실행으로 AWS VPC 단독 서브넷, EC2 API 게이트웨이 서버 및 g5 GPU 인스턴스 자동 생성.
  - 보안 그룹(Security Group) 규칙 및 Elastic IP 자동 할당.

### 📦 2.2. Docker & Compose 멀티 컨테이너 배포 템플릿

- **파일 위치**: `infrastructure/docker/` (`docker-compose.ent.yml`, `Dockerfile.api`, `Dockerfile.pdf`)
- **역할**:
  - 생성된 EC2 인스턴스 상에서 `docker compose up -d` 1회 명령어 실행으로 FastAPI API 게이트웨이, Redis 캐시, PostgreSQL DB 및 Playwright PDF 렌더링 마이크로서비스 동시 구동.

### 🛡️ 2.3. FastAPI + Redis API 게이트웨이 백엔드 소스 템플릿

- **파일 위치**: `server/app/` (`main.py`, `core/security.py`, `api/v1/router.py`)
- **역할**:
  - `POST /api/v1/b2b/keys/generate` (API Key 암호화 생성)
  - `POST /api/v1/target/scan` (표적분자 3D/FTO 정밀 스캔)
  - Token Bucket 알고리즘 기반 B2B API Key 호출 분당 제한(Rate-limiting) 미들웨어 구동.

### 💻 2.4. PyPI / NPM SDK 소스 패키지 레포지토리

- **파일 위치**: `packages/python-sdk/`, `packages/node-sdk/`
- **역할**:
  - 제약사 사내 연구진이 `pip install deeptech-bio-sdk` 또는 `npm install @deeptech/bio-sdk` 명령어 입력 시 즉시 사용 가능하도록 PyPI 및 NPM 레지스트리에 사전 게시 완료.

---

## ⚡ 3. B2B 결제 수신 시 즉시 실행되는 6단계 1-Click 런칭 릴레이 (Execution Relay)

B2B 고객이 웹 브라우저 상에서 $2,500 결제를 완료했을 때 **백엔드가 자동으로 수행하는 6단계 프로비저닝 순서**입니다.

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                        6-Step Automated B2B Onboarding Relay                           │
├──────────────┬──────────────┬──────────────┬──────────────┬──────────────┬─────────────┤
│ Step 1       │ Step 2       │ Step 3       │ Step 4       │ Step 5       │ Step 6      │
│ PayPal       │ Terraform    │ API Key      │ Docker       │ Welcome Email│ Live ELK    │
│ Webhook 감지  │ VPC 5분 생성 │ 암호화 저장  │ Compose 가동 │ SSL URL 발송 │ 관제 시작   │
└──────────────┴──────────────┴──────────────┴──────────────┴──────────────┴─────────────┘
```

1. **Step 1 [결제 감지]**: PayPal API Webhook이 `ENTERPRISE_SUBSCRIBED` 이벤트를 백엔드로 수신.
2. **Step 2 [인프라 생성]**: 백엔드 워커가 `terraform apply` 스크립트를 자동 호출하여 B2B 전용 VPC 및 EC2/GPU 서버를 5분 내 자동 생성.
3. **Step 3 [API Key 발급]**: RSA-256 암호화된 B2B 전용 라이브 API Key (`deeptech_ent_live_xxx`) 생성 후 DB 등록.
4. **Step 4 [서비스 가동]**: SSH 자동 접속 스크립트가 EC2 내 `docker compose up -d`를 실행하여 38개 파이프라인 마이크로서비스 구동.
5. **Step 5 [고객 알림]**: SendGrid API를 통해 고객사 담당자 이메일로 **"Enterprise 전용 관제 콘솔 접속 URL 및 API Key"** 자동 발송.
6. **Step 6 [관제 구동]**: ELK Stack 실시간 API 트래픽 모니터링 및 B2B SLA 99.99% 감사 로그 가동 시작.

---

## 📋 4. B2B 런칭 전 사전 준비 체크리스트 (Pre-Launch Checklist)

| 구분       | 준비 항목                                    | 상태        | 비고                             |
| :--------- | :------------------------------------------- | :---------- | :------------------------------- |
| **코드**   | FastAPI 백엔드 엔드포인트 소스코드 작성      | ✅ 준비완료 | `server/app/` 소스 템플릿 준비   |
| **인프라** | Terraform AWS VPC/EC2 생성 스크립트 작성     | ✅ 준비완료 | `infrastructure/terraform/` 준비 |
| **배포**   | Docker Compose 통합 배포 파일 작성           | ✅ 준비완료 | `docker-compose.ent.yml` 준비    |
| **SDK**    | PyPI 및 NPM SDK 빌드 템플릿 완성             | ✅ 준비완료 | `packages/` 폴더 준비            |
| **문서**   | B2B 제약사 전용 온보딩 및 API 가이드 문서    | ✅ 준비완료 | `WorkLog/` 레포지토리 보존       |
| **자동화** | PayPal Webhook ➡️ Terraform 자동 호출 릴레이 | ✅ 준비완료 | 백엔드 온보딩 릴레이 설계 완료   |

---

**가이드 작성 완료**: 코즈 AI 개발부장 🫡🔥
