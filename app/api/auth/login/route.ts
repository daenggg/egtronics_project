import { NextRequest, NextResponse } from 'next/server'
import { verifyPassword, generateToken, users } from '@/lib/auth'

// 로그인 API (POST /auth/login)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, password } = body

    // 필수 필드 검증
    if (!email || !password) {
      return NextResponse.json(
        { message: '이메일과 비밀번호는 필수입니다.' },
        { status: 400 }
      )
    }

    // 사용자 찾기
    const user = Array.from(users.values()).find(u => u.email === email)
    if (!user) {
      return NextResponse.json(
        { message: '이메일 또는 비밀번호가 올바르지 않습니다.' },
        { status: 401 }
      )
    }

    // 비밀번호 검증
    const isValidPassword = await verifyPassword(password, user.password)
    if (!isValidPassword) {
      return NextResponse.json(
        { message: '이메일 또는 비밀번호가 올바르지 않습니다.' },
        { status: 401 }
      )
    }

    // JWT 토큰 생성
    const token = generateToken(user.id, user.email)

    // 응답에서 비밀번호 제외
    const { password: _, ...userWithoutPassword } = user

    // 쿠키에 토큰 설정 (HttpOnly, Secure, SameSite 설정)
    const response = NextResponse.json(
      { 
        message: '로그인 성공',
        user: userWithoutPassword,
        token 
      },
      { status: 200 }
    )

    // 쿠키 설정 (실제 프로덕션에서는 https에서만 작동하도록 Secure: true 설정)
    response.cookies.set('auth-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60, // 7일
      path: '/'
    })

    return response
  } catch (error) {
    console.error('로그인 오류:', error)
    return NextResponse.json(
      { message: '서버 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}
