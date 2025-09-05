# =================================================================
#  1단계: 빌더(Builder) 스테이지
#  역할: 소스코드를 빌드하여 실행 파일만 깔끔하게 준비하는 '조리대'
# =================================================================
FROM node:18-alpine AS builder

# 작업 폴더를 /app으로 설정
WORKDIR /app

# package.json과 yarn.lock 파일을 먼저 복사
# yarn을 사용하므로 yarn.lock 파일을 함께 복사해야 합니다.
COPY package.json yarn.lock ./

# 의존성 설치 (npm 대신 yarn 사용)
RUN yarn install

# 나머지 모든 소스 코드를 복사
COPY . .

# Next.js 앱 빌드 (yarn 사용)
RUN yarn build


# =================================================================
#  2단계: 러너(Runner) 스테이지
#  역할: 빌드된 결과물만 담아 실제로 손님에게 나갈 작고 깨끗한 '서빙 접시'
# =================================================================
FROM node:18-alpine AS runner

# 작업 폴더를 /app으로 설정
WORKDIR /app

# 빌더 스테이지에서 생성된 파일들만 선택적으로 복사
# 1. standalone 폴더 복사 (실행에 필요한 최소한의 파일들)
COPY --from=builder /app/.next/standalone ./
# 2. public 폴더 복사 (이미지 등 정적 파일)
COPY --from=builder /app/public ./public
# 3. static 폴더 복사 (빌드된 CSS, JS 등)
COPY --from=builder /app/.next/static ./.next/static

# 이 컨테이너는 3000번 포트를 사용할 것임을 명시
EXPOSE 3000

# 환경 변수 설정 (운영 환경임을 명시)
ENV NODE_ENV=production

# 컨테이너 시작 시 실행될 최종 명령어
# standalone 폴더 안의 server.js를 실행하여 서버를 구동
CMD ["node", "server.js"]

