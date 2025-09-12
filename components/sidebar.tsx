"use client"

import Link from 'next/link'
import { useAuth } from "@/contexts/auth-context"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card, CardContent } from "@/components/ui/card"
import { API_BASE } from '@/lib/api-client'
import { CategoryFilter } from "@/components/category-filter"

// 헤더와 동일한 그라데이션 메뉴 아이콘
const GradientMenuIcon = () => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className="h-full w-full"
  >
    <defs>
      <linearGradient id="menu-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stopColor="#ec4899" /> {/* from-pink-500 */}
        <stop offset="100%" stopColor="#8b5cf6" /> {/* to-purple-500 */}
      </linearGradient>
    </defs>
    <path d="M4 6h16M4 12h16M4 18h16" stroke="url(#menu-gradient)" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

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
          fixed top-0 left-0 h-full z-40 w-64 bg-card/95 backdrop-blur-sm shadow-2xl
          transition-transform duration-300 ease-in-out bg-white dark:bg-card
          ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"}
          overflow-y-auto 
        `}
      >
        {/* 사이드바 헤더 */}
        <div className="sticky top-0 bg-white/80 dark:bg-card/80 backdrop-blur-sm z-10">
          <div className="flex h-16 items-center px-8 pt-14">
            <button onClick={toggleSidebar} className="h-8 w-8 p-2 mr-4">
              <GradientMenuIcon />
            </button>
            <Link href="/" className="text-2xl font-bold bg-gradient-to-r from-pink-500 to-purple-500 bg-clip-text text-transparent">
              egtronics
            </Link>
          </div>
        </div>
        <div className="space-y-6 px-4 py-6 w-64">
          <Card className="glass-effect border-0 shadow-lg">
            <CardContent className="p-4 flex flex-col gap-4">
              {user ? (
                  <Link href="/profile" className="flex items-center gap-4 w-full" onClick={toggleSidebar}>
                    <Avatar className="h-12 w-12 ring-2 ring-blue-200">
                      <AvatarImage
                        src={user.profilePicture ? `${API_BASE}${user.profilePicture}` : "/placeholder.svg"}
                        alt={user.name || user.nickname}
                      />
                      <AvatarFallback className="bg-gradient-to-r from-blue-500 to-purple-500 text-white">
                        {user.nickname.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 overflow-hidden">
                      <p className="font-semibold text-gray-900 truncate">{user.nickname}</p>
                      <p className="text-sm text-gray-500 truncate">{user.email}</p>
                    </div>
                  </Link>
              ) : (
                <p className="text-sm text-center text-gray-600">로그인하고 모든 기능을 이용해보세요.</p>
              )}
            </CardContent>
          </Card>
          <CategoryFilter onCategorySelect={toggleSidebar} />
        </div>
      </aside>
    </>
  )
}