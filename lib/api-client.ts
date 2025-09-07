import axios from 'axios'

import { tokenStorage } from '@/lib/token-storage';
import {
  PostWithDetails, CreatePostRequest, UpdatePostRequest, PostListResponse, PostPreview, MyComment,
  Comment, CommentWithDetails, CreateCommentRequest, UpdateCommentRequest, CommentListResponse, LikeResponse, PaginationParams, ReportPostRequest,
  Scrap, Notification, UnreadCountResponse,
  User
} from './types'

/**
 * @param dateInput - 백엔드에서 받은 날짜 데이터 (배열 또는 이미 변환된 문자열)
 * @returns ISO 8601 형식의 날짜 문자열
 */
function normalizeDate(dateInput: any): string {
  // 입력값이 null 또는 undefined인 경우, 유효한 Date 객체를 만들 수 없는
  // "null" 또는 "undefined" 문자열이 반환되는 것을 방지합니다.
  // 빈 문자열을 반환하여 UI단에서 날짜가 없음을 인지하고 처리하도록 합니다.
  if (dateInput === null || typeof dateInput === 'undefined') {
    // 또는 기본 날짜 문자열(예: '1970-01-01T00:00:00Z')을 반환하거나,
    // 에러를 던져서 데이터 문제를 파악할 수도 있습니다.
    // 여기서는 UI의 유연성을 위해 빈 문자열을 반환합니다.
    return '';
  }

  if (Array.isArray(dateInput) && dateInput.length >= 6) {
    const [year, month, day, hour, minute, second] = dateInput;
    const pad = (num: number) => String(num).padStart(2, '0');
    return `${year}-${pad(month)}-${pad(day)}T${pad(hour)}:${pad(minute)}:${pad(second)}`;
  }

  return String(dateInput);
}

// 환경 변수에서 API 기본 URL을 가져오고, 없으면 로컬 개발용 주소로 대체합니다.
 // [수정] 개발 환경에서는 '/api' (Proxy)를 사용하고,
 // 프로덕션(배포) 환경에서는 환경 변수로 주입된 실제 백엔드 주소를 사용합니다.
 // deploy.sh 스크립트에서 NEXT_PUBLIC_API_URL을 설정해줍니다.
export const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

// [수정] 백엔드의 토큰 응답 DTO와 일치하는 인터페이스
export interface JwtToken {
  accessToken: string;
  refreshToken: string;
}

// Access Token을 메모리에 저장하기 위한 변수
let accessToken: string | null = null;

export const setAccessToken = (token: string | null) => {
  accessToken = token;
};

// axios 인스턴스
const api = axios.create({
  baseURL: API_BASE,
  // 세션 쿠키를 주고받기 위해 withCredentials를 true로 설정합니다.
  withCredentials: true,
  // Spring Security의 기본 CSRF 쿠키/헤더 이름을 사용합니다.
  xsrfCookieName: 'XSRF-TOKEN',
  xsrfHeaderName: 'X-CSRF-TOKEN',
})

// 요청 인터셉터: FormData가 아닌 경우에만 Content-Type을 application/json으로 설정합니다.
api.interceptors.request.use(
  (config) => {
  // Access Token이 있으면 헤더에 추가
  if (accessToken) {
    config.headers['Authorization'] = `Bearer ${accessToken}`;
  }

  if (!(config.data instanceof FormData)) {
    // 기존 헤더를 유지하면서 Content-Type을 설정합니다.
    config.headers['Content-Type'] = 'application/json';
  }
  // FormData의 경우, axios가 자동으로 Content-Type을 'multipart/form-data'와 boundary로 설정하도록 헤더를 설정하지 않습니다.
  return config;
},
  (error) => {
    return Promise.reject(error);
  }
);

// 응답 인터셉터: Access Token 만료(401) 시 Refresh Token으로 재발급 시도
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    // 401 에러이고, 재시도한 요청이 아닐 경우
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true; // 재시도 플래그 설정

      const refreshToken = tokenStorage.getRefreshToken();
      if (refreshToken) {
        try {
          // 토큰 재발급 API 호출
          const { data } = await axios.post<JwtToken>(`${API_BASE}/auth/refresh`, { refreshToken });

          // 새로 발급받은 토큰 저장

          // 원래 요청의 헤더에 새로운 Access Token 설정
          originalRequest.headers['Authorization'] = `Bearer ${data.accessToken}`;

          // 원래 요청 재시도
          return api(originalRequest);
        } catch (refreshError) {
          // Refresh Token도 만료되었거나 문제 발생 시 로그아웃 처리
          setAccessToken(null);
          tokenStorage.removeRefreshToken();
          // 로그인 페이지로 리디렉션 또는 다른 처리
          window.location.href = '/login';
          return Promise.reject(refreshError);
        }
      }
    }
    return Promise.reject(error);
  }
);

