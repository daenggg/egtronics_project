"use client"

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Filter, X, ArrowUpDown } from 'lucide-react'

export type SortOption = 'latest' | 'likes' | 'views'

export const categories = [
  { id: 'all', name: '전체', color: 'bg-gray-100 text-gray-700', icon: '📋' },
  { id: 'general', name: '일반', color: 'bg-blue-100 text-blue-700', icon: '💬' },
  { id: 'tech', name: '기술', color: 'bg-green-100 text-green-700', icon: '💻' },
  { id: 'study', name: '스터디', color: 'bg-purple-100 text-purple-700', icon: '📚' },
  { id: 'project', name: '프로젝트', color: 'bg-orange-100 text-orange-700', icon: '🚀' },
  { id: 'career', name: '커리어', color: 'bg-pink-100 text-pink-700', icon: '💼' },
  { id: 'qna', name: 'Q&A', color: 'bg-yellow-100 text-yellow-700', icon: '❓' },
  { id: 'free', name: '자유', color: 'bg-indigo-100 text-indigo-700', icon: '🎉' }
]

const sortOptions = [
  { value: 'latest' as SortOption, label: '최신순', icon: '⏰' },
  { value: 'likes' as SortOption, label: '추천순', icon: '❤️' },
  { value: 'views' as SortOption, label: '조회순', icon: '👀' }
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

        {/* 정렬 섹션 */}
        <div className="border-t border-gray-200 pt-4">
          <div className="flex items-center gap-3 mb-3">
            <ArrowUpDown className="h-4 w-4 text-gray-600" />
            <h4 className="font-medium text-gray-900 text-sm">정렬</h4>
          </div>
          <div className="flex gap-2">
            {sortOptions.map((option) => (
              <Button
                key={option.value}
                variant={activeSort === option.value ? "default" : "outline"}
                size="sm"
                onClick={() => handleSortClick(option.value)}
                className={`transition-all text-xs ${
                  activeSort === option.value
                    ? 'bg-gradient-to-r from-green-500 to-blue-500 text-white shadow-md'
                    : 'hover:bg-gray-50 border-gray-200 text-gray-600'
                }`}
              >
                <span className="mr-1">{option.icon}</span>
                {option.label}
              </Button>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
