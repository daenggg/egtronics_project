import { NextResponse } from 'next/server'

type Media = {
  id: string
  type: 'image' | 'video'
  url: string
  thumbnail?: string
}

type Author = {
  id: string
  name: string
  avatar?: string
}

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
  comments: number
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
        '안녕하세요! 이것은 첫 번째 게시글의 내용입니다. 여러분의 의견을 듣고 싶습니다.',
      category: 'general',
      media: [
        {
          id: '1',
          type: 'image',
          url: '/beautiful-landscape.png',
          thumbnail: '/beautiful-landscape.png',
        },
      ],
      isBookmarked: false,
      author: { id: '1', name: '김철수', avatar: '/placeholder.svg?height=40&width=40' },
      createdAt: new Date(now - 1000 * 60 * 30).toISOString(),
      likes: 12,
      comments: 5,
      views: 45,
      tags: ['일반', '인사'],
    },
    {
      id: '2',
      title: 'React 개발 팁 공유',
      content:
        'React 개발을 하면서 유용한 팁들을 공유하고 싶습니다. 특히 성능 최적화에 대해서...',
      category: 'tech',
      media: [
        { id: '2', type: 'image', url: '/react-logo-abstract.png', thumbnail: '/react-logo-abstract.png' },
      ],
      isBookmarked: false,
      author: { id: '2', name: '이영희', avatar: '/placeholder.svg?height=40&width=40' },
      createdAt: new Date(now - 1000 * 60 * 60 * 2).toISOString(),
      likes: 89,
      comments: 12,
      views: 456,
      tags: ['개발', 'React', '팁'],
    },
    {
      id: '3',
      title: '주말 스터디 모임 제안',
      content:
        '이번 주말에 스터디 모임을 가져보면 어떨까요? 관심 있으신 분들은 댓글로 의견 남겨주세요.',
      category: 'study',
      media: [
        { id: '3', type: 'image', url: '/focused-study-session.png', thumbnail: '/focused-study-session.png' },
      ],
      isBookmarked: false,
      author: { id: '3', name: '박민수', avatar: '/placeholder.svg?height=40&width=40' },
      createdAt: new Date(now - 1000 * 60 * 60 * 5).toISOString(),
      likes: 8,
      comments: 3,
      views: 67,
      tags: ['모임', '스터디'],
    },
    {
      id: '4',
      title: '프론트엔드 개발자 취업 후기',
      content:
        '최근에 프론트엔드 개발자로 취업에 성공했습니다. 취업 준비 과정과 면접 경험을 공유드립니다.',
      category: 'career',
      media: [
        { id: '4', type: 'image', url: '/career-path.png', thumbnail: '/career-path.png' },
      ],
      isBookmarked: false,
      author: { id: '4', name: '정수진', avatar: '/placeholder.svg?height=40&width=40' },
      createdAt: new Date(now - 1000 * 60 * 60 * 8).toISOString(),
      likes: 67,
      comments: 18,
      views: 789,
      tags: ['취업', '면접', '경험담'],
    },
    {
      id: '5',
      title: '새로운 프로젝트 아이디어 공유',
      content:
        '웹 개발 프로젝트 아이디어를 공유합니다. 함께 개발해보고 싶은 분들이 있으시면 연락주세요!',
      category: 'project',
      media: [
        { id: '5', type: 'image', url: '/serene-forest-stream.png', thumbnail: '/serene-forest-stream.png' },
      ],
      isBookmarked: false,
      author: { id: '5', name: '최지원', avatar: '/placeholder.svg?height=40&width=40' },
      createdAt: new Date(now - 1000 * 60 * 60 * 12).toISOString(),
      likes: 34,
      comments: 7,
      views: 234,
      tags: ['프로젝트', '아이디어', '협업'],
    },
    {
      id: '6',
      title: 'TypeScript 학습 자료 모음',
      content:
        'TypeScript를 배우면서 정리한 자료들을 공유합니다. 초보자도 쉽게 따라할 수 있도록 정리했습니다.',
      category: 'qna',
      media: [
        { id: '6', type: 'image', url: '/typescript-logo.png', thumbnail: '/typescript-logo.png' },
      ],
      isBookmarked: false,
      author: { id: '6', name: '김민지', avatar: '/placeholder.svg?height=40&width=40' },
      createdAt: new Date(now - 1000 * 60 * 60 * 24).toISOString(),
      likes: 156,
      comments: 23,
      views: 892,
      tags: ['TypeScript', '학습', '자료'],
    },
  ]
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const category = searchParams.get('category')
  const posts = getMockPosts()

  const filtered = !category || category === 'all'
    ? posts
    : posts.filter((p) => p.category === category)

  return NextResponse.json(filtered)
}


