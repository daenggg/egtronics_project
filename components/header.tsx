"use client"

import Link from 'next/link'
import { useAuth } from '@/contexts/auth-context'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { User, LogOut, Settings, Bookmark, Bell } from 'lucide-react'
import { useState } from 'react'

export function Header() {
  const { user, logout } = useAuth()
  const [notifications, setNotifications] = useState([
    { id: '1', message: '새 댓글이 달렸습니다.', read: false },
    { id: '2', message: '게시글에 좋아요가 달렸습니다.', read: true },
    { id: '3', message: '게시글이 스크랩 되었습니다.', read: false },
  ])

  // 읽지 않은 알림 개수
  const unreadCount = notifications.filter(n => !n.read).length

  return (
    <header className="glass-effect sticky top-0 z-50 border-b backdrop-blur-md">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <Link href="/" className="text-2xl font-bold bg-gradient-to-r from-pink-500 to-purple-500 bg-clip-text text-transparent">
          홈으로
        </Link>
        
        <nav className="flex items-center space-x-4">
          {user ? (
            <>
              
              {/* 프로필 드롭다운 */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-10 w-10 rounded-full ring-2 ring-blue-200 hover:ring-blue-300 transition-all">
                    <Avatar className="h-9 w-9">
                      <AvatarImage src={user.avatar || "/placeholder.svg"} alt={user.name} />
                      <AvatarFallback className="bg-gradient-to-r from-blue-500 to-purple-500 text-white">
                        {user.name.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56 bg-white" align="end" forceMount>
                  <div className="flex items-center justify-start gap-2 p-2">
                    <div className="flex flex-col space-y-1 leading-none">
                      <p className="font-medium">{user.name}</p>
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

              {/* 알림 드롭다운 */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="xlg" className="relative w-15 p-2 rounded-full hover:bg-gray-100">
                    <Bell className="h-8 w-8" />
                    {unreadCount > 0 && (
                      <span className="absolute top-1 right-1 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white bg-red-600 rounded-full">
                        {unreadCount}
                      </span>
                    )}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-72 bg-white" align="end" forceMount>
                  <div className="p-2 font-semibold border-b">알림</div>
                  {notifications.length === 0 && (
                    <div className="p-4 text-center text-sm text-gray-500">알림이 없습니다.</div>
                  )}
                  {notifications.map(notification => (
                    <DropdownMenuItem key={notification.id} className={`${notification.read ? 'text-gray-500' : 'font-medium'}`}>
                      {notification.message}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>

            </>
          ) : (
            <div className="flex space-x-2">
              <Button variant="ghost" asChild className="hover:bg-blue-50">
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
  )
}
