"use client"

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'

export const categories = [
  { id: 'announcement', name: '공지사항', color: '', icon: '📋' },
  { id: 'general', name: '자유게시판', color: '', icon: '💬' },
  { id: 'tech', name: '버그 제보 / 건의 사항', color: '', icon: '💻' },
  { id: 'study', name: '자료실', color: '', icon: '📚' },
  { id: 'project', name: '후기 / 리뷰', color: '', icon: '🚀' },
  { id: 'career', name: '프로젝트 공유 / 개발 일지', color: '', icon: '💼' },
  { id: 'qna', name: '질문과 답변(Q&A)',color: '', icon: '❓' },
  { id: 'free', name: '가입인사 / 자기소개', color: '', icon: '🎉' },
]

interface CategoryFilterProps {
  onCategorySelect?: () => void
}

export function CategoryFilter({ onCategorySelect }: CategoryFilterProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [activeCategory, setActiveCategory] = useState<string | null>(null)

  useEffect(() => {
    setActiveCategory(searchParams.get('category'))
  }, [searchParams])

  const handleCategoryClick = (categoryId: string) => {
    const newCategory = activeCategory === categoryId ? null : categoryId
    if (newCategory) {
      router.push(`/?category=${newCategory}`)
    } else {
      router.push('/')
    }
    onCategorySelect?.()
  }

  return (
    <Card className="mb-2 border-0 shadow-none">
      <CardContent className="pt-2">
        {/* 카테고리 섹션 */}
        <div className="flex items-center gap-1 mb-4">
          <h3 className="font-semibold text-gray-900">Category</h3>
        </div>
        <div className="flex flex-wrap gap-2 mb-4">
          {categories.map((category) => {
            const isActive = activeCategory === category.id
            return (
              <Button
                key={category.id}
                // variant={isActive ? "default" : "shadow-none"}
                size="sm"
                onClick={() => handleCategoryClick(category.id)}
                className={`transition-all ${
                  isActive
                    ? "bg-gradient-to-r from-pink-400 to-purple-400 text-white shadow-lg"
                    : "hover:bg-gray-100 border-gray-200"
                }`}
              >
                <span className="mr-2">{category.icon}</span>
                {category.name}
              </Button>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
