"use client";

import Link from "next/link";
import { useAuth } from "@/contexts/auth-context";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { User, LogOut, Bookmark, Bell, Menu } from "lucide-react"
import { useState } from "react";

export function Header() {
  const { user, logout, toggleSidebar } = useAuth()
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const handleHomeClick = () => {
    setSelectedCategory(null);
  };

  // 더미 알림 데이터 삭제 → 실제 알림은 별도로 훅 또는 API 통해 받아와야 함
  // 읽지 않은 알림 개수는 0으로 설정 (임시)
  const unreadCount = 0;

  return (
    <header className="glass-effect sticky top-0 z-50 border-b backdrop-blur-md">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={toggleSidebar}>
            <Menu className="h-6 w-6" />
          </Button>
          <Link
            href="/"
            onClick={handleHomeClick}
            className="text-2xl font-bold bg-gradient-to-r from-pink-500 to-purple-500 bg-clip-text text-transparent"
          >
            홈으로
          </Link>
        </div>

        <nav className="flex items-center space-x-4">
          {user ? (
            <>
              {/* 알림 */}
              <Link href="/notifications" className="relative">
                <Button
                  variant="ghost"
                  className="relative w-12 p-2 rounded-full hover:bg-gray-100"
                >
                  <Bell className="h-6 w-6" />
                  <span
                    className={`absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none rounded-full
        ${
          unreadCount === 0
            ? "bg-gray-400 text-gray-800"
            : "bg-red-600 text-white"
        }`}
                  >
                    {unreadCount}
                  </span>
                </Button>
              </Link>

              {/* 프로필 드롭다운 */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className="relative h-10 w-10 rounded-full ring-2 ring-blue-200 hover:ring-blue-300 transition-all"
                  >
                    <Avatar className="h-9 w-9">
                      <AvatarImage
                        src={user.avatar || "/placeholder.svg"}
                        alt={user.name}
                      />
                      <AvatarFallback className="bg-gradient-to-r from-blue-500 to-purple-500 text-white">
                        {user.name.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  className="w-56 bg-white"
                  align="end"
                  forceMount
                >
                  <div className="flex items-center justify-start gap-2 p-2">
                    <div className="flex flex-col space-y-1 leading-none">
                      <p className="font-medium">{user.nickname}</p>
                      <p className="w-[200px] truncate text-sm text-muted-foreground">
                        {user.email}
                      </p>
                    </div>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/profile">
                      <User className="mr-2 h-4 w-4" />
                      프로필
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/bookmarks">
                      <Bookmark className="mr-2 h-4 w-4" />
                      스크랩
                    </Link>
                  </DropdownMenuItem>

                  <DropdownMenuItem onClick={logout}>
                    <LogOut className="mr-2 h-4 w-4" />
                    로그아웃
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <div className="flex space-x-2">
              <Button variant="ghost" asChild className="hover:bg-blue-50">
                <Link href="/login">로그인</Link>
              </Button>
              <Button
                asChild
                className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white shadow-lg"
              >
                <Link href="/register">회원가입</Link>
              </Button>
            </div>
          )}
        </nav>
      </div>
    </header>
  );
}
