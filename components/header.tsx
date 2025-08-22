import { Suspense } from "react";
import Link from "next/link";
import { SearchComponent } from "./SearchComponent"; // 방금 만든 컴포넌트 import

export function Header() {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white shadow-md">
      <nav className="container mx-auto px-4 py-3 flex justify-between items-center">
        <Link href="/" className="font-bold text-xl">
          MyCommunity
        </Link>
        
        <div className="w-1/3">
          {/* SearchComponent가 로드될 때까지 fallback UI를 보여줍니다.
            이제 Header 자체는 서버 컴포넌트로 유지될 수 있습니다.
          */}
          <Suspense fallback={<div className="h-10 bg-gray-200 rounded-md animate-pulse"></div>}>
            <SearchComponent />
          </Suspense>
        </div>

        <div>
          {/* 로그인/회원가입 버튼 등 */}
        </div>
      </nav>
    </header>
  );
}