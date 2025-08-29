import { useQuery } from '@tanstack/react-query';
import { getMyPosts, getMyComments } from '@/lib/api-client';

/**
 * 현재 로그인한 사용자가 작성한 게시글 목록을 가져오는 훅
 */
export function useMyPosts() {
  return useQuery({
    queryKey: ['my-posts'],
    queryFn: getMyPosts,
    staleTime: 1000 * 60 * 5, // 5분
  });
}

/**
 * 현재 로그인한 사용자가 작성한 댓글 목록을 가져오는 훅
 */
export function useMyComments() {
  return useQuery({
    queryKey: ['my-comments'],
    queryFn: getMyComments,
    staleTime: 1000 * 60 * 5, // 5분
  });
}