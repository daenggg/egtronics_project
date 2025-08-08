"use client"

import { useState, Suspense } from 'react'
import { PostList } from '@/components/post-list'
import { CreatePostButton } from '@/components/create-post-button'
import { CategoryFilter, SortOption } from '@/components/category-filter'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

export default function HomePage() {
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [selectedSort, setSelectedSort] = useState<SortOption>('latest')

  return (
    <div className="container mx-auto px-4 py-8">
      {/* 헤더 + 글쓰기 버튼 */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
            egtronics 게시판
          </h1>
          <p className="text-gray-600">다양한 주제로 소통하고 정보를 나누는 공간입니다</p>
        </div>
        <CreatePostButton />
      </div>

      {/* 메인 레이아웃: 왼쪽 필터, 오른쪽 게시물 */}
      <div className="flex gap-6">
        {/* 왼쪽 고정 카테고리 */}
        <aside className="w-64 sticky top-24 h-fit self-start">
          <CategoryFilter
            selectedCategory={selectedCategory}
            onCategoryChange={setSelectedCategory}
          />
        </aside>

        {/* 오른쪽 게시글 목록 */}
        <main className="flex-1">
          <Suspense fallback={<PostListSkeleton />}>
            <PostList sortBy={selectedSort} />
          </Suspense>
        </main>
      </div>
    </div>
  )
}

// 스켈레톤 UI
function PostListSkeleton() {
  return (
    <div className="space-y-6">
      {[...Array(5)].map((_, i) => (
        <Card key={i} className="glass-effect border-0 shadow-lg animate-pulse">
          <CardHeader>
            <div className="flex items-center space-x-3 mb-4">
              <Skeleton className="h-10 w-10 rounded-full" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-3 w-16" />
              </div>
            </div>
            <Skeleton className="h-7 w-3/4" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-20 w-full mb-4" />
            <div className="flex justify-between">
              <div className="flex space-x-2">
                <Skeleton className="h-6 w-16" />
                <Skeleton className="h-6 w-20" />
              </div>
              <div className="flex space-x-4">
                <Skeleton className="h-6 w-12" />
                <Skeleton className="h-6 w-12" />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
