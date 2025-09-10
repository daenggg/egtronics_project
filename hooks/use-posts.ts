import { useCallback, useEffect, useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  getPosts,
  searchPosts,
  getPost,
  createPost,
  updatePost,
  deletePost,
  togglePostLike,
  handleApiError
} from '@/lib/api-client';
import { PostWithDetails, UpdatePostRequest, PaginationParams, LikeResponse, PostPreview, CreatePostRequest } from '@/lib/types'
import { useToast } from '@/hooks/use-toast'

// 게시글 목록 조회 Hook
export function usePosts(params: PaginationParams = {}) {
  // ===================== 디버깅용 코드 추가 =====================
  console.log("=============================");
  console.log("[usePosts] 훅이 다음 파라미터로 호출됨:", params);
  // ==========================================================

  const cleanedParams = Object.entries(params).reduce((acc, [key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      // @ts-ignore
      acc[key] = value;
    }
    return acc;
  }, {} as PaginationParams);

  // ===================== 디버깅용 코드 추가 =====================
  console.log("[usePosts] 정리된 파라미터:", cleanedParams);
  console.log("=============================");
  // ==========================================================

  const hasKeyword = !!cleanedParams.keyword;

  return useQuery({
    queryKey: ['posts', params],
    queryFn: () => {
      if (hasKeyword) {
        return searchPosts(cleanedParams as PaginationParams & { keyword: string });
      }
      return getPosts(cleanedParams);
    },
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  })
}

// 게시글 상세 조회 Hook
export function usePost(id: string) {
  return useQuery({
    queryKey: ['post', id],
    queryFn: () => getPost(id),
    enabled: !!id,
    staleTime: 2 * 60 * 1000,
  })
}

// 게시글 작성 Hook
export function useCreatePost() {
  const queryClient = useQueryClient()
  const { toast } = useToast()
  return useMutation<PostWithDetails, Error, FormData>({
    mutationFn: createPost,
    onSuccess: () => {
      toast({ title: "성공", description: "게시글이 작성되었습니다." });
      queryClient.invalidateQueries({ queryKey: ['posts'] });
    },
    onError: (error) => {
      toast({ title: "오류", description: handleApiError(error), variant: "destructive" });
    },
  })
}

// 게시글 수정 Hook
export function useUpdatePost() {
  const queryClient = useQueryClient()
  const { toast } = useToast()
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
  })
}

// 게시글 삭제 Hook
export function useDeletePost() {
  const queryClient = useQueryClient()
  const { toast } = useToast()
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
  })
}

//게시글 좋아요 Hook
export function useToggleLikeMutation(postId: string) {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation<boolean, Error, void, { previousPost?: PostWithDetails }>({
    mutationFn: () => togglePostLike(postId),
    
    // 1. UI를 즉시 업데이트 (사용자 경험 향상)
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: ['post', postId] });
      const previousPost = queryClient.getQueryData<PostWithDetails>(['post', postId]);

      if (previousPost) {
        const updatedPost = {
          ...previousPost,
          isLiked: !previousPost.isLiked,
          likeCount: previousPost.isLiked 
            ? previousPost.likeCount - 1 
            : previousPost.likeCount + 1,
        };
        queryClient.setQueryData(['post', postId], updatedPost);
      }
      return { previousPost };
    },

    // ▼▼▼ [핵심 수정] 2. API 성공 시, 서버 응답값으로 캐시 데이터를 확실하게 업데이트 ▼▼▼
    onSuccess: (isLikedNow) => { // API가 반환한 새로운 '좋아요' 상태 (true/false)
      queryClient.setQueryData<PostWithDetails>(['post', postId], (oldData) => {
        if (!oldData) return;
        
        // 서버가 보내준 최종 isLiked 값으로 상태를 덮어씁니다.
        // likeCount는 onMutate에서 이미 변경되었으므로 그대로 사용하거나,
        // 만약 서버가 likeCount도 보내준다면 여기서 함께 업데이트할 수 있습니다.
        return {
          ...oldData,
          isLiked: isLikedNow,
        };
      });
    },

    // 3. 에러 발생 시 원래 상태로 롤백
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

    // 4. 성공/실패와 관계없이 목록 페이지의 데이터는 갱신 (선택 사항이지만 권장)
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['posts'] });
    },
  });
}