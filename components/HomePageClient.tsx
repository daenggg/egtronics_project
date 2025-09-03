"use client";

import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useState, useMemo, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Eye, Heart, Image as ImageIcon, MessageCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { categories as allCategories } from "@/components/category-filter";
import { Input } from "@/components/ui/input";
import Pagination from "@/components/Pagination";
import { usePosts } from "@/hooks/use-posts";
import { PostPreview } from "@/lib/types";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDynamicDate } from "@/lib/utils";
import { API_BASE } from "@/lib/api-client";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

function HomePageClientContent() {
  const searchParams = useSearchParams();
  const selectedCategoryId = searchParams.get("category");
  const q = searchParams.get("q");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortOption, setSortOption] = useState("0"); // 'latest' -> '0'
  const [currentPage, setCurrentPage] = useState(1);
  const postsPerPage = 12;

  const sortCodeMapping: { [key: string]: number } = {
    latest: 0,
    likes: 1,
    views: 2,
  };

  // API를 통해 데이터를 가져옵니다.
  const { data, isLoading, isError, error } = usePosts({
    page: currentPage,
    size: postsPerPage,
    sortCode: sortCodeMapping[sortOption] ?? 0,
    category: selectedCategoryId ?? undefined,
    q: q ?? undefined,
  });

  // 카테고리나 검색어가 바뀌면 페이지를 1로 초기화
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedCategoryId, q]);

  const getCategoryInfo = (categoryName: string) => {
    return (
      allCategories.find((cat) => cat.name === categoryName) || {
        id: "unknown",
        name: "미분류",
        icon: "📁",
      }
    );
  };

  const currentPosts = data?.posts || [];
  const totalPosts = data?.totalPostCount || 0;
  const totalPages = Math.ceil(totalPosts / postsPerPage);

  // 검색창 입력을 위한 상태 동기화
  useEffect(() => setSearchQuery(q || ""), [q]);

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
            게시글 목록을 불러오는 중 오류가 발생했습니다: {error?.message}
          </AlertDescription>
        </Alert>
      );
    }

    if (currentPosts.length === 0) {
      return (
        <div className="text-center py-20 col-span-full">
          <h3 className="text-xl font-medium text-gray-800">
            게시글이 없습니다.
          </h3>
          <p className="text-gray-500 mt-2">
            {selectedCategoryId || searchQuery
              ? "다른 조건으로 검색해보세요."
              : "첫 번째 게시글을 작성해보세요!"}
          </p>
        </div>
      );
    }

    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-8">
        {currentPosts.map((post) => {
          const categoryInfo = getCategoryInfo(post.categoryName);
          return (
            <Link
              key={post.postId}
              href={`/posts/${post.postId}`}
              className="block"
            >
              {/* --- ✅ 수정점: hover 시 그림자를 보라색에서 진한 회색으로 변경 --- */}
              <Card className="group h-full flex flex-col glass-effect border-0 shadow-2xl shadow-slate-400/30 cursor-pointer transition-all duration-300 hover:-translate-y-2 hover:shadow-slate-500/40 overflow-hidden rounded-xl">
                {/* --- ✅ 수정점: 작성자 정보를 카드 상단으로 이동 --- */}
               <div className="p-2 flex items-center gap-3 border-b border-slate-100">
                  <Avatar className="h-9 w-9">
                    <AvatarImage
                      src={
                        post.authorProfilePicture
                          ? `${API_BASE}${post.authorProfilePicture}`
                          : "/placeholder.svg"
                      }
                      alt={post.nickname}
                    />
                    <AvatarFallback>
                      {post.nickname.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <span className="font-semibold text-sm text-gray-800">
                      {post.nickname}
                    </span>
                    <p className="text-xs text-gray-400">
                      {formatDynamicDate(post.createdDate)}
                    </p>
                  </div>
                </div>
                {/* --- ✅ 수정점: 카테고리 배지를 사진 위로 이동 --- */}
                <div className="px-4 pt-2">
                  <Badge
                    variant="secondary"
                    className="font-medium text-sm"
                  >
                    <span className="mr-1.5">{categoryInfo.icon}</span>
                    {categoryInfo.name}
                  </Badge>
                </div>
                {/* --- ✅ 수정점: 사진을 감싸는 div에 패딩(p-4) 추가 --- */}
                <div className="aspect-video w-full bg-gray-100 flex items-center justify-center overflow-hidden px-4 pt-3 pb-2">
                  <img
                    src={
                      post.photo ? `${API_BASE}${post.photo}` : "/sample.jpg"
                    }
                    alt={post.title}
                    // --- ✅ 수정점: 이미지에 둥근 모서리(rounded-lg) 추가 ---
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 rounded-lg"
                  />
                </div>
                <div className="p-5 pt-3 flex-grow flex flex-col">
                  <div>
                    <CardTitle className="text-xl font-bold line-clamp-2 group-hover:text-blue-600 transition-colors">
                      {post.title}
                    </CardTitle>
                  </div>

                  <p className="text-base text-gray-600 mt-3 flex-grow line-clamp-3">
                    {post.content}
                  </p>

                  {/* --- ✅ 수정점: 게시물 통계 정보를 하단으로 이동 --- */}
                  <div className="border-t mt-4 pt-4 flex items-center justify-end text-sm text-gray-500">
                    <div className="flex items-center gap-4">
                      <span
                        className="flex items-center gap-1.5"
                        title="좋아요"
                      >
                        <Heart className="h-4 w-4" /> {post.likeCount}
                      </span>
                      <span
                        className="flex items-center gap-1.5"
                        title="조회수"
                      >
                        <Eye className="h-4 w-4" /> {post.viewCount}
                      </span>
                      <span className="flex items-center gap-1.5" title="댓글">
                        <MessageCircle className="h-4 w-4" />{" "}
                        {post.commentCount ?? 0}
                      </span>
                    </div>
                  </div>
                </div>
              </Card>
            </Link>
          );
        })}
      </div>
    );
  };

  return (
    <div className="container mx-auto px-4 pt-4 pb-8">
      <div className="space-y-8 min-w-0">
        {/* 헤더 */}
        <div>
          <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-pink-500 to-purple-500 bg-clip-text text-transparent mb-3">
            egtronics 오늘의 게시판
          </h1>
          <p className="text-lg text-gray-600">
            다양한 주제로 소통하고 정보를 나누는 공간입니다
          </p>
        </div>

        {/* 검색 & 정렬 */}
        {/* --- ✅ 수정점: sm:items-center 추가 --- */}
        <div className="flex flex-col sm:flex-row gap-4 sm:items-center">
          <Input
            placeholder="제목 또는 본문 키워드로 검색어를 입력하세요"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
            className="h-12 text-base"
          />
          <Select value={sortOption}onValueChange={(value) => {setSortOption(value);
              setCurrentPage(1);
            }}
          >
            {/* --- ✅ 수정점: h-16을 h-12로 변경 --- */}
            <SelectTrigger className="w-full sm:w-40 h-12 text-base">
              <SelectValue placeholder="정렬" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="0">최신순</SelectItem> {/* 'latest'에 해당 */}
              <SelectItem value="2">조회순</SelectItem> {/* 'views'에 해당 */}
              <SelectItem value="1">추천순</SelectItem> {/* 'likes'에 해당 */}
            </SelectContent>
          </Select>
        </div>
        {/* 게시글 리스트 */}
        {renderContent()}

        {/* 페이지네이션 */}
        {totalPages > 1 && (
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={(page) => setCurrentPage(page)}
          />
        )}
      </div>
    </div>
  );
}

export default function HomePageClient() {
  return (
    <Suspense
      fallback={
        <div className="container mx-auto px-4 py-8">
          <p className="text-center">게시판을 불러오는 중입니다...</p>
        </div>
      }
    >
      <HomePageClientContent />
    </Suspense>
  );
}
