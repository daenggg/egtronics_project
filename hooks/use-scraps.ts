import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { 
  getMyScraps, 
  scrapPost, 
  unscrapPost,
  handleApiError
} from '@/lib/api-client'
import { Scrap } from '@/lib/types'
import { useToast } from '@/hooks/use-toast'

// 내 스크랩 목록 조회 Hook
export function useMyScraps() {
  return useQuery({
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
  
  return useMutation({
    mutationFn: (postId: string) => scrapPost(postId),
    onSuccess: (data, postId) => {
      toast({
        title: "성공",
        description: "게시글이 스크랩되었습니다.",
      })
      
      // Optimistic update 대신, 관련 데이터 캐시를 모두 무효화하여
      // 서버로부터 최신 상태를 다시 불러오는 것이 더 안전하고 확실합니다.
      queryClient.invalidateQueries({ queryKey: ['posts'] })
      queryClient.invalidateQueries({ queryKey: ['post', postId] })
      queryClient.invalidateQueries({ queryKey: ['my-scraps'] })
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

// 게시글 스크랩 취소 Hook
export function useUnscrapPost() {
  const queryClient = useQueryClient()
  const { toast } = useToast()
  
  return useMutation({
    mutationFn: (postId: string) => unscrapPost(postId),
    onSuccess: (_, postId) => {
      toast({
        title: "성공",
        description: "스크랩이 취소되었습니다.",
      })
      
      // 관련 데이터 캐시를 모두 무효화합니다.
      queryClient.invalidateQueries({ queryKey: ['posts'] })
      queryClient.invalidateQueries({ queryKey: ['post', postId] })
      queryClient.invalidateQueries({ queryKey: ['my-scraps'] })
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

// 스크랩 토글 Hook
export function useToggleScrap() {
  const scrapMutation = useScrapPost()
  const unscrapMutation = useUnscrapPost()
  
  const toggleScrap = (postId: string, isScrapped: boolean) => {
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
