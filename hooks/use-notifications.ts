// hooks/use-notifications.ts

import { useState, useEffect, useCallback } from "react"

interface Notification {
  id: string
  message: string
  read: boolean
}

export function useNotifications(userId?: string) {
  const [notifications, setNotifications] = useState<Notification[]>([])

  useEffect(() => {
    if (!userId) return

    // 예: API 호출해서 알림 받아오기
    async function fetchNotifications() {
      try {
        const res = await fetch(`/api/notifications?userId=${userId}`)
        if (!res.ok) throw new Error("알림을 불러오지 못했습니다.")
        const data = await res.json()
        setNotifications(data)
      } catch (error) {
        console.error(error)
      }
    }

    fetchNotifications()
  }, [userId])

  const markAsRead = useCallback(async (notificationId: string) => {
    // API 호출로 알림 읽음 처리
    try {
      const res = await fetch(`/api/notifications/${notificationId}/read`, {
        method: "POST",
      })
      if (!res.ok) throw new Error("알림 읽음 처리 실패")
      // 상태 업데이트
      setNotifications((prev) =>
        prev.map((n) =>
          n.id === notificationId ? { ...n, read: true } : n
        )
      )
    } catch (error) {
      console.error(error)
    }
  }, [])

  return { notifications, markAsRead }
}
