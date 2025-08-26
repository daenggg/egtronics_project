import axios from 'axios'
import { User } from './auth'
import { tokenStorage } from './auth-storage'
import {
  Post, CreatePostRequest, UpdatePostRequest, PostListResponse,
  Comment, CreateCommentRequest, UpdateCommentRequest, CommentListResponse,
  ScrapListResponse, LikeResponse, PaginationParams
} from './types'

// 환경 변수에서 API 기본 URL을 가져오고, 없으면 로컬 개발용 주소로 대체합니다.
export const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

// 백엔드의 JwtToken DTO와 일치하는 인터페이스
export interface JwtToken {
  grantType: string;
  accessToken: string;
}

// axios 인스턴스
const api = axios.create({
  baseURL: API_BASE,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
  xsrfCookieName: 'XSRF-TOKEN', // Spring Security의 기본 CSRF 쿠키 이름
  xsrfHeaderName: 'X-CSRF-TOKEN', // Spring Security의 기본 CSRF 헤더 이름
})

/**
 * 모든 요청에 `Authorization` 헤더를 추가하는 인터셉터
 */
api.interceptors.request.use(
  (config) => {
    const token = tokenStorage.getToken();
    // 토큰이 있고, Authorization 헤더가 아직 설정되지 않았다면 추가
    if (token && !config.headers.Authorization) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

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

export async function updatePost(id: string, payload: UpdatePostRequest): Promise<Post> { // 백엔드는 PostEditResponse를 반환하지만, Post와 호환 가능
  const { data } = await api.patch<Post>(`/posts/${id}`, payload) // PUT -> PATCH
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

/**
 * 아이디(userId) 중복 확인
 * @returns `true`이면 사용 가능, `false`이면 중복.
 */
export async function checkIdAvailability(userId: string): Promise<boolean> {
  try {
    await api.get('/users/checkId', { params: { userId } });
    return true; 
  } catch (error) {
    if (axios.isAxiosError(error)) {
      if (error.response?.status === 409) {
        return false; 
      }

      console.error(`Error checking ID availability (status: ${error.response?.status || 'unknown'}):`, error.response?.data || error.message);
    }

    throw error;
  }
}

/** 닉네임 중복 확인 */
export async function checkNicknameAvailability(nickname: string): Promise<boolean> {
  try {
    await api.get('/users/checkNickname', { params: { nickname } });
    return true;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response?.status === 409) {
      return false;
    }
    throw error;
  }
}

export async function signUp(payload: {
  userId: string;
  name: string;
  nickname: string;
  email: string;
  password: string;
  phoneNumber: string;
  authority: boolean;
  profilePicture: string;
}): Promise<JwtToken> {
  const { data } = await api.post<JwtToken>('/users/', payload)
  return data
}

/**
 * 로그인 요청. 성공 시 백엔드에서 HttpOnly 쿠키로 토큰을 설정합니다.
 * @param payload - userId와 password를 포함합니다.
 * @returns JWT 토큰 정보 (accessToken)
 */
export async function login(payload: { userId: string; password: string }): Promise<JwtToken> {
  const { data } = await api.post<JwtToken>('/auth/login', payload)
  return data
}

export async function logout() {
  // 백엔드 /auth/logout 엔드포인트는 Redis의 리프레시 토큰을 삭제하고,
  // 만료된 accessToken 쿠키를 설정하여 클라이언트의 토큰을 무효화합니다.
  await api.post('/auth/logout')
  // 따라서 프론트엔드에서 수동으로 쿠키를 삭제할 필요가 없습니다.
}

/**
 * 회원 탈퇴. 성공 시 백엔드에서 토큰을 무효화합니다.
 * @param payload - 비밀번호를 포함합니다.
 */
export async function deleteAccount(payload: { password: string }): Promise<string> {
  // 계정 삭제 후에는 서버에서 세션/토큰이 무효화되어야 합니다.
  // 백엔드는 비밀번호를 담은 요청 본문을 필요로 합니다.
  const { data } = await api.delete<string>('/users/me', { data: payload })
  return data
}

export async function getMyProfile(): Promise<User> {
  const { data } = await api.get<User>('/users/me') // /me -> /users/me
  return data
}

export async function updateMyProfile(payload: Partial<Pick<User, 'nickname' | 'phone'>>): Promise<string> {
  // 백엔드는 UserEditRequest DTO를 사용하며, nickname과 phone만 수정 가능합니다.
  const { data } = await api.patch<string>('/users', payload) // PUT /me -> PATCH /users
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
export async function scrapPost(postId: string): Promise<any> {
  const { data } = await api.post(`/posts/${postId}/scrap`)
  return data
}

export async function unscrapPost(postId: string): Promise<void> {
  await api.delete(`/posts/${postId}/scrap`)
}

// TODO: 백엔드에 스크랩 목록 조회 API 구현 필요 (현재는 백엔드 엔드포인트가 존재하지 않음)
export async function getMyScraps(page: number = 1, limit: number = 20): Promise<ScrapListResponse> {
  // 현재 백엔드에 /users/me/scraps 와 같은 엔드포인트가 존재하지 않습니다.
  // 실제 API가 구현될 때까지는 이 함수가 호출될 때 오류가 발생하거나, 임시 데이터를 반환해야 할 수 있습니다.
  const { data } = await api.get<ScrapListResponse>('/users/me/scraps', { params: { page, limit } })
  return data
}

export function handleApiError(error: any): string {
  if (axios.isAxiosError(error)) {
    return error.response?.data?.message || error.message
  }
  return error.message || '알 수 없는 오류가 발생했습니다.'
}
