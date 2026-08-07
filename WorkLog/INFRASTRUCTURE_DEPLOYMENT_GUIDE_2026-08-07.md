# DeepTech AI Bio Portal - 클라우드 인프라 3단계 구축 & 상용 런칭 순차 절차서 (Infrastructure Deployment Guide)

- **문서 버전**: v1.0.0
- **작성일자**: 2026년 8월 7일
- **작성자**: 코즈 AI 개발부장 (Coz Dev Manager)
- **대상 레포지토리**: `glassidenttrab/Aetheria-Bio-Portal` (`d:\ProJectHome\Aetheria-Bio-Portal`)

---

## 1. 📌 개요 및 단계별 인프라 로드맵

본 문서는 **Aetheria Bio Portal (전신 10대 의학과 38+ 사이언스 스킬 포털)**을 실제 상용 인터넷 서비스로 런칭하기 위해 **1단계(초저비용 무자본 시작)**부터 **2단계(독립 VPS 백엔드 구축)**, **3단계(Enterprise B2B 단독 서브넷 배포)**까지 각 단계별로 이행해야 하는 **구체적인 순차 작업 절차(Step-by-Step Procedure)**를 정리한 가이드북입니다.

```
[1단계: Vercel + Supabase + Stripe (월 0~2.5만 원)]
       ⬇️
[2단계: FastAPI + Docker VPS 인스턴스 (월 3~5만 원)]
       ⬇️
[3단계: Enterprise B2B AWS/GCP 단독 서브넷 (구독료 수익으로 충당)]
```

---

## 🚀 2. 1단계: 초저비용 무자본 상용 런칭 절차 (월 0원 ~ 2.5만 원)

> **목적**: 초기 고정비 부담 없이 상용 도메인(`aetheria.bio`), 글로벌 CDN, 실제 회원가입 및 Stripe 결제 시스템을 즉시 오픈하는 절차입니다.

### 📋 순차 실행 단계 (Step-by-Step)

#### Step 1-1. 상용 도메인 구입 및 Cloudflare DNS 연결

1. **도메인 등록**: Namecheap / Porkbun / GoDaddy에서 상용 도메인(예: `aetheria.bio` 또는 `deeptech-pharma.ai`) 구입.
2. **Cloudflare 네임서버 등록**: Cloudflare 무료 플랜 가입 후 도메인 네임서버 매핑 (무료 SSL/TLS 인증서 & DDoS 방화벽 자동 확보).

#### Step 1-2. Vercel 프론트엔드 무상 글로벌 배포

