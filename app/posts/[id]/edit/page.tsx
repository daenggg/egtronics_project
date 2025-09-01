"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useForm, Controller } from "react-hook-form";
import { useAuth } from "@/contexts/auth-context";
import { usePost, useUpdatePost } from "@/hooks/use-posts";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { categories } from "@/components/category-filter";
import { MediaUpload, MediaFile } from "@/components/media-upload";
import { uploadFile } from "@/lib/api-client";

interface FormValues {
  title: string;
  content: string;
  categoryId: string;
}

export default function EditPostPage() {
  const router = useRouter();
  const params = useParams();
  const postId = params.id as string;
  const { user, loading: isAuthLoading } = useAuth();
  const { toast } = useToast();

  const { data: post, isLoading: isPostLoading, error: postError } = usePost(postId);
  const { mutate: updatePost, isPending: isUpdating } = useUpdatePost();

  const { control, handleSubmit, reset, formState: { errors } } = useForm<FormValues>();
  const [mediaFiles, setMediaFiles] = useState<MediaFile[]>([]);

  // 폼에 기존 게시물 데이터 채우기
  useEffect(() => {
    if (post) {
      reset({
        title: post.title,
        content: post.content || "",
        categoryId: String(post.categoryId),
      });
    }
  }, [post, reset]);

  const onSubmit = async (data: FormValues) => {
    if (!post) return;

    const formData = new FormData();
    formData.append("title", data.title);
    formData.append("content", data.content);
    formData.append("categoryId", data.categoryId);

    // 새 파일이 업로드된 경우, 서버에 업로드 후 form-data에 추가
    if (mediaFiles.length > 0) {
      const fileToUpload = mediaFiles[0].file;
      try {
        // 백엔드 API가 파일 업로드를 지원하지 않으므로, 이 부분은 주석 처리합니다.
        // 실제 구현 시 주석을 해제하고 사용하세요.
        // const photoUrl = await uploadFile(fileToUpload);
        // formData.append("photo", photoUrl);
        toast({
          title: "알림",
          description: "현재 버전에서는 사진 변경을 지원하지 않습니다.",
        });
      } catch (error) {
        toast({
          title: "파일 업로드 실패",
          description: "이미지 업로드 중 오류가 발생했습니다.",
          variant: "destructive",
        });
        return;
      }
    }

    updatePost({ id: postId, data: formData }, {
      onSuccess: () => {
        router.push(`/posts/${postId}`);
      },
    });
  };

  if (isAuthLoading || isPostLoading) {
    return <div className="container mx-auto px-4 py-8">로딩 중...</div>;
  }

  if (postError || !post) {
    return <div className="container mx-auto px-4 py-8">게시글 정보를 불러오는 데 실패했거나 게시글이 존재하지 않습니다.</div>;
  }

  if (!user || user.userId !== post.author.userId) {
    return <div className="container mx-auto px-4 py-8">수정 권한이 없습니다.</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl font-bold">게시글 수정</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700">제목</label>
              <Controller name="title" control={control} rules={{ required: "제목을 입력해주세요." }} render={({ field }) => <Input id="title" {...field} />} />
              {errors.title && <p className="text-red-500 text-sm mt-1">{errors.title.message}</p>}
            </div>

            <div>
              <label htmlFor="categoryId" className="block text-sm font-medium text-gray-700">카테고리</label>
              <Controller name="categoryId" control={control} rules={{ required: "카테고리를 선택해주세요." }} render={({ field }) => (
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <SelectTrigger><SelectValue placeholder="카테고리 선택" /></SelectTrigger>
                    <SelectContent>
                      {categories.map(cat => (<SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>))}
                    </SelectContent>
                  </Select>
                )} />
              {errors.categoryId && <p className="text-red-500 text-sm mt-1">{errors.categoryId.message}</p>}
            </div>

            <div>
              <label htmlFor="content" className="block text-sm font-medium text-gray-700">내용</label>
              <Controller name="content" control={control} rules={{ required: "내용을 입력해주세요." }} render={({ field }) => <Textarea id="content" {...field} rows={10} />} />
              {errors.content && <p className="text-red-500 text-sm mt-1">{errors.content.message}</p>}
            </div>

            <div className="flex justify-end space-x-2">
              <Button type="button" variant="outline" onClick={() => router.back()}>취소</Button>
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

