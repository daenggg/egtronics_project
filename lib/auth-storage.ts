// 사용자 정보 저장 관리

export class UserStorage {
  // 사용자 정보 저장 (민감하지 않은 정보만)
  setUser(user: any): void {
    if (typeof window !== 'undefined') {
      const safeUser = {
        id: user.id,
        userId: user.userId,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        nickname: user.nickname,
        phone: user.phone,
      }
      localStorage.setItem('user', JSON.stringify(safeUser))
    }
  }

  // 사용자 정보 가져오기
  getUser(): any | null {
    if (typeof window !== 'undefined') {
      const userStr = localStorage.getItem('user')
      return userStr ? JSON.parse(userStr) : null
    }
    return null
  }

  // 사용자 정보 삭제
  removeUser(): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('user')
    }
  }
}

// 토큰 저장 관리
export class TokenStorage {
  // 토큰 저장
  setToken(token: string): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem('token', token)
    }
  }

  // 토큰 가져오기
  getToken(): string | null {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('token')
    }
    return null
  }

  // 토큰 삭제
  removeToken(): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('token')
    }
  }
}

// 기본 인스턴스들
export const userStorage = new UserStorage()
export const tokenStorage = new TokenStorage()
