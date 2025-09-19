// next.config.js

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: "standalone",

  // 이전에 다른 파일에 있던 설정들을 여기에 합칩니다.
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },

  // 가장 중요한 API 프록시 설정
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: 'http://localhost:8080/:path*',
      },
    ];
  },
 };

module.exports = nextConfig;