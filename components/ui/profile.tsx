"use client"

import { useAuth } from '@/contexts/auth-context'
import { Card, CardContent } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { CreatePostButton } from '@/components/create-post-button'

export default function Profile() {
  const { user } = useAuth()

  if (!user) {
    return (
      <Card className="glass-effect border-0 shadow-lg bg-card">
        <CardContent className="p-4">
          <p className="text-sm text-muted-foreground mb-4 text-center">
            로그인하고 모든 기능을 이용해보세요.
          </p>
          <div className="flex flex-col gap-2 mt-2">
            <Button asChild className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white shadow-lg">
              <Link href="/login">로그인</Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/register">회원가입</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="glass-effect border-0 shadow-lg bg-card">
      <CardContent className="p-4">
        <div className="flex items-center gap-4 w-full">
          <Avatar className="h-12 w-12 ring-2 ring-blue-200">
            <AvatarImage src={user.profilePicture ? `${process.env.NEXT_PUBLIC_API_BASE}${user.profilePicture}` : "/images.png"} alt={user.name} />
            <AvatarFallback className="bg-gradient-to-r from-blue-500 to-purple-500 text-white">
              {user.nickname.charAt(0)}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 overflow-hidden">
            <p className="font-semibold text-foreground truncate">{user.nickname}</p>
            <p className="text-sm text-muted-foreground truncate">{user.email}</p>
          </div>
        </div>
        <div className="mt-4 w-full"><CreatePostButton /></div>
      </CardContent>
    </Card>
  )
}
