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
  // 상태 변수
  const [userId, setUserId] = useState("");
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

  // 에러 상태
  const [errors, setErrors] = useState<{
    userId?: string;
    name?: string;
    email?: string;
    password?: string;
    confirmPassword?: string;
    phone?: string;
    nickname?: string;
  }>({});

  // 닉네임 중복 상태
  const [nicknameAvailable, setNicknameAvailable] = useState<boolean | null>(
    null
  );
  const { register } = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  // 이메일 전체 조합 (trim 적용)
  const email =
    domain === "custom"
      ? `${emailId.trim()}@${customDomain.trim()}`
      : `${emailId.trim()}@${domain}`;

  // 전화번호 전체 조합 (trim 적용)
  const fullPhoneNumber =
    phonePrefix === "custom" && customPhonePrefix.trim() !== ""
      ? formatFullPhoneNumber(customPhonePrefix.trim(), phone.trim())
      : formatFullPhoneNumber(phonePrefix, phone.trim());

  // 정규식
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const phoneRegex = /^\d{3}-\d{4}-\d{4}$/;
  const passwordRegex =
    /^(?=.*[A-Za-z])(?=.*\d)(?=.*[!@#$%^&*()_+=[\]{};':"\\|,.<>/?-]).{8,13}$/;

  // 닉네임 중복 체크
  const checkNickname = async () => {
    if (!nickname.trim()) {
      toast({ title: "닉네임을 입력해주세요", variant: "destructive" });
      return;
    }
    setChecking(true);
    try {
      const res = await fetch(
        `/users/checkNickname?nickname=${encodeURIComponent(nickname.trim())}`
      );

      if (!res.ok) {
        throw new Error(`서버 응답 오류: ${res.status}`);
      }

      const data = await res.json();

      if (data.available) {
        toast({ title: "사용 가능한 닉네임입니다" });
        setNicknameAvailable(true);
        setErrors((prev) => ({ ...prev, nickname: undefined }));
      } else {
        toast({ title: "중복된 닉네임입니다", variant: "destructive" });
        setNicknameAvailable(false);
        setErrors((prev) => ({ ...prev, nickname: "중복된 닉네임입니다." }));
      }
    } catch (err) {
      console.error(err);
      toast({ title: "오류가 발생했습니다", variant: "destructive" });
      setNicknameAvailable(null);
    } finally {
      setChecking(false);
    }
  };
  // 전화번호 포맷팅 함수
  function formatFullPhoneNumber(
    prefix: string,
    middleAndLast: string
  ): string {
    const onlyNums = (prefix + middleAndLast).replace(/\D/g, "").slice(0, 11);
    if (onlyNums.length <= 3) {
      return onlyNums;
    } else if (onlyNums.length <= 7) {
      return `${onlyNums.slice(0, 3)}-${onlyNums.slice(3)}`;
    } else {
      return `${onlyNums.slice(0, 3)}-${onlyNums.slice(3, 7)}-${onlyNums.slice(
        7
      )}`;
    }
  }

  // 유효성 검사
  const validateAll = () => {
    const newErrors: typeof errors = {};

    if (!userId.trim()) newErrors.userId = "아이디를 입력해주세요.";
    if (!name.trim()) newErrors.name = "이름을 입력해주세요.";
    if (!emailRegex.test(email))
      newErrors.email = "올바른 이메일 형식이 아닙니다.";
    if (!passwordRegex.test(password))
      newErrors.password =
        "비밀번호는 영문, 숫자, 특수문자 포함 8~13자리여야 합니다.";
    if (confirmPassword !== password)
      newErrors.confirmPassword = "비밀번호가 일치하지 않습니다.";
    if (!phoneRegex.test(fullPhoneNumber))
      newErrors.phone =
        "전화번호 형식이 올바르지 않습니다. (예: 010-1234-5678)";
    if (!nickname.trim()) newErrors.nickname = "닉네임을 입력해주세요.";
    else if (nicknameAvailable === false)
      newErrors.nickname = "중복된 닉네임입니다.";
    else if (nicknameAvailable === null)
      newErrors.nickname = "닉네임 중복 확인이 필요합니다.";

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  // 버튼 활성화 조건 (loading 상태 포함)
  const isFormComplete =
    userId.trim() &&
    name.trim() &&
    emailId.trim() &&
    (domain !== "custom" || customDomain.trim()) &&
    password.trim() &&
    confirmPassword.trim() &&
    phone.trim() &&
    nickname.trim() &&
    !loading;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateAll()) {
      toast({
        title: "입력 오류",
        description: "입력한 정보를 다시 확인해주세요.",
        variant: "destructive",
      });
      return;
    }

    if (nicknameAvailable !== true) {
      toast({
        title: "닉네임 중복 확인을 해주세요",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      await register({
        userId,
        name,
        email,
        password,
        phone: fullPhoneNumber,
        nickname,
      });
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
                {errors.name && (
                  <p className="text-red-600 text-sm mt-1">{errors.name}</p>
                )}
              </div>

              {/* 아이디 */}
              <div className="space-y-2 mb-6">
                <Label htmlFor="userId">아이디</Label>
                <Input
                  id="userId"
                  value={userId}
                  onChange={(e) => setUserId(e.target.value)}
                  placeholder="아이디를 입력하세요"
                  required
                />
                {errors.userId && (
                  <p className="text-red-600 text-sm mt-1">{errors.userId}</p>
                )}
              </div>

              {/* 이메일 */}
              <div className="space-y-2 mb-6">
                <Label>이메일</Label>
                <div className="flex gap-2">
                  <Input
                    value={emailId}
                    onChange={(e) => setEmailId(e.target.value)}
                    placeholder="이메일"
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
                {errors.email && (
                  <p className="text-red-600 text-sm mt-1">{errors.email}</p>
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
                {errors.password && (
                  <p className="text-red-600 text-sm mt-1">{errors.password}</p>
                )}
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
                {errors.confirmPassword && (
                  <p className="text-red-600 text-sm mt-1">
                    {errors.confirmPassword}
                  </p>
                )}
              </div>

              {/* 전화번호 */}
              <div className="space-y-2 mb-6">
                <Label className="text-gray-700 font-medium">전화번호</Label>
                <div className="flex gap-2 items-center">
                  {phonePrefix === "custom" ? (
                    <Input
                      type="text"
                      value={customPhonePrefix}
                      onChange={(e) => {
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
                {errors.phone && (
                  <p className="text-red-600 text-sm mt-1">{errors.phone}</p>
                )}
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
                    onChange={(e) => {
                      setNickname(e.target.value);
                      setNicknameAvailable(null); // 닉네임 변경 시 초기화
                      setErrors((prev) => ({ ...prev, nickname: undefined }));
                    }}
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
                {errors.nickname && (
                  <p className="text-red-600 text-sm mt-1">{errors.nickname}</p>
                )}
              </div>

              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white py-3"
                disabled={loading || !isFormComplete}
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
