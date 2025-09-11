"use client";

import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useState, Suspense } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { Eye, Heart, MessageCircle, Search } from "lucide-react";
import { Card, CardTitle } from "@/components/ui/card";
import { categories as allCategories } from "@/components/category-filter";
import { Input } from "@/components/ui/input";
import Pagination from "@/components/Pagination";
import { usePosts } from "@/hooks/use-posts"; // 수정된 usePosts 훅을 가져옵니다.
import { Skeleton } from "@/components/ui/skeleton";
import { formatDynamicDate } from "@/lib/utils";
import { API_BASE } from "@/lib/api-client";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useTheme } from "next-themes";
import { PostPreview } from "@/lib/types";

function HomePageClient() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const page = searchParams.get("page") || "1";
  const category = searchParams.get("category");
  const keyword = searchParams.get("keyword") || "";
  const sortCode = searchParams.get("sortCode") || "0";

  const [searchInputValue, setSearchInputValue] = useState(keyword);
  const { theme } = useTheme();

  // API 호출을 위한 usePosts 훅
const { data, isLoading, isError, error } = usePosts({
  page: Number(page),
  size: 12,
  sortCode: Number(sortCode),
  category: category ? Number(category) : 0, // 카테고리가 없으면 0 (전체)으로 요청
  keyword: keyword,
});

  // 검색 실행 핸들러
  const handleSearch = () => {
    const params = new URLSearchParams(searchParams);
    if (searchInputValue) {
      params.set("keyword", searchInputValue);
    } else {
      params.delete("keyword");
    }
    params.set("page", "1");
    router.push(`${pathname}?${params.toString()}`);
  };

  // 정렬 옵션 변경 핸들러
  const handleSortChange = (newSortCode: string) => {
    const params = new URLSearchParams(searchParams);
    params.set('sortCode', newSortCode);
    params.set('page', '1');
    router.push(`${pathname}?${params.toString()}`);
  };

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
  const currentPosts = data?.posts || [];
  const totalPosts = data?.totalPostCount || 0;
  const totalPages = Math.ceil(totalPosts / postsPerPage);

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
        <div className="text-center py-20 col-span-full bg-card rounded-xl shadow-md">
          <h3 className="text-xl font-medium text-foreground">
            게시글이 없습니다.
          </h3>
          <p className="text-muted-foreground mt-2">
            {category || keyword
              ? "다른 조건으로 검색해보세요."
              : "첫 번째 게시글을 작성해보세요!"}
          </p>
        </div>
      );
    }

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-8">
            {currentPosts.map((post: PostPreview) => {
            const categoryInfo = getCategoryInfo(post.categoryName);
            return (
                <Link
                key={post.postId}
                href={`/posts/${post.postId}`}
                className="block"
                >
                <Card className="group h-full flex flex-col glass-effect border-0 shadow-2xl shadow-slate-400/30 cursor-pointer transition-all duration-300 hover:-translate-y-2 hover:shadow-slate-500/40 overflow-hidden rounded-xl bg-card">
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
                        <span className="font-semibold text-sm text-foreground">
                        {post.nickname}
                        </span>
                        <p className="text-xs text-muted-foreground">
                        {formatDynamicDate(post.createdDate)}
                        </p>
                    </div>
                    </div>
                    <div className="px-4 pt-2">
                    <Badge
                        variant="outline"
                        className="font-medium text-sm bg-background border-border"
                    >
                        <span className="mr-1.5">{categoryInfo.icon}</span>
                        {categoryInfo.name}
                    </Badge>
                    </div>
                    <div className="relative h-48 w-full bg-muted/50 overflow-hidden">
                    <img
                        src={post.photo
                            ? `${API_BASE}${post.photo}`
                            : theme === 'dark' ? '/sample-invert.jpg' : '/sample.jpg'}
                        alt={post.title}
                        className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    </div>
                    <div className="p-5 pt-3 flex-grow flex flex-col">
                    <div >
                        <CardTitle className="text-xl font-bold line-clamp-2 text-foreground group-hover:text-blue-600 transition-colors">
                        {post.title}
                        </CardTitle>
                    </div>
                    <p className="text-base text-muted-foreground mt-3 flex-grow line-clamp-3">
                        {post.content}
                    </p>

                    <div className="border-t mt-4 pt-4 flex items-center justify-end text-sm text-muted-foreground">
                        <div className="flex items-center gap-4">
                        <span
                            className="flex items-center gap-1.5"
                            title="좋아요"
                        >
                            <Heart className="h-4 w-4 text-red-400" /> {post.likeCount}
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
          <p className="text-lg text-muted-foreground">
            다양한 주제로 소통하고 정보를 나누는 공간입니다
          </p>
        </div>

        {/* 검색 & 정렬 */}
        <div className="flex flex-col sm:flex-row gap-4 sm:items-center">
          <div className="relative flex-grow">
            <Input
              placeholder="제목 또는 본문 키워드로 검색어를 입력하세요"
              value={searchInputValue}
              onChange={(e) => setSearchInputValue(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleSearch();
                }
              }}
              className="force-h-12 text-base pr-12"
            />
            <Button
              type="button"
              onClick={handleSearch}
              className="absolute right-1 top-1/2 -translate-y-1/2 h-10 w-10 p-0"
              variant="ghost"
            ><Search className="h-5 w-5" /></Button>
          </div>
          <Select
            value={sortCode}
            onValueChange={handleSortChange}
          >
            <SelectTrigger className="w-full sm:w-40 h-12 text-base flex items-center px-3">
              <SelectValue placeholder="정렬" />
            </SelectTrigger>
            <SelectContent className="bg-card">
              <SelectItem value="0" className="bg-card">최신순</SelectItem>
              <SelectItem value="1" className="bg-card">추천순</SelectItem>
              <SelectItem value="2" className="bg-card">조회순</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        {/* 게시글 리스트 */}
        {renderContent()}

        {/* 페이지네이션 */}
        {totalPages > 1 && (
          <Pagination
            currentPage={Number(page)}
            totalPages={totalPages}
            onPageChange={(newPage) => {
              const params = new URLSearchParams(searchParams.toString());
              params.set("page", String(newPage));
              router.push(`${pathname}?${params.toString()}`);
            }}
          />
        )}
      </div>
    </div>
  );
}

export default function HomePageClientWrapper() {
  return (
    <Suspense
      fallback={
        <div className="container mx-auto px-4 py-8">
          <p className="text-center">게시판을 불러오는 중입니다...</p> {/* You can replace this with a proper Skeleton component */}
        </div>
      }
    >
      <HomePageClient />
    </Suspense>
  );
}