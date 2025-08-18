"use client"
import axios from "axios"
import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { useAuth } from '@/contexts/auth-context'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Heart, MessageCircle, Eye, Edit, Trash2, Bookmark } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { ko } from 'date-fns/locale'
import { useToast } from '@/hooks/use-toast'
import { ReportDialog } from '@/components/report-dialog'
// categories import 추가:
import { categories } from '@/components/category-filter'

// Post interface에 category 필드 추가:
interface Post {
  id: string
  title: string
  content: string
  category: string
  media?: Array<{
    id: string
    type: 'image' | 'video'
    url: string
  }>
  isBookmarked?: boolean
  author: {
    id: string
    name: string
    avatar?: string
  }
  createdAt: Date
  likes: number
  isLiked: boolean
  views: number
  tags: string[]
}

interface Comment {
  id: string
  content: string
  author: {
    id: string
    name: string
    avatar?: string
  }
  createdAt: Date
  likes: number
  isLiked: boolean
}



export default function PostDetailPage() {
  const params = useParams()
  const { user } = useAuth()
  const { toast } = useToast()
  const [post, setPost] = useState<Post | null>(null)
  const [comments, setComments] = useState<Comment[]>([])
  const [newComment, setNewComment] = useState('')
  const [loading, setLoading] = useState(true)

useEffect(() => {
  const controller = new AbortController()

  const getPost = async () => {
    try {
      setLoading(true)
      const res = await axios.get(`/api/posts/${String(params.id)}`, {
        signal: controller.signal
      })
      const data = res.data
      const normalized: Post = {
        ...data,
        createdAt: new Date(data.createdAt),
      }
      setPost(normalized)
      setComments([])
    } catch (err: any) {
      if (axios.isCancel(err)) {
        console.log("요청 취소됨")
      } else {
        console.error(err)
        setPost(null)
      }
    } finally {
      setLoading(false)
    }
  }

  getPost()
  return () => controller.abort()
}, [params.id])


  const handleLikePost = () => {
    if (!user) {
      toast({
        title: "로그인 필요",
        description: "좋아요를 누르려면 로그인해주세요.",
        variant: "destructive",
      })
      return
    }

    setPost(prev => prev ? {
      ...prev,
      likes: prev.isLiked ? prev.likes - 1 : prev.likes + 1,
      isLiked: !prev.isLiked
    } : null)
  }

  const handleLikeComment = (commentId: string) => {
    if (!user) {
      toast({
        title: "로그인 필요",
        description: "좋아요를 누르려면 로그인해주세요.",
        variant: "destructive",
      })
      return
    }

    setComments(prev => prev.map(comment => 
      comment.id === commentId ? {
        ...comment,
        likes: comment.isLiked ? comment.likes - 1 : comment.likes + 1,
        isLiked: !comment.isLiked
      } : comment
    ))
  }

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) {
      toast({
        title: "로그인 필요",
        description: "댓글을 작성하려면 로그인해주세요.",
        variant: "destructive",
      })
      return
    }

    if (!newComment.trim()) return

    const comment: Comment = {
      id: Date.now().toString(),
      content: newComment,
      author: user,
      createdAt: new Date(),
      likes: 0,
      isLiked: false
    }

    setComments(prev => [...prev, comment])
    setNewComment('')
    
    toast({
      title: "댓글 작성 완료",
      description: "댓글이 성공적으로 작성되었습니다.",
    })
  }

  if (loading) {
    return <div className="container mx-auto px-4 py-8">로딩 중...</div>
  }

  if (!post) {
    return <div className="container mx-auto px-4 py-8">게시글을 찾을 수 없습니다.</div>
  }

  // getCategoryInfo 함수 추가:
  const getCategoryInfo = (categoryId: string) => {
    return categories.find(cat => cat.id === categoryId) || categories[0]
  }

  const handleBookmark = () => {
    if (!user) {
      toast({
        title: "로그인 필요",
        description: "스크랩하려면 로그인해주세요.",
        variant: "destructive",
      })
      return
    }

    setPost(prev => prev ? {
      ...prev,
      isBookmarked: !prev.isBookmarked
    } : null)

    toast({
      title: post?.isBookmarked ? "스크랩 해제" : "스크랩 완료",
      description: post?.isBookmarked ? "스크랩이 해제되었습니다." : "스크랩되었습니다.",
    })
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* 게시글 */}
      <Card className="mb-8 glass-effect border-0 shadow-xl">
        <CardHeader className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-t-lg">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-4">
              <Avatar className="h-12 w-12 ring-2 ring-blue-200">
                <AvatarImage src={post.author.avatar || "/placeholder.svg"} alt={post.author.name} />
                <AvatarFallback className="bg-gradient-to-r from-blue-500 to-purple-500 text-white">
                  {post.author.name.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="font-semibold text-gray-900">{post.author.name}</p>
                <p className="text-sm text-gray-500">
                  {formatDistanceToNow(post.createdAt, { addSuffix: true, locale: ko })}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-2 text-sm text-gray-500 bg-white px-3 py-1 rounded-full shadow-sm">
                <Eye className="h-4 w-4" />
                <span>{post.views}</span>
              </div>
              <ReportDialog type="post" targetId={post.id} />
            </div>
          </div>
          {/* 제목 위에 카테고리 배지 추가: */}
          <Badge 
            className={`${getCategoryInfo(post.category).color} border-0 font-medium mb-3 text-sm px-3 py-1`}
          >
            <span className="mr-2">{getCategoryInfo(post.category).icon}</span>
            {getCategoryInfo(post.category).name}
          </Badge>
          <h1 className="text-3xl font-bold mb-4 text-gray-900">{post.title}</h1>
          <div className="flex flex-wrap gap-2">
            {post.tags.map((tag) => (
              <Badge 
                key={tag} 
                variant="secondary"
                className="bg-gradient-to-r from-blue-100 to-purple-100 text-blue-700 border-0"
              >
                #{tag}
              </Badge>
            ))}
          </div>
        </CardHeader>
        <CardContent className="p-8">
          <div className="prose max-w-none mb-8 text-gray-700 leading-relaxed">
            <p className="whitespace-pre-wrap text-lg">{post.content}</p>
          </div>

          {post.media && post.media.length > 0 && (
            <div className="mb-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {post.media.map((media) => (
                  <div key={media.id} className="aspect-video bg-gray-100 rounded-lg overflow-hidden">
                    {media.type === 'image' ? (
                      <img
                        src={media.url || "/placeholder.svg"}
                        alt="Post media"
                        className="w-full h-full object-cover hover:scale-105 transition-transform cursor-pointer"
                      />
                    ) : (
                      <video
                        src={media.url}
                        controls
                        className="w-full h-full object-cover"
                      />
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
          <div className="flex items-center justify-between pt-6 border-t border-gray-100">
            <div className="flex items-center space-x-4">
              <Button
                variant={post.isLiked ? "default" : "outline"}
                size="sm"
                onClick={handleLikePost}
                className={`flex items-center space-x-2 transition-all ${
                  post.isLiked 
                    ? 'bg-gradient-to-r from-red-500 to-pink-500 text-white shadow-lg' 
                    : 'hover:bg-red-50 hover:text-red-500 hover:border-red-200'
                }`}
              >
                <Heart className={`h-4 w-4 ${post.isLiked ? 'fill-current' : ''}`} />
                <span>{post.likes}</span>
              </Button>
              <Button
                variant={post.isBookmarked ? "default" : "outline"}
                size="sm"
                onClick={handleBookmark}
                className={`flex items-center space-x-2 transition-all ${
                  post.isBookmarked 
                    ? 'bg-gradient-to-r from-yellow-500 to-orange-500 text-white shadow-lg' 
                    : 'hover:bg-yellow-50 hover:text-yellow-600 hover:border-yellow-200'
                }`}
              >
                <Bookmark className={`h-4 w-4 ${post.isBookmarked ? 'fill-current' : ''}`} />
                <span>스크랩</span>
              </Button>
              <div className="flex items-center space-x-2 text-sm text-gray-500 bg-gray-50 px-3 py-2 rounded-full">
                <MessageCircle className="h-4 w-4" />
                <span>{comments.length}개 댓글</span>
              </div>
            </div>
            {user && user.id === post.author.id && (
              <div className="flex space-x-2">
                <Button variant="outline" size="sm" className="hover:bg-blue-50 hover:text-blue-600">
                  <Edit className="h-4 w-4 mr-1" />
                  수정
                </Button>
                <Button variant="outline" size="sm" className="hover:bg-red-50 hover:text-red-600">
                  <Trash2 className="h-4 w-4 mr-1" />
                  삭제
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* 댓글 작성 */}
      {user && (
        <Card className="mb-8 glass-effect border-0 shadow-lg">
          <CardContent className="pt-6">
            <form onSubmit={handleSubmitComment} className="space-y-4">
              <div className="flex items-start space-x-4">
                <Avatar className="h-10 w-10 ring-2 ring-blue-100">
                  <AvatarImage src={user.avatar || "/placeholder.svg"} alt={user.name} />
                  <AvatarFallback className="bg-gradient-to-r from-blue-500 to-purple-500 text-white text-sm">
                    {user.name.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <Textarea
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="댓글을 작성하세요..."
                    className="min-h-[100px] border-gray-200 focus:border-blue-300 focus:ring-blue-200"
                  />
                </div>
              </div>
              <div className="flex justify-end">
                <Button 
                  type="submit"
                  className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white shadow-lg"
                >
                  💬 댓글 작성
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* 댓글 목록 */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">댓글 {comments.length}개</h3>
        {comments.map((comment, index) => (
          <Card 
            key={comment.id}
            className="glass-effect border-0 shadow-md animate-fade-in"
            style={{ animationDelay: `${index * 0.1}s` }}
          >
            <CardContent className="pt-6">
              <div className="flex items-start space-x-4">
                <Avatar className="h-10 w-10 ring-2 ring-gray-100">
                  <AvatarImage src={comment.author.avatar || "/placeholder.svg"} alt={comment.author.name} />
                  <AvatarFallback className="bg-gradient-to-r from-green-400 to-blue-500 text-white text-sm">
                    {comment.author.name.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      <p className="font-semibold text-sm text-gray-900">{comment.author.name}</p>
                      <p className="text-xs text-gray-500">
                        {formatDistanceToNow(comment.createdAt, { addSuffix: true, locale: ko })}
                      </p>
                    </div>
                    <ReportDialog type="comment" targetId={comment.id} />
                  </div>
                  <p className="text-sm mb-4 text-gray-700 leading-relaxed">{comment.content}</p>
                  <Button
                    variant={comment.isLiked ? "default" : "outline"}
                    size="sm"
                    onClick={() => handleLikeComment(comment.id)}
                    className={`flex items-center space-x-2 transition-all ${
                      comment.isLiked 
                        ? 'bg-gradient-to-r from-red-500 to-pink-500 text-white' 
                        : 'hover:bg-red-50 hover:text-red-500 hover:border-red-200'
                    }`}
                  >
                    <Heart className={`h-3 w-3 ${comment.isLiked ? 'fill-current' : ''}`} />
                    <span>{comment.likes}</span>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
