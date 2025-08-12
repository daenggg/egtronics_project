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
      queryClient.setQueryData(['post', updatedPost.id], updatedPost)
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
    mutationFn: (id: string) => deletePost(id),
    onSuccess: () => {
      toast({
        title: "성공",
        description: "게시글이 삭제되었습니다.",
      })
      // 관련 캐시 무효화
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

// 게시글 좋아요 Hook
export function useLikePost() {
  const queryClient = useQueryClient()
  const { toast } = useToast()
  
  return useMutation({
    mutationFn: (id: string) => likePost(id),
    onSuccess: (data, postId) => {
      // 게시글 좋아요 상태 업데이트
      queryClient.setQueryData(['post', postId], (old: Post | undefined) => {
        if (!old) return old
        return { ...old, isLiked: true, likeCount: data.likeCount }
      })
      
      // 게시글 목록의 해당 게시글도 업데이트
      queryClient.setQueriesData({ queryKey: ['posts'] }, (old: any) => {
        if (!old?.posts) return old
        return {
          ...old,
          posts: old.posts.map((post: Post) => 
            post.id === postId 
              ? { ...post, isLiked: true, likeCount: data.likeCount }
              : post
          )
        }
      })
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
    mutationFn: (id: string) => unlikePost(id),
    onSuccess: (data, postId) => {
      // 게시글 좋아요 상태 업데이트
      queryClient.setQueryData(['post', postId], (old: Post | undefined) => {
        if (!old) return old
        return { ...old, isLiked: false, likeCount: data.likeCount }
      })
      
      // 게시글 목록의 해당 게시글도 업데이트
      queryClient.setQueriesData({ queryKey: ['posts'] }, (old: any) => {
        if (!old?.posts) return old
        return {
          ...old,
          posts: old.posts.map((post: Post) => 
            post.id === postId 
              ? { ...post, isLiked: false, likeCount: data.likeCount }
              : post
          )
        }
      })
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
