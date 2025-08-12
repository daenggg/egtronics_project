//게시글 스크랩 API

import { NextRequest, NextResponse } from 'next/server'
import { authenticateUser, generateUserId } from '@/lib/auth'
import { posts, postScraps } from '../../route'
import { Scrap } from '@/lib/types'

// 인메모리 스크랩 저장소
export const scraps: Map<string, Scrap> = new Map()

// 게시글 스크랩 API (POST /posts/{postId}/scrap)
export async function POST(
  request: NextRequest,
  { params }: { params: { postId: string } }
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
    
    const postId = params.postId
    const userId = authResult.userId
    
    // 게시글 찾기
    const post = posts.get(postId)
    if (!post) {
      return NextResponse.json(
        { success: false, message: '게시글을 찾을 수 없습니다.' },
        { status: 404 }
      )
    }
    
    // 이미 스크랩했는지 확인
    const userScraps = Array.from(scraps.values()).filter(scrap => scrap.userId === userId)
    const isAlreadyScrapped = userScraps.some(scrap => scrap.postId === postId)
    
    if (isAlreadyScrapped) {
      return NextResponse.json(
        { success: false, message: '이미 스크랩한 게시글입니다.' },
        { status: 400 }
      )
    }
    
    // 스크랩 생성
    const newScrap: Scrap = {
      id: generateUserId(),
      postId,
      userId,
      createdAt: new Date(),
      post
    }
    
    scraps.set(newScrap.id, newScrap)
    
    // 스크랩 상태 업데이트 (게시글 목록에서 사용)
    const scrapsSet = postScraps.get(postId) || new Set()
    scrapsSet.add(userId)
    postScraps.set(postId, scrapsSet)
    
    return NextResponse.json({
      success: true,
      message: '게시글이 스크랩되었습니다.',
      data: newScrap
    }, { status: 201 })
  } catch (error) {
    console.error('게시글 스크랩 오류:', error)
    return NextResponse.json(
      { success: false, message: '서버 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}

// 게시글 스크랩 취소 API (DELETE /posts/{postId}/scrap)
export async function DELETE(
  request: NextRequest,
  { params }: { params: { postId: string } }
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
    
    const postId = params.postId
    const userId = authResult.userId
    
    // 게시글 찾기
    const post = posts.get(postId)
    if (!post) {
      return NextResponse.json(
        { success: false, message: '게시글을 찾을 수 없습니다.' },
        { status: 404 }
      )
    }
    
    // 스크랩 찾기
    const userScraps = Array.from(scraps.values()).filter(scrap => scrap.userId === userId)
    const scrap = userScraps.find(scrap => scrap.postId === postId)
    
    if (!scrap) {
      return NextResponse.json(
        { success: false, message: '스크랩하지 않은 게시글입니다.' },
        { status: 400 }
      )
    }
    
    // 스크랩 삭제
    scraps.delete(scrap.id)
    
    // 스크랩 상태 업데이트
    const scrapsSet = postScraps.get(postId) || new Set()
    scrapsSet.delete(userId)
    postScraps.set(postId, scrapsSet)
    
    return NextResponse.json({
      success: true,
      message: '스크랩이 취소되었습니다.'
    })
  } catch (error) {
    console.error('게시글 스크랩 취소 오류:', error)
    return NextResponse.json(
      { success: false, message: '서버 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}
