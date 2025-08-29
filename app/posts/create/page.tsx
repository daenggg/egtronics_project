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
import { handleApiError } from "@/lib/api-client";

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

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    const categoryId = parseInt(category, 10);

    if (isNaN(categoryId) || categoryId <= 0) {
      toast({
        title: "카테고리 선택 필요",
        description: "게시글의 카테고리를 선택해주세요.",
        variant: "destructive",
      });
      return;
    }

    const formData = new FormData();
    formData.append("title", title);
    formData.append("content", content);
    formData.append("categoryId", String(categoryId));

    if (media.length > 0 && media[0].file) {
      formData.append("photo", media[0].file);
    }

    console.log("✅ 서버로 전송하는 데이터:", {
      title,
      content,
      categoryId,
      photo: media.length > 0 ? media[0].file?.name : "없음",
    });

    createPost(formData, {
      onSuccess: () => {
        router.refresh();
        router.push("/");
      },
      onError: (err) => {
        toast({
          title: "게시글 작성 실패",
          description: handleApiError(err),
          variant: "destructive",
        });
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