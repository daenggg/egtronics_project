"use client"

import { useState } from 'react'
import { useAuth } from '@/contexts/auth-context'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useToast } from '@/hooks/use-toast'
import { Edit, Save } from 'lucide-react'

export default function ProfilePage() {
  const { user } = useAuth()
  const { toast } = useToast()
  const [isEditing, setIsEditing] = useState(false)
  const [name, setName] = useState(user?.name || '')

  const handleSave = () => {
    // 실제 구현에서는 API 호출
    setIsEditing(false)
    toast({
      title: "프로필 업데이트",
      description: "프로필이 성공적으로 업데이트되었습니다.",
    })
  }

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-sm">
        <Card className="text-center p-8">
          <Avatar className="mx-auto mb-4 h-20 w-20 border border-gray-300">
            <AvatarFallback className="text-3xl">?</AvatarFallback>
          </Avatar>
          <CardTitle className="mb-2 text-lg font-semibold">비회원</CardTitle>
          <CardContent className="text-gray-600">
            비회원입니다.<br />
            로그인 또는 회원가입을<br />
            해주세요.
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <Card className="mb-8">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>프로필</CardTitle>
            <Button
              variant="outline"
              size="sm"
              onClick={() => isEditing ? handleSave() : setIsEditing(true)}
            >
              {isEditing ? (
                <>
                  <Save className="h-4 w-4 mr-1" />
                  저장
                </>
              ) : (
                <>
                  <Edit className="h-4 w-4 mr-1" />
                  편집
                </>
              )}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-start space-x-6">
            <Avatar className="h-24 w-24">
              <AvatarImage src={user.avatar || "/placeholder.svg"} alt={user.name} />
              <AvatarFallback className="text-2xl">{user.name.charAt(0)}</AvatarFallback>
            </Avatar>
            <div className="flex-1 space-y-4">
              {isEditing ? (
                <div className="space-y-2">
                  <Label htmlFor="name">이름</Label>
                  <Input
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>
              ) : (
                <div>
                  <h2 className="text-2xl font-bold">{name}</h2>
                  <p className="text-muted-foreground">{user.email}</p>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="posts" className="space-y-4">
        <TabsList>
          <TabsTrigger value="posts">내 게시글</TabsTrigger>
          <TabsTrigger value="comments">내 댓글</TabsTrigger>
        </TabsList>

        <TabsContent value="posts" className="space-y-4">
          {/* 실제 게시글 데이터가 들어올 자리 */}
        </TabsContent>

        <TabsContent value="comments" className="space-y-4">
          {/* 실제 댓글 데이터가 들어올 자리 */}
        </TabsContent>
      </Tabs>
    </div>
  )
}
