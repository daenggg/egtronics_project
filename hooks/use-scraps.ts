import { useCallback } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { 
  getMyScraps, 
  scrapPost, 
  unscrapPost,
  handleApiError
} from '@/lib/api-client'
import { Scrap, PostWithDetails, PostPreview } from '@/lib/types'
import { useToast } from '@/hooks/use-toast'

// useMyScraps hook (no changes needed here)
export function useMyScraps() {
  return useQuery<Scrap[]>({
    queryKey: ['my-scraps'],
    queryFn: getMyScraps,
    staleTime: 2 * 60 * 1000,
  })
}

// Post Scrap Hook
export function useScrapPost() {
  const queryClient = useQueryClient()
  const { toast } = useToast()
  
  return useMutation<any, Error, string, { previousPost?: PostWithDetails, previousPosts?: { queryKey: any[], data: any }[] }>({
    mutationFn: (postId: string) => scrapPost(postId),
    onMutate: async (postId) => {
      await queryClient.cancelQueries({ queryKey: ['post', postId] });
      const postQueries = queryClient.getQueriesData<any>({ queryKey: ['posts'] });

      const previousPost = queryClient.getQueryData<PostWithDetails>(['post', postId]);
      
      // 👇 [FIX] Spread `queryKey` into a new mutable array `[...queryKey]`
      const previousPosts = postQueries.map(([queryKey, data]) => ({ queryKey: [...queryKey], data }));

      // Optimistic update for the detail page
      if (previousPost) {
        queryClient.setQueryData<PostWithDetails>(['post', postId], {
          ...previousPost,
          isScrapped: true,
        });
      }

      // Optimistic update for list pages
      postQueries.forEach(([queryKey, data]) => {
        if (data && Array.isArray(data.posts)) {
          const updatedPosts = data.posts.map((p: PostPreview) => 
            p.postId === Number(postId) ? { ...p, isScrapped: true } : p
          );
          queryClient.setQueryData(queryKey, { ...data, posts: updatedPosts });
        }
      });
      
      queryClient.invalidateQueries({ queryKey: ['my-scraps'] });
      return { previousPost, previousPosts };
    },
    onSuccess: (_, postId) => {
      queryClient.invalidateQueries({ queryKey: ['post', postId] });
      queryClient.invalidateQueries({ queryKey: ['posts'] });
    },
    onError: (error, postId, context) => {
      if (context?.previousPost) {
        queryClient.setQueryData(['post', postId], context.previousPost);
      }
      context?.previousPosts?.forEach(({ queryKey, data }) => {
        queryClient.setQueryData(queryKey, data);
      });
      toast({
        title: "Error",
        description: handleApiError(error),
        variant: "destructive",
      })
    },
  })
}

// Post Un-Scrap Hook
export function useUnscrapPost() {
  const queryClient = useQueryClient()
  const { toast } = useToast()
  
  return useMutation<any, Error, string, { previousPost?: PostWithDetails, previousPosts?: { queryKey: any[], data: any }[] }>({
    mutationFn: (postId: string) => unscrapPost(postId),
    onMutate: async (postId) => {
      await queryClient.cancelQueries({ queryKey: ['post', postId] });
      const postQueries = queryClient.getQueriesData<any>({ queryKey: ['posts'] });

      const previousPost = queryClient.getQueryData<PostWithDetails>(['post', postId]);

      // 👇 [FIX] Spread `queryKey` into a new mutable array `[...queryKey]`
      const previousPosts = postQueries.map(([queryKey, data]) => ({ queryKey: [...queryKey], data }));

      // Optimistic update for the detail page
      if (previousPost) {
        queryClient.setQueryData<PostWithDetails>(['post', postId], {
          ...previousPost,
          isScrapped: false,
        });
      }

      // Optimistic update for list pages
      postQueries.forEach(([queryKey, data]) => {
        if (data && Array.isArray(data.posts)) {
          const updatedPosts = data.posts.map((p: PostPreview) => 
            p.postId === Number(postId) ? { ...p, isScrapped: false } : p
          );
          queryClient.setQueryData(queryKey, { ...data, posts: updatedPosts });
        }
      });
      
      queryClient.invalidateQueries({ queryKey: ['my-scraps'] });
      return { previousPost, previousPosts };
    },
    onSuccess: (_, postId) => {
      queryClient.invalidateQueries({ queryKey: ['post', postId] });
      queryClient.invalidateQueries({ queryKey: ['posts'] });
    },
    onError: (error, postId, context) => {
      if (context?.previousPost) {
        queryClient.setQueryData(['post', postId], context.previousPost);
      }
      context?.previousPosts?.forEach(({ queryKey, data }) => {
        queryClient.setQueryData(queryKey, data);
      });
      toast({
        title: "Error",
        description: handleApiError(error),
        variant: "destructive",
      })
    },
  })
}

// Toggle Scrap Hook (no changes needed here)
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