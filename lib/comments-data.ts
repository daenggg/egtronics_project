import { Comment } from './types'

// 인메모리 댓글 저장소
export const comments: Map<string, Comment> = new Map()
export const commentLikes: Map<string, Set<string>> = new Map() // commentId -> userId Set
