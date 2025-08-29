import axios from 'axios'
import { tokenStorage } from './auth-storage'
import {
  PostWithDetails, CreatePostRequest, UpdatePostRequest, PostListResponse,
  Comment, CommentWithDetails, CreateCommentRequest, UpdateCommentRequest, CommentListResponse, LikeResponse, PaginationParams,
  Scrap, Notification, UnreadCountResponse,
  User
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
  xsrfCookieName: 'XSRF-TOKEN', 
  xsrfHeaderName: 'X-CSRF-TOKEN', 
})

// 요청 인터셉터: FormData가 아닌 경우에만 Content-Type을 application/json으로 설정합니다.
api.interceptors.request.use(config => {
  if (!(config.data instanceof FormData)) {
    // 기존 헤더를 유지하면서 Content-Type을 설정합니다.
    config.headers['Content-Type'] = 'application/json';
  }
  // FormData의 경우, axios가 자동으로 Content-Type을 'multipart/form-data'와 boundary로 설정하도록 헤더를 설정하지 않습니다.
  return config;
});

// 게시글 API
export async function getPosts(params: PaginationParams = {}): Promise<PostListResponse> {
  const { data } = await api.get<PostListResponse>('/posts', { params })
  return data
}

export async function getPost(id: string): Promise<PostWithDetails> {
  const { data } = await api.get<PostWithDetails>(`/posts/${id}`)
  return data
}

export async function createPost(payload: FormData): Promise<PostWithDetails> {
  const { data } = await api.post<PostWithDetails>('/posts/', payload);
  return data;
}

export async function updatePost(id: string, payload: FormData): Promise<PostWithDetails> {
  const { data } = await api.patch<PostWithDetails>(`/posts/${id}`, payload);
  return data;
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

/**
 * @param file 
 * @returns 
 */
export async function uploadFile(file: File): Promise<string> {
  const formData = new FormData();
  formData.append("file", file); 
  // axios 인터셉터가 FormData를 감지하고 올바른 헤더를 자동으로 설정하므로,
  // 수동으로 Content-Type을 지정할 필요가 없습니다.
  const response = await api.post("/upload", formData);
  return response.data.url; 
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

export async function signUp(payload: FormData): Promise<string> {
  // UserController의 register는 성공 시 "회원가입 성공" 문자열을 반환합니다.
  const { data } = await api.post<string>('/users/', payload);
  return data;
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
  await api.post('/auth/logout')

}

/**
 * 회원 탈퇴. 성공 시 백엔드에서 토큰을 무효화합니다.
 * @param payload - 비밀번호를 포함합니다.
 */
export async function deleteAccount(payload: { password: string }): Promise<string> {

  const { data } = await api.delete<string>('/users/me', { data: payload })
  return data
}

export async function getMyProfile(): Promise<User> {
  const { data } = await api.get<User>('/users/me') // /me -> /users/me
  return data
}

export async function updateMyProfile(payload: FormData): Promise<string> {
  // 백엔드 서비스(UserService)의 editProfile 메서드는 void를 반환하므로, 컨트롤러는 User 객체 대신 성공 메시지(string)를 반환할 가능성이 높습니다.
  // 백엔드 UserController의 editProfile 메서드는 @PatchMapping("/") 으로 매핑되어 있으므로, /users/me가 아닌 /users/ 로 요청해야 합니다.
  const { data } = await api.patch<string>('/users/', payload);
  return data
}

export async function getMyPosts(): Promise<PostWithDetails[]> {
  const { data } = await api.get<PostWithDetails[]>('/users/me/posts');
  return data;
}

export async function getMyComments(): Promise<CommentWithDetails[]> {
  const { data } = await api.get<CommentWithDetails[]>('/users/me/comments');
  return data;
}

// 댓글 API
export async function getComments(postId: string): Promise<CommentListResponse> {
  const { data } = await api.get<CommentListResponse>(`/posts/${postId}/comments`)
  return data
}

export async function createComment(postId: string | number, payload: CreateCommentRequest): Promise<CommentWithDetails> {
  const { data } = await api.post<CommentWithDetails>(`/posts/${String(postId)}/comments`, payload)
  return data
}

export async function updateComment(postId: string, commentId: string, payload: UpdateCommentRequest): Promise<CommentWithDetails> {
  const { data } = await api.put<CommentWithDetails>(`/posts/${postId}/comments/${commentId}`, payload)
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

/**
 * 내 스크랩 목록 조회
 * @returns Scrap[]
 */
export async function getMyScraps(): Promise<Scrap[]> {
  // 백엔드 ScrapController의 경로가 /posts/my/scraps 이므로 수정합니다.
  const { data } = await api.get<Scrap[]>('/users/me/scraps')
  return data
}

// ===== 알림 API =====

/**
 * 알림 목록 조회
 */
export async function getNotifications(): Promise<Notification[]> {
  const { data } = await api.get<Notification[]>('/notifications');
  return data;
}

/**
 * 알림 읽음 처리
 */
export async function markNotificationAsRead(id: number): Promise<void> {
  // API 명세에 따라 POST에서 PUT으로 변경
  await api.put(`/notifications/${id}/read`);
}

/**
 * 읽지 않은 알림 개수 조회
 */
export async function getUnreadNotificationCount(): Promise<UnreadCountResponse> {
  const { data } = await api.get<UnreadCountResponse>('/notifications/unread-count');
  return data;
}

export function handleApiError(error: any): string {
  if (axios.isAxiosError(error)) {
    return error.response?.data?.message || error.message
  }
  return error.message || '알 수 없는 오류가 발생했습니다.'
}
