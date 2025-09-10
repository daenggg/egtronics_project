import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  getMyScraps, 
  togglePostScrap,
  handleApiError
} from '@/lib/api-client';
import { Scrap, PostWithDetails } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';

// 내 스크랩 목록 조회 훅 (변경 없음)
export function useMyScraps() {
  return useQuery<Scrap[]>({
    queryKey: ['my-scraps'],
    queryFn: getMyScraps,
    staleTime: 2 * 60 * 1000,
  });
}

export function useToggleScrapMutation(postId: string) {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation<boolean, Error, void, { previousPost?: PostWithDetails }>({
    mutationFn: () => togglePostScrap(postId),
    
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: ['post', postId] });
      const previousPost = queryClient.getQueryData<PostWithDetails>(['post', postId]);
      if (previousPost) {
        const updatedPost = { ...previousPost, isScrapped: !previousPost.isScrapped };
        queryClient.setQueryData(['post', postId], updatedPost);
      }
      return { previousPost };
    },

    onSuccess: (isScrappedNow) => {
      queryClient.setQueryData<PostWithDetails>(['post', postId], (oldData) => 
        oldData ? { ...oldData, isScrapped: isScrappedNow } : oldData
      );
    },

    onError: (err, _, context) => {
      if (context?.previousPost) {
        queryClient.setQueryData(['post', postId], context.previousPost);
      }
      toast({ title: "오류", description: handleApiError(err), variant: "destructive" });
    },

    // ▼▼▼ [수정] onSettled에서 ['post', postId] 갱신 로직을 제거 ▼▼▼
    onSettled: () => {
      // 목록 페이지들의 데이터만 갱신하여 일관성을 맞춘다.
      queryClient.invalidateQueries({ queryKey: ['posts'] });
      queryClient.invalidateQueries({ queryKey: ['my-scraps'] });
    },
  });
}