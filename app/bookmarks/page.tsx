"use client"

import { useQuery } from '@tanstack/react-query'
import Link from 'next/link' 
import { useAuth } from '@/contexts/auth-context'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Heart, MessageCircle, Eye, Bookmark } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { ko } from 'date-fns/locale'
import { categories } from '@/components/category-filter'
import { getMyScraps, handleApiError } from '@/lib/api-client'
import { Scrap } from '@/lib/types'

// Scrap 타입에 post 정보가 포함되어 있으므로, BookmarkedPost 타입을 대체합니다.
// lib/types.ts에 정의된 Scrap 타입을 사용합니다.

export default function BookmarksPage() {
  const { user } = useAuth()

  const { data: scrapsResponse, isLoading, error, isError } = useQuery({
    queryKey: ['myScraps', user?.id], // 쿼리를 식별하는 고유 키, user.id가 바뀌면 재호출
    queryFn: () => getMyScraps(),     // 데이터를 가져오는 함수
    enabled: !!user,                  // user 객체가 있을 때만 쿼리 실행
  });

  const scraps = scrapsResponse?.scraps || [];

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

  if (isLoading) {
    return <div className="container mx-auto px-4 py-8 text-center">로딩 중...</div>;
  }

  if (isError) {
    return (
      <div className="container mx-auto px-4 py-8 text-center text-red-500">
        오류: {handleApiError(error)}
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-yellow-600 to-orange-600 bg-clip-text text-transparent mb-2 flex items-center gap-3">
          <Bookmark className="h-8 w-8 text-yellow-500" />
          내 스크랩
        </h1>
        <p className="text-gray-600">관심있는 게시글들을 모아보세요</p>
      </div>

      {scraps.length === 0 ? (
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
          {scraps.map(({ post }, index) => (
            <Card 
              key={post.id} 
              className="card-hover animate-fade-in glass-effect border-0 shadow-lg"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between mb-3">
                  {post.category && (
                    <Badge 
                      className={`${getCategoryInfo(post.category).color} border-0 font-medium`}
                    >
                      <span className="mr-1">{getCategoryInfo(post.category).icon}</span>
                      {getCategoryInfo(post.category).name}
                    </Badge>
                  )}
                  <div className="flex items-center space-x-3">
                    <div className="flex items-center space-x-1 text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                      <Eye className="h-3 w-3" />
                      <span>{post.viewCount}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Avatar className="h-10 w-10 ring-2 ring-blue-100">
                      <AvatarImage src={post.authorAvatar || "/placeholder.svg"} alt={post.authorName} />
                      <AvatarFallback className="bg-gradient-to-r from-blue-500 to-purple-500 text-white text-sm">
                        {post.authorName.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-sm font-semibold text-gray-900">{post.authorName}</p>
                      <p className="text-xs text-gray-500">
                        {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true, locale: ko })}
                      </p>
                    </div>
                  </div>
                </div>
                <Link href={`/posts/${post.id}`} className="block">
                  <CardTitle className="hover:text-blue-600 transition-colors cursor-pointer text-xl font-bold text-gray-900 mt-3">
                    {post.title}
                  </CardTitle>
                </Link>
              </CardHeader>
              <CardContent className="pt-0">
                <p className="text-gray-600 mb-4 line-clamp-2 leading-relaxed" dangerouslySetInnerHTML={{ __html: post.content }}>
                  {post.content}
                </p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4 text-sm text-gray-500">
                    <div className="flex items-center space-x-1 hover:text-red-500 transition-colors">
                      <Heart className="h-4 w-4" />
                      <span>{post.likeCount}</span>
                    </div>
                    <div className="flex items-center space-x-1 hover:text-blue-500 transition-colors">
                      <MessageCircle className="h-4 w-4" />
                      <span>{post.commentCount}</span>
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
