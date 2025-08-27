"use client";

import { useState, useEffect, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/auth-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { categories } from "@/components/category-filter";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { MediaUpload, MediaFile } from "@/components/media-upload";
import { useToast } from "@/hooks/use-toast";
import { useCreatePost } from "@/hooks/use-posts";

export default function CreatePostPage() {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [category, setCategory] = useState("");
  const [media, setMedia] = useState<MediaFile[]>([]);
  const { user } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const { mutate: createPost, isPending: loading } = useCreatePost();

  useEffect(() => {
    if (!user) {
      router.push("/login");
    }
  }, [user, router]);

  if (!user) {
    // 리디렉션하는 동안 아무것도 렌더링하지 않거나 로딩 상태를 표시합니다.
    return null;
  }

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();

    // 백엔드 API는 'photo' 필드에 단일 이미지 URL을 기대합니다.
    // MediaUpload 컴포넌트는 maxFiles={1}로 설정되어 있으므로, media 배열의 첫 번째 요소를 사용합니다.
    const payload = {
      title,
      content,
      category,
      photo: media.length > 0 ? media[0].url : undefined,
    };

    createPost(payload, {
      onSuccess: () => {
        // useCreatePost 훅에서 성공 토스트와 캐시 무효화는 이미 처리됩니다.
        // 여기서는 페이지 이동만 처리합니다.
        router.refresh(); // 목록 페이지의 서버 컴포넌트 데이터 갱신
        router.push("/"); // 홈으로 이동
      },
      // onError는 useCreatePost 훅에서 자동으로 처리됩니다.
    });
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <Card className="max-w-4xl mx-auto glass-effect border-0 shadow-2xl">
        <CardHeader>
          <CardTitle className="text-2xl font-bold">새 게시글 작성</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="title">제목</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="게시글 제목을 입력하세요"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">카테고리</Label>
              <Select value={category} onValueChange={setCategory} required>
                <SelectTrigger>
                  <SelectValue placeholder="카테고리를 선택하세요" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id}>
                      <div className="flex items-center gap-2">
                        <span>{cat.icon}</span>
                        <span>{cat.name}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="content">내용</Label>
              <Textarea
                id="content"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="게시글 내용을 입력하세요"
                className="min-h-[300px]"
                required
              />
            </div>

            <div className="space-y-2">
              <Label>미디어 파일</Label>
              <MediaUpload onFilesChange={setMedia} maxFiles={1} />
            </div>

            <div className="flex justify-end space-x-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
              >
                취소
              </Button>
              <Button
                type="submit"
                disabled={loading}
                className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white shadow-lg"
              >
                {loading ? "작성 중..." : "게시글 작성"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}