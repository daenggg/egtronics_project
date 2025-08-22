"use client"; // 이 파일이 클라이언트 컴포넌트임을 명시합니다.

import { AuthProvider, useAuth } from "@/contexts/auth-context";
import { Header } from "@/components/header";
import { Toaster } from "@/components/ui/toaster";
import { Sidebar } from "@/components/sidebar";

function AppLayout({ children }: { children: React.ReactNode }) {
  const { isSidebarOpen } = useAuth();

  return (
    <>
      <Header />
      <Sidebar />
      <main
        className={`
          min-h-screen bg-gray-50 pt-20 
          transition-all duration-300 ease-in-out
          ${isSidebarOpen ? "lg:ml-72" : "ml-0"}
        `}
      >
        {children}
      </main>
      <Toaster />
    </>
  );
}

export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <AppLayout>{children}</AppLayout>
    </AuthProvider>
  );
}