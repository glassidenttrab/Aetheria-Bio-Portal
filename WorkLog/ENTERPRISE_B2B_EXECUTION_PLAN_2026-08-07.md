# DeepTech AI Bio Portal - Enterprise B2B 관제 & 개발자 API 콘솔 상용화 하드웨어·소프트웨어 실전 구축 플랜 (Enterprise B2B Execution Plan)

- **문서 버전**: v1.0.0
- **작성일자**: 2026년 8월 7일
- **작성자**: 코즈 AI 개발부장 (Coz Dev Manager)
- **대상 레포지토리**: `glassidenttrab/Aetheria-Bio-Portal` (`d:\ProJectHome\Aetheria-Bio-Portal`)

---

## 1. 📌 개요 및 B2B 상용화 목적

본 실전 구축 플랜은 **Aetheria Bio Portal의 Enterprise B2B 전용 관제 & 개발자 API 콘솔 ($2,500/월 구독)**을 실제 B2B 제약사 및 생명공학 기업에 상용 서비스로 제공하기 위해 **우리가 백엔드에 사전에 준비하고 구축해야 하는 3대 하드웨어 인프라 및 5대 소프트웨어 시스템 명세**를 정의하고, **5주 간의 순차 개발 및 배포 로드맵**을 제시하는 마스터 실행 문서입니다.

```
[B2B 하드웨어 인프라 준비] ➕ [B2B 백엔드 소프트웨어 구축] ➡️ [5주 순차 상용 배포 로드맵 실행]
```

---

## 🛠️ 2. 우리가 사전에 준비해야 하는 3대 하드웨어 인프라 명세 (Hardware Requirements)

Enterprise B2B 고객사 연구팀이 REST/GraphQL API를 호출하거나 온프레미스/단독 서브넷을 활용할 때 안정적으로 서비스를 구동하기 위해 **우리가 구축해 두어야 하는 서버 및 네트워크 자원**입니다.

### 🖥️ 2.1. B2B API 관제 & 게이트웨이 전용 서버 (API Gateway Server)

- **스펙**: AWS EC2 `c6i.xlarge` 또는 `t3.xlarge` (8 vCPU, 16GB RAM, 100GB NVMe SSD SSD).
- **역할**:
  - Enterprise 생산용 API Key (`deeptech_ent_live_xxx`) 실시간 인증 및 암호화 검증.
  - Token Bucket 알고리즘 기반 초당/분당 호출 제한 (Rate-Limiting, 기본 1,000 req/min).
  - CORS, IP Whitelisting 방화벽 제어 및 B2B API 호출 로그 수집.

### ⚡ 2.2. AI 파이프라인 연산 GPU 서버 클러스터 (AI Inference GPU Cluster)

- **스펙**: AWS `g5.2xlarge` (NVIDIA A10G GPU 24GB VRAM) 또는 RunPod / Lambda Labs 전용 GPU 인스턴스.
- **역할**:
  - AlphaFold 3D 단백질 구조 예측 및 pLDDT 신뢰도 계산 연산.
  - AutoDock Vina 분자 결합력(IC50) 도킹 계산 및 SenoScan™ 장기 세포사멸 감사 시뮬레이션 처리.

### 🌐 2.3. Enterprise B2B 전용 단독 VPC 서브넷 인프라 (Dedicated VPC Subnet)

- **스펙**: AWS VPC / GCP Virtual Network 기반 격리 가상망 (Private Subnets, NAT Gateway, Elastic IP).
- **역할**:
  - 제약사 전용 독립 IP 대역 확보 및 보안 가상망 제공.
  - 제약사 사내망과 직접 연결할 수 있는 Site-to-Site VPN / AWS Direct Connect 엔드포인트 수성.

---

## 💻 3. 우리가 사전에 개발해야 하는 5대 소프트웨어 파이프라인 명세 (Software Requirements)

