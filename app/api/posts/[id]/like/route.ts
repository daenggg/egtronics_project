//게시글 좋아요 API

import { NextRequest, NextResponse } from 'next/server'
import { authenticateUser } from '@/lib/auth'
import { posts, postLikes } from '../../route'
import { LikeResponse } from '@/lib/types'

// 게시글 좋아요 API (POST /posts/{id}/like)
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
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
    
    const postId = params.id
    const userId = authResult.userId
    
    // 게시글 찾기
    const post = posts.get(postId)
    if (!post) {
      return NextResponse.json(
        { success: false, message: '게시글을 찾을 수 없습니다.' },
        { status: 404 }
      )
    }
    
    // 좋아요 상태 확인
    const likes = postLikes.get(postId) || new Set()
    const isAlreadyLiked = likes.has(userId)
    
    if (isAlreadyLiked) {
      return NextResponse.json(
        { success: false, message: '이미 좋아요를 눌렀습니다.' },
        { status: 400 }
      )
    }
    
    // 좋아요 추가
    likes.add(userId)
    postLikes.set(postId, likes)
    
    // 게시글 좋아요 수 업데이트
    post.likeCount += 1
    posts.set(postId, post)
    
    const response: LikeResponse = {
      isLiked: true,
      likeCount: post.likeCount
    }
    
    return NextResponse.json({
      success: true,
      message: '좋아요가 추가되었습니다.',
      data: response
    })
  } catch (error) {
    console.error('게시글 좋아요 오류:', error)
    return NextResponse.json(
      { success: false, message: '서버 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}

// 게시글 좋아요 취소 API (DELETE /posts/{id}/like)
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
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
    
    const postId = params.id
    const userId = authResult.userId
    
    // 게시글 찾기
    const post = posts.get(postId)
    if (!post) {
      return NextResponse.json(
        { success: false, message: '게시글을 찾을 수 없습니다.' },
        { status: 404 }
      )
    }
    
    // 좋아요 상태 확인
    const likes = postLikes.get(postId) || new Set()
    const isLiked = likes.has(userId)
    
    if (!isLiked) {
      return NextResponse.json(
        { success: false, message: '좋아요를 누르지 않았습니다.' },
        { status: 400 }
      )
    }
    
    // 좋아요 제거
    likes.delete(userId)
    postLikes.set(postId, likes)
    
    // 게시글 좋아요 수 업데이트
    post.likeCount = Math.max(0, post.likeCount - 1)
    posts.set(postId, post)
    
    const response: LikeResponse = {
      isLiked: false,
      likeCount: post.likeCount
    }
    
    return NextResponse.json({
      success: true,
      message: '좋아요가 취소되었습니다.',
      data: response
    })
  } catch (error) {
    console.error('게시글 좋아요 취소 오류:', error)
    return NextResponse.json(
      { success: false, message: '서버 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}
