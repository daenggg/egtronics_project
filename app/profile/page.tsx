"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/auth-context";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { Edit, Save, KeyRound } from "lucide-react";

// 실제 서버에 프로필 정보 업데이트 구현 필요
async function updateUserProfile(data: {
  name: string;
  nickname: string;
  phone: string;
  avatar?: string;
  password?: string;
}) {
  // 더미 딜레이
  return new Promise<void>((resolve) => setTimeout(resolve, 1000));
}

export default function ProfilePage() {
  const { user, setUser, logout } = useAuth();
  const { toast } = useToast();
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);

  // 상태 변수
  const [name, setName] = useState("");
  const [nickname, setNickname] = useState("");
  const [phone, setPhone] = useState("");
  const [avatar, setAvatar] = useState("");
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // user 정보가 변경될 때마다 상태 업데이트
  useEffect(() => {
    if (user) {
      setName(user.name || "");
      setNickname(user.nickname || "");
      setPhone(user.phone || "");
      setAvatar(user.avatar || "");
    }
  }, [user]);

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
    if (newPassword && newPassword !== confirmPassword) {
      toast({
        title: "비밀번호 오류",
        description: "새 비밀번호가 일치하지 않습니다.",
        variant: "destructive",
        duration: 2000,
      });
      return;
    }

    try {
      // TODO: avatarFile을 서버에 업로드하고 URL 받아오기
      // 예) const uploadedAvatarUrl = await uploadAvatar(avatarFile)

      const updateData: Parameters<typeof updateUserProfile>[0] = {
        name,
        nickname,
        phone,
        avatar,
      };
      if (newPassword) {
        updateData.password = newPassword;
      }
      await updateUserProfile(updateData);

      if (user && setUser) {
        setUser({
          ...user,
          name,
          nickname,
          phone,
          avatar,
        });
      }

      setIsEditing(false);
      setAvatarFile(null);
      setNewPassword("");
      setConfirmPassword("");
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
        <Card className="text-center p-8 glass-effect border-0 shadow-xl">
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
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <Card className="mb-8 glass-effect border-0 shadow-2xl">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-2xl font-bold">내 프로필</CardTitle>
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
          <div className="flex flex-col items-center gap-6 text-center md:flex-row md:items-start md:text-left md:gap-8">
            <div className="relative group">
              <Avatar className="h-24 w-24 cursor-pointer border-2 border-white shadow-lg">
                <AvatarImage src={avatar || "/placeholder.svg"} alt={user.name} />
                <AvatarFallback className="text-3xl bg-gradient-to-br from-blue-400 to-purple-500 text-white">
                  {user.name.charAt(0)}
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
            <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4 w-full">
              {isEditing ? (
                <>
                  <div className="space-y-2 text-left">
                    <Label htmlFor="nickname">닉네임</Label>
                    <Input
                      id="nickname"
                      value={nickname}
                      onChange={(e) => setNickname(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2 text-left">
                    <Label htmlFor="name">이름</Label>
                    <Input
                      id="name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2 text-left">
                    <Label htmlFor="email">이메일</Label>
                    <Input id="email" value={user.email || ""} disabled />
                  </div>
                  <div className="space-y-2 text-left">
                    <Label htmlFor="userId">아이디</Label>
                    <Input id="userId" value={user.userId || user.id} disabled />
                  </div>
                  <div className="space-y-2 text-left">
                    <Label htmlFor="phone">전화번호</Label>
                    <Input
                      id="phone"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2 text-left">
                    <Label htmlFor="newPassword">새 비밀번호</Label>
                    <Input
                      id="newPassword"
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="변경 시에만 입력"
                    />
                  </div>
                  <div className="space-y-2 text-left">
                    <Label htmlFor="confirmPassword">비밀번호 확인</Label>
                    <Input
                      id="confirmPassword"
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="새 비밀번호 확인"
                    />
                  </div>
                </>
              ) : (
                <>
                  <div className="space-y-1 text-left">
                    <Label>닉네임</Label>
                    <p className="font-semibold text-lg">{nickname}</p>
                  </div>
                  <div className="space-y-1 text-left">
                    <Label>이름</Label>
                    <p>{name}</p>
                  </div>
                  <div className="space-y-1 text-left">
                    <Label>이메일</Label>
                    <p className="text-muted-foreground">{user.email}</p>
                  </div>
                  <div className="space-y-1 text-left">
                    <Label>아이디</Label>
                    <p>{user.userId || user.id}</p>
                  </div>
                  <div className="space-y-1 text-left">
                    <Label>전화번호</Label>
                    <p>{phone}</p>
                  </div>
                  <div className="space-y-1 text-left">
                    <Label>비밀번호</Label>
                    <p>********</p>
                  </div>
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
          <Card>
            <CardContent className="p-6 text-center text-gray-500">
              작성한 게시글이 없습니다.
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="comments" className="space-y-4">
          <Card>
            <CardContent className="p-6 text-center text-gray-500">
              작성한 댓글이 없습니다.
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
