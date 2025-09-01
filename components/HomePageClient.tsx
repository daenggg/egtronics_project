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
  const [searchQuery, setSearchQuery] = useState("");
  const [sortOption, setSortOption] = useState("latest");
  const [currentPage, setCurrentPage] = useState(1);

  // 실제 API를 통해 데이터를 가져옵니다.
  const { data: posts, isLoading, isError, error } = usePosts();

  // 카테고리가 URL로 바뀌면 페이지 초기화
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedCategoryId]);

  const getCategoryInfo = (categoryName: string) => {
    return (
      allCategories.find((cat) => cat.name === categoryName) || {
        id: "unknown",
        name: "미분류",
        icon: "📁",
      }
    );
  };
  const postsPerPage = 12;

  // 필터 + 정렬된 데이터
  const filteredPosts = useMemo(() => {
    if (!posts) return [];
    let data: PostPreview[] = [...posts];

    // 5회 이상 신고된 게시물은 목록에서 숨깁니다.
    data = data.filter((post) => (post.reportCount ?? 0) < 5);

    if (selectedCategoryId) {
      const category = allCategories.find((c) => c.id === selectedCategoryId);
      if (category) {
        data = data.filter((post) => post.categoryName === category.name);
      }
    }

    if (searchQuery.trim()) {
      const lowercasedQuery = searchQuery.toLowerCase();
      data = data.filter(
        (post) =>
          post.title.toLowerCase().includes(lowercasedQuery) ||
          (post.content && post.content.toLowerCase().includes(lowercasedQuery))
      );
    }

    if (sortOption === "latest") {
      data.sort(
        (a, b) =>
          new Date(b.createdDate).getTime() - new Date(a.createdDate).getTime()
      );
    } else if (sortOption === "views") {
      data.sort((a, b) => b.viewCount - a.viewCount);
    } else if (sortOption === "likes") {
      data.sort((a, b) => b.likeCount - a.likeCount);
    }

    return data;
  }, [posts, searchQuery, sortOption, selectedCategoryId]);

  // 현재 페이지 데이터
  const totalPages = Math.ceil(filteredPosts.length / postsPerPage);
  const currentPosts = filteredPosts.slice(
    (currentPage - 1) * postsPerPage,
    currentPage * postsPerPage
  );

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
              <Card className="group h-full flex flex-col glass-effect border-0 shadow-lg cursor-pointer transition-transform duration-300 hover:-translate-y-2 hover:shadow-2xl overflow-hidden rounded-xl">
                <div className="aspect-video w-full bg-gray-100 flex items-center justify-center overflow-hidden">
                  <img
                    src={
                      post.photo ? `${API_BASE}${post.photo}` : "/sample.jpg"
                    }
                    alt={post.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <div className="p-5 flex-grow flex flex-col">
                  <div>
                    <Badge
                      variant="secondary"
                      className="mb-3 font-medium self-start"
                    >
                      <span className="mr-1.5">{categoryInfo.icon}</span>
                      {categoryInfo.name}
                    </Badge>
                    <CardTitle className="text-xl font-bold line-clamp-2 group-hover:text-blue-600 transition-colors">
                      {post.title}
                    </CardTitle>
                  </div>

                  <p className="text-base text-gray-600 mt-3 flex-grow line-clamp-3">
                    {post.content}
                  </p>

                  <div className="border-t mt-4 pt-4 flex items-center justify-between text-sm text-gray-500">
                    <div className="flex items-center gap-2">
                      <Avatar className="h-8 w-8">
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
                        <span className="font-semibold text-gray-800">
                          {post.nickname}
                        </span>
                        <p className="text-xs text-gray-400">
                          {formatDynamicDate(post.createdDate)}
                        </p>
                      </div>
                    </div>
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
              <SelectItem value="latest">최신순</SelectItem>
              <SelectItem value="views">조회순</SelectItem>
              <SelectItem value="likes">추천순</SelectItem>
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
