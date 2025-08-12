import { NextRequest, NextResponse } from 'next/server'

// 로그아웃 API (GET /auth/logout)
export async function GET(request: NextRequest) {
  try {
    // 응답 생성
    const response = NextResponse.json(
      { message: '로그아웃 성공' },
      { status: 200 }
    )

    // 쿠키에서 토큰 제거
    response.cookies.set('auth-token', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 0, // 즉시 만료
      path: '/'
    })

    return response
  } catch (error) {
    console.error('로그아웃 오류:', error)
    return NextResponse.json(
      { message: '서버 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}
