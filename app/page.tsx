"use client";

import Link from "next/link";
import { useState, useMemo } from "react";
import { CategoryFilter } from "@/components/category-filter";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import Profile from "@/components/ui/profile";
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
  author: string;
  createdAt: Date;
  views: number;
  likes: number;
  comments: number;
  category: string;
}

const categories = [
  "announcement",
  "general",
  "tech",
  "study",
  "project",
  "career",
  "qna",
  "free",
];

const mockPosts: Post[] = Array.from({ length: 50 }, (_, i) => ({
  id: String(i + 1),
  title: `게시글 ${i + 1}`,
  content: `이것은 게시글 ${
    i + 1
  }의 내용입니다. 다양한 정보와 경험을 공유합니다.`,
  author: `작성자 ${(i % 5) + 1}`,
  category: categories[i % categories.length],
  createdAt: new Date(Date.now() - 1000 * 60 * 60 * (i * 3)),
  views: Math.floor(Math.random() * 500),
  likes: Math.floor(Math.random() * 50),
  comments: Math.floor(Math.random() * 15),
}));

export default function HomePage() {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortOption, setSortOption] = useState("latest");
  const [currentPage, setCurrentPage] = useState(1);

  const postsPerPage = 12;

  // 필터 + 정렬된 데이터
  const filteredPosts = useMemo(() => {
    let data = [...mockPosts];

    if (selectedCategory) {
      data = data.filter((post) => post.category === selectedCategory);
    }
    // 검색 필터
    if (searchQuery.trim()) {
      data = data.filter(
        (post) =>
          post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          post.content.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // 정렬
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

  const handleCategoryChange = (category: string | null) => {
    setSelectedCategory(category);
    setCurrentPage(1);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* 헤더 */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-pink-500 to-purple-500 bg-clip-text text-transparent mb-2">
            egtronics 오늘의 게시판
          </h1>
          <p className="text-gray-600">
            다양한 주제로 소통하고 정보를 나누는 공간입니다
          </p>
        </div>
      </div>

      <div className="flex gap-6">
        {/* 왼쪽 고정 */}
        <aside className="w-64 sticky top-24 h-fit self-start">
          <div className="mb-6">
            <Profile />
          </div>
          <CategoryFilter
            selectedCategory={selectedCategory}
            onCategoryChange={handleCategoryChange}
          />
        </aside>

        {/* 메인 영역 */}
        <main className="flex-1 space-y-6">
          {/* 검색 & 정렬 */}
          <div className="flex gap-4 mb-4">
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
              <SelectTrigger className="w-40">
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
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {currentPosts.map((post) => (
              <Link key={post.id} href={`/posts/${post.id}`} className="block">
                <Card className="glass-effect border-0 shadow-lg cursor-pointer transition-transform hover:scale-[1.02] hover:shadow-xl">
                  <CardHeader>
                    <div className="flex justify-between items-center mb-2">
                      <h2 className="text-xl font-semibold">{post.title}</h2>
                      <span className="text-sm text-gray-500">
                        {post.author}
                      </span>
                    </div>
                    <p className="text-sm text-gray-400">
                      {post.createdAt.toLocaleString()}
                    </p>
                  </CardHeader>
                  <CardContent>
                    <p className="line-clamp-3 text-gray-700">{post.content}</p>
                    <div className="flex justify-end space-x-4 text-sm text-gray-500 mt-4">
                      <span className="flex items-center space-x-1">
                        <span>🤍</span>
                        <span>{post.likes}</span>
                      </span>
                      <span className="flex items-center space-x-1">
                        <span>💬</span>
                        <span>{post.comments}</span>
                      </span>
                      <span className="flex items-center space-x-1">
                        <span>👀</span>
                        <span>{post.views}</span>
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>

          {/* 페이지네이션 */}
          <div>
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={(page) => setCurrentPage(page)}
            />
          </div>
        </main>
      </div>
    </div>
  );
}
