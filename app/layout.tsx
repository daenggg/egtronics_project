import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { AuthProvider } from '@/contexts/auth-context'
import { Header } from '@/components/header'
import { Toaster } from '@/components/ui/toaster'
import { Sidebar } from '@/components/sidebar'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: '게시판',
  description: '커뮤니티 게시판',
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ko">
      <body className={`${inter.className} bg-gradient-to-br from-blue-50 via-white to-purple-50 min-h-screen`}>
        <AuthProvider>
          <Header />          
          <Sidebar />
          <main className="min-h-screen bg-gray-50 pt-20">
            {children}
          </main>
          <Toaster />
        </AuthProvider>
      </body>
    </html>
  )
}
