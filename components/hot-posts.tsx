"use client"

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Heart, MessageCircle, Eye, TrendingUp } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { ko } from 'date-fns/locale'
import { categories } from '@/components/category-filter'

interface HotPost {
  id: string
  title: string
  content: string
  category: string
  author: {
    id: string
    name: string
    avatar?: string
  }
  createdAt: Date
  likes: number
  comments: number
  views: number
}

export function HotPosts() {
  const [hotPosts, setHotPosts] = useState<HotPost[]>([])

  useEffect(() => {
    // 좋아요 수가 많은 상위 3개 게시물 목업 데이터
    const mockHotPosts: HotPost[] = [
      {
        id: '1',
        title: '2024년 프론트엔드 개발 트렌드 총정리',
        content: '올해 프론트엔드 개발에서 주목해야 할 기술들과 트렌드를 정리해봤습니다...',
        category: 'tech',
        author: {
          id: '1',
          name: '김개발',
          avatar: '/placeholder.svg?height=32&width=32'
        },
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 6),
        likes: 89,
        comments: 24,
        views: 456
      },
      {
        id: '2',
        title: '신입 개발자 면접 합격 후기 (네카라쿠배)',
        content: '6개월간의 취업 준비 끝에 드디어 합격했습니다! 면접 경험을 공유드려요...',
        category: 'career',
        author: {
          id: '2',
          name: '박취업',
          avatar: '/placeholder.svg?height=32&width=32'
        },
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 12),
        likes: 67,
        comments: 31,
        views: 789
      },
      {
        id: '3',
        title: '무료로 배울 수 있는 최고의 프로그래밍 강의 모음',
        content: '돈 안들이고도 충분히 실력을 늘릴 수 있는 강의들을 모아봤습니다...',
        category: 'study',
        author: {
          id: '3',
          name: '이공유',
          avatar: '/placeholder.svg?height=32&width=32'
        },
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 18),
        likes: 54,
        comments: 18,
        views: 623
      }
    ]
    setHotPosts(mockHotPosts)
  }, [])

  const getCategoryInfo = (categoryId: string) => {
    return categories.find(cat => cat.id === categoryId) || categories[0]
  }

  return (
    <Card className="glass-effect border-0 shadow-lg mb-8">
      <CardHeader>
        <CardTitle className="text-xl font-bold text-gray-900 flex items-center gap-2">
          <TrendingUp className="h-6 w-6 text-red-500" />
          🔥 HOT 게시물
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {hotPosts.map((post, index) => (
            <div key={post.id} className="flex items-start space-x-4 p-4 rounded-lg bg-gradient-to-r from-red-50 to-orange-50 hover:from-red-100 hover:to-orange-100 transition-all">
              <div className="flex-shrink-0">
                <Badge className="bg-gradient-to-r from-red-500 to-orange-500 text-white font-bold text-lg px-3 py-1">
                  #{index + 1}
                </Badge>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-2">
                  <Badge className={`${getCategoryInfo(post.category).color} border-0 text-xs`}>
                    <span className="mr-1">{getCategoryInfo(post.category).icon}</span>
                    {getCategoryInfo(post.category).name}
                  </Badge>
                  <div className="flex items-center space-x-1 text-xs text-gray-500">
                    <Avatar className="h-5 w-5">
                      <AvatarImage src={post.author.avatar || "/placeholder.svg"} alt={post.author.name} />
                      <AvatarFallback className="text-xs bg-gradient-to-r from-blue-400 to-purple-400 text-white">
                        {post.author.name.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <span>{post.author.name}</span>
                  </div>
                </div>
                <Link href={`/posts/${post.id}`}>
                  <h3 className="font-semibold text-gray-900 hover:text-red-600 transition-colors cursor-pointer line-clamp-1 mb-1">
                    {post.title}
                  </h3>
                </Link>
                <p className="text-sm text-gray-600 line-clamp-2 mb-3">
                  {post.content}
                </p>
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <div className="flex items-center space-x-3">
                    <div className="flex items-center space-x-1 text-red-500 font-medium">
                      <Heart className="h-3 w-3 fill-current" />
                      <span>{post.likes}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <MessageCircle className="h-3 w-3" />
                      <span>{post.comments}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Eye className="h-3 w-3" />
                      <span>{post.views}</span>
                    </div>
                  </div>
                  <span>{formatDistanceToNow(post.createdAt, { addSuffix: true, locale: ko })}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
