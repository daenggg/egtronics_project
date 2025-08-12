//댓글 좋아요 API

import { NextRequest, NextResponse } from 'next/server'
import { authenticateUser } from '@/lib/auth'
import { comments, commentLikes } from '@/lib/comments-data'
import { LikeResponse } from '@/lib/types'

// 댓글 좋아요 API (POST /posts/{postId}/comments/{commentId}/likes)
export async function POST(
  request: NextRequest,
  { params }: { params: { postId: string; commentId: string } }
) {
  try {
    // 인증 확인
    const authResult = await authenticateUser(request)
    if (!authResult) {
      return NextResponse.json(
        { success: false, message: '로그인이 필요합니다.' },
        { status: 401 }
      )
    }
    
    const { postId, commentId } = params
    const userId = authResult.userId
    
    // 댓글 찾기
    const comment = comments.get(commentId)
    if (!comment) {
      return NextResponse.json(
        { success: false, message: '댓글을 찾을 수 없습니다.' },
        { status: 404 }
      )
    }
    
    // 게시글 ID 확인
    if (comment.postId !== postId) {
      return NextResponse.json(
        { success: false, message: '잘못된 게시글입니다.' },
        { status: 400 }
      )
    }
    
    // 좋아요 상태 확인
    const likes = commentLikes.get(commentId) || new Set()
    const isAlreadyLiked = likes.has(userId)
    
    if (isAlreadyLiked) {
      return NextResponse.json(
        { success: false, message: '이미 좋아요를 눌렀습니다.' },
        { status: 400 }
      )
    }
    
    // 좋아요 추가
    likes.add(userId)
    commentLikes.set(commentId, likes)
    
    // 댓글 좋아요 수 업데이트
    comment.likeCount += 1
    comments.set(commentId, comment)
    
    const response: LikeResponse = {
      isLiked: true,
      likeCount: comment.likeCount
    }
    
    return NextResponse.json({
      success: true,
      message: '댓글 좋아요가 추가되었습니다.',
      data: response
    })
  } catch (error) {
    console.error('댓글 좋아요 오류:', error)
    return NextResponse.json(
      { success: false, message: '서버 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}

// 댓글 좋아요 취소 API (DELETE /posts/{postId}/comments/{commentId}/likes)
export async function DELETE(
  request: NextRequest,
  { params }: { params: { postId: string; commentId: string } }
) {
  try {
    // 인증 확인
    const authResult = await authenticateUser(request)
    if (!authResult) {
      return NextResponse.json(
        { success: false, message: '로그인이 필요합니다.' },
        { status: 401 }
      )
    }
    
    const { postId, commentId } = params
    const userId = authResult.userId
    
    // 댓글 찾기
    const comment = comments.get(commentId)
    if (!comment) {
      return NextResponse.json(
        { success: false, message: '댓글을 찾을 수 없습니다.' },
        { status: 404 }
      )
    }
    
    // 게시글 ID 확인
    if (comment.postId !== postId) {
      return NextResponse.json(
        { success: false, message: '잘못된 게시글입니다.' },
        { status: 400 }
      )
    }
    
    // 좋아요 상태 확인
    const likes = commentLikes.get(commentId) || new Set()
    const isLiked = likes.has(userId)
    
    if (!isLiked) {
      return NextResponse.json(
        { success: false, message: '좋아요를 누르지 않았습니다.' },
        { status: 400 }
      )
    }
    
    // 좋아요 제거
    likes.delete(userId)
    commentLikes.set(commentId, likes)
    
    // 댓글 좋아요 수 업데이트
    comment.likeCount = Math.max(0, comment.likeCount - 1)
    comments.set(commentId, comment)
    
    const response: LikeResponse = {
      isLiked: false,
      likeCount: comment.likeCount
    }
    
    return NextResponse.json({
      success: true,
      message: '댓글 좋아요가 취소되었습니다.',
      data: response
    })
  } catch (error) {
    console.error('댓글 좋아요 취소 오류:', error)
    return NextResponse.json(
      { success: false, message: '서버 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}
