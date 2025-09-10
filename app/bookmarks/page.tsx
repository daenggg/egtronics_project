"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMyScraps } from "@/hooks/use-scraps";
import { Card, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
// [수정] 홈페이지 카드와 동일한 아이콘들을 가져옵니다.
import { Bookmark, Home, Heart, Eye, MessageCircle } from "lucide-react"; 
import { formatDynamicDate } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { API_BASE } from "@/lib/api-client";
import { Badge } from "@/components/ui/badge"; // Badge 컴포넌트를 import 합니다.
import { categories } from "@/components/category-filter"; 

export default function BookmarksPage() {
  const { data: scraps, isLoading, isError, error } = useMyScraps();
  const router = useRouter();

  const getCategoryNameById = (categoryId: number) => {
    // categories 배열에서 id가 일치하는 항목을 찾습니다.
    // scrap.categoryId는 숫자(number)이고, categories의 id는 문자열(string)이므로 타입을 맞춰줍니다.
    const category = categories.find(cat => cat.id === String(categoryId));
    // 일치하는 카테고리가 있으면 이름을, 없으면 "미분류"를 반환합니다.
    return category ? category.name : "미분류";
  };

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-8">
          {[...Array(6)].map((_, i) => (
            <Skeleton key={i} className="h-[400px] w-full rounded-xl" />
          ))}
        </div>
      );
    }

    if (isError) {
      return (
        <Alert variant="destructive">
          <AlertTitle>오류 발생</AlertTitle>
          <AlertDescription>
            스크랩 목록을 불러오는 중 오류가 발생했습니다: {error.message}
          </AlertDescription>
        </Alert>
      );
    }

    if (!scraps || scraps.length === 0) {
      return (
        <div className="text-center py-20 col-span-full bg-white rounded-xl shadow-md">
          <div className="p-4 bg-blue-100 rounded-full inline-block mb-4">
            <Bookmark className="h-12 w-12 text-blue-500" />
          </div>
          <h3 className="text-xl font-semibold text-gray-800">
            스크랩한 게시글이 없습니다.
          </h3>
          <p className="text-gray-500 mt-2 mb-6 max-w-md mx-auto">
            관심 있는 게시글의 북마크 아이콘을 클릭하여 나중에 다시 볼 수 있도록 저장해보세요.
          </p>
          <Button
            onClick={() => router.push('/')}
            className="bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg hover:shadow-xl transition-all"
          >
            <Home className="mr-2 h-4 w-4" />
            홈으로 돌아가기
          </Button>
        </div>
      );
    }

    // [수정] HomePage의 카드 내부 디자인을 그대로 적용
    return (
// {scraps.map(...) 부분 시작}
<div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-8">
  {scraps.map((scrap) => (
    <Link
      key={scrap.scrapId}
      href={`/posts/${scrap.postId}`}
      className="block"
    >
      <Card className="group h-full flex flex-col glass-effect border-0 shadow-2xl shadow-slate-400/30 cursor-pointer transition-all duration-300 hover:-translate-y-2 hover:shadow-slate-500/40 overflow-hidden rounded-xl">
        {/* === 카드 헤더: 작성자 정보 === */}
        <div className="p-2 flex items-center gap-3 border-b border-slate-100">
          <Avatar className="h-9 w-9">
            <AvatarImage
              src={
                scrap.authorProfilePictureUrl
                  ? `${API_BASE}${scrap.authorProfilePictureUrl}`
                  : "/placeholder.svg"
              }
              alt={scrap.authorNickname}
            />
            <AvatarFallback>
              {scrap.authorNickname.charAt(0)}
            </AvatarFallback>
          </Avatar>
          <div>
            <span className="font-semibold text-sm text-gray-800">
              {scrap.authorNickname}
            </span>
            <p className="text-xs text-gray-400">
              {formatDynamicDate(scrap.postCreatedDate)}
            </p>
          </div>
        </div>

       <div className="px-5 pt-3">
          <Badge variant="outline" className="font-medium border-blue-200 text-blue-600 bg-blue-50">
            {getCategoryNameById(scrap.categoryId)}
          </Badge>
        </div>
        
        {/* === 카드 이미지 === */}
        <div className="relative h-48 w-full bg-gray-100 overflow-hidden">
          <img
            src={
              scrap.postPhotoUrl ? `${API_BASE}${scrap.postPhotoUrl}` : "/sample.jpg"
            }
            alt={scrap.postTitle}
            className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        </div>

        {/* === 카드 본문 (제목, 내용, 통계) === */}
        <div className="p-5 pt-3 flex-grow flex flex-col">
          <div>
            <CardTitle className="text-xl font-bold line-clamp-2 group-hover:text-blue-600 transition-colors">
              {scrap.postTitle}
            </CardTitle>
          </div>
          
          <p className="text-base text-gray-600 mt-3 flex-grow line-clamp-3">
            {scrap.postContent || "자세한 내용은 게시글을 확인해주세요."}
          </p>

          {/* === 통계 푸터 === */}
          <div className="border-t mt-4 pt-4 flex items-center justify-end text-sm text-gray-500">
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1.5" title="좋아요">
                <Heart className="h-4 w-4 text-gray-400" /> {scrap.likeCount}
              </span>
              <span className="flex items-center gap-1.5" title="조회수">
                <Eye className="h-4 w-4 text-gray-400" /> {scrap.viewCount}
              </span>
              <span className="flex items-center gap-1.5" title="댓글">
                <MessageCircle className="h-4 w-4 text-gray-400" /> {scrap.commentCount}
              </span>
            </div>
          </div>
        </div>
      </Card>
    </Link>
  ))}
</div>
// {scraps.map(...) 부분 끝}
// {scraps.map(...) 부분 끝}

    );
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-2xl md:text-4xl font-medium text-gray-900 mb-3 flex items-center gap-3">
          <Bookmark className="h-8 w-8 text-gray-700" />내 스크랩</h2>
        <p className="text-gray-500">{!isLoading && scraps ? `${scraps.length}개` : ''}</p>
      </div>
      {renderContent()}
    </div>
  );
}