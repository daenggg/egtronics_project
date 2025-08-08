"use client"

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Heart, MessageCircle, Eye, Bookmark } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { ko } from 'date-fns/locale'
import { ReportDialog } from '@/components/report-dialog'
import { categories} from '@/components/category-filter'
import { Button } from '@/components/ui/button'
import { useToast } from '@/hooks/use-toast'
import { useAuth } from '@/contexts/auth-context'

interface Post {
  id: string
  title: string
  content: string
  category: string
  media?: Array<{
    id: string
    type: 'image' | 'video'
    url: string
    thumbnail?: string
  }>
  isBookmarked?: boolean
  author: {
    id: string
    name: string
    avatar?: string
  }
  createdAt: Date
  likes: number
  comments: number
  views: number
  tags: string[]
}


export function PostList() {
  const [posts, setPosts] = useState<Post[]>([])
  const { toast } = useToast()
  const { user } = useAuth()

  useEffect(() => {
    // 목업 데이터 - 다양한 통계를 가진 게시물들
    const mockPosts: Post[] = [
      {
        id: '1',
        title: '첫 번째 게시글입니다',
        content: '안녕하세요! 이것은 첫 번째 게시글의 내용입니다. 여러분의 의견을 듣고 싶습니다.',
        category: 'general',
        media: [
          {
            id: '1',
            type: 'image',
            url: '/beautiful-landscape.png',
            thumbnail: '/beautiful-landscape.png'
          }
        ],
        isBookmarked: false,
        author: {
          id: '1',
          name: '김철수',
          avatar: '/placeholder.svg?height=40&width=40'
        },
        createdAt: new Date(Date.now() - 1000 * 60 * 30), // 30분 전
        likes: 12,
        comments: 5,
        views: 45,
        tags: ['일반', '인사']
      },
      {
        id: '2',
        title: 'React  공유',
        content: 'React 개발을 하면서 유용한 팁들을 공유하고 싶습니다. 특히 성능 최적화에 대해서...',
        category: 'tech',
        media: [
          {
            id: '2',
            type: 'image',
            url: '/react-logo-abstract.png',
            thumbnail: '/react-logo-abstract.png'
          }
        ],
        isBookmarked: false,
        author: {
          id: '2',
          name: '이영희',
          avatar: '/placeholder.svg?height=40&width=40'
        },
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2시간 전
        likes: 89, // 높은 좋아요 수
        comments: 12,
        views: 456, // 높은 조회수
        tags: ['개발', 'React', '팁']
      },
      {
        id: '3',
        title: '주말 스터디 모임 제안',
        content: '이번 주말에 스터디 모임을 가져보면 어떨까요? 관심 있으신 분들은 댓글로 의견 남겨주세요.',
        category: 'study',
        media: [
          {
            id: '3',
            type: 'image',
            url: '/focused-study-session.png',
            thumbnail: '/focused-study-session.png'
          }
        ],
        isBookmarked: false,
        author: {
          id: '3',
          name: '박민수',
          avatar: '/placeholder.svg?height=40&width=40'
        },
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 5), // 5시간 전
        likes: 8,
        comments: 3,
        views: 67,
        tags: ['모임', '스터디']
      },
      {
        id: '4',
        title: '프론트엔드 개발자 취업 후기',
        content: '최근에 프론트엔드 개발자로 취업에 성공했습니다. 취업 준비 과정과 면접 경험을 공유드립니다.',
        category: 'career',
        media: [
          {
            id: '4',
            type: 'image',
            url: '/career-path.png',
            thumbnail: '/career-path.png'
          }
        ],
        isBookmarked: false,
        author: {
          id: '4',
          name: '정수진',
          avatar: '/placeholder.svg?height=40&width=40'
        },
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 8), // 8시간 전
        likes: 67, // 높은 좋아요 수
        comments: 18,
        views: 789, // 가장 높은 조회수
        tags: ['취업', '면접', '경험담']
      },
    ]
    setPosts(mockPosts)
  }, [])

  const getCategoryInfo = (categoryId: string) => {
    return categories.find(cat => cat.id === categoryId) || categories[0]
  }


  const handleBookmark = (postId: string) => {
    if (!user) {
      toast({
        title: "로그인 필요",
        description: "스크랩하려면 로그인해주세요.",
        variant: "destructive",
      })
      return
    }

    setPosts(prev => prev.map(post =>
      post.id === postId ? {
        ...post,
        isBookmarked: !post.isBookmarked
      } : post
    ))

    const post = posts.find(p => p.id === postId)
    toast({
      title: post?.isBookmarked ? "스크랩 해제" : "스크랩 완료",
      description: post?.isBookmarked ? "스크랩이 해제되었습니다." : "스크랩되었습니다.",
    })
  }



  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
      {posts.map((post, index) => (
        <Card
          key={post.id}
          className="group relative overflow-hidden bg-white/90 backdrop-blur-sm border border-gray-200/50 shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1 rounded-2xl h-fit"
          style={{ animationDelay: `${index * 0.1}s` }}
        >
          {/* 상단 작성자 정보 */}
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Avatar className="h-8 w-8 ring-2 ring-white shadow-sm">
                  <AvatarImage src={post.author.avatar || "/placeholder.svg"} alt={post.author.name} />
                  <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-500 text-white font-bold text-xs">
                    {post.author.name.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-sm font-semibold text-gray-900">{post.author.name}</p>
                  <p className="text-xs text-gray-500">
                    {formatDistanceToNow(post.createdAt, { addSuffix: true, locale: ko })}
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <div className="flex items-center space-x-1 text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                  <Eye className="h-3 w-3" />
                  <span>{post.views}</span>
                </div>
                <ReportDialog type="post" targetId={post.id}>
                  <Button variant="ghost" size="sm" className="p-1 h-6 w-6 rounded-full text-gray-400 hover:text-red-500">
                    <span className="text-xs">⚠️</span>
                  </Button>
                </ReportDialog>
              </div>
            </div>
          </CardHeader>

          {/* 이미지/콘텐츠 영역 - 패딩으로 작게 */}
          <div className="px-3 pb-3">
            <div className="relative">
              {post.media && post.media.length > 0 ? (
                <div className="relative aspect-[4/3] bg-gradient-to-br from-gray-100 to-gray-200 overflow-hidden rounded-xl">
                  <img
                    src={post.media[0].url || "/placeholder.svg"}
                    alt="Post media"
                    className="w-full h-full object-cover group-hover:scale-105 transition-all duration-500"
                  />
                  {post.media.length > 1 && (
                    <div className="absolute top-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded-full backdrop-blur-sm font-medium">
                      +{post.media.length - 1}
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl"></div>
                </div>
              ) : (
                <div className="aspect-[4/3] bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 flex items-center justify-center rounded-xl">
                  <div className="text-center p-4">
                    <div className="text-3xl mb-2">{getCategoryInfo(post.category).icon}</div>
                    <p className="text-gray-600 text-sm font-medium line-clamp-3">
                      {post.content}
                    </p>
                  </div>
                </div>
              )}
              
              {/* 카테고리 배지 */}
              <div className="absolute top-2 left-2">
                <Badge className={`${getCategoryInfo(post.category).color} border-0 font-semibold px-2 py-1 rounded-full shadow-sm text-xs`}>
                  <span className="mr-1">{getCategoryInfo(post.category).icon}</span>
                  {getCategoryInfo(post.category).name}
                </Badge>
              </div>
            </div>
          </div>

          {/* 하단 정보 영역 */}
          <CardContent className="px-4 pb-4 pt-0 bg-gray-50/50">
            <div className="space-y-3">
              {/* 제목 */}
              <Link href={`/posts/${post.id}`}>
                <CardTitle className="text-base font-bold text-gray-900 hover:text-blue-600 transition-colors cursor-pointer line-clamp-2 leading-tight">
                  {post.title}
                </CardTitle>
              </Link>

              {/* 태그 */}
              <div className="flex flex-wrap gap-1">
                {post.tags.slice(0, 2).map((tag) => (
                  <Badge
                    key={tag}
                    variant="secondary"
                    className="text-xs bg-blue-50 text-blue-600 border-0 px-2 py-0.5 rounded-full"
                  >
                    #{tag}
                  </Badge>
                ))}
                {post.tags.length > 2 && (
                  <Badge variant="secondary" className="text-xs bg-gray-100 text-gray-500 border-0 px-2 py-0.5 rounded-full">
                    +{post.tags.length - 2}
                  </Badge>
                )}
              </div>

              {/* 액션 버튼들 */}
              <div className="flex items-center justify-between pt-2 border-t border-gray-200/50">
                <div className="flex items-center space-x-3">
                  <div className="flex items-center space-x-1 text-sm text-gray-600 hover:text-blue-500 transition-colors cursor-pointer">
                    <MessageCircle className="h-4 w-4" />
                    <span>{post.comments}</span>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleBookmark(post.id)}
                  className={`p-1 h-8 w-8 rounded-full transition-colors ${
                    post.isBookmarked 
                      ? 'text-yellow-500 hover:text-yellow-600' 
                      : 'text-gray-400 hover:text-yellow-500'
                  }`}
                >
                  <Bookmark className={`h-4 w-4 ${post.isBookmarked ? 'fill-current' : ''}`} />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
