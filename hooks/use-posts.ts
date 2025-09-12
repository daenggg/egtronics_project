// hooks/use-posts.ts

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getPosts,
  searchPosts,
  getPost,
  createPost,
  updatePost,
  deletePost,
  togglePostLike,
  reportPost, // reportPost import 추가
  handleApiError
} from '@/lib/api-client';
import { PostWithDetails, PaginationParams, ReportPostRequest } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';

// 게시글 목록 조회 Hook
export function usePosts(params: PaginationParams = {}) {
  const cleanedParams = Object.entries(params).reduce((acc, [key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      // @ts-ignore
      acc[key] = value;
    }
    return acc;
  }, {} as PaginationParams);

  const hasKeyword = !!cleanedParams.keyword;

  return useQuery({
    queryKey: ['posts', cleanedParams],
    queryFn: () => {
      if (hasKeyword) {
        return searchPosts(cleanedParams as PaginationParams & { keyword: string });
      }
      return getPosts(cleanedParams);
    },
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
}

// 게시글 상세 조회 Hook
export function usePost(id: string) {
  return useQuery({
    queryKey: ['post', id],
    queryFn: () => getPost(id),
    enabled: !!id,
    staleTime: 2 * 60 * 1000,
  });
}

// 게시글 작성 Hook
export function useCreatePost() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  return useMutation<PostWithDetails, Error, FormData>({
    mutationFn: createPost,
    onSuccess: () => {
      toast({ title: "성공", description: "게시글이 작성되었습니다." });
      queryClient.invalidateQueries({ queryKey: ['posts'] });
      // ✅ 해결: 프로필 페이지의 '내 활동' 데이터도 갱신합니다.
      queryClient.invalidateQueries({ queryKey: ['my-posts'] });
      queryClient.invalidateQueries({ queryKey: ['my-comments'] });
    },
    onError: (error) => {
      toast({ title: "오류", description: handleApiError(error), variant: "destructive" });
    },
  });
}

// 게시글 수정 Hook
export function useUpdatePost() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  return useMutation<PostWithDetails, Error, { id: string; data: FormData }>({
    mutationFn: ({ id, data }) => updatePost(id, data),
    onSuccess: (updatedPost) => {
      toast({ title: "성공", description: "게시글이 수정되었습니다." });
      queryClient.invalidateQueries({ queryKey: ['posts'] });
      queryClient.setQueryData(['post', String(updatedPost.postId)], updatedPost);
    },
    onError: (error) => {
      toast({ title: "오류", description: handleApiError(error), variant: "destructive" });
    },
  });
}

// 게시글 삭제 Hook
export function useDeletePost() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  return useMutation({
    mutationFn: (postId: string) => deletePost(postId),
    onSuccess: (_, postId) => {
      toast({ title: "성공", description: "게시글이 삭제되었습니다." });
      queryClient.invalidateQueries({ queryKey: ['posts'] });
      queryClient.removeQueries({ queryKey: ['post', postId] });
    },
    onError: (error) => {
      toast({ title: "오류", description: handleApiError(error), variant: "destructive" });
    },
  });
}

// 게시글 좋아요 토글 Hook
export function useToggleLikeMutation(postId: string) {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation<boolean, Error, void, { previousPost?: PostWithDetails }>({
    mutationFn: () => togglePostLike(postId),
    
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: ['post', postId] });
      const previousPost = queryClient.getQueryData<PostWithDetails>(['post', postId]);

      if (previousPost) {
        const updatedPost = {
          ...previousPost,
          // [수정] isLiked -> liked
          liked: !previousPost.liked, 
          likeCount: previousPost.liked 
            ? previousPost.likeCount - 1 
            : previousPost.likeCount + 1,
        };
        queryClient.setQueryData(['post', postId], updatedPost);
      }
      return { previousPost };
    },

    onSuccess: (isLikedNow) => {
      queryClient.setQueryData<PostWithDetails>(['post', postId], (oldData) => {
        if (!oldData) return;
        return {
          ...oldData,
          // [수정] isLiked -> liked
          liked: isLikedNow,
        };
      });
    },

    onError: (err, _, context) => {
      if (context?.previousPost) {
        queryClient.setQueryData(['post', postId], context.previousPost);
      }
      toast({
        title: "오류",
        description: handleApiError(err),
        variant: "destructive",
      });
    },

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['posts'] });
    },
  });
}

// 게시물 신고 Hook
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