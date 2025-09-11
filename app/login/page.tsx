"use client";

import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { handleApiError } from "@/lib/api-client";
import { useAuth } from "@/contexts/auth-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";

export default function LoginPage() {
  const [userId, setUserId] = useState(""); 
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await login(userId, password); // email 대신 userId 전달
      toast({
        title: "로그인 성공",
        description: "환영합니다!",
        duration: 2000,
      });
      window.location.href = "/";
    } catch (error) {
      toast({
        title: "로그인 실패",
        description: handleApiError(error),
        variant: "destructive",
        duration: 2000,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 flex justify-center min-h-[80vh] items-center">
      <Card
        className="w-full max-w-md glass-effect border-0 shadow-2xl bg-card"
        data-vaul-no-drag
      >
        <CardHeader className="text-center pb-8">
          <CardTitle className="text-3xl font-bold bg-gradient-to-r from-pink-500 to-purple-500 bg-clip-text text-transparent">
            egtronics 오늘의 게시판
          </CardTitle>
          <CardTitle className="text-3xl font-bold text-foreground">
            로그인
          </CardTitle>
          <CardDescription className="text-muted-foreground mt-2">
            계정에 로그인하여 커뮤니티에 참여하세요
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* 아이디 입력 필드 */}
            <div className="space-y-2">
              <Label htmlFor="userId" className="text-foreground font-medium">
                아이디
              </Label>
              <Input
                id="userId"
                type="text"
                value={userId}
                onChange={(e) => setUserId(e.target.value)}
                className="pr-10"
                placeholder="아이디를 입력하세요"
                required
              />
            </div>

            {/* 비밀번호 입력 필드 */}
            <div className="space-y-2">
              <Label htmlFor="password" className="text-foreground font-medium">
                비밀번호
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="비밀번호를 입력하세요"
                  required
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all py-3"
              disabled={loading}
            >
              {loading ? "로그인 중..." : "로그인"}
            </Button>
          </form>

          <div className="mt-6 text-center text-sm">
            <span className="text-muted-foreground">계정이 없으신가요? </span>
            <Link
              href="/register"
              className="text-blue-600 hover:text-blue-700 font-medium hover:underline"
            >
              회원가입하기
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}