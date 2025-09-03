import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { 
  getMyScraps, 
  scrapPost, 
  unscrapPost,
  handleApiError
} from '@/lib/api-client'
import { Scrap, PostWithDetails, PostPreview } from '@/lib/types'
import { useToast } from '@/hooks/use-toast'
import { useAuth } from '@/contexts/auth-context'

// 내 스크랩 목록 조회 Hook
export function useMyScraps() {
  return useQuery<Scrap[]>({
    // 백엔드 API가 페이지네이션을 지원하지 않으므로 파라미터 제거
    queryKey: ['my-scraps'],
    queryFn: getMyScraps,
    staleTime: 2 * 60 * 1000, // 2분
  })
}

// 게시글 스크랩 Hook임
export function useScrapPost() {
  const queryClient = useQueryClient()
  const { toast } = useToast()
  const { refreshCsrfToken } = useAuth()
  
  return useMutation<any, Error, string, { previousPost?: PostWithDetails, previousPosts?: PostPreview[] }>({
    mutationFn: (postId: string) => scrapPost(postId),
    onMutate: async (postId) => {
      // 모든 관련 쿼리를 취소하여 충돌 방지
      await queryClient.cancelQueries({ queryKey: ['post', postId] })
      await queryClient.cancelQueries({ queryKey: ['posts'] })

      // 이전 데이터 스냅샷
      const previousPost = queryClient.getQueryData<PostWithDetails>(['post', postId]);
      const previousPosts = queryClient.getQueryData<PostPreview[]>(['posts']);

      // 상세 페이지 캐시 낙관적 업데이트
      if (previousPost) {
        queryClient.setQueryData<PostWithDetails>(['post', postId], {
          ...previousPost,
          isBookmarked: true,
        });
      }

      // 목록 페이지 캐시 낙관적 업데이트
      if (previousPosts) {
        const updatedPosts = previousPosts.map(p => 
          p.postId === Number(postId) ? { ...p, isBookmarked: true } : p
        );
        queryClient.setQueryData(['posts'], updatedPosts);
      }

      // 내 스크랩 목록은 즉시 무효화하여 최신 데이터로 갱신
      queryClient.invalidateQueries({ queryKey: ['my-scraps'] });
      return { previousPost, previousPosts };
    },
    onSuccess: () => {
      // toast({ title: "성공", description: "게시글을 스크랩했습니다." });
    },
    onError: (error, postId, context) => {
      if (context?.previousPost) {
        queryClient.setQueryData(['post', postId], context.previousPost);
      }
      if (context?.previousPosts) {
        queryClient.setQueryData(['posts'], context.previousPosts);
      }
      toast({
        title: "오류",
        description: handleApiError(error),
        variant: "destructive",
      })
    },
    onSettled: (data, error, postId) => {
      refreshCsrfToken();
      queryClient.invalidateQueries({ queryKey: ['post', postId] });
      queryClient.invalidateQueries({ queryKey: ['posts'] });
    }
  })
}

// 게시글 스크랩 취소 Hook
export function useUnscrapPost() {
  const queryClient = useQueryClient()
  const { toast } = useToast()
  const { refreshCsrfToken } = useAuth()
  
  return useMutation<any, Error, string, { previousPost?: PostWithDetails, previousPosts?: PostPreview[] }>({
    mutationFn: (postId: string) => unscrapPost(postId),
    onMutate: async (postId) => {
      // 모든 관련 쿼리를 취소하여 충돌 방지
      await queryClient.cancelQueries({ queryKey: ['post', postId] })
      await queryClient.cancelQueries({ queryKey: ['posts'] })

      // 이전 데이터 스냅샷
      const previousPost = queryClient.getQueryData<PostWithDetails>(['post', postId]);
      const previousPosts = queryClient.getQueryData<PostPreview[]>(['posts']);

      // 상세 페이지 캐시 낙관적 업데이트
      if (previousPost) {
        queryClient.setQueryData<PostWithDetails>(['post', postId], {
          ...previousPost,
          isBookmarked: false,
        });
      }

      // 목록 페이지 캐시 낙관적 업데이트
      if (previousPosts) {
        const updatedPosts = previousPosts.map(p => 
          p.postId === Number(postId) ? { ...p, isBookmarked: false } : p
        );
        queryClient.setQueryData(['posts'], updatedPosts);
      }

      // 내 스크랩 목록은 즉시 무효화하여 최신 데이터로 갱신
      queryClient.invalidateQueries({ queryKey: ['my-scraps'] });
      return { previousPost, previousPosts };
    },
    onSuccess: () => {
      // toast({ title: "성공", description: "스크랩을 취소했습니다." });
    },
    onError: (error, postId, context) => {
      if (context?.previousPost) {
        queryClient.setQueryData(['post', postId], context.previousPost);
      }
      if (context?.previousPosts) {
        queryClient.setQueryData(['posts'], context.previousPosts);
      }
      toast({
        title: "오류",
        description: handleApiError(error),
        variant: "destructive",
      })
    },
    onSettled: (data, error, postId) => {
      refreshCsrfToken();
      queryClient.invalidateQueries({ queryKey: ['post', postId] });
      queryClient.invalidateQueries({ queryKey: ['posts'] });
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
