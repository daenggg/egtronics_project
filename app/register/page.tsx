"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
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
import { ScrollArea } from "@/components/ui/scroll-area";

export default function RegisterPage() {
  const [name, setName] = useState("");
  const [nickname, setNickname] = useState("");
  const [emailId, setEmailId] = useState("");
  const [domain, setDomain] = useState("naver.com");
  const [customDomain, setCustomDomain] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(false);

  const [phonePrefix, setPhonePrefix] = useState("010");
  const [customPhonePrefix, setCustomPhonePrefix] = useState("");
  const [phone, setPhone] = useState("");

  const { register } = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  const email =
    domain === "custom" ? `${emailId}@${customDomain}` : `${emailId}@${domain}`;

  const checkNickname = async () => {
    if (!nickname) {
      toast({ title: "닉네임을 입력해주세요", variant: "destructive" });
      return;
    }

    setChecking(true);
    try {
      const res = await fetch(
        `/api/check-nickname?nickname=${encodeURIComponent(nickname)}`
      );
      const data = await res.json();

      if (data.available) {
        toast({ title: "사용 가능한 닉네임입니다" });
      } else {
        toast({ title: "중복된 닉네임입니다", variant: "destructive" });
      }
    } catch {
      toast({ title: "오류가 발생했습니다", variant: "destructive" });
    } finally {
      setChecking(false);
    }
  };

  // 전화번호 앞자리와 뒷자리 합쳐서 자동 포맷팅 함수
  const formatFullPhoneNumber = (
    prefix: string,
    middleAndLast: string
  ): string => {
    const onlyNums = (prefix + middleAndLast).replace(/\D/g, "").slice(0, 11); // 최대 11자리 (010 + 8자리)
    if (onlyNums.length <= 3) {
      return onlyNums;
    } else if (onlyNums.length <= 7) {
      return `${onlyNums.slice(0, 3)}-${onlyNums.slice(3)}`;
    } else {
      return `${onlyNums.slice(0, 3)}-${onlyNums.slice(3, 7)}-${onlyNums.slice(
        7
      )}`;
    }
  };

  // 앞자리 input 값 변경 시 처리
  const handlePrefixChange = (val: string) => {
    const onlyNums = val.replace(/\D/g, "").slice(0, 3);
    setCustomPhonePrefix(onlyNums);
    setPhonePrefix(onlyNums === "" ? "custom" : onlyNums);
    // 뒷자리 숫자만 합쳐서 포맷팅 다시 적용
    const formatted = formatFullPhoneNumber(
      onlyNums === "" ? "" : onlyNums,
      phone.replace(/-/g, "")
    );
    // 포맷팅에서 앞자리는 제외하고 뒷자리만 저장
    setPhone(formatted.slice(formatted.indexOf("-") + 1).replace(/-/g, ""));
  };

  // 뒷자리 input 값 변경 시 처리
  const handlePhoneChange = (val: string) => {
    const onlyNums = val.replace(/\D/g, "").slice(0, 8);
    const prefix = phonePrefix === "custom" ? customPhonePrefix : phonePrefix;
    const formatted = formatFullPhoneNumber(prefix, onlyNums);
    setPhone(formatted.slice(formatted.indexOf("-") + 1).replace(/-/g, ""));
  };

  const fullPhoneNumber =
    phonePrefix === "custom" && customPhonePrefix !== ""
      ? formatFullPhoneNumber(customPhonePrefix, phone)
      : formatFullPhoneNumber(phonePrefix, phone);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      toast({
        title: "비밀번호 불일치",
        description: "비밀번호가 일치하지 않습니다.",
        variant: "destructive",
      });
      return;
    }

    if (!emailId || (domain === "custom" && !customDomain)) {
      toast({
        title: "이메일을 정확히 입력해주세요.",
        variant: "destructive",
      });
      return;
    }

    if (
      fullPhoneNumber.length < 10 // 10자리 이상이어야 함 (ex: 010-1234-5678)
    ) {
      toast({
        title: "전화번호를 정확히 입력해주세요.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      await register(name, email, password);
      toast({ title: "회원가입 성공", description: "환영합니다!" });
      router.push("/");
    } catch {
      toast({
        title: "회원가입 실패",
        description: "다시 시도해주세요.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 flex justify-center min-h-[80vh] items-center">
      <Card className="w-full max-w-md glass-effect border-0 shadow-2xl">
        <ScrollArea className="h-[500px]">
          <form onSubmit={handleSubmit} className="space-y-1">
            <CardHeader className="text-center pb-8">
              <CardTitle className="text-3xl font-bold bg-gradient-to-r from-pink-500 to-purple-500 bg-clip-text text-transparent">
                egtronics 오늘의 게시판
              </CardTitle>
              <CardTitle className="text-3xl font-bold bg-gradient-to-r from-gray-700 to-gray-400 bg-clip-text text-transparent">
                회원가입
              </CardTitle>
              <CardDescription className="text-gray-600 mt-2">
                새 계정을 생성하여 커뮤니티에 참여하세요
              </CardDescription>
            </CardHeader>
            <CardContent>
              {/* 이름 */}
              <div className="space-y-2 mb-6">
                <Label htmlFor="name">이름</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="이름을 입력하세요"
                  required
                />
              </div>

              {/* 이메일 */}
              <div className="space-y-2 mb-6">
                <Label>이메일</Label>
                <div className="flex gap-2">
                  <Input
                    value={emailId}
                    onChange={(e) => setEmailId(e.target.value)}
                    placeholder="이메일 아이디"
                    className="flex-1"
                    required
                  />
                  <select
                    value={domain}
                    onChange={(e) => setDomain(e.target.value)}
                    className="border-gray-200 focus:border-blue-300 focus:ring-blue-200"
                  >
                    <option value="naver.com">@naver.com</option>
                    <option value="gmail.com">@gmail.com</option>
                    <option value="daum.net">@daum.net</option>
                    <option value="custom">직접 입력</option>
                  </select>
                </div>
                {domain === "custom" && (
                  <Input
                    value={customDomain}
                    onChange={(e) => setCustomDomain(e.target.value)}
                    placeholder="도메인을 입력하세요"
                    className="mt-2"
                    required
                  />
                )}
                <p className="text-sm text-gray-500">전체 이메일: {email}</p>
              </div>

              {/* 비밀번호 */}
              <div className="space-y-2 mb-6">
                <Label htmlFor="password">비밀번호</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="비밀번호"
                  required
                />
              </div>

              {/* 비밀번호 확인 */}
              <div className="space-y-2 mb-4">
                <Label htmlFor="confirmPassword">비밀번호 확인</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="비밀번호 재입력"
                  required
                />
              </div>

              {/* 전화번호 */}
              <div className="space-y-2 mb-6">
                <Label className="text-gray-700 font-medium">전화번호</Label>
                <div className="flex gap-2 items-center">
                  {/* 국번 선택 또는 직접 입력 */}
                  {phonePrefix === "custom" ? (
                    <Input
                      type="text"
                      value={customPhonePrefix}
                      onChange={(e) => {
                        // 숫자만 3자리 제한
                        const onlyNums = e.target.value
                          .replace(/\D/g, "")
                          .slice(0, 3);
                        setCustomPhonePrefix(onlyNums);
                      }}
                      placeholder="000"
                      className="w-20 border-gray-200 focus:border-blue-300 focus:ring-blue-200"
                      autoFocus
                      required
                    />
                  ) : (
                    <select
                      value={phonePrefix}
                      onChange={(e) => {
                        if (e.target.value === "custom") {
                          setPhonePrefix("custom");
                          setCustomPhonePrefix("");
                        } else {
                          setPhonePrefix(e.target.value);
                        }
                      }}
                      className="border-gray-200 focus:border-blue-300 focus:ring-blue-200"
                    >
                      <option value="010">010</option>
                      <option value="011">011</option>
                      <option value="016">016</option>
                      <option value="custom">직접 입력</option>
                    </select>
                  )}

                  {/* 나머지 전화번호 입력 */}
                  <Input
                    type="tel"
                    value={phone}
                    onChange={(e) => {
                      const onlyNums = e.target.value
                        .replace(/\D/g, "")
                        .slice(0, 8);
                      let formatted = onlyNums;
                      if (onlyNums.length > 4) {
                        formatted = `${onlyNums.slice(0, 4)}-${onlyNums.slice(
                          4
                        )}`;
                      }
                      setPhone(formatted);
                    }}
                    placeholder="전화번호"
                    className="flex-grow border-gray-200 focus:border-blue-300 focus:ring-blue-200"
                    required
                  />
                </div>
                <p className="text-sm text-gray-500 mt-1">
                  전체 전화번호:{" "}
                  {phonePrefix === "custom" ? customPhonePrefix : phonePrefix}-
                  {phone}
                </p>
              </div>

              {/* 닉네임 */}
              <div className="space-y-2 mb-6">
                <Label htmlFor="nickname">닉네임</Label>
                <div className="flex space-x-2">
                  <Input
                    id="nickname"
                    value={nickname}
                    onChange={(e) => setNickname(e.target.value)}
                    placeholder="닉네임"
                    required
                  />
                  <Button
                    type="button"
                    onClick={checkNickname}
                    disabled={checking}
                  >
                    {checking ? "확인 중..." : "중복 검사"}
                  </Button>
                </div>
              </div>

              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white py-3"
                disabled={loading}
              >
                {loading ? "가입 중..." : "회원가입"}
              </Button>
              <div className="mt-6 text-center text-sm">
                <span className="text-gray-600">이미 계정이 있으신가요? </span>
                <Link href="/login" className="text-blue-600 hover:underline">
                  로그인하기
                </Link>
              </div>
            </CardContent>
          </form>
        </ScrollArea>
      </Card>
    </div>
  );
}
