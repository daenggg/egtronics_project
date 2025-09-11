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
      <body className={`${inter.className} min-h-screen bg-background text-foreground`}>
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}