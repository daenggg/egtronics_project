import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getComments,
  createComment,
  updateComment,
  deleteComment,
  toggleCommentLike,
  handleApiError,
} from "@/lib/api-client";
import { PostWithDetails, CommentListResponse, CommentWithDetails, CreateCommentRequest, UpdateCommentRequest, LikeResponse } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/auth-context";

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
      // ✅ 해결: 프로필 페이지의 '내 댓글' 목록도 갱신합니다.
      queryClient.invalidateQueries({ queryKey: ['my-comments'] });
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
  
  return useMutation<
    CommentWithDetails,
    Error,
    { postId: string | number; commentId: string | number; data: UpdateCommentRequest },
    { previousPost: PostWithDetails | undefined } // Optimistic Update를 위해 이전 Post 데이터를 저장
  >({
    mutationFn: ({ postId, commentId, data }) => 
      updateComment(String(postId), String(commentId), data),
    
    onMutate: async ({ postId, commentId, data }) => {
      const queryKey = ['post', String(postId)]; // Post 쿼리를 직접 수정
      await queryClient.cancelQueries({ queryKey });

      const previousPost = queryClient.getQueryData<PostWithDetails>(queryKey);

      if (previousPost?.comments) {
        queryClient.setQueryData<PostWithDetails>(queryKey, {
          ...previousPost,
          comments: previousPost.comments.map((comment) =>
            comment.commentId === Number(commentId)
              ? { ...comment, content: data.content } // 내용만 즉시 업데이트
              : comment
          ),
        });
      }
      
      return { previousPost };
    },
    
    onSuccess: () => {
      toast({
        title: "성공",
        description: "댓글이 수정되었습니다.",
      })
      // ✅ 해결: 프로필 페이지의 '내 댓글' 목록도 갱신합니다.
      queryClient.invalidateQueries({ queryKey: ['my-comments'] });
    },

    onError: (error, { postId }, context) => { // 에러 발생 시 롤백
      if (context?.previousPost) {
        queryClient.setQueryData(['post', String(postId)], context.previousPost);
      }
      toast({
        title: "오류",
        description: handleApiError(error),
        variant: "destructive",
      })
    },

    onSettled: (data, error, { postId }) => { // 성공/실패 여부와 관계없이 최종적으로 서버 데이터와 동기화
      queryClient.invalidateQueries({ queryKey: ['post', String(postId)] });
    },
  })
}

// 댓글 삭제 Hook
export function useDeleteComment() {
  const queryClient = useQueryClient()
  const { toast } = useToast()
  
  return useMutation<
    void,
    Error,
    { postId: string | number; commentId: string | number },
    { previousPost: PostWithDetails | undefined }
  >({
    mutationFn: ({ postId, commentId }: { postId: string | number; commentId: string | number }) => 
      deleteComment(String(postId), String(commentId)), // API 클라이언트 함수는 이미 postId를 받도록 되어 있습니다.
    
    onMutate: async ({ postId, commentId }) => {
      const queryKey = ['post', String(postId)];
      await queryClient.cancelQueries({ queryKey });

      const previousPost = queryClient.getQueryData<PostWithDetails>(queryKey);

      if (previousPost?.comments) {
        queryClient.setQueryData<PostWithDetails>(queryKey, {
          ...previousPost,
          comments: previousPost.comments.filter((comment) => comment.commentId !== Number(commentId)),
        });
      }
      
      return { previousPost };
    },

    onSuccess: () => {
      toast({
        title: "성공",
        description: "댓글이 삭제되었습니다.",
      })
      // ✅ 해결: 프로필 페이지의 '내 댓글' 목록도 갱신합니다.
      queryClient.invalidateQueries({ queryKey: ['my-comments'] });
    },

    onError: (error, { postId }, context) => {
      if (context?.previousPost) {
        queryClient.setQueryData(['post', String(postId)], context.previousPost);
      }
      toast({
        title: "오류",
        description: handleApiError(error),
        variant: "destructive",
      })
    },
    
    onSettled: (data, error, { postId }) => {
      queryClient.invalidateQueries({ queryKey: ['post', String(postId)] });
    },
  })
}

export function useToggleCommentLikeMutation() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation<
    { liked: boolean; likeCount: number }, // API 응답 타입 (성공 시 받는 데이터)
    Error,
    { postId: string | number; commentId: string | number }, // mutate 함수가 받을 변수 타입
    { previousPost?: PostWithDetails } // onMutate 컨텍스트 타입
  >({
    // mutationFn은 mutate 함수로부터 postId와 commentId를 받습니다.
    mutationFn: ({ postId, commentId }) => toggleCommentLike(String(postId), String(commentId)),
    
    // onMutate: UI를 즉시 업데이트 (게시글 좋아요 훅과 로직 동일)
    onMutate: async ({ postId, commentId }) => {
      const queryKey = ['post', String(postId)];
      await queryClient.cancelQueries({ queryKey });

      const previousPost = queryClient.getQueryData<PostWithDetails>(queryKey);

      if (previousPost?.comments) {
        queryClient.setQueryData<PostWithDetails>(queryKey, {
          ...previousPost,
          comments: previousPost.comments.map(comment => 
            comment.commentId === Number(commentId)
              ? { 
                  ...comment, 
                  liked: !comment.liked, 
                  likeCount: comment.liked 
                    ? Math.max(0, comment.likeCount - 1) 
                    : comment.likeCount + 1 
                }
              : comment
          )
        });
      }
      return { previousPost };
    },

    // onSuccess: 서버로부터 받은 정확한 데이터로 캐시를 업데이트 (게시글 좋아요 훅과 로직 동일)
    onSuccess: (data, { postId, commentId }) => {
      queryClient.setQueryData<PostWithDetails>(['post', String(postId)], (oldData) => {
        if (!oldData || !oldData.comments) return oldData;
        return {
          ...oldData,
          comments: oldData.comments.map(comment =>
            comment.commentId === Number(commentId)
              ? { ...comment, liked: data.liked, likeCount: data.likeCount }
              : comment
          ),
        };
      });
    },

    // onError: 에러 발생 시 원래 상태로 롤백 (게시글 좋아요 훅과 로직 동일)
    onError: (error, { postId }, context) => {
      if (context?.previousPost) {
        queryClient.setQueryData(['post', String(postId)], context.previousPost);
      }
      toast({
        title: "오류",
        description: handleApiError(error),
        variant: "destructive",
      });
    },

    // onSettled: 최종적으로 서버 데이터와 동기화 (게시글 좋아요 훅과 로직 동일)
    onSettled: (_, __, { postId }) => {
      queryClient.invalidateQueries({ queryKey: ['post', String(postId)] });
    },
  });
}