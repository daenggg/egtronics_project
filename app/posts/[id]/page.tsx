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
import { formatDistanceToNow } from "date-fns";
import { ko } from "date-fns/locale";
import { useToast } from "@/hooks/use-toast";
import { ReportDialog } from "@/components/report-dialog";
import { categories } from "@/components/category-filter";
import { usePost, useToggleLike, useDeletePost } from "@/hooks/use-posts";
import { useToggleScrap } from "@/hooks/use-scraps";
import {
  useComments,
  useCreateComment,
  useToggleCommentLike,
} from "@/hooks/use-comments";
import { PostWithDetails, CommentWithDetails } from "@/lib/types";

export default function PostDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user, loading: isAuthLoading } = useAuth();
  const { toast } = useToast();
  const postId = params.id as string;

  // 데이터 페칭 (React Query Hooks 사용)
  const { data: post, isLoading: isPostLoading, error: postError } = usePost(postId);
  const { data: commentData, isLoading: areCommentsLoading } = useComments(postId);
  const comments: CommentWithDetails[] = commentData?.comments || [];

  // 뮤테이션 (데이터 변경) Hooks
  const { toggleLike } = useToggleLike();
  const { toggleScrap } = useToggleScrap();
  const { mutate: createComment, isPending: isCreatingComment } = useCreateComment();
  const { toggleCommentLike } = useToggleCommentLike();
  const { mutate: deletePost } = useDeletePost();

  const [newComment, setNewComment] = useState("");

  const sortedComments = useMemo(() => {
    if (!comments || comments.length === 0) {
      return [];
    }

    // 베스트 댓글 기능 활성화 조건
    const isBestCommentFeatureActive = (commentData?.totalCount || 0) >= 10;

    if (!isBestCommentFeatureActive) {
      // 베스트 댓글 기능 비활성화 시, 모든 댓글을 생성일 오름차순(오래된 순)으로 정렬
      return [...comments].sort(
        (a, b) => new Date(a.createdDate).getTime() - new Date(b.createdDate).getTime()
      );
    }

    // 베스트 댓글과 나머지 댓글 분리 및 정렬
    const potentialBest = comments.filter((c) => c.likeCount >= 5);
    potentialBest.sort((a, b) => {
      if (a.likeCount !== b.likeCount) return b.likeCount - a.likeCount; // 좋아요 많은 순
      const dateDiff = new Date(b.createdDate).getTime() - new Date(a.createdDate).getTime(); // 최신순
      if (dateDiff !== 0) return dateDiff;
      return a.commentId - b.commentId; // 고유 ID로 최종 정렬
    });

    const bestComments = potentialBest.slice(0, 3);
    const bestCommentIds = new Set(bestComments.map((c) => c.commentId));

    const otherComments = comments.filter((c) => !bestCommentIds.has(c.commentId));

    // 나머지 댓글은 생성일 오름차순(오래된 순)으로 정렬
    otherComments.sort(
      (a, b) => new Date(a.createdDate).getTime() - new Date(b.createdDate).getTime()
    );

    return [...bestComments, ...otherComments];
  }, [comments, commentData?.totalCount]);

  // URL 해시(#)를 감지하여 해당 댓글로 스크롤하고 강조하는 로직
  useEffect(() => {
    // setTimeout을 사용하여 렌더링이 완료된 후 스크롤을 시도합니다.
    const timer = setTimeout(() => {
      const hash = window.location.hash;
      if (hash) {
        const elementId = hash.substring(1); // '#' 제거
        const element = document.getElementById(elementId);
        if (element) {
          element.scrollIntoView({ behavior: "smooth", block: "center" });
          element.classList.add("bg-blue-100", "transition-all", "duration-500");
          setTimeout(() => element.classList.remove("bg-blue-100"), 2500); // 2.5초 후 강조 효과 제거
        }
      }
    }, 100);
    return () => clearTimeout(timer); // 컴포넌트 언마운트 시 타이머 정리
  }, [postId]); // postId가 바뀔 때마다 (즉, 다른 게시물로 이동 시) 이 효과를 재실행

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
    if (!post) return;
    toggleLike(String(post.postId), post.isLiked);
  };

  const handleLikeComment = (commentId: number) => {
    if (!user) {
      toast({
        title: "로그인 필요",
        description: "좋아요를 누르려면 로그인해주세요.",
        variant: "destructive",
        duration: 2000,
      });
      return;
    }
    const comment = comments.find((c) => c.commentId === commentId);
    if (!comment || !post) return;

    toggleCommentLike({ postId: post.postId, commentId: comment.commentId, isLiked: comment.isLiked });
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
    if (!post || !newComment.trim()) return;

    createComment(
      { postId: post.postId, data: { content: newComment.trim() } },
      {
        onSuccess: () => {
          setNewComment(""); // 성공 시 입력창 비우기
        },
      }
    );
  };

  if (isAuthLoading || isPostLoading || areCommentsLoading)
    return <div className="container mx-auto px-4 py-8">로딩 중...</div>;
  if (postError)
    return (
      <div className="container mx-auto px-4 py-8">
        게시글을 불러오는 중 오류가 발생했습니다: {postError.message}
      </div>
    );
  if (!post)
    return (
      <div className="container mx-auto px-4 py-8">
        게시글을 찾을 수 없습니다.
      </div>
    );

  const getCategoryInfo = (categoryId: number) => {
    return categories.find((cat) => cat.id === String(categoryId)) || categories[0];
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
    if (!post) return;
    toggleScrap(String(post.postId), post.isBookmarked);
  };

  const handleDeletePost = () => {
    if (!post) return;
    // 사용자에게 확인을 구하는 로직을 추가할 수 있습니다.
    // if (!window.confirm("정말로 이 게시글을 삭제하시겠습니까?")) return;
    deletePost(String(post.postId), {
      onSuccess: () => {
        toast({ title: "게시글이 삭제되었습니다." });
        router.push("/"); // 또는 게시글 목록 페이지로 이동
      },
    });
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* 게시글 */}
      <Card className="mb-8 glass-effect border-0 shadow-2xl">
        <CardHeader className="rounded-t-lg p-4 sm:p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-4">
              <Avatar className="h-12 w-12 ring-2 ring-blue-200">
                <AvatarImage
                  src={post.author.profilePicture || "/placeholder.svg"}
                  alt={post.author.nickname}
                />
                <AvatarFallback className="bg-gradient-to-r from-blue-500 to-purple-500 text-white">
                  {post.author.nickname.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="font-semibold text-gray-900">
                  {post.author.nickname}
                </p>
                <p className="text-sm text-gray-500">
                  {formatDistanceToNow(new Date(post.createdDate), {
                    addSuffix: true,
                    locale: ko,
                  })}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-2 text-sm text-gray-500 bg-white px-3 py-1 rounded-full shadow-sm">
                <Eye className="h-4 w-4" />
                <span>{post.viewCount}</span>
              </div>
              <ReportDialog
                type="post"
                targetId={String(post.postId)}
                alreadyReported={post.reportedByCurrentUser}
              />
            </div>
          </div>
          <Badge
            className={`${
              getCategoryInfo(post.categoryId).color
            } border-0 font-medium mb-8 text-sm px-3 py-1`}
          >
            <span className="mr-2">{getCategoryInfo(post.categoryId).icon}</span>
            {getCategoryInfo(post.categoryId).name}
          </Badge>
          <h1 className="text-3xl font-bold mb-1 text-gray-900">
            {post.title}
          </h1>
        </CardHeader>
        <CardContent className="p-4 sm:p-6">
          <div className="prose max-w-none mb-4 text-gray-800 leading-relaxed">
            <p className="whitespace-pre-wrap text-medium">{post.content}</p>
          </div>
          {post.photo && (
            <div className="mb-8">
              <div className="grid grid-cols-1 gap-4">
                <div className="aspect-video bg-gray-100 rounded-lg overflow-hidden">
                  {/* Assuming photo is always an image for now */}
                  <img
                    src={post.photo || "/placeholder.svg"}
                        alt="Post media"
                        className="w-full h-full object-cover hover:scale-105 transition-transform cursor-pointer"
                      />
                </div>
              </div>
            </div>
          )}
          <div className="flex flex-wrap items-center justify-between gap-4 pt-6 border-t border-gray-100">
            <div className="flex flex-wrap items-center gap-2 sm:gap-4">
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
                <span>{post.likeCount}</span>
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
                <span>{commentData?.totalCount || 0}개 댓글</span>
              </div>
            </div>
            {user && user.userId === post.author.userId && (
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
                  onClick={handleDeletePost}
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
          <CardContent className="p-4 sm:p-6">
            <form onSubmit={handleSubmitComment} className="space-y-4">
              <div className="flex items-start space-x-4">
                <Avatar className="h-10 w-10 ring-2 ring-blue-100">
                  <AvatarImage
                    src={user.profilePicture || "/placeholder.svg"}
                    alt={user.nickname}
                  />
                  <AvatarFallback className="bg-gradient-to-r from-blue-500 to-purple-500 text-white text-sm">
                    {user.nickname.charAt(0)}
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
                  disabled={isCreatingComment}
                >
                  💬 댓글 작성
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* 댓글 목록 */}
      <div className="space-y-3">
        <h3 className="text-lg font-semibold">댓글 {commentData?.totalCount || 0}개</h3>
        {sortedComments.map((comment, index) => {
          // 댓글이 10개 이상이고, 상위 3개 댓글의 좋아요가 5개 이상인 경우 베스트 댓글로 표시
          const isTopComment =
            (commentData?.totalCount || 0) >= 10 && index < 3 && comment.likeCount >= 5;
          return (
            <Card
              key={comment.commentId}
              id={`comment-${comment.commentId}`}
              className={`glass-effect border-0 shadow-xl animate-fade-in ${
                isTopComment ? "ring-2 ring-yellow-400" : ""
              }`}
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <CardContent className="p-4 sm:p-6">
                <div className="flex items-start space-x-6">
                  <Avatar className="h-10 w-10 ring-2 ring-gray-100">
                    <AvatarImage
                      src={comment.author.profilePicture || "/placeholder.svg"}
                      alt={comment.author.nickname}
                    />
                    <AvatarFallback className="bg-gradient-to-r from-green-400 to-blue-500 text-white text-sm">
                      {comment.author.nickname.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        <p className="font-semibold text-sm text-gray-900">
                          {comment.author.nickname}
                        </p>
                        <p className="text-xs text-gray-500">
                          {formatDistanceToNow(new Date(comment.createdDate), {
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
                      onClick={() => handleLikeComment(comment.commentId)}
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
                      <span>{comment.likeCount}</span>
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