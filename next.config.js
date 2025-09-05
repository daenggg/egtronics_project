/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: 'standalone',
  // 개발 환경에서 API 요청을 백엔드로 프록시하기 위한 설정
  // 브라우저의 Same-Origin Policy 및 SameSite 쿠키 문제를 우회합니다.
  async rewrites() {
    return [
      {
        // '/api'로 시작하는 모든 경로의 요청을
        source: '/api/:path*',
        // 실제 백엔드 서버 주소로 전달합니다.
        destination: 'http://192.168.0.172:8080/:path*',
      },
    ];
  },
};

module.exports = nextConfig;