import { Suspense } from 'react';
import HomePageClient from '@/components/HomePageClient';

// 로딩 중에 보여줄 간단한 UI
const HomePageSkeleton = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <p>게시물을 불러오는 중입니다...</p>
      {/* 여기에 좀 더 정교한 스켈레톤 UI를 추가할 수 있습니다. */}
    </div>
  );
};

export default function HomePage() {
  return (
    // HomePageClient 컴포넌트를 Suspense로 감싸줍니다.
    <Suspense fallback={<HomePageSkeleton />}>
      <HomePageClient />
    </Suspense>
  );
}