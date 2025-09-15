"use client"; // 이 파일이 클라이언트 컴포넌트임을 명시합니다.

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { useState, useEffect } from "react";
import { AuthProvider, useAuth } from "@/contexts/auth-context";
import { Header } from "@/components/header";
import { Toaster } from "@/components/ui/toaster";
import { Sidebar } from "@/components/sidebar";
// 'next-themes'에서 직접 가져오는 것이 좋습니다.
import { ThemeProvider } from "next-themes"; 
import { useSSE } from "@/hooks/use-sse";

function AppLayout({ children }: { children: React.ReactNode }) {
  // ... (AppLayout 코드는 변경 없음)
  const { isSidebarOpen, logout } = useAuth();
  useSSE(); 

  useEffect(() => {
    const handleAuthError = () => {
      logout();
    };

    window.addEventListener('auth-error', handleAuthError);
    return () => {
      window.removeEventListener('auth-error', handleAuthError);
    };
  }, [logout]);

  return (
    <>
      <Header />
      <Sidebar />
      <main
        className={`
          min-h-screen bg-background pt-12
          transition-all duration-300 ease-in-out
          ${isSidebarOpen ? "lg:ml-72" : "ml-0"}
        `}
      >
        {children}
      </main>
    </>
  );
}

export function AppProviders({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 1000 * 60 * 5,
            refetchOnWindowFocus: false,
            retry: 1,
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      {/* 여기에 disableTransitionOnChange 속성을 추가해주세요 */}
      <ThemeProvider 
        attribute="class" 
        defaultTheme="system" 
        enableSystem
        disableTransitionOnChange 
      >
        <AuthProvider>
          <AppLayout>{children}</AppLayout>
          <Toaster />
        </AuthProvider>
      </ThemeProvider>
      {process.env.NODE_ENV === 'development' && (
        <ReactQueryDevtools initialIsOpen={false} />
      )}
    </QueryClientProvider>
  );
}