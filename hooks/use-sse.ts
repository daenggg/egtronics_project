"use client";

import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/contexts/auth-context";
import { API_BASE } from "@/lib/api-client";
import { Notification } from "@/lib/types";

/**
 * SSE(Server-Sent Events) 연결을 설정하고 실시간 알림을 처리하는 커스텀 훅.
 * 사용자가 로그인했을 때만 SSE 연결을 설정합니다.
 */
export function useSSE() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  useEffect(() => {
    // 로그인한 사용자가 없으면 아무것도 하지 않음
    if (!user) {
      return;
    }

    // EventSource를 사용하여 SSE 엔드포인트에 연결합니다.
    // withCredentials: true 옵션으로 쿠키(인증 정보)를 함께 보냅니다.
    const eventSource = new EventSource(`${API_BASE}/notifications/subscribe`, {
      withCredentials: true,
    });

    // 'new-notification' 이벤트를 수신했을 때의 처리
    eventSource.addEventListener("new-notification", (event) => {
      try {
        const newNotification = JSON.parse(event.data) as Notification;

        // React Query 캐시를 업데이트하여 UI를 실시간으로 변경합니다.
        // 1. 'notifications' 쿼리 캐시를 업데이트하여 알림 목록에 새 알림을 추가합니다.
        queryClient.setQueryData<Notification[]>(["notifications"], (oldData) =>
          oldData ? [newNotification, ...oldData] : [newNotification]
        );

        // 2. 'unread-notification-count' 쿼리 캐시를 업데이트하여 뱃지 카운트를 1 증가시킵니다.
        queryClient.setQueryData<number>(["unread-notification-count"], (oldData) =>
          typeof oldData === "number" ? oldData + 1 : 1
        );
      } catch (error) {
        console.error("Failed to parse SSE event data:", error);
      }
    });

    // 컴포넌트가 언마운트되거나 user가 변경될 때 SSE 연결을 종료합니다.
    return () => {
      eventSource.close();
    };
  }, [user, queryClient]); // user나 queryClient가 변경될 때 effect를 다시 실행합니다.
}