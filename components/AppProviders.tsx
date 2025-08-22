"use client"; // 이 파일이 클라이언트 컴포넌트임을 명시합니다.

import { AuthProvider } from "@/contexts/auth-context";
import { Header } from "@/components/header";
import { Toaster } from "@/components/ui/toaster";
import { Sidebar } from "@/components/sidebar";

// RootLayout에서 받은 children을 그대로 전달합니다.
export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <Header />
      <Sidebar />
      <main className="min-h-screen bg-gray-50 pt-20">
        {children}
      </main>
      <Toaster />
    </AuthProvider>
  );
}