"use client";

import { useState, useEffect, useMemo } from "react";
import { useParams } from "next/navigation";
import { useAuth } from "@/contexts/auth-context";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Heart,
  MessageCircle,
  Eye,
  Edit,
  Trash2,
  Bookmark,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { ko } from "date-fns/locale";
import { useToast } from "@/hooks/use-toast";
import { ReportDialog } from "@/components/report-dialog";
import { categories } from "@/components/category-filter";

interface Post {
  id: string;
  title: string;
  content: string;
  category: string;
  media?: Array<{
    id: string;
    type: "image" | "video";
    url: string;
  }>;
  isBookmarked?: boolean;
  author: {
    id: string;
    name: string;
    avatar?: string;
  };
  createdAt: Date;
  likes: number;
  isLiked: boolean;
  views: number;
  reportedByCurrentUser?: boolean;
}

interface Comment {
  id: string;
  content: string;
  author: {
    id: string;
    name: string;
    avatar?: string;
  };
  createdAt: Date;
  likes: number;
  isLiked: boolean;
}

export default function PostDetailPage() {
  const params = useParams();
  const { user } = useAuth();
  const { toast } = useToast();
  const [post, setPost] = useState<Post | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 목업 데이터 사용
    const mockPost: Post = {
      id: "1",
      title: "샘플 게시글 제목",
      content: "여기는 게시글 내용. 안녕하세요 여기 가입했습니다...",
      category: "tech",
      media: [{ id: "m1", type: "image", url: "/placeholder.svg" }],
      isBookmarked: false,
      author: {
        id: "u1",
        name: "홍길동",
        avatar: "/placeholder.svg",
      },
      createdAt: new Date(),
      likes: 10,
      isLiked: false,
      views: 123,
      reportedByCurrentUser: false,
    };

    const mockComments: Comment[] = [
      {
        id: "c1",
        content: "첫 번째 댓글입니다.",
        author: { id: "u2", name: "김철수", avatar: "/placeholder.svg" },
        createdAt: new Date(),
        likes: 2,
        isLiked: false,
      },
      {
        id: "c2",
        content: "두 번째 댓글입니다.",
        author: { id: "u3", name: "이영희", avatar: "/placeholder.svg" },
        createdAt: new Date(),
        likes: 5,
        isLiked: false,
      },
      {
        id: "c3",
        content: "정말 유용한 정보네요!",
        author: { id: "u3", name: "이영희", avatar: "/placeholder.svg" },
        createdAt: new Date(),
        likes: 5,
        isLiked: false,
      },
      {
        id: "asd",
        content: "세 번째 댓글입니다.",
        author: { id: "u3", name: "이영희", avatar: "/placeholder.svg" },
        createdAt: new Date(),
        likes: 8,
        isLiked: false,
      },
      {
        id: "2345",
        content: "네 번째 댓글입니다.",
        author: { id: "u3", name: "이영희", avatar: "/placeholder.svg" },
        createdAt: new Date(),
        likes: 9,
        isLiked: false,
      },
      {
        id: "234",
        content: "다섯 번째 댓글입니다.",
        author: { id: "u3", name: "이영희", avatar: "/placeholder.svg" },
        createdAt: new Date(),
        likes: 10,
        isLiked: false,
      },
    ];

    setPost(mockPost);
    setComments(mockComments);
    setLoading(false);
  }, [params.id]);

  const sortedComments = useMemo(() => {
    if (comments.length === 0) {
      return [];
    }

    // 1. 좋아요 순으로 내림차순 정렬된 복사본 생성
    const sortedByLikes = [...comments].sort((a, b) => b.likes - a.likes);

    // 2. 좋아요 수가 가장 많은 상위 3개 댓글 추출
    const topComments = sortedByLikes.slice(0, 3);
    const topCommentIds = new Set(topComments.map((c) => c.id));

    // 3. 나머지 댓글 (상위 3개를 제외하고, 원래 시간 순서 유지)
    const otherComments = comments.filter((c) => !topCommentIds.has(c.id));

    return [...topComments, ...otherComments];
  }, [comments]);

  const handleLikePost = () => {
    if (!user) {
      toast({
        title: "로그인 필요",
        description: "좋아요를 누르려면 로그인해주세요.",
        variant: "destructive",
        duration: 2000,
      });
      return;
    }
    setPost((prev) =>
      prev
        ? {
            ...prev,
            likes: prev.isLiked ? prev.likes - 1 : prev.likes + 1,
            isLiked: !prev.isLiked,
          }
        : null
    );
  };

  const handleLikeComment = (commentId: string) => {
    if (!user) {
      toast({
        title: "로그인 필요",
        description: "좋아요를 누르려면 로그인해주세요.",
        variant: "destructive",
        duration: 2000,
      });
      return;
    }
    setComments((prev) =>
      prev.map((comment) =>
        comment.id === commentId
          ? {
              ...comment,
              likes: comment.isLiked ? comment.likes - 1 : comment.likes + 1,
              isLiked: !comment.isLiked,
            }
          : comment
      )
    );
  };

  const handleSubmitComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast({
        title: "로그인 필요",
        description: "댓글을 작성하려면 로그인해주세요.",
        variant: "destructive",
        duration: 2000,
      });
      return;
    }
    if (!newComment.trim()) return;

    const comment: Comment = {
      id: Date.now().toString(),
      content: newComment,
      author: user,
      createdAt: new Date(),
      likes: 0,
      isLiked: false,
    };

    setComments((prev) => [...prev, comment]);
    setNewComment("");

    toast({
      title: "댓글 작성 완료",
      description: "댓글이 성공적으로 작성되었습니다.",
      duration: 2000,
    });
  };

  if (loading)
    return <div className="container mx-auto px-4 py-8">로딩 중...</div>;
  if (!post)
    return (
      <div className="container mx-auto px-4 py-8">
        게시글을 찾을 수 없습니다.
      </div>
    );

  const getCategoryInfo = (categoryId: string) => {
    return categories.find((cat) => cat.id === categoryId) || categories[0];
  };

  const handleBookmark = () => {
    if (!user) {
      toast({
        title: "로그인 필요",
        description: "스크랩하려면 로그인해주세요.",
        variant: "destructive",
        duration: 2000,
      });
      return;
    }
    setPost((prev) =>
      prev ? { ...prev, isBookmarked: !prev.isBookmarked } : null
    );
  };

  // ✅ 신고 완료 상태 업데이트
  const handlePostReported = () => {
    setPost((prev) => (prev ? { ...prev, reportedByCurrentUser: true } : prev));
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* 게시글 */}
      <Card className="mb-8 glass-effect border-0 shadow-2xl">
        <CardHeader className="bg-gradient-to-r  rounded-t-lg">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-4">
              <Avatar className="h-12 w-12 ring-2 ring-blue-200">
                <AvatarImage
                  src={post.author.avatar || "/placeholder.svg"}
                  alt={post.author.name}
                />
                <AvatarFallback className="bg-gradient-to-r from-blue-500 to-purple-500 text-white">
                  {post.author.name.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="font-semibold text-gray-900">
                  {post.author.name}
                </p>
                <p className="text-sm text-gray-500">
                  {formatDistanceToNow(post.createdAt, {
                    addSuffix: true,
                    locale: ko,
                  })}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-2 text-sm text-gray-500 bg-white px-3 py-1 rounded-full shadow-sm">
                <Eye className="h-4 w-4" />
                <span>{post.views}</span>
              </div>
              <ReportDialog
                type="post"
                targetId={post.id}
                alreadyReported={post.reportedByCurrentUser}
                onReported={() =>
                  setPost((prev) =>
                    prev ? { ...prev, reportedByCurrentUser: true } : prev
                  )
                }
              />
            </div>
          </div>
          <Badge
            className={`${
              getCategoryInfo(post.category).color
            } border-0 font-medium mb-8 text-sm px-3 py-1`}
          >
            <span className="mr-2">{getCategoryInfo(post.category).icon}</span>
            {getCategoryInfo(post.category).name}
          </Badge>
          <h1 className="text-3xl font-bold mb-1 text-gray-900">
            {post.title}
          </h1>
        </CardHeader>
        <CardContent className="p-8">
          <div className="prose max-w-none mb-4 text-gray-800 leading-relaxed">
            <p className="whitespace-pre-wrap text-medium">{post.content}</p>
          </div>
          {post.media && post.media.length > 0 && (
            <div className="mb-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {post.media.map((media) => (
                  <div
                    key={media.id}
                    className="aspect-video bg-gray-100 rounded-lg overflow-hidden"
                  >
                    {media.type === "image" ? (
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
                    ? "bg-gradient-to-r from-red-500 to-pink-500 text-white shadow-lg"
                    : "hover:bg-red-50 hover:text-red-500 hover:border-red-200"
                }`}
              >
                <Heart
                  className={`h-4 w-4 ${post.isLiked ? "fill-current" : ""}`}
                />
                <span>{post.likes}</span>
              </Button>
              <Button
                variant={post.isBookmarked ? "default" : "outline"}
                size="sm"
                onClick={handleBookmark}
                className={`flex items-center space-x-2 transition-all ${
                  post.isBookmarked
                    ? "bg-gradient-to-r from-yellow-500 to-orange-500 text-white shadow-lg"
                    : "hover:bg-yellow-50 hover:text-yellow-600 hover:border-yellow-200"
                }`}
              >
                <Bookmark
                  className={`h-4 w-4 ${
                    post.isBookmarked ? "fill-current" : ""
                  }`}
                />
                <span>스크랩</span>
              </Button>
              <div className="flex items-center space-x-2 text-sm text-gray-500 bg-gray-50 px-3 py-2 rounded-full">
                <MessageCircle className="h-4 w-4" />
                <span>{comments.length}개 댓글</span>
              </div>
            </div>
            {user && user.id === post.author.id && (
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="hover:bg-blue-50 hover:text-blue-600"
                >
                  <Edit className="h-4 w-4 mr-1" />
                  수정
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="hover:bg-red-50 hover:text-red-600"
                >
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
        <Card className="mb-8 glass-effect border-0 shadow-2xl">
          <CardContent className="p-6">
            <form onSubmit={handleSubmitComment} className="space-y-4">
              <div className="flex items-start space-x-4">
                <Avatar className="h-10 w-10 ring-2 ring-blue-100">
                  <AvatarImage
                    src={user.avatar || "/placeholder.svg"}
                    alt={user.name}
                  />
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
                  className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white shadow-lg">
                  💬 댓글 작성
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* 댓글 목록 */}
      <div className="space-y-3">
        <h3 className="text-lg font-semibold">댓글 {comments.length}개</h3>
        {sortedComments.map((comment, index) => {
          const isTopComment = index < 3 && comment.likes > 0;
          return (
            <Card
              key={comment.id}
              className={`glass-effect border-0 shadow-xl animate-fade-in ${
                isTopComment ? "ring-2 ring-yellow-400" : ""
              }`}
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <CardContent className="p-6">
                <div className="flex items-start space-x-6">
                  <Avatar className="h-10 w-10 ring-2 ring-gray-100">
                    <AvatarImage
                      src={comment.author.avatar || "/placeholder.svg"}
                      alt={comment.author.name}
                    />
                    <AvatarFallback className="bg-gradient-to-r from-green-400 to-blue-500 text-white text-sm">
                      {comment.author.name.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        <p className="font-semibold text-sm text-gray-900">
                          {comment.author.name}
                        </p>
                        <p className="text-xs text-gray-500">
                          {formatDistanceToNow(comment.createdAt, {
                            addSuffix: true,
                            locale: ko,
                          })}
                        </p>
                        {isTopComment && (
                          <Badge className="bg-yellow-400 text-yellow-900 hover:bg-yellow-400 font-bold">
                            BEST
                          </Badge>
                        )}
                      </div>
                    </div>

                    <p className="text-sm mb-4 text-gray-700 leading-relaxed">
                      {comment.content}
                    </p>
                    <Button
                      variant={comment.isLiked ? "default" : "outline"}
                      size="sm"
                      onClick={() => handleLikeComment(comment.id)}
                      className={`flex items-center space-x-2 transition-all ${
                        comment.isLiked
                          ? "bg-gradient-to-r from-red-500 to-pink-500 text-white"
                          : "hover:bg-red-50 hover:text-red-500 hover:border-red-200"
                      }`}
                    >
                      <Heart
                        className={`h-3 w-3 ${
                          comment.isLiked ? "fill-current" : ""
                        }`}
                      />
                      <span>{comment.likes}</span>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
