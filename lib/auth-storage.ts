// 안전한 인증 토큰 저장 관리

// 토큰 저장 방식 선택
export type TokenStorageType = 'cookie' | 'localStorage' | 'sessionStorage' | 'memory'

// 메모리 저장소 (페이지 새로고침시 사라짐)
const memoryStorage = new Map<string, string>()

// 토큰 저장 클래스
export class TokenStorage {
  private storageType: TokenStorageType

  constructor(storageType: TokenStorageType = 'cookie') {
    this.storageType = storageType
  }

  // 토큰 저장
  setToken(token: string): void {
    switch (this.storageType) {
      case 'cookie':
        this.setCookie('auth-token', token, 7) // 7일
        break
      case 'localStorage':
        localStorage.setItem('auth-token', token)
        break
      case 'sessionStorage':
        sessionStorage.setItem('auth-token', token)
        break
      case 'memory':
        memoryStorage.set('auth-token', token)
        break
    }
  }

  // 토큰 가져오기
  getToken(): string | null {
    switch (this.storageType) {
      case 'cookie':
        return this.getCookie('auth-token')
      case 'localStorage':
        return localStorage.getItem('auth-token')
      case 'sessionStorage':
        return sessionStorage.getItem('auth-token')
      case 'memory':
        return memoryStorage.get('auth-token') || null
      default:
        return null
    }
  }

  // 토큰 삭제
  removeToken(): void {
    switch (this.storageType) {
      case 'cookie':
        this.setCookie('auth-token', '', 0) // 즉시 만료
        break
      case 'localStorage':
        localStorage.removeItem('auth-token')
        break
      case 'sessionStorage':
        sessionStorage.removeItem('auth-token')
        break
      case 'memory':
        memoryStorage.delete('auth-token')
        break
    }
  }

  // 쿠키 설정
  private setCookie(name: string, value: string, days: number): void {
    if (typeof document === 'undefined') return // SSR 환경 체크
    
    const expires = new Date()
    expires.setTime(expires.getTime() + days * 24 * 60 * 60 * 1000)
    
    document.cookie = `${name}=${value};expires=${expires.toUTCString()};path=/;SameSite=Strict${
      process.env.NODE_ENV === 'production' ? ';Secure' : ''
    }`
  }

  // 쿠키 가져오기
  private getCookie(name: string): string | null {
    if (typeof document === 'undefined') return null // SSR 환경 체크
    
    const nameEQ = name + "="
    const ca = document.cookie.split(';')
    
    for (let i = 0; i < ca.length; i++) {
      let c = ca[i]
      while (c.charAt(0) === ' ') c = c.substring(1, c.length)
      if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length)
    }
    return null
  }
}

// 사용자 정보 저장 관리

export class UserStorage {
  // 사용자 정보 저장 (민감하지 않은 정보만)
  setUser(user: any): void {
    const safeUser = {
      id: user.id,
      name: user.name,
      email: user.email,
      avatar: user.avatar,
      nickname: user.nickname,
    }
    localStorage.setItem('user', JSON.stringify(safeUser))
  }

  // 사용자 정보 가져오기
  getUser(): any | null {
    const userStr = localStorage.getItem('user')
    return userStr ? JSON.parse(userStr) : null
  }

  // 사용자 정보 삭제
  removeUser(): void {
    localStorage.removeItem('user')
  }
}



// 기본 인스턴스들
export const tokenStorage = new TokenStorage('cookie') // 보안을 위해 쿠키 사용
export const userStorage = new UserStorage()

// 환경별 최적화된 저장 방식
export function getOptimalStorageType(): TokenStorageType {
  if (typeof window === 'undefined') return 'memory' // SSR
  
  // 개발 환경에서는 localStorage 사용 (디버깅 편의)
  if (process.env.NODE_ENV === 'development') {
    return 'localStorage'
  }
  
  // 프로덕션에서는 쿠키 사용 (보안)
  return 'cookie'
}
