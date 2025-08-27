import { useState, useCallback } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { 
  getPosts, 
  getPost, 
  createPost, 
  updatePost, 
  deletePost, 
  likePost, 
  unlikePost,
  handleApiError
} from '@/lib/api-client'
import { Post, CreatePostRequest, UpdatePostRequest, PaginationParams } from '@/lib/types'
import { useToast } from '@/hooks/use-toast'

// 게시글 목록 조회 Hook
export function usePosts(params: PaginationParams = {}) {
  const { toast } = useToast()
  
  return useQuery({
    queryKey: ['posts', params],
    queryFn: () => getPosts(params),
    staleTime: 5 * 60 * 1000, // 5분
    gcTime: 10 * 60 * 1000, // 10분
  })
}

// 게시글 상세 조회 Hook
export function usePost(id: string) {
  const { toast } = useToast()
  
  return useQuery({
    queryKey: ['post', id],
    queryFn: () => getPost(id),
    enabled: !!id,
    staleTime: 2 * 60 * 1000, // 2분
  })
}

// 게시글 작성 Hook
export function useCreatePost() {
  const queryClient = useQueryClient()
  const { toast } = useToast()
  
  return useMutation({
    mutationFn: (data: CreatePostRequest) => createPost(data),
    onSuccess: () => {
      toast({
        title: "성공",
        description: "게시글이 작성되었습니다.",
      })
      // 게시글 목록 캐시 무효화
      queryClient.invalidateQueries({ queryKey: ['posts'] })
    },
    onError: (error) => {
      toast({
        title: "오류",
        description: handleApiError(error),
        variant: "destructive",
      })
    },
  })
}

// 게시글 수정 Hook
export function useUpdatePost() {
  const queryClient = useQueryClient()
  const { toast } = useToast()
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdatePostRequest }) => 
      updatePost(id, data),
    onSuccess: (updatedPost) => {
      toast({
        title: "성공",
        description: "게시글이 수정되었습니다.",
      })
      // 관련 캐시 업데이트
      queryClient.invalidateQueries({ queryKey: ['posts'] })
      queryClient.setQueryData(['post', String(updatedPost.postId)], updatedPost)
    },
    onError: (error) => {
      toast({
        title: "오류",
        description: handleApiError(error),
        variant: "destructive",
      })
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
      toast({
        title: "성공",
        description: "게시글이 삭제되었습니다.",
      })
      // 관련 캐시 무효화
      queryClient.invalidateQueries({ queryKey: ['posts'] })
      // 상세 페이지 캐시도 제거하여 오래된 데이터가 보이지 않도록 합니다.
      queryClient.removeQueries({ queryKey: ['post', postId] })
    },
    onError: (error) => {
      toast({
        title: "오류",
        description: handleApiError(error),
        variant: "destructive",
      })
    },
  })
}

// 게시글 좋아요 Hook
export function useLikePost() {
  const queryClient = useQueryClient()
  const { toast } = useToast()
  
  return useMutation({
    mutationFn: (postId: string) => likePost(postId),
    onSuccess: (_, postId) => {
      // 참고: 백엔드 like/unlike API가 업데이트된 데이터를 반환하지 않으므로,
      // 가장 확실한 방법은 관련 쿼리를 무효화하여 다시 불러오는 것입니다.
      // 이렇게 하면 UI가 서버의 최신 상태와 일치하게 됩니다.
      toast({ title: "성공", description: "게시글을 추천했습니다." });
      queryClient.invalidateQueries({ queryKey: ['posts'] });
      queryClient.invalidateQueries({ queryKey: ['post', postId] });
    },
    onError: (error) => {
      toast({
        title: "오류",
        description: handleApiError(error),
        variant: "destructive",
      })
    },
  })
}

// 게시글 좋아요 취소 Hook
export function useUnlikePost() {
  const queryClient = useQueryClient()
  const { toast } = useToast()
  
  return useMutation({
    mutationFn: (postId: string) => unlikePost(postId),
    onSuccess: (_, postId) => {
      // 참고: 백엔드 like/unlike API가 업데이트된 데이터를 반환하지 않으므로,
      // 가장 확실한 방법은 관련 쿼리를 무효화하여 다시 불러오는 것입니다.
      toast({ title: "성공", description: "게시글 추천을 취소했습니다." });
      queryClient.invalidateQueries({ queryKey: ['posts'] });
      queryClient.invalidateQueries({ queryKey: ['post', postId] });
    },
    onError: (error) => {
      toast({
        title: "오류",
        description: handleApiError(error),
        variant: "destructive",
      })
    },
  })
}

// 게시글 좋아요 토글 Hook
export function useToggleLike() {
  const likeMutation = useLikePost()
  const unlikeMutation = useUnlikePost()
  
  const toggleLike = useCallback((postId: string, isLiked: boolean) => {
    if (isLiked) {
      unlikeMutation.mutate(postId)
    } else {
      likeMutation.mutate(postId)
    }
  }, [likeMutation, unlikeMutation])
  
  return {
    toggleLike,
    isLoading: likeMutation.isPending || unlikeMutation.isPending,
  }
}
