"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/auth-context";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import {
  Edit,
  Save,
  Heart,
  Eye,
  FileText,
  MessageSquare,
  Image as ImageIcon,
  Pencil,
  PlusCircle,
  Quote,
  UserCircle,
  User,
  Mail,
  Phone,
  Lock,
  KeyRound,
} from "lucide-react";
import { PostPreview, MyComment } from "@/lib/types";
import { useMyPosts, useMyComments } from "@/hooks/use-my-activities";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDynamicDate } from "@/lib/utils";
import { API_BASE } from "@/lib/api-client";

// ✅ 해결: 컴포넌트 정의를 ProfilePage 바깥으로 이동
const ProfileInfoItem = ({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
}) => (
  <div className="flex items-start gap-4 text-left">
    <Icon className="h-5 w-5 text-muted-foreground mt-0.5 flex-shrink-0" />
    <div className="flex-1">
      <p className="text-sm font-medium text-muted-foreground">{label}</p>
      <p className="text-base text-foreground">{value}</p>
    </div>
  </div>
);

// ✅ 해결: 컴포넌트 정의를 ProfilePage 바깥으로 이동
const ProfileEditItem = ({
  icon: Icon,
  id,
  label,
  value,
  onChange,
  error,
  type = "text",
  placeholder,
  disabled = false,
}: any) => (
  <div className="space-y-1.5 text-left">
    <Label htmlFor={id} className="font-medium text-foreground">
      {label}
    </Label>
    <div className="relative">
      <Icon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
      <Input
        id={id}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        disabled={disabled}
        className="pl-10 bg-background"
      />
    </div>
    {error && <p className="text-red-600 text-sm mt-1">{error}</p>}
  </div>
);

const formatPhoneNumber = (value: string) => {
  if (!value) return value;
  const phoneNumber = value.replace(/[^\d]/g, "");
  const phoneNumberLength = phoneNumber.length;
  if (phoneNumberLength < 4) return phoneNumber;
  if (phoneNumberLength < 8) {
    return `${phoneNumber.slice(0, 3)}-${phoneNumber.slice(3)}`;
  }
  return `${phoneNumber.slice(0, 3)}-${phoneNumber.slice(3, 7)}-${phoneNumber.slice(7, 11)}`;
};

