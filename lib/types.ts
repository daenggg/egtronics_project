/**
 * 사용자 정보 (User 테이블)
 */
export interface User {
  userId: string;
  password?: string; // 보안상 클라이언트로 내려주지 않는 것이 일반적입니다.
  email: string;
  name: string;
  phoneNumber: string;
  nickname: string;
  authority: string;
  createdDate: string; // ISO 8601 형식의 문자열 (e.g., "2025-08-27T14:30:00.000Z")
  profilePicture?: string | null;
}

/**
 * 카테고리 (Category 테이블)
 */
export interface Category {
  categoryId: number;
  categoryName: string;
}

/**
 * 게시글 정보 (Post 테이블)
 */
export interface Post {
  postId: number;
  userId: string;
  categoryId: number;
  title: string;
  content: string | null;
  photo: string | null;
  likeCount: number;
  viewCount: number;
  createdDate: string;
}

/**
 * 게시글 댓글 (Comment 테이블)
 */
export interface Comment {
  commentId: number;
  userId: string;
  postId: number;
  content: string;
  likeCount: number;
  createdDate: string;
}

/**
 * (API 응답용 확장 인터페이스)
 * 실제 API에서는 Post, Comment 데이터를 내려줄 때
 * 연관된 User, Category 정보를 포함하여 응답하는 경우가 많습니다.
 */

export interface PostWithDetails extends Post {
  author: {
    userId: string;
    nickname: string;
    profilePicture?: string | null;
  };
  category: {
    categoryId: number;
    categoryName: string;
  };
  comments?: CommentWithDetails[];
  // 현재 로그인한 사용자의 좋아요/스크랩 여부 (서버에서 계산)
  isLiked?: boolean;
  isBookmarked?: boolean;
  reportCount?: number; // 신고 횟수
  reportedByCurrentUser?: boolean; // 신고 여부
  isMine?: boolean; // 내가 쓴 게시물인지 여부
}

/**
 * (API 응답용 확장 인터페이스)
 * 게시글 목록 조회 (GET /posts) API가 반환하는 데이터 형식입니다.
 * PostWithDetails보다 가벼운 버전입니다.
 */
export interface PostPreview {
  postId: number;
  title: string;
  content: string | null;
  nickname: string;
  createdDate: string;
  likeCount: number;
  viewCount: number;
  categoryName: string;
  photo: string | null;
  commentCount?: number;
  authorProfilePicture?: string | null; // 작성자 프로필 사진
  reportCount?: number; // 신고 횟수

  // 낙관적 업데이트를 위한 속성 추가
  isLiked?: boolean;
  isBookmarked?: boolean;
}

export interface CommentWithDetails extends Comment {
  author: {
    userId: string;
    nickname: string;
    profilePicture?: string | null;
  };
  // 현재 로그인한 사용자의 좋아요 여부 (서버에서 계산)
  isLiked?: boolean;
  isMine?: boolean; // 내가 쓴 댓글인지 여부
}

// --- API 요청/응답 타입 ---

export interface CreatePostRequest {
  title: string;
  content: string;
  categoryId: number;
  photo?: string | null;
}

export interface UpdatePostRequest {
  title?: string;
  content?: string;
  categoryId?: number;
  photo?: string | null;
}

export type PostListResponse = PostPreview[];

export interface CreateCommentRequest {
  content: string;
}

export interface UpdateCommentRequest {
  content: string;
}

export interface CommentListResponse {
  comments: CommentWithDetails[];
  totalCount: number;
}

export interface ReportPostRequest {
  reportReason: string;
  reportText?: string;
}

/**
 * 알림 (Notification 테이블)
 */
export interface Notification {
  notificationId: number;
  userId: string;
  // 알림 종류에 따라 postId, commentId 등이 있을 수 있습니다.
  // 백엔드 응답에 따라 optional (?) 처리하거나 타입을 확장해야 합니다.
  postId?: number | null;
  commentId?: number | null;
  postLikeId?: number | null;
  commentLikeId?: number | null;
  message: string;
  read: boolean;
  createdDate: string;
}

export interface Scrap {
  scrapId: number;
  postId: number;
  postTitle: string;
  postContent: string | null;
  postCreatedDate: string;
  authorNickname: string;
  postPhoto: string | null;
  authorProfilePicture: string | null;
}

/**
 * 내 활동내역 > 내 댓글 조회 API 응답 타입
 */
export interface MyComment {
  commentId: number;
  postId: number;
  postTitle: string;
  content: string;
  likeCount: number;
  createdDate: string;
}

export interface PaginationParams {
  page?: number;
  limit?: number;
  search?: string;
  category?: string;
  sortBy?: 'latest' | 'popular' | 'views';
}

export interface LikeResponse {
  isLiked: boolean;
  likeCount: number;
}

export interface UnreadCountResponse {
  unreadCount: number;
}
