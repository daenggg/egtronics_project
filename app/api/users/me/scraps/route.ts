//내 스크랩 목록 조회 API

import { NextRequest, NextResponse } from 'next/server'
import { authenticateUser } from '@/lib/auth'
import { ScrapListResponse } from '@/lib/types'
import { scraps } from '../../../posts/[postId]/scrap/route'

// 내 스크랩 목록 조회 API (GET /users/me/scraps)
export async function GET(request: NextRequest) {
  try {
    // 인증 확인
    const authResult = await authenticateUser(request)
    if (!authResult) {
      return NextResponse.json(
        { success: false, message: '로그인이 필요합니다.' },
        { status: 401 }
      )
    }
    
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    
    const userId = authResult.userId
    
    // 사용자의 스크랩 목록 필터링
    const userScraps = Array.from(scraps.values())
      .filter(scrap => scrap.userId === userId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    
    // 페이징
    const totalCount = userScraps.length
    const totalPages = Math.ceil(totalCount / limit)
    const startIndex = (page - 1) * limit
    const endIndex = startIndex + limit
    const paginatedScraps = userScraps.slice(startIndex, endIndex)
    
    const response: ScrapListResponse = {
      scraps: paginatedScraps,
      totalCount,
      currentPage: page,
      totalPages,
    }
    
    return NextResponse.json({
      success: true,
      message: '스크랩 목록 조회 성공',
      data: response
    })
  } catch (error) {
    console.error('스크랩 목록 조회 오류:', error)
    return NextResponse.json(
      { success: false, message: '서버 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}
