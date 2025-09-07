"use client";

import { useState, useMemo, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
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
import { formatDynamicDate } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { ReportDialog } from "@/components/report-dialog";
import { categories } from "@/components/category-filter";
import { usePost, useToggleLike, useDeletePost } from "@/hooks/use-posts";
import { useToggleScrap } from "@/hooks/use-scraps";
import {
  useComments,
  useCreateComment,
  useUpdateComment,
  useDeleteComment,
  useToggleCommentLike,
} from "@/hooks/use-comments";
import { PostWithDetails, CommentWithDetails } from "@/lib/types";
import { API_BASE } from "@/lib/api-client";

export default function PostDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user, loading: isAuthLoading } = useAuth();
  const { toast } = useToast();
  const postId = params.id as string;

  const {
    data: post,
    isLoading: isPostLoading,
    error: postError,
  } = usePost(postId);
  const comments: CommentWithDetails[] = post?.comments || [];

  const { toggleLike } = useToggleLike();
  const { toggleScrap } = useToggleScrap();
  const { mutate: createComment, isPending: isCreatingComment } = useCreateComment();
  const { mutate: updateComment, isPending: isUpdatingComment } = useUpdateComment();
  const { mutate: deleteComment } = useDeleteComment();
  const { toggleCommentLike } = useToggleCommentLike();
  const { mutate: deletePost } = useDeletePost();

  const [newComment, setNewComment] = useState("");
  const [editingCommentId, setEditingCommentId] = useState<number | null>(null);
  const [editingCommentContent, setEditingCommentContent] = useState("");

  const sortedComments = useMemo(() => {
    if (!post?.comments || post.comments.length === 0) {
      return [];
    }
    const isBestCommentFeatureActive = (post.comments.length || 0) >= 10;
    if (!isBestCommentFeatureActive) {
      return [...post.comments].sort(
        (a, b) => new Date(a.createdDate).getTime() - new Date(b.createdDate).getTime()
      );
    }
    const potentialBest = post.comments.filter((c) => c.likeCount >= 5);
    potentialBest.sort((a, b) => {
      if (a.likeCount !== b.likeCount) return b.likeCount - a.likeCount;
      const dateDiff = new Date(b.createdDate).getTime() - new Date(a.createdDate).getTime();
      if (dateDiff !== 0) return dateDiff;
      return a.commentId - b.commentId;
    });
    const bestComments = potentialBest.slice(0, 3);
    const bestCommentIds = new Set(bestComments.map((c) => c.commentId));
    const otherComments = post.comments.filter((c) => !bestCommentIds.has(c.commentId));
    otherComments.sort((a, b) => new Date(a.createdDate).getTime() - new Date(b.createdDate).getTime());
    return [...bestComments, ...otherComments];
  }, [post?.comments]);

  useEffect(() => {
    const timer = setTimeout(() => {
      const hash = window.location.hash;
      if (hash) {
        const elementId = hash.substring(1);
        const element = document.getElementById(elementId);
        if (element) {
          element.scrollIntoView({ behavior: "smooth", block: "center" });
          element.classList.add("bg-blue-100", "transition-all", "duration-500");
          setTimeout(() => element.classList.remove("bg-blue-100"), 2500);
        }
      }
    }, 100);
    return () => clearTimeout(timer);
  }, [postId]);

  const handleLikePost = () => {
    if (!user) {
      toast({ title: "로그인 필요", description: "좋아요를 누르려면 로그인해주세요.", variant: "destructive", duration: 2000 });
      return;
    }
    if (!post) return;
    toggleLike(String(post.postId), post.isLiked);
  };

  const handleLikeComment = (commentId: number) => {
    if (!user) {
      toast({ title: "로그인 필요", description: "좋아요를 누르려면 로그인해주세요.", variant: "destructive", duration: 2000 });
      return;
    }
    const comment = comments.find((c) => c.commentId === commentId);
    if (!comment || !post) return;
    toggleCommentLike({ postId: post.postId, commentId: comment.commentId, isLiked: comment.isLiked });
  };

  const handleEditComment = (comment: CommentWithDetails) => {
    setEditingCommentId(comment.commentId);
    setEditingCommentContent(comment.content);
  };

  const handleCancelEdit = () => {
    setEditingCommentId(null);
    setEditingCommentContent("");
  };

  const handleUpdateComment = () => {
    if (!post || editingCommentId === null || !editingCommentContent.trim()) return;
    updateComment({ postId: post.postId, commentId: editingCommentId, data: { content: editingCommentContent.trim() } }, {
      onSuccess: () => handleCancelEdit(),
    });
  };

  const handleDeleteComment = (commentId: number) => {
    if (!post || !window.confirm("정말로 이 댓글을 삭제하시겠습니까?")) return;
    deleteComment({ postId: post.postId, commentId });
  };

  const handleSubmitComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast({ title: "로그인 필요", description: "댓글을 작성하려면 로그인해주세요.", variant: "destructive", duration: 2000 });
      return;
    }
    if (!post || !newComment.trim()) return;
    createComment({ postId: post.postId, data: { content: newComment.trim() } }, {
      onSuccess: () => {
        setNewComment("");
      },
    });
  };

  if (isAuthLoading || isPostLoading) return <div className="container mx-auto px-4 py-8">로딩 중...</div>;
  if (postError) return <div className="container mx-auto px-4 py-8">게시글을 불러오는 중 오류가 발생했습니다: {postError.message}</div>;
  if (!post) return <div className="container mx-auto px-4 py-8">게시글을 찾을 수 없습니다.</div>;

  const getCategoryInfo = (categoryId: number) => {
    return categories.find((cat) => cat.id === String(categoryId)) || categories[0];
  };

  const handleScrap = () => {
    if (!user) {
      toast({ title: "로그인 필요", description: "스크랩하려면 로그인해주세요.", variant: "destructive", duration: 2000 });
      return;
    }
    if (!post) return;
    // 👇 [수정] isBookmarked -> isScrapped 로 변수명 통일
    toggleScrap(String(post.postId), post.isScrapped);
  };

  const handleDeletePost = () => {
    if (!post) return;
    if (!window.confirm("정말로 이 게시글을 삭제하시겠습니까?")) return;
    deletePost(String(post.postId), {
      onSuccess: () => {
        toast({ title: "게시글이 삭제되었습니다." });
        router.push("/");
      },
    });
  };

  const isMyPost = user?.userId === post?.author?.userId;

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <Card className="mb-8 glass-effect border-0 shadow-2xl overflow-hidden">
        <CardHeader className="rounded-t-lg p-4 sm:p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center space-x-4">
              <Avatar className="h-12 w-12 ring-2 ring-blue-200">
                <AvatarImage src={post.author.profilePicture ? `${API_BASE}${post.author.profilePicture}` : "/images.png"} alt={post.author.nickname} />
                <AvatarFallback className="bg-gradient-to-r from-blue-500 to-purple-500 text-white">{post.author.nickname.charAt(0)}</AvatarFallback>
              </Avatar>
              <div>
                <p className="font-semibold text-gray-900">{post.author.nickname}</p>
                <p className="text-sm text-gray-500">{formatDynamicDate(post.createdDate)}</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-2 text-sm text-gray-500 bg-white px-3 py-1 rounded-full shadow-sm">
                <Eye className="h-4 w-4" />
                <span>{post.viewCount}</span>
              </div>
              <div className={!user || isMyPost ? "pointer-events-none opacity-50" : ""}>
                <ReportDialog type="post" targetId={String(post.postId)} alreadyReported={post.reportedByCurrentUser} />
              </div>
            </div>
          </div>
          <Badge className="border border-slate-200 font-medium mb-4 text-sm px-3 py-1">
            <span className="mr-2">{getCategoryInfo(post.categoryId).icon}</span>
            {getCategoryInfo(post.categoryId).name}
          </Badge>
          <h1 className="text-2xl font-bold text-gray-900 leading-tight">{post.title}</h1>
        </CardHeader>
        <CardContent className="p-4 pt-2 sm:p-6 sm:pt-2">
          <div className="prose max-w-none mb-8 text-gray-800 leading-relaxed">
            <p className="whitespace-pre-wrap text-base">{post.content}</p>
          </div>
          {post.photo && (
            <div className="mb-8">
              <div className="grid grid-cols-1 gap-4">
                <div className="aspect-video bg-gray-100 rounded-lg overflow-hidden">
                  <img src={post.photo ? `${API_BASE}${post.photo}` : "/images.png"} alt="Post media" className="w-full h-full object-cover hover:scale-105 transition-transform cursor-pointer" />
                </div>
              </div>
            </div>
          )}
          <div className="flex flex-wrap items-center justify-between gap-4 pt-6 border-t border-gray-100">
            <div className="flex flex-wrap items-center gap-2 sm:gap-4">
              <Button variant={post.isLiked ? "default" : "outline"} size="sm" onClick={handleLikePost} className={`flex items-center space-x-2 transition-all ${post.isLiked ? "bg-gradient-to-r from-red-500 to-pink-500 text-white shadow-lg" : "hover:bg-red-50 hover:text-red-500 hover:border-red-200"}`}>
                <Heart className={`h-4 w-4 ${post.isLiked ? "fill-current" : ""}`} />
                <span>{post.likeCount}</span>
              </Button>
              {/* 👇 [수정] isBookmarked -> isScrapped, handleBookmark -> handleScrap */}
              <Button variant={post.isScrapped ? "default" : "outline"} size="sm" onClick={handleScrap} className={`flex items-center space-x-2 transition-all ${post.isScrapped ? "bg-gradient-to-r from-yellow-500 to-orange-500 text-white shadow-lg" : "hover:bg-yellow-50 hover:text-yellow-600 hover:border-yellow-200"}`}>
                <Bookmark className={`h-4 w-4 ${post.isScrapped ? "fill-current" : ""}`} />
                <span>스크랩</span>
              </Button>
              <div className="flex items-center space-x-2 text-sm text-gray-500 bg-gray-50 px-3 py-2 rounded-full">
                <MessageCircle className="h-4 w-4" />
                <span>{post.comments?.length || 0}개 댓글</span>
              </div>
            </div>
            {isMyPost && (
              <div className="flex space-x-2">
                <Button variant="outline" size="sm" className="hover:bg-blue-50 hover:text-blue-600" onClick={() => router.push(`/posts/${post.postId}/edit`)}>
                  <Edit className="h-4 w-4 mr-1" /> 수정
                </Button>
                <Button variant="outline" size="sm" className="hover:bg-red-50 hover:text-red-600" onClick={handleDeletePost}>
                  <Trash2 className="h-4 w-4 mr-1" /> 삭제
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
      
      {/* 댓글 작성, 댓글 목록은 변경 없음 */}
      {/* ... */}
    </div>
  );
}