// 게시글 API
export async function getPosts(params: PaginationParams = {}): Promise<PostListResponse> {
  // 백엔드 응답은 PostPageResponse 형태({ posts: [], totalPostCount: 0 })로 옵니다.
  const { data } = await api.get<any>('/posts/', { params });

  // PostPreview[] 형태로 변환하여 반환합니다.
  const posts = data.posts.map((post: any) => ({
    ...post,
    photo: post.photoUrl || null, // photoUrl -> photo
    authorProfilePicture: post.authorProfilePictureUrl || null, // authorProfilePictureUrl -> authorProfilePicture
    createdDate: normalizeDate(post.createdDate),
  }));
  return { posts, totalPostCount: data.totalPostCount };
}

export async function getPost(id: string): Promise<PostWithDetails> {
  // The backend sends a flat object, but the frontend expects a nested structure.
  // We use <any> to accept the flat response and then transform it.
  const { data } = await api.get<any>(`/posts/${id}`);
  if (!data) {
    throw new Error('Post not found');
  }

  // 백엔드에서 오는 댓글 목록은 이미 isMine 필드가 계산되어 있습니다.
  // 날짜 형식만 프론트엔드에 맞게 변환해줍니다.
  // The backend response for a single post includes its comments.
  // We need to normalize the dates for these comments as well.
  const normalizedComments = (data.comments && Array.isArray(data.comments))
    ? data.comments.map((comment: any) => {
        // 백엔드 CommentResponse DTO는 이미 필요한 대부분의 필드를 가지고 있습니다.
        // author 객체를 프론트엔드 타입에 맞게 구성합니다.
        return {
          ...comment,
          createdDate: normalizeDate(comment.createdDate),
          // [수정] 백엔드 CommentResponse의 최상위 필드를 사용하여 author 객체를 구성합니다.
          author: {
            userId: comment.userId, // comment.author.userId -> comment.userId
            nickname: comment.nickname, // comment.author.nickname -> comment.nickname
            profilePicture: comment.profilePictureUrl || null,
          },
        };
      })
    : [];

  // 백엔드 응답(PostDetailResponse)을 프론트엔드 타입(PostWithDetails)으로 변환합니다.
  return {
    ...data,
    photo: data.photoUrl || null, // photoUrl을 photo로 매핑
    createdDate: normalizeDate(data.createdDate),
    comments: normalizedComments,
    author: {
      userId: data.userId, // [수정] 백엔드에서 DTO 최상단에 포함해준 작성자 ID
      nickname: data.nickname, // 백엔드 DTO에 이미 포함된 닉네임
      profilePicture: data.authorProfilePictureUrl || null, // authorProfilePictureUrl을 profilePicture로 매핑
    },
  };
}

export async function createPost(payload: FormData): Promise<PostWithDetails> {
  // The backend returns a response containing the new post's ID.
  const { data } = await api.post<any>('/posts/', payload);
  // After creating, fetch the full post details to ensure we have the correct
  // PostWithDetails structure, including the normalized date.
  return getPost(String(data.postId));
}

export async function updatePost(id: string, payload: FormData): Promise<PostWithDetails> {
  // Perform the update. The backend returns a PostEditResponse, which is not what we need.
  await api.patch<any>(`/posts/${id}`, payload);
  // After a successful update, refetch the post to get the latest data
  // in the correct PostWithDetails format. This ensures the cache is updated correctly.
  return getPost(id);
}

export async function deletePost(id: string): Promise<void> {
  await api.delete(`/posts/${id}`)
}

export async function likePost(id: string): Promise<void> {
  await api.post(`/posts/${id}/like`)
}

