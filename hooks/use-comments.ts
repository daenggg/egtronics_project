import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { 
  getComments, 
  createComment, 
  updateComment, 
  deleteComment, 
  likeComment, 
  unlikeComment,
  handleApiError
} from '@/lib/api-client'
import { Comment, CreateCommentRequest, UpdateCommentRequest } from '@/lib/types'
import { useToast } from '@/hooks/use-toast'

// 댓글 목록 조회 Hook
export function useComments(postId: string) {
  const { toast } = useToast()
  
  return useQuery({
    queryKey: ['comments', postId],
    queryFn: () => getComments(postId),
    enabled: !!postId,
    staleTime: 1 * 60 * 1000, // 1분
  })
}

// 댓글 작성 Hook
export function useCreateComment() {
  const queryClient = useQueryClient()
  const { toast } = useToast()
  
  return useMutation({
    mutationFn: ({ postId, data }: { postId: string; data: CreateCommentRequest }) => 
      createComment(postId, data),
    onSuccess: (newComment, { postId }) => {
      toast({
        title: "성공",
        description: "댓글이 작성되었습니다.",
      })
      // 댓글 목록 캐시 업데이트
      queryClient.setQueryData(['comments', postId], (old: any) => {
        if (!old?.comments) return old
        return {
          ...old,
          comments: [...old.comments, newComment],
          totalCount: old.totalCount + 1
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

// 댓글 수정 Hook
export function useUpdateComment() {
  const queryClient = useQueryClient()
  const { toast } = useToast()
  
  return useMutation({
    mutationFn: ({ postId, commentId, data }: { 
      postId: string; 
      commentId: string; 
      data: UpdateCommentRequest 
    }) => updateComment(postId, commentId, data),
    onSuccess: (updatedComment, { postId }) => {
      toast({
        title: "성공",
        description: "댓글이 수정되었습니다.",
      })
      // 댓글 목록 캐시 업데이트
      queryClient.setQueryData(['comments', postId], (old: any) => {
        if (!old?.comments) return old
        return {
          ...old,
          comments: old.comments.map((comment: Comment) => 
            comment.id === updatedComment.id ? updatedComment : comment
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

// 댓글 삭제 Hook
export function useDeleteComment() {
  const queryClient = useQueryClient()
  const { toast } = useToast()
  
  return useMutation({
    mutationFn: ({ postId, commentId }: { postId: string; commentId: string }) => 
      deleteComment(postId, commentId),
    onSuccess: (_, { postId, commentId }) => {
      toast({
        title: "성공",
        description: "댓글이 삭제되었습니다.",
      })
      // 댓글 목록 캐시 업데이트
      queryClient.setQueryData(['comments', postId], (old: any) => {
        if (!old?.comments) return old
        return {
          ...old,
          comments: old.comments.filter((comment: Comment) => comment.id !== commentId),
          totalCount: old.totalCount - 1
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

// 댓글 좋아요 Hook
export function useLikeComment() {
  const queryClient = useQueryClient()
  const { toast } = useToast()
  
  return useMutation({
    mutationFn: ({ postId, commentId }: { postId: string; commentId: string }) => 
      likeComment(postId, commentId),
    onSuccess: (data, { postId, commentId }) => {
      // 댓글 좋아요 상태 업데이트
      queryClient.setQueryData(['comments', postId], (old: any) => {
        if (!old?.comments) return old
        return {
          ...old,
          comments: old.comments.map((comment: Comment) => 
            comment.id === commentId 
              ? { ...comment, isLiked: true, likeCount: data.likeCount }
              : comment
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

// 댓글 좋아요 취소 Hook
export function useUnlikeComment() {
  const queryClient = useQueryClient()
  const { toast } = useToast()
  
  return useMutation({
    mutationFn: ({ postId, commentId }: { postId: string; commentId: string }) => 
      unlikeComment(postId, commentId),
    onSuccess: (data, { postId, commentId }) => {
      // 댓글 좋아요 상태 업데이트
      queryClient.setQueryData(['comments', postId], (old: any) => {
        if (!old?.comments) return old
        return {
          ...old,
          comments: old.comments.map((comment: Comment) => 
            comment.id === commentId 
              ? { ...comment, isLiked: false, likeCount: data.likeCount }
              : comment
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

// 댓글 좋아요 토글 Hook
export function useToggleCommentLike() {
  const likeMutation = useLikeComment()
  const unlikeMutation = useUnlikeComment()
  
  const toggleLike = (postId: string, commentId: string, isLiked: boolean) => {
    if (isLiked) {
      unlikeMutation.mutate({ postId, commentId })
    } else {
      likeMutation.mutate({ postId, commentId })
    }
  }
  
  return {
    toggleLike,
    isLoading: likeMutation.isPending || unlikeMutation.isPending,
  }
}
