"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/auth-context";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { Edit, Save, Heart, Eye, FileText, MessageSquare, Image as ImageIcon, Pencil, PlusCircle, Quote } from "lucide-react";
import { PostPreview, MyComment } from "@/lib/types";
import { useMyPosts, useMyComments } from "@/hooks/use-my-activities";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDynamicDate } from "@/lib/utils";
import { API_BASE } from "@/lib/api-client";

export default function ProfilePage() {
  const { user, updateUserInfo, loading: authLoading } = useAuth(); // ✅ 1. auth-context의 loading 상태 가져오기
  const { toast } = useToast();
  const router = useRouter();

  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string | undefined>>({});

  // 유효성 검사를 위한 정규식
  const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[!@#$%^&*()_+=[\]{};':"\\|,.<>/?-]).{6,20}$/;
  const koreanRegex = /^[가-힣]+$/;
  const englishRegex = /^[A-Za-z]+$/;
  const phoneRegex = /^\d{3}-\d{4}-\d{4}$/;

  // 상태 변수
  const [name, setName] = useState("");
  const [nickname, setNickname] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [profilePicture, setProfilePicture] = useState("");
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // 내 활동내역 불러오기
  const { data: myPosts, isLoading: isLoadingPosts } = useMyPosts();
  const { data: myComments, isLoading: isLoadingComments } = useMyComments();

  // user 정보가 변경될 때마다 상태 업데이트
  useEffect(() => {
    if (user) {
      setName(user.name || "");
      setNickname(user.nickname || "");
      setPhoneNumber(user.phoneNumber || "");
      setProfilePicture(user.profilePicture || "");
    }
  }, [user]);

  // 프로필 사진 선택 시 미리보기 처리
  useEffect(() => {
    if (!avatarFile) return;
    const objectUrl = URL.createObjectURL(avatarFile);
    setProfilePicture(objectUrl);

    // 언마운트 시 URL 해제
    return () => URL.revokeObjectURL(objectUrl);
  }, [avatarFile]);

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setAvatarFile(e.target.files[0]);
    }
  };

  const validate = () => {
    const newErrors: Record<string, string | undefined> = {};

    if (!name.trim()) newErrors.name = "이름을 입력해주세요.";
    else if (!koreanRegex.test(name) && !englishRegex.test(name)) {
      newErrors.name = "이름은 한글 또는 영어로만 입력 가능합니다.";
    }
    if (!nickname.trim()) newErrors.nickname = "닉네임을 입력해주세요.";
    if (!phoneRegex.test(phoneNumber)) newErrors.phoneNumber = "전화번호 형식이 올바르지 않습니다. (예: 010-1234-5678)";
    if (newPassword && !passwordRegex.test(newPassword)) newErrors.newPassword = "비밀번호는 영문, 숫자, 특수문자 포함 6~20자리여야 합니다.";
    if (newPassword && newPassword !== confirmPassword) newErrors.confirmPassword = "새 비밀번호가 일치하지 않습니다.";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) {
      toast({
        title: "입력 오류",
        description: "입력된 정보를 다시 확인해주세요.",
        variant: "destructive",
        duration: 2000,
      });
      return;
    }
    setIsSaving(true);

    try {
      const formData = new FormData();
      formData.append("name", name);
      formData.append("nickname", nickname);
      formData.append("phoneNumber", phoneNumber);
      if (newPassword) formData.append("password", newPassword);
      if (avatarFile) formData.append("profilePicture", avatarFile);

      await updateUserInfo(formData);

      setIsEditing(false);
      setAvatarFile(null);
      setNewPassword("");
      setConfirmPassword("");

      toast({
        title: "성공",
        description: "프로필이 성공적으로 업데이트되었습니다.",
      });

    } catch (error) {
      toast({
        title: "업데이트 실패",
        description: "잠시 후 다시 시도해주세요.",
        variant: "destructive",
        duration: 2000,
      });
    } finally {
      setIsSaving(false);
    }
  };
  
  // 프로필 정보 항목을 위한 컴포넌트
  const ProfileInfoItem = ({ label, value }: { label: string; value: string }) => (
    <div className="space-y-1 text-left">
      <p className="text-sm font-medium text-slate-500">{label}</p>
      <p className="text-base text-slate-800">{value}</p>
    </div>
  );

  // ✅ 2. 인증 로딩 중일 때 스켈레톤 UI 표시
  if (authLoading) {
    return (
      <div className="bg-slate-50/50 min-h-screen">
        <div className="container mx-auto px-4 py-8 md:py-12 max-w-4xl">
          <Skeleton className="h-10 w-48 mb-8" />
          <Card className="mb-10 glass-effect border-0 shadow-2xl overflow-hidden">
            <CardHeader>
              <Skeleton className="h-8 w-32" />
            </CardHeader>
            <CardContent>
              <div className="flex flex-col items-center gap-6 md:flex-row md:items-start md:gap-8">
                <Skeleton className="h-24 w-24 rounded-full" />
                <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6 w-full">
                  {[...Array(6)].map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}
                </div>
              </div>
            </CardContent>
          </Card>
          <Skeleton className="h-12 w-full" />
        </div>
      </div>
    );
  }

  // ✅ 3. 로딩이 끝났는데 user가 없을 경우 비회원 UI 표시
  if (!authLoading && !user) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-200px)] bg-slate-50">
        <Card className="text-center p-8 glass-effect border-0 shadow-xl w-full max-w-sm">
          <Avatar className="mx-auto mb-4 h-20 w-20 border border-gray-300">
            <AvatarFallback className="text-3xl bg-gray-200">?</AvatarFallback>
          </Avatar>
          <CardTitle className="mb-2 text-lg font-semibold">비회원</CardTitle>
          <CardContent className="text-gray-600 p-0">
            <p>로그인이 필요한 서비스입니다.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="bg-slate-50/50 min-h-screen">
      <div className="container mx-auto px-4 py-8 md:py-12 max-w-4xl">
        <h1 className="text-3xl font-bold mb-8">마이페이지</h1>
        <Card className="mb-10 glass-effect border-0 shadow-2xl overflow-hidden">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-2xl font-bold">내 프로필</CardTitle>
              <Button
                variant="outline"
                size="sm"
                onClick={() => (isEditing ? handleSave() : setIsEditing(true))}
                disabled={isSaving}
              >
                {isEditing ? (
                  <>
                    <Save className="h-4 w-4 mr-1" />
                    {isSaving ? "저장 중..." : "저장"}
                  </>
                ) : (
                  <>
                    <Edit className="h-4 w-4 mr-1" />
                    편집
                  </>
                )}
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center gap-6 text-center md:flex-row md:items-start md:text-left md:gap-8">
              <div className="relative group">
                <Avatar className="h-24 w-24 cursor-pointer border-2 border-white shadow-lg">
                  <AvatarImage
                    src={profilePicture ? (profilePicture.startsWith('blob:') ? profilePicture : `${API_BASE}${profilePicture}`) : "/images.png"}
                    alt={user?.name || 'User'}
                  />
                  <AvatarFallback className="text-3xl bg-gradient-to-br from-blue-400 to-purple-500 text-white">
                    {user?.nickname?.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                {isEditing && (
                  <>
                    <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <Edit className="h-6 w-6 text-white" />
                    </div>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleAvatarChange}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      title="프로필 사진 변경"
                    />
                  </>
                )}
              </div>
              <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6 w-full">
                {isEditing ? (
                  <>
                    <div className="space-y-2 text-left">
                      <Label htmlFor="nickname">닉네임</Label>
                      <Input id="nickname" value={nickname} onChange={(e) => setNickname(e.target.value)} />
                      {errors.nickname && <p className="text-red-600 text-sm mt-1">{errors.nickname}</p>}
                    </div>
                    <div className="space-y-2 text-left">
                      <Label htmlFor="name">이름</Label>
                      <Input id="name" value={name} onChange={(e) => setName(e.target.value)} />
                      {errors.name && <p className="text-red-600 text-sm mt-1">{errors.name}</p>}
                    </div>
                    <div className="space-y-2 text-left">
                      <Label htmlFor="email">이메일</Label>
                      <Input id="email" value={user?.email || ""} disabled />
                    </div>
                    <div className="space-y-2 text-left">
                      <Label htmlFor="userId">아이디</Label>
                      <Input id="userId" value={user?.userId || ""} disabled />
                    </div>
                    <div className="space-y-2 text-left">
                      <Label htmlFor="phoneNumber">전화번호</Label>
                      <Input id="phoneNumber" value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)} />
                      {errors.phoneNumber && <p className="text-red-600 text-sm mt-1">{errors.phoneNumber}</p>}
                    </div>
                    <div className="space-y-2 text-left">
                      <Label htmlFor="newPassword">새 비밀번호</Label>
                      <Input id="newPassword" type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="변경 시에만 입력" />
                      {errors.newPassword && <p className="text-red-600 text-sm mt-1">{errors.newPassword}</p>}
                    </div>
                    <div className="space-y-2 text-left md:col-span-2">
                      <Label htmlFor="confirmPassword">비밀번호 확인</Label>
                      <Input id="confirmPassword" type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="새 비밀번호 확인" />
                      {errors.confirmPassword && <p className="text-red-600 text-sm mt-1">{errors.confirmPassword}</p>}
                    </div>
                  </>
                ) : (
                  <>
                    <ProfileInfoItem label="닉네임" value={nickname} />
                    <ProfileInfoItem label="이름" value={name} />
                    <ProfileInfoItem label="이메일" value={user?.email || ''} />
                    <ProfileInfoItem label="아이디" value={user?.userId || ''} />
                    <ProfileInfoItem label="전화번호" value={phoneNumber} />
                    <ProfileInfoItem label="비밀번호" value="********" />
                  </>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <Tabs defaultValue="posts">
          <TabsList className="grid w-full grid-cols-2 bg-slate-200/60 p-1 rounded-lg h-auto">
            <TabsTrigger value="posts" className="py-2"><FileText className="h-4 w-4 mr-2" />내 게시글</TabsTrigger>
            <TabsTrigger value="comments" className="py-2"><MessageSquare className="h-4 w-4 mr-2" />내 댓글</TabsTrigger>
          </TabsList>

          <TabsContent value="posts" className="mt-6">
            {/* --- ✅ 수정점: space-y-6 대신 flex flex-col gap-6 사용 --- */}
            <div className="flex flex-col gap-6">
              {isLoadingPosts ? (
                [...Array(3)].map((_, i) => <Skeleton key={i} className="h-36 w-full rounded-xl" />)
              ) : myPosts && myPosts.length > 0 ? (
                myPosts.map((post) => (
                  <Link href={`/posts/${post.postId}`} key={post.postId}>
                    <Card className="overflow-hidden transition-all duration-300 ease-in-out hover:shadow-xl hover:-translate-y-1 group border bg-white hover:border-blue-300 rounded-xl">
                      <CardContent className="p-0 flex h-36">
                        <div className="w-36 flex-shrink-0 relative">
                            {post.photo ? (
                                <img src={`${API_BASE}${post.photo}`} alt={post.title} className="w-full h-full object-cover transition-transform group-hover:scale-105" />
                            ) : (
                                <div className="w-full h-full bg-slate-100 flex items-center justify-center">
                                    <ImageIcon className="h-10 w-10 text-slate-400" />
                                </div>
                            )}
                        </div>
                        <div className="p-5 flex flex-col flex-1 min-w-0 group-hover:bg-slate-50/50 transition-colors">
                          <div>
                            <p className="text-xs text-blue-500 font-semibold">{post.categoryName}</p>
                            <h4 className="font-semibold text-lg truncate mt-1 group-hover:text-blue-600 transition-colors">{post.title}</h4>
                            <p className="text-sm text-gray-500 mt-1.5 line-clamp-2">
                              {post.content}
                            </p>
                          </div>
                          <div className="text-xs text-gray-500 flex items-center justify-between mt-auto pt-3 border-t border-slate-200">
                            <span>{formatDynamicDate(post.createdDate)}</span>
                            <div className="flex items-center gap-3">
                              <span className="flex items-center gap-1.5" title="좋아요"><Heart className="h-4 w-4 text-red-400" /> {post.likeCount}</span>
                              <span className="flex items-center gap-1.5" title="조회수"><Eye className="h-4 w-4 text-gray-600" /> {post.viewCount}</span>
                              <span className="flex items-center gap-1.5" title="댓글"><MessageSquare className="h-4 w-4 text-gray-600" /> {post.commentCount ?? 0}</span>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                ))
              ) : (
                  <Card className="border-dashed rounded-xl">
                    <CardContent className="p-10 text-center flex flex-col items-center">
                      <div className="p-4 bg-slate-100 rounded-full mb-4">
                        <Pencil className="h-8 w-8 text-slate-400" />
                      </div>
                      <h3 className="font-bold text-lg">아직 작성한 게시글이 없어요</h3>
                      <p className="text-gray-500 mt-1">첫 게시글을 작성하고 사람들과 소통해보세요!</p>
                      <Button asChild className="mt-6">
                        <Link href="/posts/create">
                          <PlusCircle className="h-4 w-4 mr-2" />
                          게시글 작성하기
                        </Link>
                      </Button>
                    </CardContent>
                  </Card>
              )}
            </div>
          </TabsContent>

          <TabsContent value="comments" className="mt-6">
            {/* --- ✅ 수정점: space-y-6 대신 flex flex-col gap-6 사용 --- */}
            <div className="flex flex-col gap-6">
              {isLoadingComments ? (
                [...Array(3)].map((_, i) => <Skeleton key={i} className="h-32 w-full rounded-xl" />)
              ) : myComments && myComments.length > 0 ? (
                myComments.map((comment) => (
                  <Link href={`/posts/${comment.postId}#comment-${comment.commentId}`} key={comment.commentId}>
                    <Card className="transition-all duration-300 ease-in-out hover:shadow-lg hover:border-blue-300 group bg-white rounded-xl overflow-hidden">
                      <CardContent className="p-5 pb-0">
                        <div className="flex items-start gap-4">
                          <Quote className="h-6 w-6 text-blue-200 flex-shrink-0 mt-0.5" />
                          <p className="text-gray-700 text-base line-clamp-2">
                            {comment.content}
                          </p>
                        </div>
                      </CardContent>
                      <div className="bg-slate-50/70 mt-4 px-5 py-3 flex flex-wrap items-center justify-between gap-y-2 text-sm">
                        <p className="text-gray-500 truncate text-xs font-medium">
                          <FileText className="h-3.5 w-3.5 inline-block mr-1.5 align-middle text-slate-400" />
                          <span className="align-middle text-blue-600 group-hover:underline">
                            {comment.postTitle}
                          </span>
                          <span className="text-gray-400 ml-1">게시글에 남긴 댓글</span>
                        </p>
                        <div className="flex items-center gap-4 text-xs text-gray-500 flex-shrink-0">
                          <span>{formatDynamicDate(comment.createdDate)}</span>
                          <span className="flex items-center gap-1 font-medium">
                            <Heart className="h-3.5 w-3.5 text-red-400" /> {comment.likeCount}
                          </span>
                        </div>
                      </div>
                    </Card>
                  </Link>
                ))
              ) : (
                <Card className="border-dashed rounded-xl">
                  <CardContent className="p-10 text-center flex flex-col items-center">
                    <div className="p-4 bg-slate-100 rounded-full mb-4">
                      <MessageSquare className="h-8 w-8 text-slate-400" />
                    </div>
                    <h3 className="font-bold text-lg">아직 작성한 댓글이 없어요</h3>
                    <p className="text-gray-500 mt-1">다양한 게시글에 의견을 남겨보세요.</p>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>
        
        </Tabs>
      </div>
    </div>
  );
}