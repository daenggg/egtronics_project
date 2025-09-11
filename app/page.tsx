import { Suspense } from 'react';
import HomePageClient from '@/components/HomePageClient';

// 로딩 중에 보여줄 간단한 UI
const HomePageSkeleton = () => {
  return (
    <div className="container mx-auto px-4 py-8 animate-pulse">
      <div className="h-10 bg-muted rounded-md w-1/3 mb-8"></div>
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-8">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="h-[400px] bg-muted rounded-xl"></div>
        ))}
      </div>
    </div>
  );
};

export default function HomePage() {
  return (
    <Suspense fallback={<HomePageSkeleton />}>
      <HomePageClient />
    </Suspense>
  );
}