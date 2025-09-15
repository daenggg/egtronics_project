"use client";

import { useState, useEffect, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import { usePost, useUpdatePost } from "@/hooks/use-posts";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { categories } from "@/components/category-filter";
import { API_BASE } from "@/lib/api-client";
import { useAuth } from "@/contexts/auth-context";
import { MediaUpload, MediaFile } from "@/components/media-upload";

export default function PostEditPage() {
  const router = useRouter();
  const params = useParams();
  const postId = params.id as string;

  const { data: post, isLoading: isPostLoading, error } = usePost(postId);
  const { mutate: updatePost, isPending: isUpdating } = useUpdatePost();
  const { toast } = useToast();
  
  // 상태들을 post가 로드된 후에 설정되도록 초기값을 null 또는 빈 값으로 설정
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [media, setMedia] = useState<MediaFile[]>([]); // 사용자가 새로 업로드/제거하는 파일 관리

  // ✅ 해결: useMemo를 사용하여 post 데이터가 있을 때만 initialMedia를 계산합니다.
  const initialMedia = useMemo(() => {
    return post?.photoUrl
      ? [{ id: 'existing', url: `${API_BASE}${post.photoUrl}`, type: 'image' as const, file: new File([], 'existing-image.jpg', { type: 'image/jpeg' }) }]
      : [];
  }, [post?.photoUrl]);

  useEffect(() => {
    if (post) {
      setTitle(post.title);
      setContent(post.content);
      setCategoryId(String(post.categoryId));
    }
  }, [post]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append("title", title);
    formData.append("content", content);
    formData.append("categoryId", categoryId);

    const newFile = media.find(m => m.id !== 'existing');
    if (newFile && newFile.file) {
      formData.append("photo", newFile.file);
    } else if (media.length === 0) {
      formData.append("removePhoto", "true");
    }

    updatePost(
      { id: postId, data: formData },
      {
        onSuccess: (updatedPost) => {
          toast({ title: "성공", description: "게시글이 성공적으로 수정되었습니다." });
          router.refresh();
          router.push(`/posts/${updatedPost.postId}`);
        },
        onError: (err) => {
          toast({ description: "게시글 수정에 실패했습니다.", variant: "destructive" });
        },
      }
    );
  };

  if (isPostLoading) return <div className="container mx-auto px-4 py-8">로딩 중...</div>;
  if (error) return <div className="container mx-auto px-4 py-8">오류 발생: {error.message}</div>;
  if (!post) return <div className="container mx-auto px-4 py-8">게시글을 찾을 수 없습니다.</div>;

  return (
    <div className="container mx-auto px-4 py-8">
      <Card className="max-w-4xl mx-auto glass-effect border-0 shadow-2xl">
        <CardHeader>
          <CardTitle className="text-2xl font-bold">게시글 수정</CardTitle>
        </CardHeader>
        <CardContent>
          <form key={post.postId} onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label htmlFor="title" className="font-medium">제목</label>
              <Input
                id="title"
                defaultValue={post.title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="category" className="font-medium">카테고리</label> 
              <Select defaultValue={String(post.categoryId)} onValueChange={setCategoryId} required>
                <SelectTrigger id="category">
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
              <label htmlFor="content" className="font-medium">내용</label>
              <Textarea
                id="content"
                defaultValue={post.content}
                onChange={(e) => setContent(e.target.value)}
                className="min-h-[300px]"
                required
              />
            </div>
            <div className="space-y-2">
              <label className="font-medium">사진</label>
              <MediaUpload onFilesChange={(files) => setMedia(files)} maxFiles={1} initialFiles={initialMedia} />
            </div>
            <div className="flex justify-end space-x-2">
              <Button type="button" variant="ghost" onClick={() => router.back()}>
                취소
              </Button>
              <Button type="submit" disabled={isUpdating} variant="outline">
                {isUpdating ? "수정 중..." : "수정 완료"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}