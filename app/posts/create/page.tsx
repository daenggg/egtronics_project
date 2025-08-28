"use client";

import { useState, useEffect, FormEvent, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
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
// 1. 파일 업로드 함수를 import 합니다. (이 함수는 따로 만들어야 합니다)
import { uploadFile } from "@/lib/api-client";

function CreatePostForm() {
  const { user } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const { mutate: createPost, isPending: loading } = useCreatePost();

  // URL에서 초기 카테고리 값을 읽어옵니다.
  const initialCategory = searchParams.get("category") || "";

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [category, setCategory] = useState(initialCategory);
  const [media, setMedia] = useState<MediaFile[]>([]);

  useEffect(() => {
    if (!user) {
      router.push("/login");
    }
  }, [user, router]);

  // URL 파라미터가 변경될 때 카테고리 상태를 업데이트합니다.
  useEffect(() => {
    setCategory(searchParams.get("category") || "");
  }, [searchParams]);

  if (!user) {
    return null;
  }

// --- [수정됨] --- 안정성이 강화된 handleSubmit 함수
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    // 1. category 상태(문자열)를 정수(number)로 변환
    const categoryId = parseInt(category, 10);

    // 2. 변환된 값이 유효한 숫자인지 검사 (NaN 이거나 0 이하인지 확인)
    if (isNaN(categoryId) || categoryId <= 0) {
      toast({
        title: "카테고리 선택 필요",
        description: "게시글의 카테고리를 선택해주세요.",
        variant: "destructive",
      });
      return;
    }

    // 3. (검증 통과 후) 이미지 업로드 로직 실행
    let photoUrl = "";
    if (media.length > 0 && media[0].file) {
      try {
        toast({ title: "이미지를 업로드하는 중입니다..." });
        photoUrl = await uploadFile(media[0].file);
      } catch (error) {
        toast({
          title: "이미지 업로드 실패",
          description: "이미지 업로드 중 오류가 발생했습니다. 다시 시도해주세요.",
          variant: "destructive",
        });
        return;
      }
    }

    // 4. 안전하게 변환된 categoryId로 payload 생성
    const payload = {
      title,
      content,
      categoryId: categoryId, // 안전하게 변환된 숫자 ID 사용
      photo: photoUrl,
    };

    console.log("✅ 서버로 전송하는 실제 데이터:", JSON.stringify(payload, null, 2));
    
    createPost(payload, {
      onSuccess: () => {
        router.refresh();
        router.push("/");
      },
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

export default function CreatePostPage() {
  return (
    <Suspense fallback={<div className="container mx-auto px-4 py-8 text-center">페이지를 불러오는 중입니다...</div>}>
      <CreatePostForm />
    </Suspense>
  );
}