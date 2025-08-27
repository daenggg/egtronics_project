"use client"
import axios from "axios"
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { MessageCircle, Eye, Bookmark } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { ko } from 'date-fns/locale'

import { categories } from '@/components/category-filter'
import { Button } from '@/components/ui/button'
import { useToast } from '@/hooks/use-toast'
import { useAuth } from '@/contexts/auth-context'

interface Post {
  id: string
  title: string
  content: string
  category: string
  media?: Array<{
    id: string
    type: 'image' | 'video'
    url: string
    thumbnail?: string
  }>
  isBookmarked?: boolean
  author: {
    id: string
    name: string
    avatar?: string
  }
  createdAt: Date
  likes: number
  comments: number
  views: number
}

interface PostListProps {
  selectedCategory: string | null
}

export function PostList({ selectedCategory }: PostListProps) {
  const [posts, setPosts] = useState<Post[]>([])
  const { toast } = useToast()
  const { user } = useAuth()

  useEffect(() => {
    const controller = new AbortController()

    const loadPosts = async () => {
      try {
        const params = selectedCategory ? `?category=${encodeURIComponent(selectedCategory)}` : ''
        const res = await axios.get(`/api/posts${params}`, { signal: controller.signal })
        const data = res.data
        const normalized: Post[] = (data as any[]).map((p) => ({
          ...p,
          createdAt: new Date(p.createdAt),
        }))
        setPosts(normalized)
      } catch (err: any) {
        if (axios.isCancel(err)) return
        console.error(err)
        setPosts([])
      }
    }

    loadPosts()
    return () => controller.abort()
  }, [selectedCategory])



  const getCategoryInfo = (categoryId: string) => {
    return categories.find(cat => cat.id === categoryId) || categories[0]
  }

  const handleBookmark = (postId: string) => {
    if (!user) {
      toast({
        title: "로그인 필요",
        description: "스크랩하려면 로그인해주세요.",
        variant: "destructive",
        duration: 2000,
      })
      return
    }

    setPosts(prev =>
      prev.map(post =>
        post.id === postId
          ? { ...post, isBookmarked: !post.isBookmarked }
          : post
      )
    )

    const post = posts.find(p => p.id === postId)
    toast({
      title: post?.isBookmarked ? "스크랩 해제" : "스크랩 완료",
      description: post?.isBookmarked ? "스크랩이 해제되었습니다." : "스크랩되었습니다.",
      duration: 2000,
    })
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
      {posts.map((post, index) => (
        <Card
          key={post.id}
          className="group relative overflow-hidden bg-white/90 backdrop-blur-sm border border-gray-200/50 shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1 rounded-2xl h-fit"
          style={{ animationDelay: `${index * 0.1}s` }}
        >
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Avatar className="h-8 w-8 ring-2 ring-white shadow-sm">
                  <AvatarImage src={post.author.avatar || "/placeholder.svg"} alt={post.author.name} />
                  <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-500 text-white font-bold text-xs">
                    {post.author.name.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-sm font-semibold text-gray-900">{post.author.name}</p>
                  <p className="text-xs text-gray-500">
                    {formatDistanceToNow(post.createdAt, { addSuffix: true, locale: ko })}
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <div className="flex items-center space-x-1 text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                  <Eye className="h-3 w-3" />
                  <span>{post.views}</span>
                </div>

              </div>
            </div>
          </CardHeader>

          <div className="px-3 pb-3">
            <div className="relative">
              {post.media && post.media.length > 0 ? (
                <div className="relative aspect-[4/3] bg-gradient-to-br from-gray-100 to-gray-200 overflow-hidden rounded-xl">
                  <img
                    src={post.media[0].url || "/placeholder.svg"}
                    alt="Post media"
                    className="w-full h-full object-cover group-hover:scale-105 transition-all duration-500"
                  />
                  {post.media.length > 1 && (
                    <div className="absolute top-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded-full backdrop-blur-sm font-medium">
                      +{post.media.length - 1}
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl"></div>
                </div>
              ) : (
                <div className="aspect-[4/3] bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 flex items-center justify-center rounded-xl">
                  <div className="text-center p-4">
                    <div className="text-3xl mb-2">{getCategoryInfo(post.category).icon}</div>
                    <p className="text-gray-600 text-sm font-medium line-clamp-3">
                      {post.content}
                    </p>
                  </div>
                </div>
              )}
              <div className="absolute top-2 left-2">
                <Badge className={`${getCategoryInfo(post.category).color} border-0 font-semibold px-2 py-1 rounded-full shadow-sm text-xs`}>
                  <span className="mr-1">{getCategoryInfo(post.category).icon}</span>
                  {getCategoryInfo(post.category).name}
                </Badge>
              </div>
            </div>
          </div>

          <CardContent className="px-4 pb-4 pt-0 bg-gray-50/50">
            <div className="space-y-3">
              <Link href={`/posts/${post.id}`}>
                <CardTitle className="text-base font-bold text-gray-900 hover:text-blue-600 transition-colors cursor-pointer line-clamp-2 leading-tight">
                  {post.title}
                </CardTitle>
              </Link>

              <div className="flex items-center justify-between pt-2 border-t border-gray-200/50">
                <div className="flex items-center space-x-3">
                  <div className="flex items-center space-x-1 text-sm text-gray-600 hover:text-blue-500 transition-colors cursor-pointer">
                    <MessageCircle className="h-4 w-4" />
                    <span>{post.comments}</span>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleBookmark(post.id)}
                  className={`p-1 h-8 w-8 rounded-full transition-colors ${
                    post.isBookmarked 
                      ? 'text-yellow-500 hover:text-yellow-600' 
                      : 'text-gray-400 hover:text-yellow-500'
                  }`}
                >
                  <Bookmark className={`h-4 w-4 ${post.isBookmarked ? 'fill-current' : ''}`} />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
