/**
 * 사용자 정보 (User 테이블)
 */
export interface User {
  userId: string;
  password?: string;
  email: string;
  name: string;
  phoneNumber: string;
  nickname: string;
  authority: string;
  createdDate: string;
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

export interface PostWithDetails {
  postId: number;
  categoryId: number;
  title: string;
  content: string;
  photoUrl: string | null;
  nickname: string; // author 객체에서 밖으로 이동
  createdDate: string;
  likeCount: number;
  viewCount: number;
  authorProfilePictureUrl: string | null; // author 객체에서 밖으로 이동
  comments: CommentWithDetails[];
  scrapped: boolean; // isScrapped -> scrapped
  author: boolean;   // isAuthor -> author
  liked: boolean;    // isLiked -> liked
  blocked: boolean;
  reportedByCurrentUser?: boolean; // 이 필드는 있을 수도 있고 없을 수도 있습니다.
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
  authorProfilePicture?: string | null;
  reportCount?: number;
  isLiked: boolean;
  isScrapped: boolean; // [수정] isBookmarked -> isScrapped 로 이름 통일
}

export interface CommentWithDetails extends Comment {
  author: {
    userId: string;
    nickname: string;
    profilePicture?: string | null;
  };
  isLiked?: boolean;
  isAuthor?: boolean; // [수정] isMine -> isAuthor 로 이름 통일
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

export interface PostListResponse {
  posts: PostPreview[];
  totalPostCount: number;
}

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
  size?: number;
  category?: number; // 백엔드와 일치하도록 'category'로 수정
  sortCode?: number;
  keyword?: string;
}

export interface LikeResponse {
  isLiked: boolean;
  likeCount: number;
}

export interface UnreadCountResponse {
  unreadCount: number;
}