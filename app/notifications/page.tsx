"use client";

import { useRouter } from "next/navigation";
import { useNotifications, useMarkNotificationAsRead } from "@/hooks/use-notifications";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { BellRing, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { Notification } from "@/lib/types";

export default function NotificationsPage() {
  const router = useRouter();
  const { data: notifications, isLoading, isError, error } = useNotifications();
  const { mutate: markAsRead } = useMarkNotificationAsRead();

  const handleNotificationClick = (notification: Notification) => {
    // 읽지 않은 알림일 경우에만 읽음 처리 API 호출
    if (!notification.read) {
      markAsRead(notification.notificationId);
    }
    // 알림에 연결된 게시글 ID가 있으면 해당 페이지로 이동
    if (notification.postId) {
      router.push(`/posts/${notification.postId}`);
    }
  };

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} className="h-16 w-full" />
          ))}
        </div>
      );
    }

    if (isError) {
      return (
        <Alert variant="destructive">
          <AlertTitle>오류 발생</AlertTitle>
          <AlertDescription>
            알림 목록을 불러오는 중 오류가 발생했습니다: {error.message}
          </AlertDescription>
        </Alert>
      );
    }

    if (!notifications || notifications.length === 0) {
      return (
        <div className="text-center py-10">
          <BellRing className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">
            새로운 알림이 없습니다.
          </h3>
        </div>
      );
    }

    return (
      <ul className="space-y-2">
        {notifications.map((notification) => (
          <li
            key={notification.notificationId}
            onClick={() => handleNotificationClick(notification)}
            className={cn(
              "flex items-center p-4 border rounded-lg transition-colors cursor-pointer",
              notification.read
                ? "bg-gray-50 text-gray-500"
                : "bg-white hover:bg-blue-50"
            )}
          >
            <div className="flex-shrink-0 mr-4">
              {notification.read ? <Check className="h-6 w-6 text-gray-400" /> : <BellRing className="h-6 w-6 text-blue-500" />}
            </div>
            <div className="flex-grow">
              <p>{notification.message}</p>
              <p className="text-xs text-gray-400 mt-1">
                {new Date(notification.createdDate).toLocaleString()}
              </p>
            </div>
          </li>
        ))}
      </ul>
    );
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <Card className="max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle className="text-2xl font-bold">알림</CardTitle>
        </CardHeader>
        <CardContent>{renderContent()}</CardContent>
      </Card>
    </div>
  );
}