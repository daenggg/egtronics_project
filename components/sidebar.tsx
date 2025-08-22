"use client"

import { Suspense } from 'react' // 1. Suspense를 import 합니다.
import { useAuth } from "@/contexts/auth-context"
import Profile from "@/components/ui/profile"
import { CategoryFilter } from "@/components/category-filter"

// 2. CategoryFilter가 로딩되는 동안 보여줄 스켈레톤 UI를 만듭니다.
function CategoryFilterSkeleton() {
  return (
    <div className="animate-pulse space-y-2 pt-4">
      <div className="h-4 bg-gray-200 rounded w-1/3"></div>
      <div className="h-8 bg-gray-200 rounded"></div>
      <div className="h-8 bg-gray-200 rounded"></div>
      <div className="h-8 bg-gray-200 rounded"></div>
    </div>
  )
}

export function Sidebar() {
  const { isSidebarOpen, toggleSidebar } = useAuth()

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 bg-black/60 z-30 transition-opacity duration-300 ease-in-out ${
          isSidebarOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        onClick={toggleSidebar}
        aria-hidden="true"
      />
      {/* Sidebar */}
      <aside
        className={`
          fixed top-0 left-0 h-full z-40 w-64 bg-white/95 backdrop-blur-sm shadow-2xl
          transition-transform duration-300 ease-in-out
          ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"}
          overflow-y-auto pt-20
        `}
      >
        <div className="space-y-6 px-4 w-64">
          <Profile />
          {/* 3. useSearchParams를 사용하는 CategoryFilter를 Suspense로 감싸줍니다. */}
          <Suspense fallback={<CategoryFilterSkeleton />}>
            <CategoryFilter onCategorySelect={toggleSidebar} />
          </Suspense>
        </div>
      </aside>
    </>
  )
}