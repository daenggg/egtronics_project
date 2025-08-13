"use client"

import { useAuth } from '@/contexts/auth-context'
import { useNotifications } from '@/hooks/use-notifications'
import { useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default function NotificationsPage() {
  const { user } = useAuth()

  // user가 없으면 빈 알림 반환하도록 훅 호출 조건 분기
  const { notifications = [], markAsRead } = useNotifications(user?.id ?? '')

  useEffect(() => {
    if (!notifications) return
    notifications.forEach(n => {
      if (!n.read) markAsRead(n.id)
    })
  }, [notifications, markAsRead])

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-md">
        <Card className="text-center p-8">
          <CardTitle className="mb-2 text-lg font-semibold">비회원</CardTitle>
          <CardContent className="text-gray-600">
            로그인 후 알림을 확인할 수 있습니다.
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <Card>
        <CardHeader>
          <CardTitle>알림</CardTitle>
        </CardHeader>
        <CardContent>
          {notifications.length === 0 ? (
            <p className="text-center text-gray-500 py-8">알림이 없습니다.</p>
          ) : (
            <ul>
              {notifications.map(n => (
                <li
                  key={n.id}
                  onClick={() => markAsRead(n.id)}
                  className={`
                    p-4 border-b cursor-pointer transition
                    hover:bg-gray-100
                    ${n.read 
                      ? 'text-gray-500 bg-white' 
                      : 'font-bold bg-blue-100 text-blue-900'}
                  `}
                >
                  {n.message}
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
