// 게시글 관련 타입 정의

export interface Post {
  id: string
  title: string
  content: string
  authorId: string
  authorName: string
  authorAvatar?: string
  images?: string[]
  category?: string
  viewCount: number
  likeCount: number
  commentCount: number
  isLiked: boolean
  isScrapped: boolean
  createdAt: Date
  updatedAt: Date
}

export interface CreatePostRequest {
  title: string
  content: string
  category?: string
  images?: string[]
}

export interface UpdatePostRequest {
  title?: string
  content?: string
  category?: string
  images?: string[]
}

export interface PostListResponse {
  posts: Post[]
  totalCount: number
  currentPage: number
  totalPages: number
  hasNext: boolean
  hasPrev: boolean
}

// 댓글 관련 타입 정의
export interface Comment {
  id: string
  postId: string
  content: string
  authorId: string
  authorName: string
  authorAvatar?: string
  likeCount: number
  isLiked: boolean
  createdAt: Date
  updatedAt: Date
}

export interface CreateCommentRequest {
  content: string
}

export interface UpdateCommentRequest {
  content: string
}

export interface CommentListResponse {
  comments: Comment[]
  totalCount: number
}

// 스크랩 관련 타입 정의
// 백엔드의 ScrapResponseDto와 일치시킵니다.
export interface Scrap {
  postId: number;
  title: string;
  nickname: string;
  createdDate: string;
}

export type ScrapListResponse = Scrap[];

// 알림 관련 타입 정의
export interface Notification {
  id: number;
  content: string;
  url: string;
  read: boolean;
  createdDate: string;
}

// API 응답 공통 타입
export interface ApiResponse<T = any> {
  success: boolean
  message: string
  data?: T
  error?: string
}

export interface UnreadCountResponse {
  unreadCount: number;
}

// 페이징 관련 타입
export interface PaginationParams {
  page?: number
  limit?: number
  search?: string
  category?: string
  sortBy?: 'latest' | 'popular' | 'views'
}

// 좋아요 관련 타입
export interface LikeResponse {
  isLiked: boolean
  likeCount: number
}
