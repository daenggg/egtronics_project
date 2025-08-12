import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { 
  getMyScraps, 
  scrapPost, 
  unscrapPost,
  handleApiError
} from '@/lib/api-client'
import { ScrapListResponse } from '@/lib/types'
import { useToast } from '@/hooks/use-toast'

// 내 스크랩 목록 조회 Hook
export function useMyScraps(page: number = 1, limit: number = 20) {
  const { toast } = useToast()
  
  return useQuery({
    queryKey: ['scraps', page, limit],
    queryFn: () => getMyScraps(page, limit),
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
      
      // 게시글 목록의 스크랩 상태 업데이트
      queryClient.setQueriesData({ queryKey: ['posts'] }, (old: any) => {
        if (!old?.posts) return old
        return {
          ...old,
          posts: old.posts.map((post: any) => 
            post.id === postId 
              ? { ...post, isScrapped: true }
              : post
          )
        }
      })
      
      // 게시글 상세의 스크랩 상태 업데이트
      queryClient.setQueryData(['post', postId], (old: any) => {
        if (!old) return old
        return { ...old, isScrapped: true }
      })
      
      // 스크랩 목록 캐시 무효화
      queryClient.invalidateQueries({ queryKey: ['scraps'] })
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
      
      // 게시글 목록의 스크랩 상태 업데이트
      queryClient.setQueriesData({ queryKey: ['posts'] }, (old: any) => {
        if (!old?.posts) return old
        return {
          ...old,
          posts: old.posts.map((post: any) => 
            post.id === postId 
              ? { ...post, isScrapped: false }
              : post
          )
        }
      })
      
      // 게시글 상세의 스크랩 상태 업데이트
      queryClient.setQueryData(['post', postId], (old: any) => {
        if (!old) return old
        return { ...old, isScrapped: false }
      })
      
      // 스크랩 목록 캐시 무효화
      queryClient.invalidateQueries({ queryKey: ['scraps'] })
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
