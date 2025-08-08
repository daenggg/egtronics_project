"use client"

import { useState } from 'react'
import { useAuth } from '@/contexts/auth-context'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useToast } from '@/hooks/use-toast'
import { Edit, Save, X } from 'lucide-react'

export default function ProfilePage() {
  const { user } = useAuth()
  const { toast } = useToast()
  const [isEditing, setIsEditing] = useState(false)
  const [name, setName] = useState(user?.name || '')
  const [bio, setBio] = useState('안녕하세요! 개발을 좋아하는 사용자입니다.')

  if (!user) {
    return <div className="container mx-auto px-4 py-8">로그인이 필요합니다.</div>
  }

  const handleSave = () => {
    // 실제 구현에서는 API 호출
    setIsEditing(false)
    toast({
      title: "프로필 업데이트",
      description: "프로필이 성공적으로 업데이트되었습니다.",
    })
  }

  const myPosts = [
    {
      id: '1',
      title: '첫 번째 게시글입니다',
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24),
      likes: 12,
      comments: 5,
      tags: ['일반', '인사']
    },
    {
      id: '2',
      title: 'React 개발 팁 공유',
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3),
      likes: 28,
      comments: 12,
      tags: ['개발', 'React', '팁']
    }
  ]

  const myComments = [
    {
      id: '1',
      content: '좋은 글 감사합니다! 앞으로도 좋은 내용 부탁드려요.',
      postTitle: 'Next.js 13 새로운 기능들',
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2),
      likes: 3
    },
    {
      id: '2',
      content: '저도 동감합니다. 개발 관련 주제들이 많았으면 좋겠어요.',
      postTitle: '개발자 커뮤니티의 중요성',
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 5),
      likes: 1
    }
  ]

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
                <>
                  <div className="space-y-2">
                    <Label htmlFor="name">이름</Label>
                    <Input
                      id="name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="bio">소개</Label>
                    <Textarea
                      id="bio"
                      value={bio}
                      onChange={(e) => setBio(e.target.value)}
                      className="min-h-[100px]"
                    />
                  </div>
                </>
              ) : (
                <>
                  <div>
                    <h2 className="text-2xl font-bold">{name}</h2>
                    <p className="text-muted-foreground">{user.email}</p>
                  </div>
                  <p className="text-sm">{bio}</p>
                </>
              )}
              <div className="flex space-x-4 text-sm text-muted-foreground">
                <span>게시글 {myPosts.length}개</span>
                <span>댓글 {myComments.length}개</span>
              </div>
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
          {myPosts.map((post) => (
            <Card key={post.id}>
              <CardContent className="pt-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-medium">{post.title}</h3>
                  <span className="text-sm text-muted-foreground">
                    {post.createdAt.toLocaleDateString()}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex flex-wrap gap-1">
                    {post.tags.map((tag) => (
                      <Badge key={tag} variant="secondary" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                  <div className="flex space-x-4 text-sm text-muted-foreground">
                    <span>좋아요 {post.likes}</span>
                    <span>댓글 {post.comments}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>
        
        <TabsContent value="comments" className="space-y-4">
          {myComments.map((comment) => (
            <Card key={comment.id}>
              <CardContent className="pt-4">
                <div className="mb-2">
                  <p className="text-sm font-medium text-blue-600">{comment.postTitle}</p>
                  <span className="text-xs text-muted-foreground">
                    {comment.createdAt.toLocaleDateString()}
                  </span>
                </div>
                <p className="text-sm mb-2">{comment.content}</p>
                <div className="text-xs text-muted-foreground">
                  좋아요 {comment.likes}개
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>
      </Tabs>
    </div>
  )
}
