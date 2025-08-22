import { Suspense } from 'react';
import ProfilePageContent from '@/components/ProfilePageContent'; // 이 경로가 올바른지 다시 확인!

export default function ProfilePage() {
  return (
    <div>
      <h1>프로필 페이지</h1>
      <Suspense fallback={<p>콘텐츠 로딩 중...</p>}>
        <ProfilePageContent />
      </Suspense>
    </div>
  );
}