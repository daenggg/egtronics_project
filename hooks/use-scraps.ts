// hooks/use-scraps.ts

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  getMyScraps, 
  togglePostScrap,
  handleApiError
} from '@/lib/api-client';
import { Scrap, PostWithDetails } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';

// 내 스크랩 목록 조회 훅
export function useMyScraps() {
  return useQuery<Scrap[]>({
    queryKey: ['my-scraps'],
    queryFn: getMyScraps,
    staleTime: 2 * 60 * 1000,
  });
}

// 스크랩 토글 뮤테이션 훅
export function useToggleScrapMutation(postId: string) {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation<boolean, Error, void, { previousPost?: PostWithDetails }>({
    mutationFn: () => togglePostScrap(postId),
    
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: ['post', postId] });
      const previousPost = queryClient.getQueryData<PostWithDetails>(['post', postId]);
      if (previousPost) {
        // [수정] isScrapped -> scrapped
        const updatedPost = { ...previousPost, scrapped: !previousPost.scrapped }; 
        queryClient.setQueryData(['post', postId], updatedPost);
      }
      return { previousPost };
    },

    onSuccess: (isScrappedNow) => {
      queryClient.setQueryData<PostWithDetails>(['post', postId], (oldData) => 
        // [수정] isScrapped -> scrapped
        oldData ? { ...oldData, scrapped: isScrappedNow } : oldData
      );
    },

    onError: (err, _, context) => {
      if (context?.previousPost) {
        queryClient.setQueryData(['post', postId], context.previousPost);
      }
      toast({ title: "오류", description: handleApiError(err), variant: "destructive" });
    },

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['posts'] });
      queryClient.invalidateQueries({ queryKey: ['my-scraps'] });
    },
  });
}