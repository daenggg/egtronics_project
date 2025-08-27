import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getComments,
  createComment,
  updateComment,
  deleteComment,
  likeComment,
  unlikeComment,
  handleApiError,
} from "@/lib/api-client";
import { CommentListResponse, CommentWithDetails, CreateCommentRequest, UpdateCommentRequest } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";

// 댓글 목록 조회 Hook
export function useComments(postId: string | number) {
  
  return useQuery<CommentListResponse, Error>({
    queryKey: ['comments', String(postId)],
    queryFn: () => getComments(String(postId)),
    enabled: !!postId,
    staleTime: 1 * 60 * 1000, // 1분
  })
}

// 댓글 작성 Hook
export function useCreateComment() {
  const queryClient = useQueryClient()
  const { toast } = useToast()
  
  return useMutation({
    mutationFn: ({ postId, data }: { postId: string | number; data: CreateCommentRequest }) => 
      createComment(String(postId), data),
    onSuccess: (_, { postId }) => {
      toast({
        title: "성공",
        description: "댓글이 작성되었습니다.",
      })
      // Optimistic update는 반환되는 데이터 구조가 다를 수 있어 복잡합니다.
      // 쿼리 무효화는 가장 안전하고 확실하게 UI를 최신 상태로 유지하는 방법입니다.
      queryClient.invalidateQueries({ queryKey: ['comments', String(postId)] })
      queryClient.invalidateQueries({ queryKey: ['post', String(postId)] }) // 게시글의 댓글 수 업데이트
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
      postId: string | number; 
      commentId: string | number; 
      data: UpdateCommentRequest 
    }) => updateComment(String(postId), String(commentId), data),
    onSuccess: (updatedComment, { postId }) => {
      toast({
        title: "성공",
        description: "댓글이 수정되었습니다.",
      })
      // 댓글 목록 캐시 업데이트
      queryClient.setQueryData(['comments', String(postId)], (old: CommentListResponse | undefined) => {
        if (!old?.comments) return old
        return {
          ...old,
          comments: old.comments.map((comment: CommentWithDetails) => 
            comment.commentId === updatedComment.commentId ? updatedComment : comment
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
    mutationFn: ({ postId, commentId }: { postId: string | number; commentId: string | number }) => 
      deleteComment(String(postId), String(commentId)),
    onSuccess: (_, { postId, commentId }) => {
      toast({
        title: "성공",
        description: "댓글이 삭제되었습니다.",
      })
      // 댓글 목록 캐시 업데이트
      queryClient.setQueryData(['comments', String(postId)], (old: CommentListResponse | undefined) => {
        if (!old?.comments) return old
        return {
          ...old,
          comments: old.comments.filter((comment: CommentWithDetails) => comment.commentId !== Number(commentId)),
          totalCount: (old.totalCount || 1) - 1
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
    mutationFn: ({ postId, commentId }: { postId: string | number; commentId: string | number }) => 
      likeComment(String(postId), String(commentId)),
    onSuccess: (data, { postId, commentId }) => {
      // 댓글 좋아요 상태 업데이트
      queryClient.setQueryData(['comments', String(postId)], (old: CommentListResponse | undefined) => {
        if (!old?.comments) return old
        return {
          ...old,
          comments: old.comments.map((comment: CommentWithDetails) => 
            comment.commentId === Number(commentId)
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
    mutationFn: ({ postId, commentId }: { postId: string | number; commentId: string | number }) => 
      unlikeComment(String(postId), String(commentId)),
    onSuccess: (data, { postId, commentId }) => {
      // 댓글 좋아요 상태 업데이트
      queryClient.setQueryData(['comments', String(postId)], (old: CommentListResponse | undefined) => {
        if (!old?.comments) return old
        return {
          ...old,
          comments: old.comments.map((comment: CommentWithDetails) => 
            comment.commentId === Number(commentId)
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
  
  const toggleCommentLike = ({ postId, commentId, isLiked }: { postId: number | string; commentId: number | string; isLiked: boolean }) => {
    const params = { postId: String(postId), commentId: String(commentId) };
    if (isLiked) {
      unlikeMutation.mutate(params)
    } else {
      likeMutation.mutate(params)
    }
  }
  
  return {
    toggleCommentLike,
    isLoading: likeMutation.isPending || unlikeMutation.isPending,
  }
}
