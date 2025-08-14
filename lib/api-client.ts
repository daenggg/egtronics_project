import { tokenStorage } from './auth-storage'
import { 
  Post, 
  CreatePostRequest, 
  UpdatePostRequest, 
  PostListResponse,
  Comment,
  CreateCommentRequest,
  UpdateCommentRequest,
  CommentListResponse,
  ScrapListResponse,
  LikeResponse,
  PaginationParams
} from './types'

// API 기본 설정
const API_BASE = '/api'

// 공통 fetch 함수
async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const config: RequestInit = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    credentials: 'include', // 쿠키 자동 포함
    ...options,
  }

  const response = await fetch(`${API_BASE}${endpoint}`, config)
  const data = await response.json()

  if (!response.ok) {
    throw new Error(data.message || 'API 요청에 실패했습니다.')
  }

  return data
}


// ===== 게시글 API =====

// 게시글 목록 조회
export async function getPosts(params: PaginationParams = {}): Promise<PostListResponse> {
  const searchParams = new URLSearchParams()
  
  if (params.page) searchParams.set('page', params.page.toString())
  if (params.limit) searchParams.set('limit', params.limit.toString())
  if (params.search) searchParams.set('search', params.search)
  if (params.category) searchParams.set('category', params.category)
  if (params.sortBy) searchParams.set('sortBy', params.sortBy)
  
  const queryString = searchParams.toString()
  const endpoint = `/posts${queryString ? `?${queryString}` : ''}`
  
  const response = await apiRequest<{ data: PostListResponse }>(endpoint)
  return response.data
}

// 게시글 상세 조회
export async function getPost(id: string): Promise<Post> {
  const response = await apiRequest<{ data: Post }>(`/posts/${id}`)
  return response.data
}

// 게시글 작성
export async function createPost(data: CreatePostRequest): Promise<Post> {
  const response = await apiRequest<{ data: Post }>('/posts', {
    method: 'POST',
    body: JSON.stringify(data)
  })
  return response.data
}

// 게시글 수정
export async function updatePost(id: string, data: UpdatePostRequest): Promise<Post> {
  const response = await apiRequest<{ data: Post }>(`/posts/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data)
  })
  return response.data
}

// 게시글 삭제
export async function deletePost(id: string): Promise<void> {
  await apiRequest(`/posts/${id}`, {
    method: 'DELETE'
  })
}

// 게시글 좋아요
export async function likePost(id: string): Promise<LikeResponse> {
  const response = await apiRequest<{ data: LikeResponse }>(`/posts/${id}/like`, {
    method: 'POST'
  })
  return response.data
}

// 게시글 좋아요 취소
export async function unlikePost(id: string): Promise<LikeResponse> {
  const response = await apiRequest<{ data: LikeResponse }>(`/posts/${id}/like`, {
    method: 'DELETE'
  })
  return response.data
}

// ===== 댓글 API =====

// 댓글 목록 조회
export async function getComments(postId: string): Promise<CommentListResponse> {
  const response = await apiRequest<{ data: CommentListResponse }>(`/posts/${postId}/comments`)
  return response.data
}

// 댓글 작성
export async function createComment(postId: string, data: CreateCommentRequest): Promise<Comment> {
  const response = await apiRequest<{ data: Comment }>(`/posts/${postId}/comments`, {
    method: 'POST',
    body: JSON.stringify(data)
  })
  return response.data
}

// 댓글 수정
export async function updateComment(postId: string, commentId: string, data: UpdateCommentRequest): Promise<Comment> {
  const response = await apiRequest<{ data: Comment }>(`/posts/${postId}/comments/${commentId}`, {
    method: 'PUT',
    body: JSON.stringify(data)
  })
  return response.data
}

// 댓글 삭제
export async function deleteComment(postId: string, commentId: string): Promise<void> {
  await apiRequest(`/posts/${postId}/comments/${commentId}`, {
    method: 'DELETE'
  })
}

// 댓글 좋아요
export async function likeComment(postId: string, commentId: string): Promise<LikeResponse> {
  const response = await apiRequest<{ data: LikeResponse }>(`/posts/${postId}/comments/${commentId}/likes`, {
    method: 'POST'
  })
  return response.data
}

// 댓글 좋아요 취소
export async function unlikeComment(postId: string, commentId: string): Promise<LikeResponse> {
  const response = await apiRequest<{ data: LikeResponse }>(`/posts/${postId}/comments/${commentId}/likes`, {
    method: 'DELETE'
  })
  return response.data
}

// ===== 스크랩 API =====

// 게시글 스크랩
export async function scrapPost(postId: string): Promise<any> {
  const response = await apiRequest<{ data: any }>(`/posts/${postId}/scrap`, {
    method: 'POST'
  })
  return response.data
}

// 게시글 스크랩 취소
export async function unscrapPost(postId: string): Promise<void> {
  await apiRequest(`/posts/${postId}/scrap`, {
    method: 'DELETE'
  })
}

// 내 스크랩 목록 조회
export async function getMyScraps(page: number = 1, limit: number = 20): Promise<ScrapListResponse> {
  const response = await apiRequest<{ data: ScrapListResponse }>(`/users/me/scraps?page=${page}&limit=${limit}`)
  return response.data
}

// ===== 유틸리티 함수 =====

// 에러 처리 헬퍼
export function handleApiError(error: any): string {
  if (error instanceof Error) {
    return error.message
  }
  return '알 수 없는 오류가 발생했습니다.'
}

// API 응답 타입 가드
export function isApiResponse<T>(response: any): response is { success: boolean; data: T; message: string } {
  return response && typeof response.success === 'boolean' && 'data' in response
}
