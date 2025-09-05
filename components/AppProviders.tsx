"use client"; // 이 파일이 클라이언트 컴포넌트임을 명시합니다.

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { useState } from "react";
import { AuthProvider, useAuth } from "@/contexts/auth-context";
import { Header } from "@/components/header";
import { Toaster } from "@/components/ui/toaster";
import { Sidebar } from "@/components/sidebar";
import { ThemeProvider } from "next-themes";

function AppLayout({ children }: { children: React.ReactNode }) {
  const { isSidebarOpen } = useAuth();

  return (
    <>
      <Header />
      <Sidebar />
      <main
        className={`
          min-h-screen bg-gray-50 pt-12
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
  // React Query 클라이언트를 컴포넌트가 리렌더링되어도 유지되도록 useState로 생성합니다.
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            // staleTime: 5분. 이 시간 내에는 캐시된 데이터를 사용합니다.
            staleTime: 1000 * 60 * 5,
            // 사용자가 다른 창을 갔다가 돌아왔을 때 자동으로 데이터를 다시 가져오지 않습니다.
            refetchOnWindowFocus: false,
            retry: 1,
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
        <AuthProvider>
          <AppLayout>{children}</AppLayout>
          <Toaster />
        </AuthProvider>
      </ThemeProvider>
      {/* 개발 환경에서 React Query 상태를 시각적으로 디버깅할 수 있는 도구 */}
      {process.env.NODE_ENV === 'development' && (
        <ReactQueryDevtools initialIsOpen={false} />
      )}
    </QueryClientProvider>
  );
}