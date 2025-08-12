//게시글 메인 API

import { NextRequest, NextResponse } from 'next/server'
import { generateUserId, users, authenticateUser } from '@/lib/auth'
import { Post, CreatePostRequest, PostListResponse, PaginationParams } from '@/lib/types'

// 인메모리 게시글 저장소 (실제로는 데이터베이스 사용)
export const posts: Map<string, Post> = new Map()
export const postLikes: Map<string, Set<string>> = new Map() // postId -> userId Set
export const postScraps: Map<string, Set<string>> = new Map() // postId -> userId Set

// 게시글 목록 조회 API (GET /posts)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    
    // 페이징 및 필터링 파라미터
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const search = searchParams.get('search') || ''
    const category = searchParams.get('category') || ''
    const sortBy = searchParams.get('sortBy') || 'latest'
    
    // 현재 로그인한 사용자 확인 (좋아요, 스크랩 상태 확인용)
    const authResult = await authenticateUser(request)
    const currentUserId = authResult?.userId

    // 게시글 필터링
    let filteredPosts = Array.from(posts.values())
    
    // 검색 필터
    if (search) {
      filteredPosts = filteredPosts.filter(post => 
        post.title.toLowerCase().includes(search.toLowerCase()) ||
        post.content.toLowerCase().includes(search.toLowerCase())
      )
    }
    
    // 카테고리 필터
    if (category) {
      filteredPosts = filteredPosts.filter(post => post.category === category)
    }
    
    // 정렬
    switch (sortBy) {
      case 'popular':
        filteredPosts.sort((a, b) => b.likeCount - a.likeCount)
        break
      case 'views':
        filteredPosts.sort((a, b) => b.viewCount - a.viewCount)
        break
      case 'latest':
      default:
        filteredPosts.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        break
    }
    
    // 페이징
    const totalCount = filteredPosts.length
    const totalPages = Math.ceil(totalCount / limit)
    const startIndex = (page - 1) * limit
    const endIndex = startIndex + limit
    const paginatedPosts = filteredPosts.slice(startIndex, endIndex)
    
    // 좋아요, 스크랩 상태 추가
    const postsWithStatus = paginatedPosts.map(post => ({
      ...post,
      isLiked: currentUserId ? postLikes.get(post.id)?.has(currentUserId) || false : false,
      isScrapped: currentUserId ? postScraps.get(post.id)?.has(currentUserId) || false : false
    }))
    
    const response: PostListResponse = {
      posts: postsWithStatus,
      totalCount,
      currentPage: page,
      totalPages,
      hasNext: page < totalPages,
      hasPrev: page > 1
    }
    
    return NextResponse.json({
      success: true,
      message: '게시글 목록 조회 성공',
      data: response
    })
  } catch (error) {
    console.error('게시글 목록 조회 오류:', error)
    return NextResponse.json(
      { success: false, message: '서버 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}

// 게시글 작성 API (POST /posts)
export async function POST(request: NextRequest) {
  try {
    // 인증 확인
    const authResult = await authenticateUser(request)
    if (!authResult) {
      return NextResponse.json(
        { success: false, message: '로그인이 필요합니다.' },
        { status: 401 }
      )
    }
    
    const body: CreatePostRequest = await request.json()
    const { title, content, category, images } = body
    
    // 필수 필드 검증
    if (!title || !content) {
      return NextResponse.json(
        { success: false, message: '제목과 내용은 필수입니다.' },
        { status: 400 }
      )
    }
    
    // 제목 길이 검증
    if (title.length > 100) {
      return NextResponse.json(
        { success: false, message: '제목은 100자 이하여야 합니다.' },
        { status: 400 }
      )
    }
    
    // 내용 길이 검증
    if (content.length > 10000) {
      return NextResponse.json(
        { success: false, message: '내용은 10,000자 이하여야 합니다.' },
        { status: 400 }
      )
    }
    
    // 작성자 정보 가져오기
    const author = users.get(authResult.userId)
    if (!author) {
      return NextResponse.json(
        { success: false, message: '사용자 정보를 찾을 수 없습니다.' },
        { status: 404 }
      )
    }
    
    // 새 게시글 생성
    const newPost: Post = {
      id: generateUserId(),
      title,
      content,
      authorId: authResult.userId,
      authorName: author.name,
      authorAvatar: author.avatar,
      images: images || [],
      category: category || '일반',
      viewCount: 0,
      likeCount: 0,
      commentCount: 0,
      isLiked: false,
      isScrapped: false,
      createdAt: new Date(),
      updatedAt: new Date()
    }
    
    // 게시글 저장
    posts.set(newPost.id, newPost)
    
    // 좋아요, 스크랩 초기화
    postLikes.set(newPost.id, new Set())
    postScraps.set(newPost.id, new Set())
    
    return NextResponse.json({
      success: true,
      message: '게시글이 작성되었습니다.',
      data: newPost
    }, { status: 201 })
  } catch (error) {
    console.error('게시글 작성 오류:', error)
    return NextResponse.json(
      { success: false, message: '서버 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}


