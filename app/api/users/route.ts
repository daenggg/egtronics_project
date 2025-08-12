import { NextRequest, NextResponse } from 'next/server'
import { hashPassword, generateUserId, users, User, authenticateUser } from '@/lib/auth'

// 회원가입 API (POST /users)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, email, password, nickname, phone } = body

    // 필수 필드 검증
    if (!name || !email || !password) {
      return NextResponse.json(
        { message: '이름, 이메일, 비밀번호는 필수입니다.' },
        { status: 400 }
      )
    }

    // 이메일 형식 검증
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { message: '올바른 이메일 형식이 아닙니다.' },
        { status: 400 }
      )
    }

    // 비밀번호 길이 검증
    if (password.length < 6) {
      return NextResponse.json(
        { message: '비밀번호는 최소 6자 이상이어야 합니다.' },
        { status: 400 }
      )
    }

    // 이메일 중복 검사
    const existingUser = Array.from(users.values()).find(user => user.email === email)
    if (existingUser) {
      return NextResponse.json(
        { message: '이미 존재하는 이메일입니다.' },
        { status: 409 }
      )
    }

    // 비밀번호 해싱
    const hashedPassword = await hashPassword(password)

    // 새 사용자 생성
    const newUser: User = {
      id: generateUserId(),
      name,
      email,
      password: hashedPassword,
      nickname,
      phone,
      avatar: `/api/avatars/${generateUserId()}`,
      createdAt: new Date(),
      updatedAt: new Date()
    }

    // 사용자 저장
    users.set(newUser.id, newUser)

    // 응답에서 비밀번호 제외
    const { password: _, ...userWithoutPassword } = newUser

    return NextResponse.json(
      { 
        message: '회원가입이 완료되었습니다.',
        user: userWithoutPassword 
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('회원가입 오류:', error)
    return NextResponse.json(
      { message: '서버 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}

// 내 정보 수정 API (PUT /users)
export async function PUT(request: NextRequest) {
  try {
    // 인증 확인
    const authResult = await authenticateUser(request)
    if (!authResult) {
      return NextResponse.json(
        { message: '인증이 필요합니다.' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { name, nickname, phone, avatar } = body

    // 사용자 찾기
    const user = users.get(authResult.userId)
    if (!user) {
      return NextResponse.json(
        { message: '사용자를 찾을 수 없습니다.' },
        { status: 404 }
      )
    }

    // 정보 업데이트
    const updatedUser: User = {
      ...user,
      name: name || user.name,
      nickname: nickname !== undefined ? nickname : user.nickname,
      phone: phone !== undefined ? phone : user.phone,
      avatar: avatar || user.avatar,
      updatedAt: new Date()
    }

    users.set(user.id, updatedUser)

    // 응답에서 비밀번호 제외
    const { password: _, ...userWithoutPassword } = updatedUser

    return NextResponse.json(
      { 
        message: '정보가 수정되었습니다.',
        user: userWithoutPassword 
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('정보 수정 오류:', error)
    return NextResponse.json(
      { message: '서버 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}
