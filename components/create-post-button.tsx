"use client"

import { useAuth } from '@/contexts/auth-context'
import { Button } from '@/components/ui/button'
import { PlusCircle } from 'lucide-react'
import Link from 'next/link'

export function CreatePostButton() {
  const { user } = useAuth()

  if (!user) {
    return (
      <Button asChild variant="outline" className="hover:bg-blue-50 border-blue-200 text-blue-600">
        <Link href="/login">로그인 후 글쓰기</Link>
      </Button>
    )
  }

  return (
    <Button asChild className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all">
      <Link href="/posts/create">
        <PlusCircle className="mr-2 h-4 w-4" />
        ✨ 글쓰기
      </Link>
    </Button>
  )
}
