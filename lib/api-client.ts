import axios from 'axios'
import { tokenStorage } from './auth-storage'
import { 
  Post, CreatePostRequest, UpdatePostRequest, PostListResponse, 
  Comment, CreateCommentRequest, UpdateCommentRequest, CommentListResponse, 
  ScrapListResponse, LikeResponse, PaginationParams, 
  User, AuthResponse, SignUpRequest, LoginRequest, UpdateProfileRequest
} from './types'

export const API_BASE = 'http://localhost:8080';

// axios 인스턴스
const api = axios.create({
  baseURL: API_BASE,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
})


api.interceptors.request.use(config => {
  const token = tokenStorage.getToken()
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// 게시글 API
export async function getPosts(params: PaginationParams = {}): Promise<PostListResponse> {
  const { data } = await api.get<PostListResponse>('/posts', { params })
  return data
}

export async function getPost(id: string): Promise<Post> {
  const { data } = await api.get<Post>(`/posts/${id}`)
  return data
}

export async function createPost(payload: CreatePostRequest): Promise<Post> {
  const { data } = await api.post<Post>('/posts', payload)
  return data
}

export async function updatePost(id: string, payload: UpdatePostRequest): Promise<Post> {
  const { data } = await api.put<Post>(`/posts/${id}`, payload)
  return data
}

export async function deletePost(id: string): Promise<void> {
  await api.delete(`/posts/${id}`)
}

export async function likePost(id: string): Promise<LikeResponse> {
  const { data } = await api.post<LikeResponse>(`/posts/${id}/like`)
  return data
}

export async function unlikePost(id: string): Promise<LikeResponse> {
  const { data } = await api.delete<LikeResponse>(`/posts/${id}/like`)
  return data
}

// ===== 회원관리 API =====

export async function signUp(payload: SignUpRequest): Promise<User> {
  const { data } = await api.post<User>('/users', payload)
  return data
}

export async function login(payload: LoginRequest): Promise<AuthResponse> {
  const { data } = await api.post<AuthResponse>('/auth/login', payload)
  tokenStorage.setToken(data.token) 
  return data
}

export async function logout(): Promise<void> {
  await api.get('/auth/logout')
  tokenStorage.removeToken() 
}

export async function deleteAccount(): Promise<void> {
  await api.delete('/users/me')
  tokenStorage.removeToken() 
}

export async function getMyProfile(): Promise<User> {
  const { data } = await api.get<User>('/users/me')
  return data
}

export async function updateMyProfile(payload: { username?: string; email?: string; password?: string }) {
  const { data } = await api.put('/users', payload)
  return data
}

// 댓글 API
export async function getComments(postId: string): Promise<CommentListResponse> {
  const { data } = await api.get<CommentListResponse>(`/posts/${postId}/comments`)
  return data
}

export async function createComment(postId: string, payload: CreateCommentRequest): Promise<Comment> {
  const { data } = await api.post<Comment>(`/posts/${postId}/comments`, payload)
  return data
}

export async function updateComment(postId: string, commentId: string, payload: UpdateCommentRequest): Promise<Comment> {
  const { data } = await api.put<Comment>(`/posts/${postId}/comments/${commentId}`, payload)
  return data
}

export async function deleteComment(postId: string, commentId: string): Promise<void> {
  await api.delete(`/posts/${postId}/comments/${commentId}`)
}

export async function likeComment(postId: string, commentId: string): Promise<LikeResponse> {
  const { data } = await api.post<LikeResponse>(`/posts/${postId}/comments/${commentId}/likes`)
  return data
}

export async function unlikeComment(postId: string, commentId: string): Promise<LikeResponse> {
  const { data } = await api.delete<LikeResponse>(`/posts/${postId}/comments/${commentId}/likes`)
  return data
}

// ===== 스크랩 API =====
export async function scrapPost(postId: string): Promise<void> {
  const { data } = await api.post<void>(`/posts/${postId}/scrap`)
  return data
}

export async function unscrapPost(postId: string): Promise<void> {
  await api.delete(`/posts/${postId}/scrap`)
}

export async function getMyScraps(page: number = 1, limit: number = 20): Promise<ScrapListResponse> {
  const { data } = await api.get<ScrapListResponse>('/users/me/scraps', { params: { page, limit } })
  return data
}







export function handleApiError(error: any): string {
  if (axios.isAxiosError(error)) {
    return error.response?.data?.message || error.message
  }
  return error.message || '알 수 없는 오류가 발생했습니다.'
}