export async function unlikePost(id: string): Promise<void> {
  await api.delete(`/posts/${id}/like`)
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

export async function searchPosts(params: PaginationParams & { keyword: string }): Promise<PostListResponse> {
  // '/posts/search' 엔드포인트를 사용합니다.
  const response = await api.get('/posts/search', { params });
  // getPosts와 동일하게 데이터를 변환합니다.
  const posts = response.data.posts.map((post: any) => ({
    ...post,
    photo: post.photoUrl || null, // photoUrl -> photo
    authorProfilePicture: post.authorProfilePictureUrl || null, // authorProfilePictureUrl -> authorProfilePicture
    createdDate: normalizeDate(post.createdDate),
  }));
  return { posts, totalPostCount: response.data.totalPostCount };
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
 * @returns JWT 토큰 정보 (accessToken, refreshToken)
 */
export async function login(payload: { userId: string; password: string }): Promise<JwtToken> {
  // 백엔드의 /auth/login 엔드포인트로 JSON 데이터를 전송합니다.
  const { data } = await api.post<JwtToken>('/auth/login', payload);

  return data;
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
  const { data } = await api.get<any>('/users/me');
  return {
    ...data,
    profilePicture: data.profilePictureUrl || null, // 백엔드 DTO의 profilePictureUrl을 매핑
    createdDate: normalizeDate(data.createdDate),
  };
}

export async function updateMyProfile(payload: FormData): Promise<string> {
  // 백엔드 서비스(UserService)의 editProfile 메서드는 void를 반환하므로, 컨트롤러는 User 객체 대신 성공 메시지(string)를 반환할 가능성이 높습니다.
  // 로그인한 사용자 본인의 정보를 수정하는 API 경로는 일반적으로 '/users/me' 입니다.
  const { data } = await api.patch<string>('/users/me', payload);
  return data
}

export async function getMyPosts(): Promise<PostPreview[]> {
  const { data } = await api.get<any[]>('/users/me/posts');
  return data.map(post => ({
    ...post,
    createdDate: normalizeDate(post.createdDate),
    // 백엔드 응답 필드명(photoUrl, authorProfilePictureUrl)을
    // 프론트엔드 타입 필드명(photo, authorProfilePicture)으로 매핑합니다.
    photo: post.photoUrl || null, 
    authorProfilePicture: post.authorProfilePictureUrl || null,
  }));
}

export async function getMyComments(): Promise<MyComment[]> {
  const { data } = await api.get<any[]>('/users/me/comments');
  return data.map(comment => ({
    ...comment,
    createdDate: normalizeDate(comment.createdDate),
  }));
}

// 댓글 API
export async function getComments(postId: string): Promise<CommentListResponse> {
  // The backend returns a raw array of comments, but the frontend expects an object
  // with a `comments` property and a `totalCount`. We'll transform the data here.
  const { data: rawComments } = await api.get<any>(`/posts/${postId}/comments`);

  if (!Array.isArray(rawComments)) {
    if (rawComments && Array.isArray(rawComments.comments)) {
      return rawComments; // It's already in the expected format.
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
  const { data } = await api.post<any>(`/posts/${String(postId)}/comments`, payload);
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
  // The backend controller uses @PatchMapping, so we should use api.patch.
  const { data } = await api.patch<any>(`/posts/${postId}/comments/${commentId}`, payload);
  // The backend returns a flat response, so we transform it.
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
  await api.delete(`/posts/${postId}/comments/${commentId}`)
}

export async function likeComment(postId: string, commentId: string): Promise<void> {
  await api.post(`/posts/${postId}/comments/${commentId}/likes`)
}

export async function unlikeComment(postId: string, commentId:string): Promise<void> {
  await api.delete(`/posts/${postId}/comments/${commentId}/likes`)
}

// ===== 스크랩 API =====
export async function scrapPost(postId: string): Promise<any> {
  const { data } = await api.post(`/posts/${postId}/scrap`)
  return data
}

export async function unscrapPost(postId: string): Promise<any> {
  const { data } = await api.delete(`/posts/${postId}/scrap`)
  return data
}

/**
 * 내 스크랩 목록 조회
 * @returns Scrap[]
 */
export async function getMyScraps(): Promise<Scrap[]> {
  // 백엔드 응답 구조가 Scrap 타입과 정확히 일치하지 않을 수 있으므로 any[]로 받고,
  // 프론트엔드 타입에 맞게 명시적으로 매핑하여 안정성을 높입니다.
  const { data } = await api.get<any[]>('/users/me/scraps');

  if (!Array.isArray(data)) {
    console.error('Error: Expected an array of scraps, but received:', data);
    return []; // 오류 발생 시 빈 배열 반환
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

// ===== 알림 API =====

/**
 * 알림 목록 조회
 */
export async function getNotifications(): Promise<Notification[]> {
  const { data } = await api.get<any[]>('/notifications');
  return data.map(notification => ({
    ...notification,
    createdDate: normalizeDate(notification.createdDate),
  }));
}

/**
 * 알림 읽음 처리
 */
export async function markNotificationAsRead(id: number): Promise<void> {
  await api.put(`/notifications/${id}/read`);
}

/**
 * 읽지 않은 알림 개수 조회
 */
export async function getUnreadNotificationCount(): Promise<UnreadCountResponse> {
  // 백엔드는 { "count": number } 형식으로 응답합니다.
  // 프론트엔드의 UnreadCountResponse ({ unreadCount: number }) 형식에 맞게 변환합니다.
  const { data } = await api.get<{ count: number }>('/notifications/unread-count');
  return { unreadCount: data.count };
}

// ===== 신고 API =====

/**
 * 게시물을 신고합니다.
 */
export async function reportPost(postId: string, payload: ReportPostRequest): Promise<any> {
  const { data } = await api.post(`/reports/posts/${postId}`, payload);
  return data;
}

export function handleApiError(error: any): string {
  if (axios.isAxiosError(error)) {
    return error.response?.data?.message || error.message
  }
  return error.message || '알 수 없는 오류가 발생했습니다.'
}