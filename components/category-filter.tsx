"use client"

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Filter, X, ArrowUpDown } from 'lucide-react'

export type SortOption = 'latest' | 'likes' | 'views'

export const categories = [
  { id: 'all', name: '공지사항', color: 'bg-gray-100 text-gray-700', icon: '📋' },
  { id: 'general', name: '자유게시판', color: 'bg-blue-100 text-blue-700', icon: '💬' },
  { id: 'tech', name: '버그 제보 / 건의 사항', color: 'bg-green-100 text-green-700', icon: '💻' },
  { id: 'study', name: '자료실', color: 'bg-purple-100 text-purple-700', icon: '📚' },
  { id: 'project', name: '후기 / 리뷰', color: 'bg-orange-100 text-orange-700', icon: '🚀' },
  { id: 'career', name: '프로젝트 공유 / 개발 일지', color: 'bg-pink-100 text-pink-700', icon: '💼' },
  { id: 'qna', name: '질문과 답변(Q&A_', color: 'bg-yellow-100 text-yellow-700', icon: '❓' },
  { id: 'free', name: '가입인사 / 자기소개', color: 'bg-indigo-100 text-indigo-700', icon: '🎉' }
]



interface CategoryFilterProps {
  selectedCategory?: string
  onCategoryChange?: (category: string) => void
  selectedSort?: SortOption
  onSortChange?: (sort: SortOption) => void
}

export function CategoryFilter({ 
  selectedCategory = 'all', 
  onCategoryChange,
  selectedSort = 'latest',
  onSortChange 
}: CategoryFilterProps) {
  const [activeCategory, setActiveCategory] = useState(selectedCategory)
  const [activeSort, setActiveSort] = useState<SortOption>(selectedSort)

  const handleCategoryClick = (categoryId: string) => {
    setActiveCategory(categoryId)
    onCategoryChange?.(categoryId)
  }

  const handleSortClick = (sortValue: SortOption) => {
    setActiveSort(sortValue)
    onSortChange?.(sortValue)
  }

  return (
    <Card className="mb-6 glass-effect border-0 shadow-lg">
      <CardContent className="pt-6">
        {/* 카테고리 섹션 */}
        <div className="flex items-center gap-3 mb-4">
          <Filter className="h-5 w-5 text-gray-600" />
          <h3 className="font-semibold text-gray-900">카테고리</h3>
          {activeCategory !== 'all' && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleCategoryClick('all')}
              className="text-gray-500 hover:text-gray-700"
            >
              <X className="h-4 w-4 mr-1" />
              필터 초기화
            </Button>
          )}
        </div>
        <div className="flex flex-wrap gap-2 mb-4">
          {categories.map((category) => (
            <Button
              key={category.id}
              variant={activeCategory === category.id ? "default" : "outline"}
              size="sm"
              onClick={() => handleCategoryClick(category.id)}
              className={`transition-all ${
                activeCategory === category.id
                  ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg'
                  : `hover:${category.color.replace('text-', 'bg-').replace('100', '50')} ${category.color} border-gray-200`
              }`}
            >
              <span className="mr-2">{category.icon}</span>
              {category.name}
            </Button>
          ))}
        </div>

        
      </CardContent>
    </Card>
  )
}