export default function ProfilePage() {
  const { user, updateUserInfo, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const router = useRouter();

  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string | undefined>>({});

  const passwordRegex =
    /^(?=.*[A-Za-z])(?=.*\d)(?=.*[!@#$%^&*()_+=[\]{};':"\\|,.<>/?-]).{6,20}$/;
  const koreanRegex = /^[가-힣]+$/;
  const englishRegex = /^[A-Za-z]+$/;
  const phoneRegex = /^\d{3}-\d{4}-\d{4}$/;

  const [name, setName] = useState("");
  const [nickname, setNickname] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [profilePicture, setProfilePicture] = useState("");
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const { data: myPosts, isLoading: isLoadingPosts } = useMyPosts();
  const { data: myComments, isLoading: isLoadingComments } = useMyComments();

  // user 객체가 로드되거나 변경될 때마다 상태를 동기화합니다.
  useEffect(() => {
    if (user) {
      setName(user.name || "");
      setNickname(user.nickname || "");
      setPhoneNumber(user.phoneNumber || "");
      setProfilePicture(user.profilePicture || "");
    }
  }, [user]);

  useEffect(() => {
    if (!avatarFile) return;
    const objectUrl = URL.createObjectURL(avatarFile);
    setProfilePicture(objectUrl);
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
    if (!phoneRegex.test(phoneNumber))
      newErrors.phoneNumber =
        "전화번호 형식이 올바르지 않습니다. (예: 010-1234-5678)";
    if (newPassword && !passwordRegex.test(newPassword))
      newErrors.newPassword =
        "비밀번호는 영문, 숫자, 특수문자 포함 6~20자리여야 합니다.";
    if (newPassword && newPassword !== confirmPassword)
      newErrors.confirmPassword = "새 비밀번호가 일치하지 않습니다.";
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

  if (authLoading) {
    return (
      <div className="bg-background min-h-screen">
        <div className="container mx-auto px-4 py-8 md:py-12 max-w-4xl">
          <Skeleton className="h-10 w-48 mb-8" />
          <Card className="mb-10 glass-effect border-0 shadow-2xl overflow-hidden bg-card">
            <CardHeader>
              <Skeleton className="h-8 w-32" />
            </CardHeader>
            <CardContent>
              <div className="flex flex-col items-center gap-6 md:flex-row md:items-start md:gap-8">
                <Skeleton className="h-24 w-24 rounded-full" />
                <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6 w-full">
                  {[...Array(6)].map((_, i) => (
                    <Skeleton key={i} className="h-16 w-full" />
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
          <Skeleton className="h-12 w-full" />
        </div>
      </div>
    );
  }

  if (!authLoading && !user) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-200px)] bg-background">
        <Card className="text-center p-8 glass-effect border-0 shadow-xl w-full max-w-sm bg-card">
          <CardTitle className="mb-2 text-lg font-medium">
            로그인이 필요합니다
          </CardTitle>
          <CardContent className="text-muted-foreground p-0">
            <p>마이페이지를 보려면 먼저 로그인해주세요.</p>
            <Button asChild className="mt-6">
              <Link href="/login">로그인하기</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="bg-background min-h-screen w-full">
      <div className="container mx-auto px-4 py-8 md:py-12 max-w-4xl space-y-10">
        <div>
          <h1 className="text-2xl md:text-4xl font-medium text-foreground mb-3 flex items-center gap-3">
            <UserCircle className="h-9 w-9 text-muted-foreground" />
            마이페이지
          </h1>
          <p className="text-lg text-muted-foreground">
            내 정보를 관리하고 활동 내역을 확인하세요.
          </p>
        </div>

        <Card className="glass-effect border-0 shadow-2xl overflow-hidden bg-card">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-2xl font-normal">
                내 프로필
              </CardTitle>
              <Button
                size="sm"
                onClick={() => (isEditing ? handleSave() : setIsEditing(true))}
                disabled={isSaving}
                className={
                  isEditing
                    ? "bg-primary text-primary-foreground shadow-lg"
                    : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                }
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
                <Avatar className="h-24 w-24 cursor-pointer border-2 border-background shadow-lg">
                  <AvatarImage
                    src={
                      profilePicture
                        ? profilePicture.startsWith("blob:")
                          ? profilePicture
                          : `${API_BASE}${profilePicture}`
                        : "/images.png"
                    }
                    alt={user?.name || "User"}
                  />
                  <AvatarFallback className="text-3xl bg-gradient-to-br from-pink-500 to-purple-500 text-white">
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
                    <ProfileEditItem
                      icon={User}
                      id="nickname"
                      label="닉네임"
                      value={nickname}
                      onChange={(e: any) => setNickname(e.target.value)}
                      error={errors.nickname}
                    />
                    <ProfileEditItem
                      icon={User}
                      id="name"
                      label="이름"
                      value={name}
                      onChange={(e: any) => setName(e.target.value)}
                      error={errors.name}
                    />
                    <ProfileEditItem
                      icon={Mail}
                      id="email"
                      label="이메일"
                      value={user?.email || ""}
                      disabled
                    />
                    <ProfileEditItem
                      icon={KeyRound}
                      id="userId"
                      label="아이디"
                      value={user?.userId || ""}
                      disabled
                    />
                    <ProfileEditItem
                      icon={Phone}
                      id="phoneNumber"
                      label="전화번호"
                      value={phoneNumber}
                      onChange={(e: any) => {
                        const formattedPhoneNumber = formatPhoneNumber(e.target.value);
                        setPhoneNumber(formattedPhoneNumber);
                        if (!phoneRegex.test(formattedPhoneNumber)) {
                          setErrors(prev => ({ ...prev, phoneNumber: "전화번호 형식이 올바르지 않습니다. (예: 010-1234-5678)" }));
                        } else { setErrors(prev => ({ ...prev, phoneNumber: undefined })); }
                      }}
                      error={errors.phoneNumber}
                    />
                    <ProfileEditItem
                      icon={Lock}
                      id="newPassword"
                      label="새 비밀번호"
                      value={newPassword}
                      onChange={(e: any) => {
                        const value = e.target.value;
                        setNewPassword(value);
                        if (value && !passwordRegex.test(value)) {
                          setErrors(prev => ({ ...prev, newPassword: "비밀번호는 영문, 숫자, 특수문자 포함 6~20자리여야 합니다." }));
                        } else { setErrors(prev => ({ ...prev, newPassword: undefined })); }
                        if (confirmPassword && value !== confirmPassword) { setErrors(prev => ({ ...prev, confirmPassword: "새 비밀번호가 일치하지 않습니다." })); } else if (confirmPassword) { setErrors(prev => ({ ...prev, confirmPassword: undefined })); }
                      }}
                      type="password"
                      placeholder="변경 시에만 입력"
                      error={errors.newPassword}
                    />
                    <div className="md:col-span-2">
                      <ProfileEditItem
                        icon={Lock}
                        id="confirmPassword"
                        label="비밀번호 확인"
                        value={confirmPassword}
                        onChange={(e: any) => {
                          const value = e.target.value;
                          setConfirmPassword(value);
                          if (newPassword && newPassword !== value) {
                            setErrors(prev => ({ ...prev, confirmPassword: "새 비밀번호가 일치하지 않습니다." }));
                          } else { setErrors(prev => ({ ...prev, confirmPassword: undefined })); }
                        }}
                        type="password"
                        placeholder="새 비밀번호 확인"
                        error={errors.confirmPassword}
                      />
                    </div>
                  </>
                ) : (
                  <>
                    <ProfileInfoItem
                      icon={User}
                      label="닉네임"
                      value={nickname}
                    />
                    <ProfileInfoItem icon={User} label="이름" value={name} />
                    <ProfileInfoItem
                      icon={Mail}
                      label="이메일"
                      value={user?.email || ""}
                    />
                    <ProfileInfoItem
                      icon={KeyRound}
                      label="아이디"
                      value={user?.userId || ""}
                    />
                    <ProfileInfoItem
                      icon={Phone}
                      label="전화번호"
                      value={phoneNumber}
                    />
                    <ProfileInfoItem
                      icon={Lock}
                      label="비밀번호"
                      value="********"
                    />
                  </>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-effect border-0 shadow-2xl overflow-hidden bg-card">
          <CardHeader>
            <CardTitle className="text-2xl font-medium">
              내 활동 내역
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="posts" className="bg-card">
              <TabsList className="grid w-full grid-cols-2 bg-muted/50 p-1 rounded-lg h-auto">
                <TabsTrigger
                  value="posts"
                  className="py-2.5 data-[state=active]:bg-background data-[state=active]:text-primary data-[state=active]:shadow-md font-semibold transition-all duration-300"
                >
                  <FileText className="h-4 w-4 mr-2" />내 게시글
                </TabsTrigger>
                <TabsTrigger
                  value="comments"
                  className="py-2.5 data-[state=active]:bg-background data-[state=active]:text-primary data-[state=active]:shadow-md font-semibold transition-all duration-300"
                >
                  <MessageSquare className="h-4 w-4 mr-2" />내 댓글
                </TabsTrigger>
              </TabsList>

              <TabsContent value="posts" className="mt-6">
                <div className="flex flex-col gap-6">
                  {isLoadingPosts ? (
                    [...Array(3)].map((_, i) => (
                      <Skeleton key={i} className="h-40 w-full rounded-xl" />
                    ))
                  ) : myPosts && myPosts.length > 0 ? (
                    myPosts.map((post) => (
                      <Link href={`/posts/${post.postId}`} key={post.postId}>
                        <Card className="overflow-hidden transition-all duration-300 ease-in-out hover:shadow-xl hover:-translate-y-1 group border bg-background hover:border-primary/50 rounded-xl">
                          <CardContent className="p-5 flex h-40 items-center gap-5">
                            <div className="w-40 flex-shrink-0 relative h-full">
                              {post.photo ? (
                                <img
                                  src={`${API_BASE}${post.photo}`}
                                  alt={post.title}
                                  className="w-full h-full object-cover transition-transform group-hover:scale-105 rounded-lg"
                                />
                              ) : (
                                <div className="w-full h-full bg-muted/50 flex items-center justify-center rounded-lg">
                                  <ImageIcon className="h-10 w-10 text-muted-foreground" />
                                </div>
                              )}
                            </div>
                            <div className="py-1 flex flex-col flex-1 min-w-0 h-full">
                              <div>
                                <p className="text-xs text-foreground font-semibold">
                                  {post.categoryName}
                                </p>
                                <h4 className="font-semibold text-lg truncate mt-1 group-hover:text-primary transition-colors">
                                  {post.title}
                                </h4>
                                <p className="text-sm text-muted-foreground mt-1.5 line-clamp-2">
                                  {post.content}
                                </p>
                              </div>
                              <div className="text-xs text-muted-foreground flex items-center justify-between mt-auto pt-3 border-t border-border">
                                <span>
                                  {formatDynamicDate(post.createdDate)}
                                </span>
                                <div className="flex items-center gap-3">
                                  <span
                                    className="flex items-center gap-1.5"
                                    title="좋아요"
                                  >
                                    <Heart className="h-4 w-4 text-red-400" />{" "}
                                    {post.likeCount}
                                  </span>
                                  <span
                                    className="flex items-center gap-1.5"
                                    title="조회수"
                                  >
                                    <Eye className="h-4 w-4" />{" "}
                                    {post.viewCount}
                                  </span>
                                  <span
                                    className="flex items-center gap-1.5"
                                    title="댓글"
                                  >
                                    <MessageSquare className="h-4 w-4" />{" "}
                                    {post.commentCount ?? 0}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </Link>
                    ))
                  ) : (
                    <Card className="border-dashed rounded-xl bg-background">
                      <CardContent className="p-10 text-center flex flex-col items-center">
                        <div className="p-4 bg-muted rounded-full mb-4">
                          <Pencil className="h-8 w-8 text-muted-foreground" />
                        </div>
                        <h3 className="font-bold text-lg">
                          아직 작성한 게시글이 없어요
                        </h3>
                        <p className="text-muted-foreground mt-1">
                          첫 게시글을 작성하고 사람들과 소통해보세요!
                        </p>
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
                <div className="flex flex-col gap-6">
                  {isLoadingComments ? (
                    [...Array(3)].map((_, i) => (
                      <Skeleton key={i} className="h-32 w-full rounded-xl" />
                    ))
                  ) : myComments && myComments.length > 0 ? (
                    myComments.map((comment) => (
                      <Link
                        href={`/posts/${comment.postId}#comment-${comment.commentId}`}
                        key={comment.commentId}
                      >
                        <Card className="transition-all duration-300 ease-in-out hover:shadow-lg hover:border-primary/50 group bg-background rounded-xl overflow-hidden">
                          <CardContent className="p-5 pb-0">
                            <div className="flex items-start gap-4">
                              <Quote className="h-6 w-6 text-primary/30 flex-shrink-0 mt-0.5" />
                              <p className="text-foreground text-base line-clamp-2">
                                {comment.content}
                              </p>
                            </div>
                          </CardContent>
                          <div className="bg-muted/50 mt-4 px-5 py-3 flex flex-wrap items-center justify-between gap-y-2 text-sm">
                            <p className="text-muted-foreground truncate text-xs font-medium">
                              <FileText className="h-3.5 w-3.5 inline-block mr-1.5 align-middle text-muted-foreground" />
                              <span className="align-middle text-primary group-hover:underline">
                                {comment.postTitle}
                              </span>
                              <span className="text-muted-foreground/80 ml-1">
                                게시글에 남긴 댓글
                              </span>
                            </p>
                            <div className="flex items-center gap-4 text-xs text-muted-foreground flex-shrink-0">
                              <span>
                                {formatDynamicDate(comment.createdDate)}
                              </span>
                              <span className="flex items-center gap-1 font-medium">
                                <Heart className="h-3.5 w-3.5 text-red-400" />{" "}
                                {comment.likeCount}
                              </span>
                            </div>
                          </div>
                        </Card>
                      </Link>
                    ))
                  ) : (
                    <Card className="border-dashed rounded-xl bg-background">
                      <CardContent className="p-10 text-center flex flex-col items-center">
                        <div className="p-4 bg-muted rounded-full mb-4">
                          <MessageSquare className="h-8 w-8 text-muted-foreground" />
                        </div>
                        <h3 className="font-bold text-lg">
                          아직 작성한 댓글이 없어요
                        </h3>
                        <p className="text-muted-foreground mt-1">
                          다양한 게시글에 의견을 남겨보세요.
                        </p>
                      </CardContent>
                    </Card>
                  )}
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}