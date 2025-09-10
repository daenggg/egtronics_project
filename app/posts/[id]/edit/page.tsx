"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { usePost, useUpdatePost } from "@/hooks/use-posts";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { categories } from "@/components/category-filter";
import { API_BASE } from "@/lib/api-client";
import { X } from "lucide-react";
import { useAuth } from "@/contexts/auth-context";

interface FormValues {
  title: string;
  content: string;
  categoryId: string;
}

export default function PostEditPage() {
  const router = useRouter();
  const params = useParams();
  const postId = params.id as string;

  const { data: post, isLoading: isPostLoading, error } = usePost(postId);
  const { mutate: updatePost, isPending: isUpdating } = useUpdatePost();
  const { toast } = useToast();
  const { user, loading: isAuthLoading } = useAuth();

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [categoryId, setCategoryId] = useState<string>("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isImageRemoved, setIsImageRemoved] = useState(false);

  useEffect(() => {
    if (post) {
      setTitle(post.title);
      setContent(post.content);
      setCategoryId(String(post.categoryId));
      if (post.photoUrl) {
        setImagePreview(`${API_BASE}${post.photoUrl}`);
      }
    }
  }, [post]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
      setIsImageRemoved(false);
    }
  };

  const handleRemoveImage = () => {
    setImageFile(null);
    setImagePreview(null);
    setIsImageRemoved(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) {
      toast({
        title: "입력 오류",
        description: "제목과 내용을 모두 입력해주세요.",
        variant: "destructive",
      });
      return;
    }

    const formData = new FormData();
    formData.append("title", title);
    formData.append("content", content);
    formData.append("categoryId", categoryId);
    if (imageFile) {
      formData.append("photo", imageFile);
    }
    formData.append("removePhoto", String(isImageRemoved));

    updatePost(
      { id: postId, data: formData },
      {
        onSuccess: (updatedPost) => {
          toast({
            title: "성공",
            description: "게시글이 성공적으로 수정되었습니다.",
          });
          router.push(`/posts/${updatedPost.postId}`);
        },
        onError: () => {
          toast({
            title: "오류",
            description: "게시글 수정에 실패했습니다.",
            variant: "destructive",
          });
        },
      }
    );
  };

  if (isPostLoading || isAuthLoading) return <div className="container mx-auto px-4 py-8">게시글 정보를 불러오는 중...</div>;
  if (error) return <div className="container mx-auto px-4 py-8">오류가 발생했습니다: {error.message}</div>;
  if (!post) return <div className="container mx-auto px-4 py-8">게시글을 찾을 수 없습니다.</div>;

  return (
    <div className="container mx-auto max-w-2xl px-4 py-8">
      <Card className="glass-effect border-0 shadow-2xl">
        <CardHeader>
          <CardTitle className="text-2xl font-bold">게시글 수정</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label htmlFor="category" className="font-medium">카테고리</label>
              <Select value={categoryId} onValueChange={setCategoryId}>
                <SelectTrigger id="category">
                  <SelectValue placeholder="카테고리를 선택하세요" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id}>
                      {cat.icon} {cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label htmlFor="title" className="font-medium">제목</label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="제목을 입력하세요"
                required
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="content" className="font-medium">내용</label>
              <Textarea
                id="content"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="내용을 입력하세요"
                className="min-h-[200px]"
                required
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="photo" className="font-medium">사진</label>
              <Input id="photo" type="file" accept="image/*" onChange={handleImageChange} />
              {imagePreview && (
                <div className="mt-4 relative w-fit">
                  <img src={imagePreview} alt="미리보기" className="max-w-full h-auto rounded-md border" />
                  <Button
                    type="button"
                    variant="destructive"
                    size="icon"
                    className="absolute top-2 right-2 h-6 w-6"
                    onClick={handleRemoveImage}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </div>

            <div className="flex justify-end space-x-4">
              <Button type="button" variant="outline" onClick={() => router.back()}>
                취소
              </Button>
              <Button type="submit" disabled={isUpdating}>
                {isUpdating ? "수정 중..." : "수정 완료"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}