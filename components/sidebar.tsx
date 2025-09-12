"use client"

import Link from 'next/link'
import { useAuth } from "@/contexts/auth-context"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card, CardContent } from "@/components/ui/card"
import { API_BASE } from '@/lib/api-client'
import { CategoryFilter } from "@/components/category-filter"

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
          fixed top-0 left-0 h-full z-40 w-64 bg-white dark:bg-background shadow-2xl
          transition-transform duration-300 ease-in-out
          ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"}
          overflow-y-auto pt-32
        `}
      >
        <div className="space-y-6 px-4 w-64">
          <Card className="bg-card border shadow-sm">
            <CardContent className="p-0">
              {user ? (
                <Link href="/profile" className="flex flex-col items-center gap-4 w-full p-4 rounded-lg transition-colors hover:bg-accent" onClick={toggleSidebar}>
                  <Avatar className="h-20 w-20 ring-2 ring-primary/50">
                    <AvatarImage
                      src={user.profilePicture ? `${API_BASE}${user.profilePicture}` : "/images.png"}
                      alt={user.name || user.nickname}
                    />
                    <AvatarFallback className="bg-gradient-to-r from-pink-500 to-purple-500 text-white">
                      {user.nickname.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="text-center space-y-1">
                    <p className="font-semibold text-foreground truncate">{user.nickname}</p>
                    <p className="text-sm text-muted-foreground truncate">{user.email}</p>
                  </div>
                </Link>
              ) : (
                <div className="text-sm text-center text-muted-foreground p-6">
                  <p>로그인하고 모든 기능을 이용해보세요.</p>
                </div>
              )}
            </CardContent>
          </Card>
          <CategoryFilter onCategorySelect={toggleSidebar} />
        </div>
      </aside>
    </>
  )
}