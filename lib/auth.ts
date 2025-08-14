// auth.ts

export interface User {
  id: string
  name: string
  email: string
  avatar?: string
  nickname?: string
  phone?: string
  createdAt: Date
  updatedAt: Date
}

// 로그인 API 호출 함수
export async function login(email: string, password: string): Promise<User> {
  const res = await fetch('/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
    credentials: 'include', // 쿠키 포함
  })

  if (!res.ok) {
    const errorData = await res.json()
    throw new Error(errorData.message || '로그인 실패')
  }

  const data = await res.json()
  return data.user
}

// 로그아웃 API 호출 함수
export async function logout() {
  const res = await fetch('/api/auth/logout', {
    method: 'POST',
    credentials: 'include', // 쿠키 포함
  })

  if (!res.ok) {
    const errorData = await res.json()
    throw new Error(errorData.message || '로그아웃 실패')
  }
}

// 보호된 API 요청 함수 (쿠키 자동 포함, 인증 실패 시 에러 throw)
export async function fetchWithAuth(url: string, options: RequestInit = {}) {
  let res = await fetch(url, { ...options, credentials: 'include' })

  if (res.status === 401) {
    // TODO: 리프레시 토큰으로 액세스 토큰 재발급 로직 추가 가능
    throw new Error('인증 실패, 로그인 필요')
  }

  if (!res.ok) {
    const errorData = await res.json()
    throw new Error(errorData.message || 'API 요청 실패')
  }

  return res.json()
}
