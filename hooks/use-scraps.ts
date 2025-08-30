import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { 
  getMyScraps, 
  scrapPost, 
  unscrapPost,
  handleApiError
} from '@/lib/api-client'
import { Scrap, PostWithDetails } from '@/lib/types'
import { useToast } from '@/hooks/use-toast'

// 내 스크랩 목록 조회 Hook
export function useMyScraps() {
  return useQuery<Scrap[]>({
    // 백엔드 API가 페이지네이션을 지원하지 않으므로 파라미터 제거
    queryKey: ['my-scraps'],
    queryFn: getMyScraps,
    staleTime: 2 * 60 * 1000, // 2분
  })
}

// 게시글 스크랩 Hook
export function useScrapPost() {
  const queryClient = useQueryClient()
  const { toast } = useToast()
  
  return useMutation<any, Error, string, { previousPost: PostWithDetails | undefined }>({
    mutationFn: (postId: string) => scrapPost(postId),
    onMutate: async (postId) => {
      await queryClient.cancelQueries({ queryKey: ['post', postId] });
      const previousPost = queryClient.getQueryData<PostWithDetails>(['post', postId]);

      if (previousPost) {
        queryClient.setQueryData<PostWithDetails>(['post', postId], {
          ...previousPost,
          isBookmarked: true,
        });
      }
      queryClient.invalidateQueries({ queryKey: ['my-scraps'] });
      return { previousPost };
    },
    onError: (error, postId, context) => {
      if (context?.previousPost) {
        queryClient.setQueryData(['post', postId], context.previousPost);
      }
      toast({
        title: "오류",
        description: handleApiError(error),
        variant: "destructive",
      })
    },
    onSettled: (data, error, postId) => {
      queryClient.invalidateQueries({ queryKey: ['post', postId] });
      if (!error) {
        toast({ title: "성공", description: "게시글을 스크랩했습니다." });
      }
    }
  })
}

// 게시글 스크랩 취소 Hook
export function useUnscrapPost() {
  const queryClient = useQueryClient()
  const { toast } = useToast()
  
  return useMutation<void, Error, string, { previousPost: PostWithDetails | undefined }>({
    mutationFn: (postId: string) => unscrapPost(postId),
    onMutate: async (postId) => {
      await queryClient.cancelQueries({ queryKey: ['post', postId] });
      const previousPost = queryClient.getQueryData<PostWithDetails>(['post', postId]);

      if (previousPost) {
        queryClient.setQueryData<PostWithDetails>(['post', postId], {
          ...previousPost,
          isBookmarked: false,
        });
      }
      queryClient.invalidateQueries({ queryKey: ['my-scraps'] });
      return { previousPost };
    },
    onError: (error, postId, context) => {
      if (context?.previousPost) {
        queryClient.setQueryData(['post', postId], context.previousPost);
      }
      toast({
        title: "오류",
        description: handleApiError(error),
        variant: "destructive",
      })
    },
    onSettled: (data, error, postId) => {
      queryClient.invalidateQueries({ queryKey: ['post', postId] });
      if (!error) {
        toast({ title: "성공", description: "스크랩을 취소했습니다." });
      }
    }
  })
}

// 스크랩 토글 Hook
export function useToggleScrap() {
  const scrapMutation = useScrapPost()
  const unscrapMutation = useUnscrapPost()
  
  const toggleScrap = (postId: string, isScrapped: boolean | undefined) => {
    if (isScrapped) {
      unscrapMutation.mutate(postId)
    } else {
      scrapMutation.mutate(postId)
    }
  }
  
  return {
    toggleScrap,
    isLoading: scrapMutation.isPending || unscrapMutation.isPending,
  }
}
