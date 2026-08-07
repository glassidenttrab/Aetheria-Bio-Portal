# ====================================================================
# Aetheria Bio Portal - Multi-Stage Dockerfile
# Stage 1: Build Vite React Application
# Stage 2: Serve via Nginx Production Server
# ====================================================================

# ----- Stage 1: Builder -----
FROM node:20-alpine AS builder

WORKDIR /app

# npm 의존성 복사 및 설치
COPY package.json package-lock.json ./
RUN npm ci

# 소스 코드 복사 및 Vite 빌드
COPY . .
RUN npm run build

# ----- Stage 2: Production -----
FROM nginx:1.25-alpine AS production

# custom Nginx 설정 복사
COPY nginx.conf /etc/nginx/conf.d/default.conf

# 빌드 산출물 복사
COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
