"use client"

import { useAuth } from '@/contexts/auth-context'
import { useNotifications } from '@/hooks/use-notifications'
import { useState, useEffect, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Bell } from 'lucide-react'

interface Notification {
  id: string
  message: string
  read: boolean
}

export default function NotificationsPage() {
  const { user } = useAuth()
  const [notifications, setNotifications] = useState<Notification[]>([])

  // --- 실제 API 연동 로직 (주석 처리됨) ---
  /*
  const { notifications, markAsRead } = useNotifications(user?.id ?? '')

  // 페이지에 진입했을 때 모든 알림을 자동으로 읽음 처리하던 로직
  useEffect(() => {
    if (!notifications) return
    notifications.forEach(n => {
      if (!n.read) markAsRead(n.id)
    })
  }, [notifications, markAsRead])
  */

  // 알림을 읽음 상태로 처리하는 함수 (목업용)
  const markAsRead = useCallback((notificationId: string) => {
    setNotifications(prev =>
      prev.map(n => (n.id === notificationId ? { ...n, read: true } : n))
    )
  }, [])

  // --- 목업 데이터 로직 (실제 API 연동 시 이 부분을 주석 처리) ---
  useEffect(() => {
    if (!user) return

    // 목업 데이터 사용
    const mockNotifications: Notification[] = [
      {
        id: 'n1',
        message: '개발고수님이 회원님의 게시글 "React Query로 서버 상태 관리하기"에 댓글을 남겼습니다.',
        read: false,
      },
      {
        id: 'n2',
        message: '회원님이 스크랩한 "Next.js 14의 새로운 기능들" 게시글에 새로운 댓글이 달렸습니다.',
        read: false,
      },
      {
        id: 'n3',
        message: '트렌드세터님이 회원님을 팔로우하기 시작했습니다.',
        read: true,
      },
      {
        id: 'n4',
        message: '주간 인기 게시글 "일상에서 실천하는 작은 환경 보호 팁"을 확인해보세요!',
        read: true,
      },
    ]
    setNotifications(mockNotifications)
  }, [user])
  // --- 여기까지 목업 데이터 로직 ---

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-md">
        <Card className="text-center p-8">
          <Bell className="mx-auto mb-4 h-16 w-16 text-gray-400" />
          <CardTitle className="mb-2 text-lg font-semibold">로그인이 필요합니다</CardTitle>
          <CardContent className="text-gray-600">
            로그인 후 알림을 확인할 수 있습니다.
          </CardContent>
          <div className="mt-6">
            <a href="/login" className="text-blue-600 hover:underline">
              로그인하기
            </a>
          </div>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-yellow-600 to-orange-600 bg-clip-text text-transparent mb-2 flex items-center gap-3">
          <Bell className="h-8 w-8 text-yellow-500" />
          내 알림
        </h1>
        <p className="text-gray-600">새로운 소식을 빠르게 확인하세요</p>
      </div>

      {notifications.length === 0 ? (
        <Card className="text-center py-12">
          <CardContent>
            <Bell className="h-16 w-16 mx-auto text-gray-400 mb-4" />
            <h2 className="text-xl font-semibold mb-2">알림이 없습니다</h2>
            <p className="text-gray-600 mb-4">활동이 있을 때 알림이 표시됩니다.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {notifications.map((n, index) => (
            <Card
              key={n.id}
              className={`cursor-pointer border-0 shadow-lg ${
                n.read ? 'bg-white text-gray-600' : 'bg-blue-100 text-blue-900 font-semibold'
              }`}
              style={{ animationDelay: `${index * 0.1}s` }}
              onClick={() => !n.read && markAsRead(n.id)}
            >
              <CardContent className="p-4">
                {n.message}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
