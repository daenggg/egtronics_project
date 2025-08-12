//댓글 수정 및 삭제 API

import { NextRequest, NextResponse } from 'next/server'
import { authenticateUser } from '@/lib/auth'
import { Comment, UpdateCommentRequest } from '@/lib/types'
import { comments } from '@/lib/comments-data'

// 댓글 수정 API (PUT /posts/{postId}/comments/{commentId})
export async function PUT(
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
    const body: UpdateCommentRequest = await request.json()
    const { content } = body
    
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
    
    // 작성자 확인
    if (comment.authorId !== authResult.userId) {
      return NextResponse.json(
        { success: false, message: '댓글을 수정할 권한이 없습니다.' },
        { status: 403 }
      )
    }
    
    // 필수 필드 검증
    if (!content || content.trim() === '') {
      return NextResponse.json(
        { success: false, message: '댓글 내용은 필수입니다.' },
        { status: 400 }
      )
    }
    
    // 댓글 길이 검증
    if (content.length > 1000) {
      return NextResponse.json(
        { success: false, message: '댓글은 1,000자 이하여야 합니다.' },
        { status: 400 }
      )
    }
    
    // 댓글 업데이트
    const updatedComment: Comment = {
      ...comment,
      content: content.trim(),
      updatedAt: new Date()
    }
    
    comments.set(commentId, updatedComment)
    
    return NextResponse.json({
      success: true,
      message: '댓글이 수정되었습니다.',
      data: updatedComment
    })
  } catch (error) {
    console.error('댓글 수정 오류:', error)
    return NextResponse.json(
      { success: false, message: '서버 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}

// 댓글 삭제 API (DELETE /posts/{postId}/comments/{commentId})
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
    
    // 작성자 확인
    if (comment.authorId !== authResult.userId) {
      return NextResponse.json(
        { success: false, message: '댓글을 삭제할 권한이 없습니다.' },
        { status: 403 }
      )
    }
    
    // 댓글 삭제
    comments.delete(commentId)
    
    return NextResponse.json({
      success: true,
      message: '댓글이 삭제되었습니다.'
    })
  } catch (error) {
    console.error('댓글 삭제 오류:', error)
    return NextResponse.json(
      { success: false, message: '서버 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}
