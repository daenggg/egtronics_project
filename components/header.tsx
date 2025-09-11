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
} from "@/components/ui/dropdown-menu";
import { useUnreadNotificationCount } from "@/hooks/use-notifications";
import { User, LogOut, Bookmark, Bell } from "lucide-react";
import { API_BASE } from "@/lib/api-client";

// 홈으로 링크와 동일한 그라데이션을 적용한 메뉴 아이콘
const GradientMenuIcon = () => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className="h-full w-full" // 버튼 크기에 맞게 꽉 채웁니다.
  >
    <defs>
      <linearGradient id="menu-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stopColor="#ec4899" /> {/* from-pink-500 */}
        <stop offset="100%" stopColor="#8b5cf6" /> {/* to-purple-500 */}
      </linearGradient>
    </defs>
    <path d="M4 6h16M4 12h16M4 18h16" stroke="url(#menu-gradient)" strokeWidth="4.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export function Header() {
  const { user, logout, toggleSidebar } = useAuth();
  // API를 통해 읽지 않은 알림 개수를 가져옵니다.
  const { data: unreadCount = 0 } = useUnreadNotificationCount();

  return (
    <header className="sticky top-0 z-50">
      <div className="w-full px-6 py-3 flex justify-between items-center">
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            onClick={toggleSidebar}
            className="h-12 w-12 p-2"
          >
            <GradientMenuIcon />
          </Button>
          <Link
            href="/"
            className="text-2xl font-bold bg-gradient-to-r from-pink-500 to-purple-500 bg-clip-text text-transparent"
          >
            홈으로
          </Link>
        </div>

        <nav className="flex items-center space-x-2 sm:space-x-4">
          {user ? (
            <>
              {/* 알림 */}
              <Link href="/notifications" passHref legacyBehavior>
                <Button
                  variant="ghost"
                  size="icon"
                  className="relative h-10 w-10 rounded-full hover:bg-gray-100"
                >
                  <Bell className="h-5 w-5" />
                  <span
                    className={`absolute top-1 right-1 inline-flex items-center justify-center w-5 h-5 text-xs font-bold leading-none rounded-full
                      ${
                        unreadCount === 0
                          ? "bg-gray-400 text-white"
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
                    className="relative h-10 w-10 rounded-full ring-2 ring-offset-2 ring-transparent hover:ring-blue-300 transition-all"
                  >
                    <Avatar className="h-9 w-9">
                      <AvatarImage
                        src={user.profilePicture ? `${API_BASE}${user.profilePicture}` : "/images.png"}
                        alt={user.name}
                      />
                      <AvatarFallback className="bg-gradient-to-r from-blue-500 to-purple-500 text-white">
                        {user.nickname.charAt(0)}
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
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={logout}>
                    <LogOut className="mr-2 h-4 w-4" />
                    로그아웃
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <div className="flex space-x-2">
              <Button
                variant="ghost"
                asChild
                className="hover:bg-blue-50 text-black"
              >
                <Link href="/login">로그인</Link>
              </Button>
              <Button asChild className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white shadow-lg">
                <Link href="/register">회원가입</Link>
              </Button>
            </div>
          )}
        </nav>
      </div>
    </header>
  );
}