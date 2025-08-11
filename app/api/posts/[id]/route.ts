import { NextResponse, type NextRequest } from 'next/server'

type Media = { id: string; type: 'image' | 'video'; url: string }
type Author = { id: string; name: string; avatar?: string }
type Post = {
  id: string
  title: string
  content: string
  category: string
  media?: Media[]
  isBookmarked?: boolean
  author: Author
  createdAt: string
  likes: number
  isLiked: boolean
  views: number
  tags: string[]
}

function getMockPosts(): Post[] {
  const now = Date.now()
  return [
    {
      id: '1',
      title: '첫 번째 게시글입니다',
      content:
        '안녕하세요! 이것은 첫 번째 게시글의 상세 내용입니다. 앞으로 더 좋은 콘텐츠로 찾아뵙겠습니다!'.repeat(1),
      category: 'general',
      author: { id: '1', name: '김철수', avatar: '/placeholder.svg?height=40&width=40' },
      createdAt: new Date(now - 1000 * 60 * 30).toISOString(),
      likes: 12,
      isLiked: false,
      views: 45,
      tags: ['일반', '인사'],
      media: [
        { id: '1', type: 'image', url: '/serene-forest-stream.png' },
        { id: '2', type: 'video', url: '/video-thumbnail.png' },
      ],
      isBookmarked: false,
    },
    {
      id: '2',
      title: 'React 개발 팁 공유',
      content: '리액트 성능 최적화와 훅 패턴에 대한 정리입니다.',
      category: 'tech',
      author: { id: '2', name: '이영희', avatar: '/placeholder.svg?height=40&width=40' },
      createdAt: new Date(now - 1000 * 60 * 60 * 2).toISOString(),
      likes: 89,
      isLiked: false,
      views: 456,
      tags: ['개발', 'React', '팁'],
      media: [{ id: '2', type: 'image', url: '/react-logo-abstract.png' }],
      isBookmarked: false,
    },
    {
      id: '3',
      title: '주말 스터디 모임 제안',
      content: '관심 있으신 분들은 댓글 주세요!',
      category: 'study',
      author: { id: '3', name: '박민수', avatar: '/placeholder.svg?height=40&width=40' },
      createdAt: new Date(now - 1000 * 60 * 60 * 5).toISOString(),
      likes: 8,
      isLiked: false,
      views: 67,
      tags: ['모임', '스터디'],
      media: [{ id: '3', type: 'image', url: '/focused-study-session.png' }],
      isBookmarked: false,
    },
    {
      id: '4',
      title: '프론트엔드 개발자 취업 후기',
      content: '취업 준비 과정과 면접 경험을 공유합니다.',
      category: 'career',
      author: { id: '4', name: '정수진', avatar: '/placeholder.svg?height=40&width=40' },
      createdAt: new Date(now - 1000 * 60 * 60 * 8).toISOString(),
      likes: 67,
      isLiked: false,
      views: 789,
      tags: ['취업', '면접', '경험담'],
      media: [{ id: '4', type: 'image', url: '/career-path.png' }],
      isBookmarked: false,
    },
    {
      id: '5',
      title: '새로운 프로젝트 아이디어 공유',
      content: '함께 개발하실 분?',
      category: 'project',
      author: { id: '5', name: '최지원', avatar: '/placeholder.svg?height=40&width=40' },
      createdAt: new Date(now - 1000 * 60 * 60 * 12).toISOString(),
      likes: 34,
      isLiked: false,
      views: 234,
      tags: ['프로젝트', '아이디어', '협업'],
      media: [{ id: '5', type: 'image', url: '/serene-forest-stream.png' }],
      isBookmarked: false,
    },
    {
      id: '6',
      title: 'TypeScript 학습 자료 모음',
      content: '입문자를 위한 자료 모음입니다.',
      category: 'qna',
      author: { id: '6', name: '김민지', avatar: '/placeholder.svg?height=40&width=40' },
      createdAt: new Date(now - 1000 * 60 * 60 * 24).toISOString(),
      likes: 156,
      isLiked: false,
      views: 892,
      tags: ['TypeScript', '학습', '자료'],
      media: [{ id: '6', type: 'image', url: '/typescript-logo.png' }],
      isBookmarked: false,
    },
  ]
}

export async function GET(_request: NextRequest, { params }: { params: { id: string } }) {
  const post = getMockPosts().find((p) => p.id === params.id)
  if (!post) {
    return NextResponse.json({ message: 'Not found' }, { status: 404 })
  }
  return NextResponse.json(post)
}


