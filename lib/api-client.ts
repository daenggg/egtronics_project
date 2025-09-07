import axios, { AxiosError } from 'axios';
import { tokenStorage } from '@/lib/token-storage';
import {
  PostWithDetails, CreatePostRequest, UpdatePostRequest, PostListResponse, PostPreview, MyComment,
  Comment, CommentWithDetails, CreateCommentRequest, UpdateCommentRequest, CommentListResponse, LikeResponse, PaginationParams, ReportPostRequest,
  Scrap, Notification, UnreadCountResponse,
  User
} from './types';

function normalizeDate(dateInput: any): string {
  if (dateInput === null || typeof dateInput === 'undefined') {
    return '';
  }
  if (Array.isArray(dateInput) && dateInput.length >= 6) {
    const [year, month, day, hour, minute, second] = dateInput;
    const pad = (num: number) => String(num).padStart(2, '0');
    return `${year}-${pad(month)}-${pad(day)}T${pad(hour)}:${pad(minute)}:${pad(second)}`;
  }
  return String(dateInput);
}

export const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

export interface JwtToken {
  accessToken: string;
  refreshToken: string;
}

// axios 인스턴스 생성 (쿠키 관련 옵션 모두 제거)
const apiClient = axios.create({
  baseURL: API_BASE,
});

// Access Token을 axios 기본 헤더에 설정하거나 제거하는 함수
export function setAccessTokenInClient(token: string | null) {
  if (token) {
    apiClient.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    delete apiClient.defaults.headers.common['Authorization'];
  }
}

// 요청 인터셉터: 매 요청 시 최신 accessToken을 Authorization 헤더에 자동 삽입
apiClient.interceptors.request.use(
  (config) => {
    const accessToken = tokenStorage.getAccessToken();
    if (accessToken) {
      config.headers['Authorization'] = `Bearer ${accessToken}`;
    }
    if (!(config.data instanceof FormData)) {
      config.headers['Content-Type'] = 'application/json';
    }
    return config;
  },
  (error) => Promise.reject(error),
);