프론트엔드 콘솔 인터페이스(`EnterpriseB2BConsoleModal.tsx`) 백엔드에서 실제로 동작해야 하는 **백엔드 API, SDK 패키지, Docker 컨테이너 레지스트리 및 PDF 엔진**입니다.

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                        Enterprise B2B Software Architecture                           │
├───────────────────┬───────────────────┬───────────────────┬────────────────────────────┤
│ 1. API Gateway    │ 2. Private ECR    │ 3. PyPI/NPM SDK   │ 4. PDF Generation Engine   │
│ (FastAPI + Redis) │ (Docker Engine)   │ (deeptech-bio-sdk)│ (Headless Chromium)        │
└───────────────────┴───────────────────┴───────────────────┴────────────────────────────┘
```

### 🛡️ 3.1. B2B API 게이트웨이 & RSA 라이선스 게이팅 소프트웨어

- **기술 스택**: FastAPI + Redis + PyJWT + cryptography (RSA-256).
- **핵심 기능**:
  - `POST /api/v1/target/scan`, `GET /api/v1/alphafold/3d`, `POST /api/v1/fto/analyze` 실제 백엔드 API 핸들러 구동.
  - B2B API Key 해시 검증 및 라이선스 만료일/사용량 자동 카운팅 게이팅.

### 📦 3.2. 프라이빗 Docker 컨테이너 레지스트리 & 오프라인 모델 패키지

- **기술 스택**: AWS ECR Private Registry + Docker Compose.
- **핵심 기능**:
  - 고객사 온프레미스 배포용 `deeptech-bio-engine:v1.0.tar.gz` 컨테이너 이미지 패키징.
  - 오프라인 환경에서 작동하는 AI 가중치 데이터 및 RSA-256 서명된 `license.key` 검증 모듈 포함.

### 💻 3.3. 공식 B2B 개발자 SDK 패키지 제작 및 글로벌 레지스트리 등록

- **기술 스택**: Python Setuptools (PyPI) + TypeScript/Node.js (NPM).
- **핵심 기능**:
  - **PyPI 공식 패키지**: `pip install deeptech-bio-sdk` 설치 시 바로 10분 만에 LIMS 파이썬 코드 연동 가능.
  - **NPM 공식 패키지**: `npm install @deeptech/bio-sdk` 제공.

### 📄 3.4. 고성능 Executive PDF 감사 보고서 생성 백엔드 마이크로서비스

- **기술 스택**: Node.js + Playwright (Headless Chromium) + PDF-Lib.
- **핵심 기능**:
  - 표적분자 및 특허 청구항 번호 입력 시 20+ 페이지 분량의 B2B FTO & SenoScan™ PDF 감사 보고서 서버측 정밀 렌더링.
  - 제약사 전용 보안 암호화, 위변조 방지 워터마크 및 전자 서명 자동 첨부.

### 📊 3.5. 영속성 데이터베이스 & B2B 실시간 감사 로그 관제 시스템

- **기술 스택**: PostgreSQL 15 + Elasticsearch & Kibana (ELK Stack).
- **핵심 기능**:
  - B2B 기업 회원 정보, API Key 매핑, 결제 이력 및 파이프라인 수행 이력 저장.
  - Enterprise B2B 콘솔 상에서 실시간 API 호출 지연시간(Latency), 성공률(200 OK) 및 쿼리 처리량 시각화.

---

## 🗓️ 4. B2B 상용화 5주 순차 실전 구축 로드맵 (5-Week Execution Timeline)

```
[Week 1: API 게이트웨이] ➡️ [Week 2: SDK 패키지 배포] ➡️ [Week 3: Docker 인프라] ➡️ [Week 4: PDF 엔진] ➡️ [Week 5: B2B 런칭]
```

### 1. **Week 1: B2B API 게이트웨이 & 인증 백엔드 구축**

- FastAPI + Redis 환경 구축, API Key 생성/검증/Rotate 핸들러 및 Rate-Limiter 미들웨어 개발.

### 2. **Week 2: B2B SDK 패키지 개발 및 PyPI / NPM 공식 등록**

- Python (`deeptech-bio-sdk`) 및 Node.js (`@deeptech/bio-sdk`) SDK 개발 후 PyPI/NPM 레지스트리 등록.

### 3. **Week 3: 온프레미스 Docker 패키지 & ECR 프라이빗 레지스트리 구축**

- AWS ECR 프라이빗 레지스트리 개설 및 오프라인 배포용 Docker 타르볼(`deeptech-bio-engine:v1.0.tar.gz`) 패키징.

### 4. **Week 4: Headless Chrome 기반 PDF 감사 보고서 자동 생성 백엔드 구축**

- Playwright 기반 PDF 생성 백엔드 마이크로서비스 구축 및 암호화 워터마크 자동화.

### 5. **Week 5: AWS Terraform VPC 서브넷 자동화 스크립트 검증 & B2B 라이브 런칭**

- Terraform 자동 배포 스크립트 테스트 및 `EnterpriseB2BConsoleModal.tsx` 라이브 백엔드 엔드포인트 최종 연결.

---

## 💵 5. B2B 하드웨어·소프트웨어 인프라 운영 비용 추산표 & ROI 마진 분석 (Cost Breakdown & Profitability)

Enterprise B2B 기업 전용 관제 & 개발자 API 콘솔 서비스를 구축하고 운영할 때 발생하는 **월간/연간 클라우드 및 소프트웨어 유지비용 추산표**와 B2B 플랜($2,500/월) 유치 시 **수익성 마진 구조** 분석입니다.

### 💰 5.1. 월간/연간 인프라 유지 비용 추산표 (OpEx Breakdown)

| 구분           | 컴포넌트 스펙                             | 월간 예상 비용 (USD)  | 연간 예상 비용 (USD)     | 비고                                   |
| :------------- | :---------------------------------------- | :-------------------- | :----------------------- | :------------------------------------- |
| **하드웨어**   | API Gateway 서버 (AWS EC2 `c6i.xlarge`)   | $90 ~ $150            | $1,080 ~ $1,800          | 1년 예약 인스턴스(RI) 적용 시 $90/월   |
| **하드웨어**   | AI 연산 GPU 서버 (AWS `g5.2xlarge` A10G)  | $300 ~ $730           | $3,600 ~ $8,760          | Auto-scaling/Spot 혼용 시 $300/월 절감 |
| **하드웨어**   | Enterprise 단독 VPC & NAT Gateway         | $70 ~ $120            | $840 ~ $1,440            | B2B 제약사 단독 가상망 및 VPN          |
| **하드웨어**   | PostgreSQL DB & Redis (RDS + ElastiCache) | $120 ~ $150           | $1,440 ~ $1,800          | 회원 DB, API Key, 세션 및 캐시         |
| **소프트웨어** | AWS ECR & S3 스토리지 (Docker/PDF/백업)   | $30 ~ $50             | $360 ~ $600              | 500GB 스토리지 및 네트워크 아웃바운드  |
| **소프트웨어** | Datadog/ELK 관제 + SSL + SendGrid 이메일  | $80 ~ $100            | $960 ~ $1,200            | APM 관제, SSL 서티피케이트, 이메일 API |
| **합계**       | **최소 기본 가동 ~ 최대 풀가동**          | **$690 ~ $1,300 /월** | **$8,280 ~ $15,600 /연** | **월 약 90만 원 ~ 170만 원 수준**      |

> 💡 **비용 절감 팁 (Cost Optimization)**: 초기 런칭 시 GPU 인스턴스를 Auto-scaling 정책(요청 시 가동)으로 설정하면 **기본 월 인프라 운영비를 $690 (약 90만 원)** 수준으로 고정할 수 있습니다.

---

### 📈 5.2. Enterprise B2B ($2,500/월) 유치 시 수익성 & 마진율 (ROI Analysis)

```
[Enterprise 1개 고객사 계약] ➡️ 매출 $2,500/월 ➖ 원가 $350/월 ＝ 순이익 $2,150/월 (마진율 86%)
[Enterprise 5개 고객사 계약] ➡️ 매출 $12,500/월 ➖ 원가 $1,800/월 ＝ 순이익 $10,700/월 (마진율 85.6%)
```

1. **Enterprise 1개 제약사 유치 시 (월 $2,500 = 약 330만 원)**:
   - 월 매출: **$2,500**
   - 추가 인프라 변동 원가: **+$350** (단독 서브넷 + 추가 GPU 할당량)
   - **월 순이익: $2,150 (약 285만 원 / 마진율 86.0%)**
2. **Enterprise 5개 제약사 유치 시 (월 $12,500 = 약 1,650만 원)**:
   - 월 매출: **$12,500 (연간 환산 $150,000 = 약 2억 원)**
   - 총 인프라 운영 원가: **$1,800** (GPU 클러스터 스케일아웃 포함)
   - **월 순이익: $10,700 (약 1,410만 원 / 마진율 85.6%)**

---

## 📊 6. 요약 하드웨어·소프트웨어 명세표 (Master Spec Sheet)

| 구분           | 컴포넌트 명칭        | 핵심 기술 스택                   | 비고 (우리가 준비하는 자산)                |
| :------------- | :------------------- | :------------------------------- | :----------------------------------------- |
| **하드웨어**   | API Gateway 서버     | AWS EC2 (8 vCPU, 16GB RAM)       | API Key 검증 & rate limiting 서버 ($90/월) |
| **하드웨어**   | GPU 연산 서버        | AWS g5.2xlarge (NVIDIA A10G GPU) | AlphaFold 3D & IC50 연산 서버 ($300/월)    |
| **하드웨어**   | B2B 단독 VPC 서브넷  | AWS VPC / Terraform IaC          | 제약사 전용 가상 서브넷 인프라 ($70/월)    |
| **소프트웨어** | API 게이트웨이 엔진  | FastAPI + Redis + RSA-256        | B2B REST/GraphQL 게이트웨이 모듈           |
| **소프트웨어** | 온프레미스 Docker    | AWS ECR Private Registry         | `deeptech-bio-engine:v1.0.tar.gz`          |
| **소프트웨어** | B2B 개발자 SDK       | PyPI & NPM 레지스트리            | `deeptech-bio-sdk` 라이브러리              |
| **소프트웨어** | PDF 감사 보고서 엔진 | Headless Chromium (Playwright)   | 20+ 페이지 Executive PDF 백엔드 엔진       |
| **소프트웨어** | 관제 DB & 감사 로그  | PostgreSQL 15 + ELK Stack        | B2B 트래픽 & 로그 분석 시스템 ($120/월)    |

---

**플랜 작성 완료**: 코즈 AI 개발부장 🫡🔥
