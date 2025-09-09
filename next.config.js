/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: "standalone",
  // API 요청을 백엔드로 프록시하기 위한 설정입니다.
  // 개발 및 프로덕션 환경 모두에서 동작하여 CORS 및 쿠키 문제를 해결합니다.
  async rewrites() {
    return [
      {
        // '/api'로 시작하는 모든 경로의 요청을
        source: "/api/:path*",
        // 실제 백엔드 서버 주소로 전달합니다.
        // NEXT_PUBLIC_API_URL 환경 변수가 있으면 그 값을 사용하고,
        // 없으면 (예: 빌드 시점) 기본 백엔드 주소를 사용합니다.
        // 이렇게 하면 빌드 오류를 방지하고, 런타임에는 deploy.sh에서 주입된
        // 환경 변수를 사용하여 올바른 백엔드 서버로 요청을 보냅니다.
        destination: `${process.env.NEXT_PUBLIC_API_URL || 'http://192.168.0.172:8080'}/:path*`,
      },
    ];
  },
};

module.exports = nextConfig;