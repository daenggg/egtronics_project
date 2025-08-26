"use client";

import React, { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { useRouter } from "next/navigation";
import Link from "next/link";

import { useAuth } from "@/contexts/auth-context";
import {
  checkIdAvailability,
  checkNicknameAvailability,
  handleApiError,
} from "@/lib/api-client";
import { useToast } from "@/hooks/use-toast";

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
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function RegisterForm() {
  const { register } = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  // 상태 변수
  const [userId, setUserId] = useState("");
  const [name, setName] = useState("");
  const [nickname, setNickname] = useState("");
  const [emailId, setEmailId] = useState("");
  const [domain, setDomain] = useState("naver.com");
  const [customDomain, setCustomDomain] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [phonePrefix, setPhonePrefix] = useState("010");
  const [customPhonePrefix, setCustomPhonePrefix] = useState("");
  const [phone, setPhone] = useState("");
  const [profilePicture, setProfilePicture] = useState<File | null>(null);

  // 상태 관리
  const [loading, setLoading] = useState(false);
  const [checkingId, setCheckingId] = useState(false);
  const [checkingNickname, setCheckingNickname] = useState(false);
  const [idAvailable, setIdAvailable] = useState<boolean | null>(null);
  const [nicknameAvailable, setNicknameAvailable] = useState<boolean | null>(
    null
  );
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState<Record<string, string | undefined>>({});

  // 조합된 값
  const email =
    domain === "custom"
      ? `${emailId.trim()}@${customDomain.trim()}`
      : `${emailId.trim()}@${domain}`;

  const fullPhoneNumber =
    phonePrefix === "custom" && customPhonePrefix.trim() !== ""
      ? formatPhone(customPhonePrefix.trim(), phone.trim())
      : formatPhone(phonePrefix, phone.trim());

  // 정규식
  const emailRegex = /^[A-Za-z0-9_-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;
  const phoneRegex = /^\d{3}-\d{4}-\d{4}$/;
  const userIdRegex = /^[A-Za-z0-9!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?~`]{6,20}$/;
  const passwordRegex =
    /^(?=.*[A-Za-z])(?=.*\d)(?=.*[!@#$%^&*()_+=[\]{};':"\\|,.<>/?-]).{6,20}$/;
  const koreanRegex = /^[가-힣]+$/;
  const englishRegex = /^[A-Za-z]+$/;

  // 유틸 함수
  function formatPhone(prefix: string, rest: string): string {
    const onlyNums = (prefix + rest).replace(/\D/g, "").slice(0, 11);
    if (onlyNums.length <= 3) return onlyNums;
    if (onlyNums.length <= 7)
      return `${onlyNums.slice(0, 3)}-${onlyNums.slice(3)}`;
    return `${onlyNums.slice(0, 3)}-${onlyNums.slice(3, 7)}-${onlyNums.slice(
      7
    )}`;
  }

  // 아이디 중복 검사
  const checkId = async () => {
    if (!userId.trim() || !userIdRegex.test(userId)) {
      toast({
        title: "아이디 오류",
        description: "아이디를 다시 확인해주세요.",
        variant: "destructive",
      });
      return;
    }

    setCheckingId(true);
    try {
      const isAvailable = await checkIdAvailability(userId.trim());
      if (isAvailable) {
        setIdAvailable(true);
        setErrors((prev) => ({ ...prev, userId: undefined }));
        toast({ title: "사용 가능한 아이디입니다" });
      } else {
        setIdAvailable(false);
        setErrors((prev) => ({
          ...prev,
          userId: "이미 사용 중인 아이디입니다.",
        }));
        toast({ title: "이미 사용 중인 아이디입니다", variant: "destructive" });
      }
    } catch (err) {
      toast({ title: "서버 오류", description: handleApiError(err), variant: "destructive" });
    } finally {
      setCheckingId(false);
    }
  };

  // 닉네임 중복 검사
  const checkNickname = async () => {
    if (!nickname.trim()) {
      toast({ title: "닉네임을 입력해주세요", variant: "destructive" });
      return;
    }

    setCheckingNickname(true);
    try {
      const isAvailable = await checkNicknameAvailability(nickname.trim());
      if (isAvailable) {
        setNicknameAvailable(true);
        setErrors((prev) => ({ ...prev, nickname: undefined }));
        toast({ title: "사용 가능한 닉네임입니다" });
      } else {
        setNicknameAvailable(false);
        setErrors((prev) => ({ ...prev, nickname: "중복된 닉네임입니다." }));
        toast({ title: "중복된 닉네임입니다", variant: "destructive" });
      }
    } catch (err) {
      toast({ title: "서버 오류", description: handleApiError(err), variant: "destructive" });
    } finally {
      setCheckingNickname(false);
    }
  };

  // 유효성 검사
  const validateAll = () => {
    const newErrors: typeof errors = {};

    if (!userId.trim()) newErrors.userId = "아이디를 입력해주세요.";
    else if (idAvailable === false)
      newErrors.userId = "이미 사용 중인 아이디입니다.";
    else if (idAvailable === null)
      newErrors.userId = "아이디 중복 확인이 필요합니다.";

    if (!name.trim()) newErrors.name = "이름을 입력해주세요.";
    else if (!(koreanRegex.test(name) || englishRegex.test(name)))
      newErrors.name = "이름은 한글 또는 영어로 입력해주세요.";

    if (!emailRegex.test(email))
      newErrors.email = "올바른 이메일 형식이 아닙니다.";

    if (!passwordRegex.test(password))
      newErrors.password =
        "비밀번호는 영문, 숫자, 특수문자 포함 6~20자리여야 합니다.";

    if (confirmPassword !== password)
      newErrors.confirmPassword = "비밀번호가 일치하지 않습니다.";

    if (!phoneRegex.test(fullPhoneNumber))
      newErrors.phoneNumber =
        "전화번호 형식이 올바르지 않습니다. (예: 010-1234-5678)";

    if (!nickname.trim()) newErrors.nickname = "닉네임을 입력해주세요.";
    else if (nicknameAvailable === false)
      newErrors.nickname = "중복된 닉네임입니다.";
    else if (nicknameAvailable === null)
      newErrors.nickname = "닉네임 중복 확인이 필요합니다.";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // 회원가입 제출
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateAll()) {
      toast({
        title: "입력 오류",
        description: "입력 정보를 확인해주세요.",
        variant: "destructive",
      });
      return;
    }

    // 아이디/닉네임 중복 체크 안 했으면 막기
    if (idAvailable !== true) {
      toast({ title: "아이디 중복 확인을 해주세요", variant: "destructive" });
      return;
    }
    if (nicknameAvailable !== true) {
      toast({ title: "닉네임 중복 확인을 해주세요", variant: "destructive" });
      return;
    }

    setLoading(true);
    try {
      // TODO: 프로필 사진을 업로드하고 URL을 받아와서 profilePicture에 설정해야 합니다.
      // 현재는 빈 문자열로 보냅니다.
      await register({
        userId,
        name,
        email,
        password,
        phoneNumber: fullPhoneNumber,
        nickname,
        authority: true,
        profilePicture: "",
      });
      toast({ title: "회원가입 성공", description: "로그인 페이지로 이동합니다." });
      router.push("/login");
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

  const isFormComplete =
    userId &&
    name &&
    emailId &&
    (domain !== "custom" || customDomain) &&
    password &&
    confirmPassword &&
    phone &&
    nickname &&
    !loading;

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
              {/* 프로필 사진 */}
              <div className="space-y-2 mb-6">
                <div className="flex justify-center">
                  <label
                    htmlFor="profilePicture"
                    className="cursor-pointer inline-block relative"
                  >
                    {profilePicture ? (
                      <img
                        src={URL.createObjectURL(profilePicture)}
                        alt="프로필 미리보기"
                        className="w-24 h-24 rounded-full object-cover border"
                      />
                    ) : (
                      <div className="w-24 h-24 rounded-full border flex items-center justify-center bg-gray-200 text-sm text-center">
                        프로필 사진
                        <br />
                        등록하기🖊
                      </div>
                    )}
                  </label>
                </div>
                <input
                  id="profilePicture"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) =>
                    e.target.files && setProfilePicture(e.target.files[0])
                  }
                />
              </div>

              {/* 이름 */}
              <div className="space-y-2 mb-6">
                <Label htmlFor="name">이름</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => {
                    let value = e.target.value;

                    // 최대 20글자 제한
                    if (value.length > 20) {
                      value = value.slice(0, 20);
                    }

                    setName(value);

                    // 오류 처리
                    setErrors((prev) => ({
                      ...prev,
                      name: !value.trim()
                        ? "이름을 입력해주세요."
                        : !(koreanRegex.test(value) || englishRegex.test(value))
                        ? "이름은 한글 또는 영어만 가능합니다."
                        : undefined,
                    }));
                  }}
                  placeholder="이름을 입력하세요"
                />

                {errors.name && (
                  <p className="text-red-600 text-sm mt-1">{errors.name}</p>
                )}
              </div>

              {/* 아이디 */}
              <div className="space-y-2 mb-6">
                <Label htmlFor="userId">아이디</Label>
                <div className="flex space-x-2">
                  <Input
                    id="userId"
                    value={userId}
                    onChange={(e) => {
                      let value = e.target.value;

                      // 최대 20글자 제한
                      if (value.length > 20) {
                        value = value.slice(0, 20);
                      }

                      setUserId(value);
                      setIdAvailable(null);

                      // 오류 처리
                      setErrors((prev) => ({
                        ...prev,
                        userId: value.trim()
                          ? userIdRegex.test(value)
                            ? undefined
                            : "아이디는 영문, 숫자, 특수문자를 넣을 수 있습니다. (6~20자리)."
                          : "아이디를 입력해주세요.",
                      }));
                    }}
                    placeholder="아이디를 입력하세요"
                  />

                  <Button
                    type="button"
                    onClick={checkId}
                    disabled={checkingId}
                  >
                    {checkingId ? "확인 중..." : "중복 검사"}
                  </Button>
                </div>
                {errors.userId && (
                  <p className="text-red-600 text-sm mt-1">{errors.userId}</p>
                )}
              </div>

              {/* 이메일 */}
              <div className="space-y-2 mb-6">
                <Label>이메일</Label>
                <div className="flex flex-col sm:flex-row gap-2">
                  <Input
                    value={emailId}
                    onChange={(e) => {
                      let value = e.target.value;

                      // 도메인 포함 최대 50글자 제한
                      const domainLength =
                        domain === "custom"
                          ? customDomain.length
                          : domain.length;
                      if (value.length + 1 + domainLength > 50

                      ) {
                        // @ 포함해서 +1
                        value = value.slice(0, 30 - 1 - domainLength);
                      }

                      setEmailId(value);

                      // 오류 처리
                      if (
                        !emailRegex.test(
                          value +
                            "@" +
                            (domain === "custom" ? customDomain : domain)
                        )
                      ) {
                        setErrors((prev) => ({
                          ...prev,
                          email: "올바른 이메일 형식이 아닙니다.",
                        }));
                      } else {
                        setErrors((prev) => ({ ...prev, email: undefined }));
                      }
                    }}
                    placeholder="이메일을 입력하세요"
                  />

                  <Select value={domain} onValueChange={setDomain}>
                    <SelectTrigger className="w-[180px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="naver.com">@naver.com</SelectItem>
                      <SelectItem value="gmail.com">@gmail.com</SelectItem>
                      <SelectItem value="daum.net">@daum.net</SelectItem>
                      <SelectItem value="custom">직접 입력</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                {domain === "custom" && (
                  <Input
                    value={customDomain}
                    onChange={(e) => setCustomDomain(e.target.value)}
                    placeholder="도메인 입력"
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
                <div className="relative">
                  <Input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => {
                      // 20글자 초과 방지
                      const value = e.target.value.slice(0, 20);
                      setPassword(value);

                      // 오류 처리
                      setErrors((prev) => ({
                        ...prev,
                        password:
                          !/^(?=.*[A-Za-z])(?=.*\d)(?=.*[!@#$%^&*()_+=[\]{};':"\\|,.<>/?-]).{6,20}$/.test(
                            value
                          )
                            ? "비밀번호는 영문, 숫자, 특수문자 모두 포함 6~20자리여야 합니다."
                            : undefined,
                      }));
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400"
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-red-600 text-sm mt-1">{errors.password}</p>
                )}
              </div>

              {/* 비밀번호 확인 */}
              <div className="space-y-2 mb-6">
                <Label htmlFor="confirmPassword">비밀번호 확인</Label>
                <div className="relative">
                  <Input
                    type={showConfirmPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => {
                      // 20글자 초과 방지
                      const value = e.target.value.slice(0, 20);
                      setConfirmPassword(value);

                      // 비밀번호 일치 여부 체크
                      setErrors((prev) => ({
                        ...prev,
                        confirmPassword:
                          value !== password
                            ? "비밀번호가 일치하지 않습니다."
                            : undefined,
                      }));
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400"
                  >
                    {showConfirmPassword ? (
                      <EyeOff size={20} />
                    ) : (
                      <Eye size={20} />
                    )}
                  </button>
                </div>
                {errors.confirmPassword && (
                  <p className="text-red-600 text-sm mt-1">
                    {errors.confirmPassword}
                  </p>
                )}
              </div>

              {/* 전화번호 */}
              <div className="space-y-2 mb-6">
                <Label className="text-gray-700 font-medium">전화번호</Label>
                <div className="flex flex-col sm:flex-row gap-2 items-stretch sm:items-center">
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
                      className="w-20 border-gray-800 focus:border-blue-300 focus:ring-blue-200"
                      autoFocus
                      required
                    />
                  ) : (
                    <Select
                      value={phonePrefix}
                      onValueChange={(value) => {
                        if (value === "custom") {
                          setPhonePrefix("custom");
                          setCustomPhonePrefix("");
                        } else {
                          setPhonePrefix(value);
                        }
                      }}
                    >
                      <SelectTrigger className="w-[100px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="010">010</SelectItem>
                        <SelectItem value="011">011</SelectItem>
                        <SelectItem value="016">016</SelectItem>
                        <SelectItem value="custom">직접 입력</SelectItem>
                      </SelectContent>
                    </Select>
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
                    className="flex-grow border-gray-800 focus:border-blue-300 focus:ring-blue-200"
                    required
                  />
                </div>
                {errors.phoneNumber && (
                  <p className="text-red-600 text-sm mt-1">
                    {errors.phoneNumber}
                  </p>
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
                    maxLength={20} // 브라우저 입력 제한
                    onChange={(e) => {
                      const value = e.target.value.slice(0, 20); // 혹시 maxLength 무시될 경우 대비
                      setNickname(value);
                      setNicknameAvailable(null);
                      setErrors((prev) => ({
                        ...prev,
                        nickname: value.trim()
                          ? undefined
                          : "닉네임을 입력해주세요.",
                      }));
                    }}
                    placeholder="닉네임을 입력하세요"
                  />
                  <Button
                    type="button"
                    onClick={checkNickname}
                    disabled={checkingNickname}
                  >
                    {checkingNickname ? "확인 중..." : "중복 검사"}
                  </Button>
                </div>
                {errors.nickname && (
                  <p className="text-red-600 text-sm mt-1">{errors.nickname}</p>
                )}
                <p className="text-sm text-gray-500 mt-1">
                  {nickname.length}/20
                </p>
              </div>

              {/* 회원가입 버튼 */}
              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white py-3"
                disabled={loading || !isFormComplete}
              >
                {loading ? "가입 중..." : "회원가입"}
              </Button>

              {/* 로그인 링크 */}
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
