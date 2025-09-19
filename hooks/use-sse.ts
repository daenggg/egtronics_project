"use client";

import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/contexts/auth-context";

/**
 * SSE(Server-Sent Events) 연결을 설정하고 실시간 알림을 처리하는 커스텀 훅.
 * 사용자가 로그인하면 SSE 연결을 설정하고, 새 알림 이벤트를 받으면
 * 관련 React Query 캐시를 무효화하여 최신 데이터를 다시 불러오도록 합니다.
 */
export function useSSE() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  useEffect(() => {
    // 1. 로그인한 사용자가 없으면 아무것도 하지 않고 종료
    if (!user) {
      return;
    }

    // 2. EventSource를 사용하여 SSE 엔드포인트에 직접 연결
    const eventSource = new EventSource(`http://localhost:8080/notifications/stream`, {
      withCredentials: true,
    });

    // 3. SSE 연결이 성공적으로 열렸을 때 로그 출력 (디버깅용)
    eventSource.onopen = () => {
      console.log("SSE connection established successfully!");
    };

    // 4. 'notification' 이름으로 된 이벤트를 수신했을 때의 처리
    eventSource.addEventListener("notification", (event) => {
      console.log("New notification event received from server:", event.data);

      // 5. 캐시를 직접 수정하는 대신, 관련 쿼리가 '오래된 데이터'임을 알림
      // 이렇게 하면 해당 쿼리를 사용하는 컴포넌트들이 자동으로 최신 데이터를 서버로부터 다시 가져옵니다.
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      queryClient.invalidateQueries({ queryKey: ["unread-notification-count"] });
    });

    // 6. 에러 발생 시 로그 출력 (디버깅용)
    eventSource.onerror = (error) => {
      console.error("SSE connection error:", error);
      // 에러 발생 시 연결을 닫을 수도 있습니다.
      eventSource.close();
    };

    // 7. 컴포넌트가 언마운트되거나 user 정보가 바뀔 때 연결을 반드시 종료
    return () => {
      console.log("Closing SSE connection.");
      eventSource.close();
    };
  }, [user, queryClient]); // user나 queryClient가 변경될 때마다 이 effect를 다시 실행
}