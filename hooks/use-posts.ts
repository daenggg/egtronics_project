import { useCallback } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { 
  getPosts,
  searchPosts,
  getPost, 
  createPost, 
  updatePost, 
  deletePost, 
  likePost, 
  unlikePost,
  handleApiError
} from '@/lib/api-client'
import { PostWithDetails, UpdatePostRequest, PaginationParams, LikeResponse, PostPreview } from '@/lib/types'
import { useToast } from '@/hooks/use-toast'

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

// 게시글 좋아요 Hook
export function useLikePost() {
  const queryClient = useQueryClient()
  const { toast } = useToast()
  return useMutation<void, Error, string, { previousPost?: PostWithDetails, previousPostsList?: Map<string, any> }>({
    mutationFn: (postId: string) => likePost(postId),
    onMutate: async (postId) => {
      await queryClient.cancelQueries({ queryKey: ['post', postId] });
      await queryClient.cancelQueries({ queryKey: ['posts'] });
      const previousPost = queryClient.getQueryData<PostWithDetails>(['post', postId]);
      const postQueries = queryClient.getQueriesData<any>({ queryKey: ['posts'] });
      const previousPostsList = new Map<string, any>();
      if (previousPost) {
        queryClient.setQueryData<PostWithDetails>(['post', postId], { ...previousPost, isLiked: true, likeCount: previousPost.likeCount + 1 });
      }
      postQueries.forEach(([queryKey, data]) => {
        if (data && data.posts) {
          previousPostsList.set(JSON.stringify(queryKey), data);
          const updatedData = { ...data, posts: data.posts.map((p: PostPreview) => p.postId === Number(postId) ? { ...p, isLiked: true, likeCount: p.likeCount + 1 } : p) };
          queryClient.setQueryData(queryKey, updatedData);
        }
      });
      return { previousPost, previousPostsList };
    },
    onSuccess: (_, postId, context) => {
      toast({ description: "게시글에 좋아요를 눌렀습니다." });
      queryClient.invalidateQueries({ queryKey: ['post', postId] });
      queryClient.invalidateQueries({ queryKey: ['posts'] });
    },
    onError: (error, postId, context) => {
      if (context?.previousPost) {
        queryClient.setQueryData(['post', postId], context.previousPost);
      }
      context?.previousPostsList?.forEach((data, queryKey) => {
        queryClient.setQueryData(JSON.parse(queryKey), data);
      });
      toast({ title: "오류", description: handleApiError(error), variant: "destructive" });
    },
  })
}

// 게시글 좋아요 취소 Hook
export function useUnlikePost() {
  const queryClient = useQueryClient()
  const { toast } = useToast()
  return useMutation<void, Error, string, { previousPost?: PostWithDetails, previousPostsList?: Map<string, any> }>({
    mutationFn: (postId: string) => unlikePost(postId),
    onMutate: async (postId) => {
      await queryClient.cancelQueries({ queryKey: ['post', postId] });
      await queryClient.cancelQueries({ queryKey: ['posts'] });
      const previousPost = queryClient.getQueryData<PostWithDetails>(['post', postId]);
      const postQueries = queryClient.getQueriesData<any>({ queryKey: ['posts'] });
      const previousPostsList = new Map<string, any>();
      if (previousPost) {
        queryClient.setQueryData<PostWithDetails>(['post', postId], { ...previousPost, isLiked: false, likeCount: Math.max(0, previousPost.likeCount - 1) });
      }
      postQueries.forEach(([queryKey, data]) => {
        if (data && data.posts) {
          previousPostsList.set(JSON.stringify(queryKey), data);
          const updatedData = { ...data, posts: data.posts.map((p: PostPreview) => p.postId === Number(postId) ? { ...p, isLiked: false, likeCount: Math.max(0, p.likeCount - 1) } : p) };
          queryClient.setQueryData(queryKey, updatedData);
        }
      });
      return { previousPost, previousPostsList };
    },
    onSuccess: (_, postId, context) => {
      toast({ description: "좋아요를 취소했습니다." });
      queryClient.invalidateQueries({ queryKey: ['post', postId] });
      queryClient.invalidateQueries({ queryKey: ['posts'] });
    },
    onError: (error, postId, context) => {
      if (context?.previousPost) {
        queryClient.setQueryData(['post', postId], context.previousPost);
      }
      context?.previousPostsList?.forEach((data, queryKey) => {
        queryClient.setQueryData(JSON.parse(queryKey), data);
      });
      toast({ title: "오류", description: handleApiError(error), variant: "destructive" });
    },
  })
}

// 게시글 좋아요 토글 Hook
export function useToggleLike() {
  const likeMutation = useLikePost()
  const unlikeMutation = useUnlikePost()
  const toggleLike = useCallback((postId: string, isLiked: boolean | undefined) => {
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