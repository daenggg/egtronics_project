"use client";

import { useSearchParams } from "next/navigation";
import { Input } from "@/components/ui/input";
import { useEffect, useState } from "react";

// useSearchParams를 사용하는 로직은 이 컴포넌트 안에 격리됩니다.
export function SearchComponent() {
  const searchParams = useSearchParams();
  const query = searchParams.get("q"); // URL에서 검색어 읽기
  const [searchQuery, setSearchQuery] = useState(query || "");

  useEffect(() => {
    setSearchQuery(query || "");
  }, [query]);

  // 여기에 검색 로직 구현...
  return (
    <Input 
      placeholder="검색..."
      value={searchQuery}
      onChange={(e) => setSearchQuery(e.target.value)}
      className="w-full"
    />
  );
}