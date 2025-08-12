"use client"

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { tokenStorage, userStorage, getOptimalStorageType } from '@/lib/auth-storage'

interface User {
  id: string
  name: string
  email: string
  avatar?: string
  nickname?: string
  phone?: string
}

interface AuthContextType {
  user: User | null
  setUser: React.Dispatch<React.SetStateAction<User | null>>
  login: (email: string, password: string) => Promise<void>
  register: (name: string, email: string, password: string) => Promise<void>
  logout: () => void
  updateUserInfo: (userData: Partial<User>) => Promise<void>
  loading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // 저장된 사용자 정보 확인
    const savedUser = userStorage.getUser()
    if (savedUser) {
      setUser(savedUser)
    }
    setLoading(false)
  }, [])

  const login = async (email: string, password: string) => {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || '로그인에 실패했습니다.')
      }

      setUser(data.user)
      userStorage.setUser(data.user)
      tokenStorage.setToken(data.token)
    } catch (error) {
      console.error('로그인 오류:', error)
      throw error
    }
  }

  const register = async (name: string, email: string, password: string) => {
    try {
      const response = await fetch('/api/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, email, password }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || '회원가입에 실패했습니다.')
      }

      setUser(data.user)
      userStorage.setUser(data.user)
    } catch (error) {
      console.error('회원가입 오류:', error)
      throw error
    }
  }

  const logout = async () => {
    try {
      await fetch('/api/auth/logout', {
        method: 'GET',
      })
    } catch (error) {
      console.error('로그아웃 오류:', error)
    } finally {
      setUser(null)
      userStorage.removeUser()
      tokenStorage.removeToken()
    }
  }

  const updateUserInfo = async (userData: Partial<User>) => {
    try {
      const response = await fetch('/api/users', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${tokenStorage.getToken()}`,
        },
        body: JSON.stringify(userData),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || '정보 수정에 실패했습니다.')
      }

      setUser(data.user)
      userStorage.setUser(data.user)
    } catch (error) {
      console.error('정보 수정 오류:', error)
      throw error
    }
  }

  return (
    <AuthContext.Provider value={{ user, setUser, login, register, logout, updateUserInfo, loading }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
