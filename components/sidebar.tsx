"use client"

import { Suspense } from 'react' // 1. Suspense를 import 합니다.
import Link from 'next/link'
import { useAuth } from "@/contexts/auth-context"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card, CardContent } from "@/components/ui/card"
import { API_BASE } from '@/lib/api-client'
import { CreatePostButton } from './create-post-button'
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
  const { user, isSidebarOpen, toggleSidebar } = useAuth()

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 bg-black/60 z-30 transition-opacity duration-300 ease-in-out lg:hidden ${
          isSidebarOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        onClick={toggleSidebar}
        aria-hidden="true"
      />
      {/* Sidebar */}
      <aside
        className={`
          fixed top-0 left-0 h-full z-40 w-64 bg-background/95 backdrop-blur-sm shadow-2xl
          transition-transform duration-300 ease-in-out
          ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"}
          overflow-y-auto pt-32
        `}
      >
        <div className="space-y-6 px-4 w-64">
          <Card className="glass-effect border-0 shadow-lg bg-card">
            <CardContent className="p-4 flex flex-col gap-4">
              {user ? (
                <Link href="/profile" className="flex items-center gap-4 w-full" onClick={toggleSidebar}>
                  <Avatar className="h-12 w-12 ring-2 ring-blue-200">
                    <AvatarImage
                      src={user.profilePicture ? `${API_BASE}${user.profilePicture}` : "/images.png"}
                      alt={user.name || user.nickname}
                    />
                    <AvatarFallback className="bg-gradient-to-r from-blue-500 to-purple-500 text-white">
                      {user.nickname.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 overflow-hidden">
                    <p className="font-semibold text-foreground truncate">{user.nickname}</p>
                    <p className="text-sm text-muted-foreground truncate">{user.email}</p>
                  </div>
                </Link>
              ) : (
                <p className="text-sm text-center text-muted-foreground">로그인하고 모든 기능을 이용해보세요.</p>
              )}
              {/* 글 작성 버튼을 클릭하면 사이드바가 닫히도록 onClick 핸들러 추가 */}
              <div onClick={toggleSidebar} className="flex justify-center">
                <CreatePostButton />
              </div>
            </CardContent>
          </Card>
          {/* 3. useSearchParams를 사용하는 CategoryFilter를 Suspense로 감싸줍니다. */}
          <Suspense fallback={<CategoryFilterSkeleton />}>
            <CategoryFilter onCategorySelect={toggleSidebar} />
          </Suspense>
        </div>
      </aside>
    </>
  )
}