"use client";

import Link from "next/link";
import { useState, useMemo, useEffect, Suspense, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { formatDistanceToNow } from "date-fns";
import { ko } from "date-fns/locale";
import { Eye, Heart, MessageCircle } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { categories as allCategories } from "@/components/category-filter";
import { Input } from "@/components/ui/input";
import Pagination from "@/components/Pagination";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Post {
  id: string;
  title: string;
  content: string;
  author: {
    id: string;
    name: string;
    avatar?: string;
  };
  createdAt: Date;
  views: number;
  likes: number;
  comments: number;
  category: string;
}

const categoryIds = [
  "announcement",
  "general",
  "tech",
  "study",
  "project",
  "career",
  "qna",
  "free",
];

const mockPosts: Post[] = Array.from({ length: 200 }, (_, i) => ({
  id: String(i + 1),
  title: `게시글 ${i + 1}`,
  content: `이것은 게시글 ${
    i + 1
  }의 내용입니다. 다양한 정보와 경험을 공유합니다.`,
  author: {
    id: `u${(i % 5) + 1}`,
    name: `작성자 ${(i % 5) + 1}`,
  },
  category: categoryIds[i % categoryIds.length],
  createdAt: new Date(Date.now() - 1000 * 60 * 60 * (i * 3)),
  views: Math.floor(Math.random() * 500),
  likes: Math.floor(Math.random() * 50),
  comments: Math.floor(Math.random() * 15),
}));

// The main content component that uses client-side hooks
function HomePageClientContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const selectedCategory = searchParams.get("category");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortOption, setSortOption] = useState("latest");
  const [currentPage, setCurrentPage] = useState(1);

  // 페이지 새로고침 시 카테고리 선택 해제
  useEffect(() => {
    // 이 코드는 클라이언트에서만 실행됩니다.
    if (typeof window !== "undefined") {
      // PerformanceNavigationTiming[] 타입으로 캐스팅하여 'type' 속성 오류를 해결합니다.
      const navigationEntries = performance.getEntriesByType("navigation") as PerformanceNavigationTiming[];
      if (navigationEntries.length > 0 && navigationEntries[0].type === "reload") {
        if (searchParams.has('category')) {
          router.replace('/', { scroll: false });
        }
      }
    }
  }, [router, searchParams]);

  // 카테고리가 URL로 바뀌면 페이지 초기화
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedCategory]);

  const getCategoryInfo = (categoryId: string) => {
    return (
      allCategories.find((cat) => cat.id === categoryId) || { id: "unknown", name: "미분류", icon: "📁" }
    );
  };
  const postsPerPage = 12;

  // 필터 + 정렬된 데이터
  const filteredPosts = useMemo(() => {
    let data = [...mockPosts];

    if (selectedCategory) {
      data = data.filter((post) => post.category === selectedCategory);
    }

    if (searchQuery.trim()) {
      data = data.filter(
        (post) =>
          post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          post.content.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (sortOption === "latest") {
      data.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    } else if (sortOption === "views") {
      data.sort((a, b) => b.views - a.views);
    } else if (sortOption === "likes") {
      data.sort((a, b) => b.likes - a.likes);
    }

    return data;
  }, [searchQuery, sortOption, selectedCategory]);

  // 현재 페이지 데이터
  const totalPages = Math.ceil(filteredPosts.length / postsPerPage);
  const currentPosts = filteredPosts.slice(
    (currentPage - 1) * postsPerPage,
    currentPage * postsPerPage
  );

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="space-y-6 min-w-0">
        {/* 헤더 */}
        <div>
          <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-pink-500 to-purple-500 bg-clip-text text-transparent mb-2">
            egtronics 오늘의 게시판
          </h1>
          <p className="text-gray-600">다양한 주제로 소통하고 정보를 나누는 공간입니다</p>
        </div>

        {/* 검색 & 정렬 */}
        <div className="flex flex-col sm:flex-row gap-4">
          <Input
            placeholder="제목 또는 본문 키워드로 검색어를 입력하세요"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
          />
          <Select
            value={sortOption}
            onValueChange={(value) => {
              setSortOption(value);
              setCurrentPage(1);
            }}
          >
            <SelectTrigger className="w-full sm:w-40">
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
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
          {currentPosts.map((post) => {
            const categoryInfo = getCategoryInfo(post.category);
            return (
              <Link key={post.id} href={`/posts/${post.id}`} className="block">
                <Card className="h-full flex flex-col glass-effect border-0 shadow-lg cursor-pointer transition-transform hover:scale-[1.02] hover:shadow-xl">
                  <CardHeader className="flex-row items-center gap-3 space-y-0">
                    <Avatar className="h-10 w-10">
                      <AvatarImage
                        src={post.author.avatar}
                        alt={post.author.name}
                      />
                      <AvatarFallback>{post.author.name[0]}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <p className="font-semibold text-sm">{post.author.name}</p>
                      <p className="text-xs text-gray-500">
                        {formatDistanceToNow(post.createdAt, {
                          addSuffix: true,
                          locale: ko,
                        })}
                      </p>
                    </div>
                  </CardHeader>
                  <CardContent className="flex-1 flex flex-col justify-between">
                    <div>
                      <Badge
                        variant="secondary"
                        className="mb-2 font-medium"
                      >
                        <span className="mr-1.5">{categoryInfo.icon}</span>
                        {categoryInfo.name}
                      </Badge>
                      <h2 className="text-lg font-bold mb-2 line-clamp-2">
                        {post.title}
                      </h2>
                      <p className="line-clamp-3 text-sm text-gray-700 mb-4">
                        {post.content}
                      </p>
                    </div>
                    <div className="flex justify-end space-x-4 text-sm text-gray-500 mt-2 pt-2 border-t">
                      <div className="flex items-center space-x-1" title="추천">
                        <Heart className="h-4 w-4 text-red-400" />
                        <span>{post.likes}</span>
                      </div>
                      <div className="flex items-center space-x-1" title="댓글">
                        <MessageCircle className="h-4 w-4 text-blue-400" />
                        <span>{post.comments}</span>
                      </div>
                      <div className="flex items-center space-x-1" title="조회수">
                        <Eye className="h-4 w-4 text-gray-400" />
                        <span>{post.views}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>

        {/* 페이지네이션 */}
        <div>
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={(page) => setCurrentPage(page)}
          />
        </div>
      </div>
    </div>
  );
}

// This is the exported component. It wraps the main content in a Suspense boundary
// to prevent errors during static rendering.
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
