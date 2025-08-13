"use client"

import React from 'react'
import { useRouter } from 'next/navigation'
import { CreatePostButton } from '@/components/create-post-button'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/contexts/auth-context'  // 예: auth context에서 user 정보 가져오기

export default function Profile() {
  const router = useRouter()
  const { user } = useAuth()  // 로그인 상태 정보 가져오기

  return (
    <div className="w-48 h-56 p-4 border rounded-2xl flex flex-col items-center justify-center gap-4">
      {/* 프로필 이미지 원 */}
      <div className="w-14 aspect-square rounded-full border border-gray-400 flex items-center justify-center overflow-hidden">
        <div className="w-14 aspect-square bg-gray-300 rounded-full"></div>
      </div>

      {/* 이름과 숫자 */}
      <div className="text-center text-gray-700 font-medium">
        {user ? user.nickname : '비회원'}
      </div>

      {/* 버튼 그룹 또는 로그인 안내 문구 */}
      <div className="flex flex-col gap-2 w-full text-center text-gray-600">
        {user ? (
          <>
            <Button variant="white" onClick={() => router.push('/profile')}>
              내 정보 수정하기
            </Button>
            <CreatePostButton />
          </>
        ) : (
          <p>비회원입니다.<br/>로그인 또는 회원가입을 해주세요.</p>
        )}
      </div>
    </div>
  )
}
