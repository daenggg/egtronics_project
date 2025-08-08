"use client"

import React from 'react'
import { CreatePostButton } from '@/components/create-post-button'

export default function Profile() {
  return (
    <div className="w-48 h-56 p-4 border rounded-2xl flex flex-col items-center justify-center gap-4">
      {/* 프로필 이미지 원 */}
      <div className="w-20 h-20 rounded-full border border-gray-400 flex items-center justify-center overflow-hidden">
        {/* 실제 이미지가 있다면 <img> 태그로 교체 */}
        <div className="w-14 h-14 bg-gray-300 rounded-full"></div>
      </div>

      {/* 이름과 숫자 */}
      <div className="text-center text-gray-700 font-medium">
        인턴<span className="text-sm text-gray-500">(1)</span>
      </div>

      {/* 버튼 그룹 */}
      <div className="flex flex-col gap-2 w-full">
        <button
          className="bg-gray-400 text-white rounded-md py-2 cursor-not-allowed"
          disabled
        >
          내 정보 수정하기
        </button>

        {/* 로그인 여부에 따라 다른 버튼 보여줌 */}
        <CreatePostButton />
      </div>
    </div>
  )
}
