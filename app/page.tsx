"use client"

import { useState } from 'react'
import { CategoryFilter } from '@/components/category-filter'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import Profile from '@/components/ui/profile'

interface Post {
  id: string
  title: string
  content: string
  author: string
  createdAt: Date
  likes: number
  comments: number
}

const mockPosts: Post[] = [
  {
    id: '1',
    title: 'React 공부 중입니다',
    content: 'React를 배우면서 느낀 점과 팁을 공유합니다.',
    author: '홍길동',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 5),
    likes: 10,
    comments: 2,
  },
  {
    id: '2',
    title: 'Next.js를 이용한 프로젝트',
    content: 'Next.js를 사용한 간단한 웹사이트 제작 경험을 공유합니다.',
    author: '김철수',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 12),
    likes: 25,
    comments: 8,
  },
]

export default function HomePage() {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)

  return (
    <div className="container mx-auto px-4 py-8">
      {/* 헤더 + 글쓰기 버튼 */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-pink-500 to-purple-500 bg-clip-text text-transparent mb-2">
            egtronics 오늘의 게시판
          </h1>
          <p className="text-gray-600">다양한 주제로 소통하고 정보를 나누는 공간입니다</p>
        </div>
      </div>

      {/* 메인 레이아웃: 왼쪽 필터, 오른쪽 게시물 */}
      <div className="flex gap-6">
        {/* 왼쪽 고정 카테고리 */}
        <aside className="w-64 sticky top-24 h-fit self-start">
          <div className="mb-6">
            <Profile />
          </div>
          <CategoryFilter 
            selectedCategory={selectedCategory} 
            onCategoryChange={setSelectedCategory} 
          />
        </aside>

        {/* 목업 게시글 리스트 */}
        <main className="flex-1 space-y-6">
          {mockPosts.map(post => (
            <Card key={post.id} className="glass-effect border-0 shadow-lg">
              <CardHeader>
                <div className="flex justify-between items-center mb-2">
                  <h2 className="text-xl font-semibold">{post.title}</h2>
                  <span className="text-sm text-gray-500">{post.author}</span>
                </div>
                <p className="text-sm text-gray-400">{post.createdAt.toLocaleString()}</p>
              </CardHeader>
              <CardContent>
                <p className="line-clamp-3 text-gray-700">{post.content}</p>
                <div className="flex justify-end space-x-4 text-sm text-gray-500 mt-4">
                  <span>좋아요 {post.likes}</span>
                  <span>댓글 {post.comments}</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </main>
      </div>
    </div>
  )
}
