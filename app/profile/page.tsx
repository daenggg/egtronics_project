"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/auth-context";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { Edit, Save } from "lucide-react";

async function updateUserProfile(data: {
  name: string;
  nickname: string;
  phone: string;
  avatar?: string;
}) {
  // 실제 서버에 이미지 업로드 및 프로필 정보 업데이트 구현 필요
  return new Promise<void>((resolve) => setTimeout(resolve, 1000)); // 더미 딜레이
}

export default function ProfilePage() {
  const { user, setUser } = useAuth();
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);

  // 초기값 설정
  const [name, setName] = useState(user?.name || "");
  const [nickname, setNickname] = useState(user?.nickname || "");
  const [phone, setPhone] = useState(user?.phone || "");
  const [avatar, setAvatar] = useState(user?.avatar || "");
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const email = user?.email || "";

  // 프로필 사진 선택 시 미리보기 처리
  useEffect(() => {
    if (!avatarFile) return;
    const objectUrl = URL.createObjectURL(avatarFile);
    setAvatar(objectUrl);

    // 언마운트 시 URL 해제
    return () => URL.revokeObjectURL(objectUrl);
  }, [avatarFile]);

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setAvatarFile(e.target.files[0]);
    }
  };

  const handleSave = async () => {
    try {
      // TODO: avatarFile을 서버에 업로드하고 URL 받아오기
      // 예) const uploadedAvatarUrl = await uploadAvatar(avatarFile)

      await updateUserProfile({
        name,
        nickname,
        phone,
        avatar /* 또는 uploadedAvatarUrl */,
      });

      if (user && setUser) {
        setUser({
          id: user.id,
          name,
          nickname,
          phone,
          email: user.email || "",
          avatar, // 혹은 서버에서 받아온 업로드 URL
        });
      }

      setIsEditing(false);
      setAvatarFile(null); // 임시 파일 해제
      toast({
        title: "프로필 업데이트",
        description: "프로필이 성공적으로 업데이트되었습니다.",
        duration: 2000,
      });
    } catch (error) {
      toast({
        title: "업데이트 실패",
        description: "잠시 후 다시 시도해주세요.",
        variant: "destructive",
        duration: 2000,
      });
    }
  };

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-sm">
        <Card className="text-center p-8">
          <Avatar className="mx-auto mb-4 h-20 w-20 border border-gray-300">
            <AvatarFallback className="text-3xl">?</AvatarFallback>
          </Avatar>
          <CardTitle className="mb-2 text-lg font-semibold">비회원</CardTitle>
          <CardContent className="text-gray-600">
            비회원입니다.
            <br />
            로그인 또는 회원가입을
            <br />
            해주세요.
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <Card className="mb-8">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>내 프로필</CardTitle>
            <Button
              variant="outline"
              size="sm"
              onClick={() => (isEditing ? handleSave() : setIsEditing(true))}
            >
              {isEditing ? (
                <>
                  <Save className="h-4 w-4 mr-1" />
                  저장
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
          <div className="flex items-start space-x-6">
            <div className="relative">
              <Avatar className="h-24 w-24 cursor-pointer border border-gray-800">
                <AvatarImage
                  src={avatar || "/placeholder.svg"}
                  alt={user.name}
                />
                <AvatarFallback className="text-2xl">
                  {user.name.charAt(0)}
                </AvatarFallback>
              </Avatar>
              {isEditing && (
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarChange}
                  className="absolute top-0 left-0 w-24 h-24 opacity-0 cursor-pointer "
                  title="프로필 사진 변경"
                />
              )}
            </div>
            <div className="flex-1 space-y-4">
              {isEditing ? (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="nickname">닉네임</Label>
                    <Input
                      id="nickname"
                      value={nickname}
                      onChange={(e) => setNickname(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="name">이름</Label>
                    <Input
                      id="name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">이메일</Label>
                    <Input id="email" value={email} disabled />
                  </div>
                   <div className="space-y-2">
                    <Label htmlFor="id">아이디</Label>
                    <Input id="id" value={user.id} disabled />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password">비밀번호</Label>
                    <Input id="password" value={nickname} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">전화번호</Label>
                    <Input
                      id="phone"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                    />
                  </div>
                </>
              ) : (
                <>
                  <h2 className="text-2xl font-bold"> {nickname}</h2>
                  <p>이름: {name}</p>
                  <p className="text-muted-foreground">이메일: {email}</p>
                  <p>아이디: {user.id}</p>
                  <p>비밀번호: ********</p>
                  <p>전화번호: {phone}</p>
                </>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="posts" className="space-y-4">
        <TabsList>
          <TabsTrigger value="posts">내 게시글</TabsTrigger>
          <TabsTrigger value="comments">내 댓글</TabsTrigger>
        </TabsList>

        <TabsContent value="posts" className="space-y-4">
          {/* 실제 게시글 데이터가 들어올 자리 */}
        </TabsContent>

        <TabsContent value="comments" className="space-y-4">
          {/* 실제 댓글 데이터가 들어올 자리 */}
        </TabsContent>
      </Tabs>
    </div>
  );
}
