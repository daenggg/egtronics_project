import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getNotifications,
  markNotificationAsRead,
  getUnreadNotificationCount,
  handleApiError
} from '@/lib/api-client';
import { useToast } from '@/hooks/use-toast';
import type { Notification } from '@/lib/types';

// 알림 목록 조회 Hook
export function useNotifications() {
  return useQuery<Notification[], Error>({
    queryKey: ['notifications'],
    queryFn: getNotifications,
    staleTime: 1 * 60 * 1000, // 1분
  });
}

// 알림 읽음 처리 Hook
export function useMarkNotificationAsRead() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation<void, Error, number>({
    mutationFn: (notificationId: number) => markNotificationAsRead(notificationId),
    onSuccess: (_, notificationId) => {
      // Optimistic update: 목록에서 해당 알림을 즉시 읽음 상태로 변경
      queryClient.setQueryData<Notification[]>(['notifications'], (oldData) =>
        oldData
          ? oldData.map((n) =>
              n.notificationId === notificationId ? { ...n, read: true } : n
            )
          : []
      );
      // 읽지 않은 알림 개수 쿼리를 무효화하여 다시 불러오게 함
      queryClient.invalidateQueries({ queryKey: ['notifications', 'unread-count'] });
    },
    onError: (error) => {
      toast({
        title: '오류',
        description: handleApiError(error),
        variant: 'destructive',
      });
    },
  });
}

// 읽지 않은 알림 개수 조회 Hook
export function useUnreadNotificationCount() {
  return useQuery<number, Error>({
    queryKey: ['notifications', 'unread-count'],
    queryFn: async () => {
      const data = await getUnreadNotificationCount();
      return data.unreadCount;
    },
    staleTime: 1 * 60 * 1000, // 1분
    refetchInterval: 5 * 60 * 1000, // 5분마다 자동 갱신
  });
}
