import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { AppProviders } from '@/components/AppProviders'; // 1단계에서 만든 컴포넌트를 import

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: '게시판',
  description: '커뮤니티 게시판',
  generator: 'v0.dev',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <body className={`${inter.className} min-h-screen`}>
        {/*
          모든 클라이언트 관련 컴포넌트를 AppProviders로 감싸줍니다.
          이렇게 하면 서버/클라이언트 경계가 명확해집니다.
        */}
        <AppProviders>
          {children}
        </AppProviders>
      </body>
    </html>
  );
}