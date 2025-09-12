"use client"

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'

export const categories = [
  { id: '1', name: '공지사항', color: '', icon: '📋' },
  { id: '2', name: '자유게시판', color: '', icon: '💬' },
  { id: '3', name: '버그 제보 / 건의 사항', color: '', icon: '💻' },
  { id: '4', name: '자료실', color: '', icon: '📚' },
  { id: '5', name: '후기 / 리뷰', color: '', icon: '🚀' },
  { id: '6', name: '프로젝트 공유 / 개발 일지', color: '', icon: '💼' },
  { id: '7', name: '질문과 답변(Q&A)',color: '', icon: '❓' },
  { id: '8', name: '가입인사 / 자기소개', color: '', icon: '🎉' },
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
    const params = new URLSearchParams(searchParams.toString());
    const newCategory = activeCategory === categoryId ? null : categoryId
    if (newCategory) {
      params.set('category', newCategory);
    } else {
      params.delete('category');
    }
    router.push(`/?${params.toString()}`);
    onCategorySelect?.()
  }

  return (
    <Card className="mb-2 border-0 bg-card">
      <CardContent className="pt-2">
        {/* 카테고리 섹션 */}
        <div className="flex items-center gap-1 mb-4">
          <h3 className="font-semibold text-foreground">Category</h3>
        </div>
        <div className="flex flex-wrap gap-2 mb-4">
          {categories.map((category) => {
            const isActive = activeCategory === category.id
            return (
              <Button
                key={category.id}
                size="sm"
                onClick={() => handleCategoryClick(category.id)}
                className={`transition-all ${
                  isActive
                    ? "bg-gradient-to-r from-pink-400 to-purple-400 text-white shadow-lg hover:shadow-xl"
                    : "bg-background hover:bg-muted/50 border-border"
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
