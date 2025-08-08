"use client"

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { categories } from '@/components/category-filter'
import { Badge } from '@/components/ui/badge'

interface CategoryStatsProps {
  stats?: Record<string, number>
}

export function CategoryStats({ stats }: CategoryStatsProps) {
  // 목업 통계 데이터
  const mockStats = {
    general: 15,
    tech: 23,
    study: 8,
    project: 12,
    career: 6,
    qna: 19,
    free: 11
  }

  const categoryStats = stats || mockStats

  return (
    <Card className="glass-effect border-0 shadow-lg">
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-gray-900 flex items-center gap-2">
          📊 카테고리별 게시글 수
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {categories.filter(cat => cat.id !== 'all').map((category) => (
            <div key={category.id} className="text-center p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors">
              <div className="text-2xl mb-1">{category.icon}</div>
              <div className="text-sm font-medium text-gray-700 mb-1">{category.name}</div>
              <Badge variant="secondary" className="text-xs">
                {categoryStats[category.id] || 0}개
              </Badge>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
