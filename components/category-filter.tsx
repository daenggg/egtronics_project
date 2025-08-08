"use client"

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Filter } from 'lucide-react'

export const categories = [
  { id: 'announcement', name: '공지사항', color: 'bg-gray-100 text-gray-700', icon: '📋' },
  { id: 'general', name: '자유게시판', color: 'bg-blue-100 text-blue-700', icon: '💬' },
  { id: 'tech', name: '버그 제보 / 건의 사항', color: 'bg-green-100 text-green-700', icon: '💻' },
  { id: 'study', name: '자료실', color: 'bg-purple-100 text-purple-700', icon: '📚' },
  { id: 'project', name: '후기 / 리뷰', color: 'bg-orange-100 text-orange-700', icon: '🚀' },
  { id: 'career', name: '프로젝트 공유 / 개발 일지', color: 'bg-pink-100 text-pink-700', icon: '💼' },
  { id: 'qna', name: '질문과 답변(Q&A)', color: 'bg-yellow-100 text-yellow-700', icon: '❓' },
  { id: 'free', name: '가입인사 / 자기소개', color: 'bg-indigo-100 text-indigo-700', icon: '🎉' }
]

interface CategoryFilterProps {
  selectedCategory?: string | null
  onCategoryChange?: (category: string | null) => void
}

export function CategoryFilter({ 
  selectedCategory = null, 
  onCategoryChange
}: CategoryFilterProps) {
  const [activeCategory, setActiveCategory] = useState<string | null>(selectedCategory)

  const handleCategoryClick = (categoryId: string) => {
    const newCategory = activeCategory === categoryId ? null : categoryId
    setActiveCategory(newCategory)
    onCategoryChange?.(newCategory)
  }

  return (
    <Card className="mb-6 glass-effect border-0 shadow-lg">
      <CardContent className="pt-6">
        {/* 카테고리 섹션 */}
        <div className="flex items-center gap-3 mb-4">
          <Filter className="h-5 w-5 text-gray-600" />
          <h3 className="font-semibold text-gray-900">카테고리</h3>
        </div>
        <div className="flex flex-wrap gap-2 mb-4">
          {categories.map((category) => {
            const isActive = activeCategory === category.id
            return (
              <Button
                key={category.id}
                variant={isActive ? "default" : "outline"}
                size="sm"
                onClick={() => handleCategoryClick(category.id)}
                className={`transition-all ${
                  isActive
                    ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg'
                    : `hover:${category.color.replace('text-', 'bg-').replace('100', '50')} ${category.color} border-gray-200`
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
