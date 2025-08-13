"use client"

import { useAuth } from '@/contexts/auth-context'
import { useNotifications } from '@/hooks/use-notifications'
import { useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Bell } from 'lucide-react'

export default function NotificationsPage() {
  const { user } = useAuth()

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
              onClick={() => markAsRead(n.id)}
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
