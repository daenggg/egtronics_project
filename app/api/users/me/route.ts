import { NextRequest, NextResponse } from 'next/server'
import { authenticateUser, users } from '@/lib/auth'

// 내 정보 조회 API (GET /users/me)
export async function GET(request: NextRequest) {
  try {
    // 인증 확인
    const authResult = await authenticateUser(request)
    if (!authResult) {
      return NextResponse.json(
        { message: '인증이 필요합니다.' },
        { status: 401 }
      )
    }

    // 사용자 찾기
    const user = users.get(authResult.userId)
    if (!user) {
      return NextResponse.json(
        { message: '사용자를 찾을 수 없습니다.' },
        { status: 404 }
      )
    }

    // 응답에서 비밀번호 제외
    const { password: _, ...userWithoutPassword } = user

    return NextResponse.json(
      { 
        message: '내 정보 조회 성공',
        user: userWithoutPassword 
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('내 정보 조회 오류:', error)
    return NextResponse.json(
      { message: '서버 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}

// 회원 탈퇴 API (DELETE /users/me)
export async function DELETE(request: NextRequest) {
  try {
    // 인증 확인
    const authResult = await authenticateUser(request)
    if (!authResult) {
      return NextResponse.json(
        { message: '인증이 필요합니다.' },
        { status: 401 }
      )
    }

    // 사용자 찾기
    const user = users.get(authResult.userId)
    if (!user) {
      return NextResponse.json(
        { message: '사용자를 찾을 수 없습니다.' },
        { status: 404 }
      )
    }

    // 사용자 삭제
    users.delete(authResult.userId)

    return NextResponse.json(
      { message: '회원 탈퇴가 완료되었습니다.' },
      { status: 200 }
    )
  } catch (error) {
    console.error('회원 탈퇴 오류:', error)
    return NextResponse.json(
      { message: '서버 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}
