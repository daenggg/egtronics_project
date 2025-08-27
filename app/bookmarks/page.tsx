"use client";

import Link from "next/link";
import { useMyScraps } from "@/hooks/use-scraps";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { List } from "lucide-react";

export default function BookmarksPage() {
  const { data: scraps, isLoading, isError, error } = useMyScraps();

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} className="h-20 w-full" />
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
        <div className="text-center py-10">
          <List className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">
            스크랩한 게시글이 없습니다.
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            관심 있는 게시글을 스크랩하여 나중에 다시 보세요.
          </p>
        </div>
      );
    }

    return (
      <ul className="space-y-4">
        {scraps.map((scrap) => (
          <li key={scrap.postId}>
            <Link href={`/posts/${scrap.postId}`} className="block p-4 border rounded-lg hover:bg-gray-50 transition-colors">
              <h4 className="font-semibold text-lg">{scrap.title}</h4>
              <div className="text-sm text-gray-500 mt-1 flex justify-between">
                <span>작성자: {scrap.nickname}</span>
                <span>
                  스크랩 일시: {new Date(scrap.createdDate).toLocaleDateString()}
                </span>
              </div>
            </Link>
          </li>
        ))}
      </ul>
    );
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <Card className="max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle className="text-2xl font-bold">내 스크랩</CardTitle>
        </CardHeader>
        <CardContent>{renderContent()}</CardContent>
      </Card>
    </div>
  );
}