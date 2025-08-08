"use client";

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/contexts/auth-context'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useToast } from '@/hooks/use-toast'
import { ScrollArea } from '@/components/ui/scroll-area'


export default function RegisterPage() {
  const [name, setName] = useState('')
  const [nickname, setNickname] = useState('')
  const [emailId, setEmailId] = useState('')      // 이메일 아이디 부분
  const [domain, setDomain] = useState('naver.com') // 도메인 선택
  const [customDomain, setCustomDomain] = useState('') // 직접 입력 도메인
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [checking, setChecking] = useState(false)
  const [phone, setPhone]=useState('')
  const [phonePrefix, setPhonePrefix] = useState('010')
  const { register } = useAuth()
  const router = useRouter()
  const { toast } = useToast()

  const email = domain === 'custom' ? `${emailId}@${customDomain}` : `${emailId}@${domain}`

 const checkNickname = async () => {
  if (!nickname) {
    toast({ title: "닉네임을 입력해주세요", variant: "destructive" });
    return;
  }

  setChecking(true);
  try {
    const res = await fetch(`/api/check-nickname?nickname=${encodeURIComponent(nickname)}`);
    const data = await res.json();

    if (data.available) {
      toast({ title: "사용 가능한 닉네임입니다", variant: "default" });
    } else {
      toast({ title: "중복된 닉네임입니다", variant: "destructive" });
    }
  } catch (error) {
    toast({ title: "오류가 발생했습니다", variant: "destructive" });
  } finally {
    setChecking(false);
  }
};


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (password !== confirmPassword) {
      toast({
        title: "비밀번호 불일치",
        description: "비밀번호가 일치하지 않습니다.",
        variant: "destructive",
      })
      return
    }

    if (!emailId || (domain === 'custom' && !customDomain)) {
      toast({
        title: "이메일을 정확히 입력해주세요.",
        variant: "destructive",
      })
      return
    }

    setLoading(true)

    try {
      await register(name, email, password)  // email 통합해서 넘김
      toast({
        title: "회원가입 성공",
        description: "환영합니다!",
      })
      router.push('/')
    } catch (error) {
      toast({
        title: "회원가입 실패",
        description: "다시 시도해주세요.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    
    <div className="container mx-auto px-4 py-8 flex justify-center min-h-[80vh] items-center">
      <Card className="w-full max-w-md glass-effect border-0 shadow-2xl">
        <ScrollArea className="h-[500px]">
          <form onSubmit={handleSubmit} className="space-y-6">
        <CardHeader className="text-center pb-8">
          <CardTitle className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            egtronics 게시판 회원가입
          </CardTitle>
          <CardDescription className="text-gray-600 mt-2">
            새 계정을 생성하여 커뮤니티에 참여하세요
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* 이름 */}
            <div className="space-y-2">
              <Label htmlFor="name" className="text-gray-700 font-medium">이름</Label>
              <Input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="border-gray-200 focus:border-blue-300 focus:ring-blue-200"
                placeholder="이름을 입력하세요"
                required
              />
            </div>

            {/* 이메일 - 아이디 + 도메인 선택 */}
            <div className="space-y-2">
              <Label className="text-gray-700 font-medium">이메일</Label>
              <div className="flex gap-2">
                <Input
                  id="emailId"
                  type="text"
                  value={emailId}
                  onChange={(e) => setEmailId(e.target.value)}
                  className="border-gray-200 focus:border-blue-300 focus:ring-blue-200 flex-1"
                  placeholder="이메일 아이디를 입력하세요"
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
              {domain === 'custom' && (
                <Input
                  type="text"
                  value={customDomain}
                  onChange={(e) => setCustomDomain(e.target.value)}
                  placeholder="도메인을 입력하세요"
                  className="border-gray-200 focus:border-blue-300 focus:ring-blue-200 mt-2"
                  required
                />
              )}
              <p className="text-sm text-gray-500 mt-1">전체 이메일: {email}</p>
            </div>

            {/* 비밀번호 */}
            <div className="space-y-2">
              <Label htmlFor="password" className="text-gray-700 font-medium">비밀번호</Label>


              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="border-gray-200 focus:border-blue-300 focus:ring-blue-200 flex-1"
                placeholder="비밀번호를 입력하세요"
                required
              />
            </div>

            {/* 비밀번호 확인 */}
            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className="text-gray-700 font-medium">비밀번호 확인</Label>
              <Input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="border-gray-200 focus:border-blue-300 focus:ring-blue-200"
                placeholder="비밀번호를 다시 입력하세요"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone" className="text-gray-700 font-medium">전화번호</Label>
              <div className="flex space-x-2">
                <select
                  value={phonePrefix}
                  onChange={(e) => setDomain(e.target.value)}
                  className="border-gray-200 focus:border-blue-300 focus:ring-blue-200"
                >
                  <option value="010">010</option>
                  <option value="011">011</option>
                  <option value="016">016</option>
                  <option value="custom">직접 입력</option>
                </select>
                <Input
                  id="phone"
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="border-gray-200 focus:border-blue-300 focus:ring-blue-200 flex-grow"
                  placeholder="전화번호를 입력하세요"
                  required
                />
                
              </div>
              <p className="text-sm text-gray-500 mt-1">전체 전화번호: {`${phonePrefix}-${phone}`}</p>
             </div> 

            {/* 닉네임 (기존 코드) */}
            <div className="space-y-2">
              <Label htmlFor="nickname" className="text-gray-700 font-medium">닉네임</Label>
              <div className="flex space-x-2">
                <Input
                  id="nickname"
                  type="text"
                  value={nickname}
                  onChange={(e) => setNickname(e.target.value)}
                  className="border-gray-200 focus:border-blue-300 focus:ring-blue-200 flex-grow"
                  placeholder="닉네임을 입력하세요"
                  required
                />
                <Button
                  type="button"
                  onClick={checkNickname}
                  disabled={checking}
                >
                  {checking ? '확인 중...' : '중복 검사'}
                </Button>
              </div>
            </div>

            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all py-3"
              disabled={loading}
            >
              {loading ? '가입 중...' : '회원가입'}
            </Button>
          </form>
          <div className="mt-6 text-center text-sm">
            <span className="text-gray-600">이미 계정이 있으신가요? </span>
            <Link href="/login" className="text-blue-600 hover:text-blue-700 font-medium hover:underline">
              로그인하기
            </Link>
          </div>
          
        </CardContent>
        </form>
        </ScrollArea>
      </Card>
    </div>
  )
}
