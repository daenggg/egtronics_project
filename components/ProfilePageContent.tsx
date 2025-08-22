"use client";

// CategoryFilter와 HomePageClient 컴포넌트를 import 합니다.
// HomePageClient.tsx 파일의 위치가 app 폴더 바로 아래에 있으므로 경로를 정확히 맞춰줍니다.
import { CategoryFilter } from "./category-filter";
import HomePageClient from "@/components/HomePageClient"; 

export default function ProfilePageContent() {
  // 두 클라이언트 컴포넌트를 여기서 함께 렌더링합니다.
  return (
    <>
      <CategoryFilter />
      <HomePageClient />
    </>
  );
}