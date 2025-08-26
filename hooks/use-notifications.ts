// hooks/use-notifications.ts
import { useState, useEffect, useCallback } from "react"
import axios from "axios"

interface Notification {
  id: string
  message: string
  read: boolean
}

export function useNotifications(userId?: string) {
  const [notifications, setNotifications] = useState<Notification[]>([])

  useEffect(() => {
    if (!userId) return

    const controller = new AbortController()

    async function loadNotifications() {
      try {
        const res = await axios.get(`/api/notifications?userId=${userId}`, {
          signal: controller.signal,
        })
        setNotifications(res.data)
      } catch (error: any) {
        if (axios.isCancel(error)) return
        console.error("알림 불러오기 실패:", error)
      }
    }

    loadNotifications()
    return () => controller.abort()
  }, [userId])

  const markAsRead = useCallback(async (notificationId: string) => {
    try {
      await axios.post(`/api/notifications/${notificationId}/read`)
      setNotifications((prev) =>
        prev.map((n) =>
          n.id === notificationId ? { ...n, read: true } : n
        )
      )
    } catch (error) {
      console.error("알림 읽음 처리 실패:", error)
    }
  }, [])

  return { notifications, markAsRead }
}