1. **Vercel 회원가입**: GitHub 계정으로 [Vercel](https://vercel.com) 로그인.
2. **레포지토리 연결**: GitHub 레포지토리 (`ProShotOz`) 1클릭 임포트(Import).
3. **빌드 설정 확인**: Framework Preset `Vite`, Build Command `npm run build`, Output Directory `dist` 지정.
4. **커스텀 도메인 매핑**: Vercel Settings ➡️ Domains 탭에서 `aetheria.bio` 추가 및 Cloudflare CNAME/A 레코드 매핑 (1분 내 SSL 자동 활성화).

#### Step 1-3. Supabase 회원가입 & 데이터베이스 (BaaS) 개설

1. **Supabase 프로젝트 생성**: [Supabase](https://supabase.com) 가입 후 무료 PostgreSQL 데이터베이스 생성.
2. **인증(Auth) 설정**: Email/Password 및 Google OAuth 로그인 기능 ON.
3. **React 앱 연동**: 프론트엔드 환경변수(`.env.production`)에 `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY` 설정.

#### Step 1-4. Stripe PG 라이브 결제 연동

1. **Stripe 가입 & 승인**: [Stripe](https://stripe.com) 비즈니스 계정 가입 및 라이브 키(`pk_live_...`, `sk_live_...`) 발급.
2. **구독 상품 등록**: Pro ($490/월) 및 Enterprise ($2,500/월) Recurring Subscription 결제 상품 등록.
3. **Checkout 버튼 연결**: `AuthCheckoutModal.tsx`에 Stripe 결제 링크 및 Webhook 결제 승인 이벤트를 연결.

---

## 🖥️ 3. 2단계: 독립 클라우드 VPS 백엔드 서버 구축 절차 (월 3만 원 ~ 5만 원)

> **목적**: 트래픽 증가 및 대용량 AI 파이프라인 처리 시 독립된 리눅스 서버 인스턴스에서 FastAPI 백엔드, Redis 큐, PostgreSQL DB를 구동하는 절차입니다.

### 📋 순차 실행 단계 (Step-by-Step)

#### Step 2-1. 리눅스 VPS 인스턴스 임대 & 고정 IP 할당

1. **서버 인스턴스 생성**: Hetzner / DigitalOcean / AWS LightSail에서 **Ubuntu 22.04 LTS (2 vCPU, 4~8GB RAM)** 인스턴스 선택.
2. **고정 IP (Elastic IP) 할당**: 서버에 변하지 않는 고정 공인 IP 주소 매핑.

#### Step 2-2. 서버 보안 및 Docker 환경 구축

1. **SSH 보안 로그인**: 비밀번호 로그인 차단 및 SSH Key 전용 접속 적용.
2. **방화벽(UFW) 설정**:
   ```bash
   sudo ufw allow 22/tcp   # SSH
   sudo ufw allow 80/tcp   # HTTP
   sudo ufw allow 443/tcp  # HTTPS
   sudo ufw enable
   ```
3. **Docker & Compose 설치**:
   ```bash
   curl -fsSL https://get.docker.com | sh
   sudo usermod -aG docker $USER
   ```

#### Step 2-3. 백엔드 마이크로서비스 패키지 컨테이너 배포

1. **`docker-compose.yml` 구동**:
   ```yaml
   version: "3.8"
   services:
     api:
       image: deeptech-fastapi:latest
       ports: ["8000:8000"]
     db:
       image: postgres:15
       volumes: [pgdata:/var/lib/postgresql/data]
     redis:
       image: redis:alpine
   ```
2. **Nginx Reverse Proxy & Certbot SSL 적용**:
   - `api.aetheria.bio` 도메인을 8000번 포트로 프록시 설정하고 `certbot --nginx` 명령어로 무료 Let's Encrypt SSL/TLS 적용.

---

## 🏢 4. 3단계: Enterprise B2B 전용 단독 서브넷 & 온프레미스 배포 절차 (Enterprise 고객)

> **목적**: 월 $2,500 결제 B2B 제약사를 위해 전용 AWS/GCP VPC 서브넷을 개설하거나 고객사 사내망에 Docker 패키지를 이식하는 절차입니다.

### 📋 순차 실행 단계 (Step-by-Step)

#### Step 3-1. Enterprise B2B 온보딩 확인 & 요건 정의

1. **신청 내역 확인**: Enterprise B2B Console (`EnterpriseB2BConsoleModal.tsx`)에서 고객사 인프라 선택 방식 확인 (Enterprise Cloud API vs AWS VPC Subnet vs On-Premise Docker).

#### Step 3-2. AWS / GCP VPC 단독 서브넷 자동 개설 (Cloud 배포 시)

1. **Terraform 배포 실행**:
   ```bash
   terraform init
   terraform apply -var="client_name=aetheria_pharma" -var="region=us-east-1"
   ```
2. **결과**: 제약사 단독 VPC 망에 무제한 API 게이트웨이 및 암호화 DB 가상 인스턴스가 5분 내 전자동 생성됨.

#### Step 3-3. 온프레미스 Docker 패키지 전달 (사내망 배포 시)

1. **독립 패키지 빌드**: 외부 인프라 단절 오프라인 환경용 `deeptech-bio-engine:v1.0.tar.gz` 및 캐싱 데이터베이스 포함 패키지 생성.
2. **고객사 전달**: 암호화된 보안 다운로드 링크 및 온프레미스 구동 가이드북 전달.
3. **Enterprise 생산용 API Key 전달**: `deeptech_ent_live_xxx` 생산 키 발급 완료.

---

## 📊 5. 요약 체크리스트 (Summary Checklist)

| 단계      | 추진 과제                   | 핵심 사용 기술/서비스                     | 예상 고정비                    |
| :-------- | :-------------------------- | :---------------------------------------- | :----------------------------- |
| **1단계** | 프론트엔드 + BaaS + PG 연동 | Vercel + Supabase + Stripe + Cloudflare   | **월 0원 ~ 2.5만 원**          |
| **2단계** | 독립 백엔드 API & DB 구축   | FastAPI + Docker + PostgreSQL + Hetzner   | **월 3만 원 ~ 5만 원**         |
| **3단계** | Enterprise B2B 전용 인프라  | AWS/GCP Terraform VPC Subnet / On-Premise | **고객 구독료($2,500)로 충당** |

---

**절차서 작성 완료**: 코즈 AI 개발부장 🫡🔥
