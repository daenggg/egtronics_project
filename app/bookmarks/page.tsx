"use client"

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useAuth } from '@/contexts/auth-context'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Heart, MessageCircle, Eye, Bookmark } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { ko } from 'date-fns/locale'
import { categories } from '@/components/category-filter'

interface BookmarkedPost {
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

  bookmarkedAt: Date
}

export default function BookmarksPage() {
  const { user } = useAuth()
  const [bookmarkedPosts, setBookmarkedPosts] = useState<BookmarkedPost[]>([])

  useEffect(() => {
    if (!user) return

    // TODO: 실제 API 호출로 스크랩된 게시글 데이터 받아오기
    setBookmarkedPosts([]) // 현재는 빈 배열로 초기화
  }, [user])

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <Card className="max-w-md mx-auto">
          <CardContent className="pt-6">
            <Bookmark className="h-16 w-16 mx-auto text-gray-400 mb-4" />
            <h2 className="text-xl font-semibold mb-2">로그인이 필요합니다</h2>
            <p className="text-gray-600 mb-4">스크랩한 게시글을 보려면 로그인해주세요.</p>
            <Link href="/login" className="text-blue-600 hover:underline">
              로그인하기
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  const getCategoryInfo = (categoryId: string) => {
    return categories.find(cat => cat.id === categoryId) || categories[0]
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-yellow-600 to-orange-600 bg-clip-text text-transparent mb-2 flex items-center gap-3">
          <Bookmark className="h-8 w-8 text-yellow-500" />
          내 스크랩
        </h1>
        <p className="text-gray-600">관심있는 게시글들을 모아보세요</p>
      </div>

      {bookmarkedPosts.length === 0 ? (
        <Card className="text-center py-12">
          <CardContent>
            <Bookmark className="h-16 w-16 mx-auto text-gray-400 mb-4" />
            <h2 className="text-xl font-semibold mb-2">스크랩한 게시글이 없습니다</h2>
            <p className="text-gray-600 mb-4">관심있는 게시글을 스크랩해보세요!</p>
            <Link href="/" className="text-blue-600 hover:underline">
              게시글 둘러보기
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {bookmarkedPosts.map((post, index) => (
            <Card 
              key={post.id} 
              className="card-hover animate-fade-in glass-effect border-0 shadow-lg"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between mb-3">
                  <Badge 
                    className={`${getCategoryInfo(post.category).color} border-0 font-medium`}
                  >
                    <span className="mr-1">{getCategoryInfo(post.category).icon}</span>
                    {getCategoryInfo(post.category).name}
                  </Badge>
                  <div className="flex items-center space-x-3">
                    <div className="flex items-center space-x-1 text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                      <Eye className="h-3 w-3" />
                      <span>{post.views}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Avatar className="h-10 w-10 ring-2 ring-blue-100">
                      <AvatarImage src={post.author.avatar || "/placeholder.svg"} alt={post.author.name} />
                      <AvatarFallback className="bg-gradient-to-r from-blue-500 to-purple-500 text-white text-sm">
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
                </div>
                <Link href={`/posts/${post.id}`}>
                  <CardTitle className="hover:text-blue-600 transition-colors cursor-pointer text-xl font-bold text-gray-900 mt-3">
                    {post.title}
                  </CardTitle>
                </Link>
              </CardHeader>
              <CardContent className="pt-0">
                <p className="text-gray-600 mb-4 line-clamp-2 leading-relaxed">
                  {post.content}
                </p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4 text-sm text-gray-500">
                    <div className="flex items-center space-x-1 hover:text-red-500 transition-colors">
                      <Heart className="h-4 w-4" />
                      <span>{post.likes}</span>
                    </div>
                    <div className="flex items-center space-x-1 hover:text-blue-500 transition-colors">
                      <MessageCircle className="h-4 w-4" />
                      <span>{post.comments}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
