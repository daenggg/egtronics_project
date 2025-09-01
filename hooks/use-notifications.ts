"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getNotifications, markNotificationAsRead,
  getUnreadNotificationCount,
  handleApiError,
} from "@/lib/api-client";
import { Notification, UnreadCountResponse } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";

// 알림 목록 조회 Hook
export function useNotifications() {
  return useQuery<Notification[], Error>({
    queryKey: ['notifications'],
    queryFn: getNotifications,
    staleTime: 1 * 60 * 1000, // 1분
  });
}

// 단일 알림 읽음 처리 Hook
export function useMarkNotificationAsRead() {
  const queryClient = useQueryClient();

  return useMutation<void, Error, number>({
    mutationFn: markNotificationAsRead,
    onSuccess: (_, notificationId) => {
      // Optimistic update: 해당 알림만 'read: true'로 변경
      queryClient.setQueryData<Notification[]>(['notifications'], (oldData) =>
        oldData
          ? oldData.map((notification) =>
              notification.notificationId === notificationId
                ? { ...notification, read: true }
                : notification
            )
          : oldData
      );
      // 읽지 않은 알림 개수 쿼리도 무효화하여 헤더의 뱃지를 업데이트합니다.
      queryClient.invalidateQueries({ queryKey: ['unread-notification-count'] });
    },
    onSettled: (data, error, notificationId) => {
      // 최종적으로 서버 데이터와 동기화
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    }
  });
}

// 읽지 않은 알림 개수 조회 Hook
export function useUnreadNotificationCount() {
  // useQuery의 세 번째 제네릭 인자로 select 함수의 반환 타입을 지정합니다.
  return useQuery<UnreadCountResponse, Error, number>({
    queryKey: ['unread-notification-count'],
    queryFn: getUnreadNotificationCount,
    staleTime: 1 * 60 * 1000, // 1분
    refetchOnWindowFocus: true,
    // select 옵션을 사용하여 데이터가 반환될 때 unreadCount 속성만 추출합니다.
    select: (data) => data.unreadCount,
  });
}