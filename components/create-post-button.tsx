"use client"

import { useAuth } from '@/contexts/auth-context'
import { Button } from '@/components/ui/button'
import { PlusCircle } from 'lucide-react'
import Link from 'next/link'

export function CreatePostButton() {
  const { user } = useAuth()

  if (!user) {
    return (
      <Button asChild variant="outline" className="hover:bg-blue-50 border-blue-200 text-blue-600 force-h-12"
      >
        <Link href="/login">로그인 후 글쓰기</Link>
      </Button>
    )
  }

  return (
    <Button asChild className="bg-gradient-to-r from-pink-400 to-purple-400 hover:from-pink-500 hover:to-purple-500 text-white shadow-lg hover:shadow-xl transition-all force-h-12">
      <Link href="/posts/create">
        <PlusCircle className="mr-2 h-4 w-4" />
        게시글 작성하기
      </Link>
    </Button>
  )
}
