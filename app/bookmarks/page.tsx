"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMyScraps } from "@/hooks/use-scraps";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Bookmark, Clock, Home, Image as ImageIcon } from "lucide-react";
import { formatDynamicDate } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { API_BASE } from "@/lib/api-client";

export default function BookmarksPage() {
  const { data: scraps, isLoading, isError, error } = useMyScraps();
  const router = useRouter();

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <Skeleton key={i} className="h-80 w-full rounded-xl" />
          ))}
        </div>
      );
    }

    if (isError) {
      return (
        <Alert variant="destructive">
          <AlertTitle>오류 발생</AlertTitle>
          <AlertDescription>
            스크랩 목록을 불러오는 중 오류가 발생했습니다: {error.message}
          </AlertDescription>
        </Alert>
      );
    }

    if (!scraps || scraps.length === 0) {
      return (
        <div className="text-center py-20 col-span-full bg-white rounded-xl shadow-md">
          <div className="p-4 bg-blue-100 rounded-full inline-block mb-4">
            <Bookmark className="h-12 w-12 text-blue-500" />
          </div>
          <h3 className="text-xl font-semibold text-gray-800">
            스크랩한 게시글이 없습니다.
          </h3>
          <p className="text-gray-500 mt-2 mb-6 max-w-md mx-auto">
            관심 있는 게시글의 북마크 아이콘을 클릭하여 나중에 다시 볼 수 있도록 저장해보세요.
          </p>
          <Button
            onClick={() => router.push('/')}
            className="bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg hover:shadow-xl transition-all"
          >
            <Home className="mr-2 h-4 w-4" />
            홈으로 돌아가기
          </Button>
        </div>
      );
    }

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {scraps.map((scrap) => (
          <Link href={`/posts/${scrap.postId}`} key={scrap.scrapId}>
            <Card className="group h-full flex flex-col glass-effect border-0 shadow-lg cursor-pointer transition-transform hover:scale-[1.02] hover:shadow-xl overflow-hidden rounded-xl">
              <div className="aspect-video w-full bg-gray-100 flex items-center justify-center relative">
                {scrap.postPhoto ? (
                  <img src={`${API_BASE}${scrap.postPhoto}`} alt={scrap.postTitle} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                ) : (
                  <ImageIcon className="h-16 w-16 text-gray-300" />
                )}
                <div className="absolute top-2 right-2 bg-black/50 text-white text-xs px-2 py-1 rounded-full flex items-center gap-1.5 backdrop-blur-sm">
                  <Bookmark className="h-3 w-3" />
                  <span>스크랩</span>
                </div>
              </div>
              <CardContent className="flex-grow flex flex-col justify-between p-4">
                <div>
                  <h4 className="font-bold text-lg truncate group-hover:text-blue-600 transition-colors mb-2">
                    {scrap.postTitle}
                  </h4>
                  <div className="flex items-center gap-2 text-xs text-gray-500 mb-3">
                    <Avatar className="h-6 w-6">
                      <AvatarImage src={scrap.authorProfilePicture ? `${API_BASE}${scrap.authorProfilePicture}` : "/placeholder.svg"} alt={scrap.authorNickname} />
                      <AvatarFallback>{scrap.authorNickname.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <span className="font-medium text-gray-800">{scrap.authorNickname}</span>
                  </div>
                </div>
                <div className="text-xs text-gray-400 border-t pt-3 mt-auto flex justify-end items-center">
                  <span title={`게시일: ${formatDynamicDate(scrap.postCreatedDate)}`}>
                    <Clock className="h-3 w-3 inline-block mr-1" />
                    {formatDynamicDate(scrap.postCreatedDate)}
                  </span>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    );
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold flex items-center gap-3">
          <Bookmark className="h-8 w-8 text-yellow-500" />
          내 스크랩
        </h1>
        <p className="text-gray-500">{!isLoading && scraps ? `${scraps.length}개` : ''}</p>
      </div>
      {renderContent()}
    </div>
  );
}