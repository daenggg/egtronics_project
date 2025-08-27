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
// 1. 파일 업로드 함수를 import 합니다. (이 함수는 따로 만들어야 합니다)
import { uploadFile } from "@/lib/api-client";

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
    return null;
  }

  // 2. handleSubmit을 async 함수로 변경합니다. (await 키워드 사용을 위해)
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    // 파일을 먼저 업로드하고 URL을 받아오는 로직으로 변경합니다.
    let photoUrl = ""; // 최종 이미지 URL을 저장할 변수

    // 3. 업로드할 이미지가 있는지 확인합니다.
    // media[0].file이 실제 File 객체라고 가정합니다. MediaFile 타입에 file 속성이 있어야 합니다.
    if (media.length > 0 && media[0].file) {
      try {
        toast({ title: "이미지를 업로드하는 중입니다..." });
        // 4. 파일 업로드 API를 먼저 호출하여 실제 URL을 받아옵니다.
        photoUrl = await uploadFile(media[0].file);
      } catch (error) {
        toast({
          title: "이미지 업로드 실패",
          description: "이미지 업로드 중 오류가 발생했습니다. 다시 시도해주세요.",
          variant: "destructive",
        });
        return; // 이미지 업로드 실패 시 게시글 작성을 중단합니다.
      }
    }

    // 5. 받아온 URL을 payload에 담아 게시글 작성 API를 호출합니다.
    const payload = {
      title,
      content,
      categoryId: Number(category),
      photo: photoUrl,
    };

    createPost(payload, {
      onSuccess: () => {
        router.refresh();
        router.push("/");
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