// 응답 인터셉터: 401 Unauthorized 시 refreshToken으로 accessToken 재발급 시도
apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError<any>) => {
    const originalRequest: any = error.config;
    if (error.response?.status === 401 && originalRequest && !originalRequest._retry) {
      originalRequest._retry = true;
      const refreshToken = tokenStorage.getRefreshToken();
      if (refreshToken) {
        try {
          const { data } = await axios.post<JwtToken>(`${API_BASE}/auth/refresh`, { refreshToken });
          tokenStorage.setAccessToken(data.accessToken);
          tokenStorage.setRefreshToken(data.refreshToken);
          setAccessTokenInClient(data.accessToken);
          originalRequest.headers['Authorization'] = `Bearer ${data.accessToken}`;
          return apiClient(originalRequest);
        } catch {
          tokenStorage.clearTokens();
          setAccessTokenInClient(null);
          window.location.href = '/login';
          return Promise.reject(error);
        }
      } else {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  },
);

// ==========================
// 기존 API 함수들 (변경 없음)
// ==========================

export async function getPosts(params: PaginationParams = {}): Promise<PostListResponse> {
  const { data } = await apiClient.get<any>('/posts/', { params });
  const posts = data.posts.map((post: any) => ({
    ...post,
    photo: post.photoUrl || null,
    authorProfilePicture: post.authorProfilePictureUrl || null,
    createdDate: normalizeDate(post.createdDate),
  }));
  return { posts, totalPostCount: data.totalPostCount };
}

export async function getPost(id: string): Promise<PostWithDetails> {
  const { data } = await apiClient.get<any>(`/posts/${id}`);
  if (!data) {
    throw new Error('Post not found');
  }
  const normalizedComments = (data.comments && Array.isArray(data.comments))
    ? data.comments.map((comment: any) => ({
        ...comment,
        createdDate: normalizeDate(comment.createdDate),
        author: {
          userId: comment.userId,
          nickname: comment.nickname,
          profilePicture: comment.profilePictureUrl || null,
        },
      }))
    : [];
  return {
    ...data,
    photo: data.photoUrl || null,
    createdDate: normalizeDate(data.createdDate),
    comments: normalizedComments,
    author: {
      userId: data.userId,
      nickname: data.nickname,
      profilePicture: data.authorProfilePictureUrl || null,
    },
  };
}

export async function createPost(payload: FormData): Promise<PostWithDetails> {
  const { data } = await apiClient.post<any>('/posts/', payload);
  return getPost(String(data.postId));
}

export async function updatePost(id: string, payload: FormData): Promise<PostWithDetails> {
  await apiClient.patch<any>(`/posts/${id}`, payload);
  return getPost(id);
}

export async function deletePost(id: string): Promise<void> {
  await apiClient.delete(`/posts/${id}`);
}

export async function likePost(id: string): Promise<void> {
  await apiClient.post(`/posts/${id}/like`);
}

export async function unlikePost(id: string): Promise<void> {
  await apiClient.delete(`/posts/${id}/like`);
}

export async function uploadFile(file: File): Promise<string> {
  const formData = new FormData();
  formData.append("file", file);
  const response = await apiClient.post("/upload", formData);
  return response.data.url;
}

export async function searchPosts(params: PaginationParams & { keyword: string }): Promise<PostListResponse> {
  const response = await apiClient.get('/posts/search', { params });
  const posts = response.data.posts.map((post: any) => ({
    ...post,
    photo: post.photoUrl || null,
    authorProfilePicture: post.authorProfilePictureUrl || null,
    createdDate: normalizeDate(post.createdDate),
  }));
  return { posts, totalPostCount: response.data.totalPostCount };
}

export async function checkIdAvailability(userId: string): Promise<boolean> {
  try {
    await apiClient.get('/users/checkId', { params: { userId } });
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

export async function checkNicknameAvailability(nickname: string): Promise<boolean> {
  try {
    await apiClient.get('/users/checkNickname', { params: { nickname } });
    return true;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response?.status === 409) {
      return false;
    }
    throw error;
  }
}

export async function signUp(payload: FormData): Promise<string> {
  const { data } = await apiClient.post<string>('/users/', payload);
  return data;
}

export async function login(payload: { userId: string; password: string }): Promise<JwtToken> {
  const { data } = await apiClient.post<JwtToken>('/auth/login', payload);
  tokenStorage.setAccessToken(data.accessToken);
  tokenStorage.setRefreshToken(data.refreshToken);
  setAccessTokenInClient(data.accessToken);
  return data;
}

export async function logout() {
  await apiClient.post('/auth/logout');
}

export async function deleteAccount(payload: { password: string }): Promise<string> {
  const { data } = await apiClient.delete<string>('/users/me', { data: payload });
  return data;
}

export async function getMyProfile(): Promise<User> {
  const { data } = await apiClient.get<any>('/users/me');
  return {
    ...data,
    profilePicture: data.profilePictureUrl || null,
    createdDate: normalizeDate(data.createdDate),
  };
}

export async function updateMyProfile(payload: FormData): Promise<string> {
  const { data } = await apiClient.patch<string>('/users/me', payload);
  return data;
}

export async function getMyPosts(): Promise<PostPreview[]> {
  const { data } = await apiClient.get<any[]>('/users/me/posts');
  return data.map(post => ({
    ...post,
    createdDate: normalizeDate(post.createdDate),
    photo: post.photoUrl || null,
    authorProfilePicture: post.authorProfilePictureUrl || null,
  }));
}

export async function getMyComments(): Promise<MyComment[]> {
  const { data } = await apiClient.get<any[]>('/users/me/comments');
  return data.map(comment => ({
    ...comment,
    createdDate: normalizeDate(comment.createdDate),
  }));
}

export async function getComments(postId: string): Promise<CommentListResponse> {
  const { data: rawComments } = await apiClient.get<any>(`/posts/${postId}/comments`);
  if (!Array.isArray(rawComments)) {
    if (rawComments && Array.isArray(rawComments.comments)) {
      return rawComments;
    }
    return { comments: [], totalCount: 0 };
  }
  const transformedComments = rawComments.map((comment) => ({
    ...comment,
    createdDate: normalizeDate(comment.createdDate),
    author: {
      userId: comment.userId,
      nickname: comment.nickname,
      profilePicture: comment.profilePicture || null,
    },
  }));
  return {
    comments: transformedComments,
    totalCount: transformedComments.length,
  };
}

export async function createComment(postId: string | number, payload: CreateCommentRequest): Promise<CommentWithDetails> {
  const { data } = await apiClient.post<any>(`/posts/${String(postId)}/comments`, payload);
  return {
    ...data,
    createdDate: normalizeDate(data.createdDate),
    author: {
      userId: data.userId,
      nickname: data.nickname,
      profilePicture: data.profilePicture || null,
    },
  };
}

export async function updateComment(postId: string, commentId: string, payload: UpdateCommentRequest): Promise<CommentWithDetails> {
  const { data } = await apiClient.patch<any>(`/posts/${postId}/comments/${commentId}`, payload);
  return {
    ...data,
    createdDate: normalizeDate(data.createdDate),
    author: {
      userId: data.userId,
      nickname: data.nickname,
      profilePicture: data.profilePicture || null,
    },
  };
}

export async function deleteComment(postId: string, commentId: string): Promise<void> {
  await apiClient.delete(`/posts/${postId}/comments/${commentId}`);
}

export async function likeComment(postId: string, commentId: string): Promise<void> {
  await apiClient.post(`/posts/${postId}/comments/${commentId}/likes`);
}

export async function unlikeComment(postId: string, commentId: string): Promise<void> {
  await apiClient.delete(`/posts/${postId}/comments/${commentId}/likes`);
}

export async function scrapPost(postId: string): Promise<any> {
  const { data } = await apiClient.post(`/posts/${postId}/scrap`);
  return data;
}

export async function unscrapPost(postId: string): Promise<any> {
  const { data } = await apiClient.delete(`/posts/${postId}/scrap`);
  return data;
}

export async function getMyScraps(): Promise<Scrap[]> {
  const { data } = await apiClient.get<any[]>('/users/me/scraps');
  if (!Array.isArray(data)) {
    console.error('Error: Expected an array of scraps, but received:', data);
    return [];
  }
  return data.map((item) => ({
    scrapId: item.scrapId,
    postId: item.postId,
    postTitle: item.postTitle,
    postContent: item.postContent,
    postCreatedDate: normalizeDate(item.postCreatedDate),
    authorNickname: item.authorNickname,
    postPhoto: item.postPhotoUrl || null,
    authorProfilePicture: item.authorProfilePictureUrl || null,
  }));
}

export async function getNotifications(): Promise<Notification[]> {
  const { data } = await apiClient.get<any[]>('/notifications');
  return data.map(notification => ({
    ...notification,
    createdDate: normalizeDate(notification.createdDate),
  }));
}

export async function markNotificationAsRead(id: number): Promise<void> {
  await apiClient.put(`/notifications/${id}/read`);
}

export async function getUnreadNotificationCount(): Promise<UnreadCountResponse> {
  const { data } = await apiClient.get<{ count: number }>('/notifications/unread-count');
  return { unreadCount: data.count };
}

export async function reportPost(postId: string, payload: ReportPostRequest): Promise<any> {
  const { data } = await apiClient.post(`/reports/posts/${postId}`, payload);
  return data;
}

export function handleApiError(error: any): string {
  if (axios.isAxiosError(error)) {
    return error.response?.data?.message || error.message;
  }
  return error.message || '알 수 없는 오류가 발생했습니다.';
}
