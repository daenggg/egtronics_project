"use client";

import { useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/contexts/auth-context";
import {
  getNotifications,
  markNotificationAsRead,
  getUnreadNotificationCount,
} from "@/lib/api-client";
import { API_BASE } from "@/lib/api-client";
import { Notification, UnreadCountResponse } from "@/lib/types";

// SSE 훅
export function useSSE() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!user) return;

    const eventSource = new EventSource(`${API_BASE}/notifications/stream`, { withCredentials: true });

    eventSource.addEventListener("notification", (event) => {
      try {
        const newNotification = JSON.parse(event.data) as Notification;

        queryClient.setQueryData<Notification[]>(["notifications"], (old) =>
          old ? [newNotification, ...old] : [newNotification]
        );

        queryClient.setQueryData<number>(["unread-notification-count"], (old) =>
          typeof old === "number" ? old + 1 : 1
        );
      } catch (e) {
        console.error("Failed to parse SSE event data:", e);
      }
    });

    return () => eventSource.close();
  }, [user, queryClient]);
}

// 알림 목록 조회
export function useNotifications() {
  return useQuery<Notification[], Error>({
    queryKey: ["notifications"],
    queryFn: getNotifications,
    staleTime: 60000,
  });
}

// 단일 알림 읽음 처리
export function useMarkNotificationAsRead() {
  const queryClient = useQueryClient();

  return useMutation<void, Error, number>({
    mutationFn: markNotificationAsRead,
    onSuccess: (_, id) => {
      queryClient.setQueryData<Notification[]>(["notifications"], (old) =>
        old
          ? old.map((n) =>
              n.notificationId === id ? { ...n, read: true } : n
            )
          : old
      );
      queryClient.invalidateQueries(["unread-notification-count"] as any);
    },
    onSettled: () => {
      queryClient.invalidateQueries(["notifications"] as any);
    },
  });
}

// 읽지 않은 알림 개수 조회
export function useUnreadNotificationCount() {
  return useQuery<UnreadCountResponse, Error, number>({
    queryKey: ["unread-notification-count"],
    queryFn: getUnreadNotificationCount,
    staleTime: 60000,
    refetchOnWindowFocus: true,
    select: (data) => data.unreadCount,
  });
}
