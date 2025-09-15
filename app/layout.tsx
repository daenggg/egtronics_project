import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { AppProviders } from '@/components/AppProviders';
import { ScrollToTopButton } from '@/components/scroll-to-top-button';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: '게시판',
  description: '커뮤니티 게시판',
  generator: 'v0.dev',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    // 여기에 suppressHydrationWarning={true}를 추가해주세요.
    <html lang="ko" suppressHydrationWarning>
      <body className={`${inter.className} min-h-screen bg-background text-foreground`}>
        <AppProviders>
          {children}
          <ScrollToTopButton />
        </AppProviders>
      </body>
    </html>
  );
}