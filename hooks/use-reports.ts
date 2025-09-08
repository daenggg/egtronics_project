"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { reportPost } from "@/lib/api-client";
import { useToast } from "@/hooks/use-toast";
import { PostWithDetails, ReportPostRequest } from "@/lib/types";

// 게시물 신고를 위한 커스텀 훅 (useMutation)
export const useReportPost = (postId: string) => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (payload: ReportPostRequest) => reportPost(postId, payload),
    onSuccess: () => {
      toast({
        title: "신고 완료",
        description: "신고가 정상적으로 접수되었습니다. 검토 후 조치하겠습니다.",
        duration: 3000,
      });

      // 신고 성공 시, 해당 게시글 상세 정보 쿼리를 낙관적으로 업데이트하여
      // UI에 '신고 완료' 상태를 즉시 반영합니다.
      queryClient.setQueryData<PostWithDetails>(['post', postId], (oldData) =>
        oldData ? { ...oldData, reportedByCurrentUser: true, reportCount: (oldData.reportCount ?? 0) + 1 } : oldData
      );

      // 게시글 목록 쿼리를 무효화하여, 신고 횟수가 갱신된 목록을 다시 불러오게 합니다.
      // (예: 5회 이상 신고된 게시물 숨김 처리 반영)
      queryClient.invalidateQueries({ queryKey: ['posts'] });
    },
    onError: (error: any) => {
      toast({
        title: "신고 실패",
        description: error.response?.data?.message || "오류가 발생했습니다. 다시 시도해주세요.",
        variant: "destructive",
        duration: 3000,
      });
    },
  });
};