"use client";

// [수정] useRouter는 더 이상 사용하지 않으므로 import에서 제거합니다.
import {
  useNotifications,
  useMarkNotificationAsRead,
} from "@/hooks/use-notifications";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Bell, BellRing, Check, Home } from "lucide-react";
import { cn, formatDynamicDate } from "@/lib/utils";
import { Notification } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation"; // [수정] '내용 없음' UI의 버튼을 위해 useRouter를 다시 추가합니다.

export default function NotificationsPage() {
  const router = useRouter();
  const { data: notifications, isLoading, isError, error } = useNotifications();
  const { mutate: markAsRead } = useMarkNotificationAsRead();

  const handleNotificationClick = (notification: Notification) => {
    // 읽지 않은 알림일 경우에만 읽음 처리 API를 호출합니다.
    if (!notification.read) {
      markAsRead(notification.notificationId);
    }
    // 알림에 postId가 있으면 해당 게시글로 이동합니다.
    if (notification.postId) {
      // commentId가 있으면 URL 해시에 추가하여 해당 댓글로 스크롤합니다.
      const url = `/posts/${notification.postId}${notification.commentId ? `#comment-${notification.commentId}` : ''}`;
      router.push(url);
    }
  };

  const unreadCount = notifications?.filter((n) => !n.read).length || 0;

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex items-center space-x-4 p-4">
              <Skeleton className="h-10 w-10 rounded-full" />
              <div className="space-y-2 flex-grow">
                <Skeleton className="h-4 w-4/5" />
                <Skeleton className="h-3 w-1/4" />
              </div>
            </div>
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
        <div className="text-center py-16 col-span-full">
          <div className="p-4 bg-blue-100 rounded-full inline-block mb-4">
            <BellRing className="h-12 w-12 text-primary" />
          </div>
          <h3 className="text-xl font-semibold text-foreground">
            새로운 알림이 없습니다.
          </h3>
          <p className="text-muted-foreground mt-2 mb-6 max-w-md mx-auto">
            게시글에 새로운 댓글이 달리거나 좋아요를 받으면 이곳에 표시됩니다.
          </p>
          <Button
            onClick={() => router.push("/")}
            className="bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg hover:shadow-xl transition-all"
          >
            <Home className="mr-2 h-4 w-4" />
            홈으로 돌아가기
          </Button>
        </div>
      );
    }

    return (
      <ul className="space-y-3">
        {notifications.map((notification) => (
          <li
            key={notification.notificationId}
            onClick={() => handleNotificationClick(notification)}
            className={cn(
              "flex items-start p-4 rounded-xl transition-all duration-300 cursor-pointer",
              "hover:bg-accent",
              notification.read ? "text-muted-foreground" : "bg-accent/50 border-l-4 border-primary"
            )}
          >
            <div className="flex-shrink-0 h-10 w-10 flex items-center justify-center mr-4">
              {notification.read ? (
                <Check className="h-6 w-6 text-gray-400" />
              ) : (
                <div className="h-full w-full rounded-full bg-blue-100 flex items-center justify-center">
                  <BellRing className="h-5 w-5 text-primary" />
                </div>
              )}
            </div>
            <div className="flex-grow">
              <p
                className={cn(
                  "text-base text-foreground",
                  !notification.read && "font-medium"
                )}
              >
                {notification.message}
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                {formatDynamicDate(notification.createdDate)}
              </p>
            </div>
          </li>
        ))}
      </ul>
    );
  };

  return (
    <div className="container mx-auto px-4 py-8 bg-background">
      <div className="max-w-4xl mx-auto space-y-8">
        <div>
          <h1 className="text-2xl md:text-4xl font-medium text-foreground mb-3 flex items-center gap-3">
            <Bell className="h-8 w-8 text-muted-foreground" />
            알림
          </h1>
          <p className="text-lg text-muted-foreground">
            새로운 활동 내역을 확인하고 바로 이동할 수 있습니다.
          </p>
        </div>

        <Card className="glass-effect border-0 shadow-2xl overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-2xl font-medium">알림 목록</CardTitle>
            {unreadCount > 0 && (
              <Badge variant="destructive" className="animate-pulse text-destructive-foreground">
                {unreadCount}개의 안 읽은 알림
              </Badge>
            )}
          </CardHeader>
          <CardContent>{renderContent()}</CardContent>
        </Card>
      </div>
    </div>
  );
}
