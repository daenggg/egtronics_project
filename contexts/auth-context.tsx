"use client"

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import axios from 'axios'
import { tokenStorage, userStorage } from '@/lib/auth-storage'

interface User {
  id: string
  userId?: string
  name: string
  email: string
  avatar?: string
  nickname?: string
  phone?: string
}

interface RegisterData {
  userId: string
  name: string
  email: string
  password: string
  phone: string
  nickname: string
}

interface AuthContextType {
  user: User | null
  setUser: React.Dispatch<React.SetStateAction<User | null>>
  login: (email: string, password: string) => Promise<void>
  register: (data: RegisterData) => Promise<void>
  logout: () => void
  updateUserInfo: (userData: Partial<User>) => Promise<void>
  loading: boolean
  isSidebarOpen: boolean
  toggleSidebar: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)

  useEffect(() => {
    const savedUser = userStorage.getUser()
    if (savedUser) {
      setUser(savedUser)
    }
    setLoading(false)
  }, [])

  const login = async (email: string, password: string) => {
    if (process.env.NODE_ENV === 'development') {
      const tempUser: User = {
        id: 'u1',
        userId: 'testuser',
        name: '테스트 유저',
        email:'asdjfi@naver.com',
        avatar: '',
        nickname: '테스트닉',
        phone: '010-0000-0000',
      }
      setUser(tempUser)
      userStorage.setUser(tempUser)
      tokenStorage.setToken('fake-token')
      return
    }

    try {
      const { data } = await axios.post('/api/auth/login', { email, password })

      setUser(data.user)
      userStorage.setUser(data.user)
      tokenStorage.setToken(data.token)
    } catch (error: any) {
      console.error('로그인 오류:', error.response?.data || error.message)
      throw new Error(error.response?.data?.message || '로그인에 실패했습니다.')
    }
  }

  const register = async (data: RegisterData) => {
    try {
      const res = await axios.post('/users', data)
      setUser(res.data.user)
      userStorage.setUser(res.data.user)
    } catch (error: any) {
      console.error('회원가입 오류:', error.response?.data || error.message)
      throw new Error(error.response?.data?.message || '회원가입에 실패했습니다.')
    }
  }

  const logout = async () => {
    try {
      await axios.get('/api/auth/logout')
    } catch (error: any) {
      console.error('로그아웃 오류:', error.response?.data || error.message)
    } finally {
      setUser(null)
      userStorage.removeUser()
      tokenStorage.removeToken()
    }
  }

  const updateUserInfo = async (userData: Partial<User>) => {
    try {
      const { data } = await axios.put('/users', userData, {
        headers: {
          Authorization: `Bearer ${tokenStorage.getToken()}`,
        },
      })

      setUser(data.user)
      userStorage.setUser(data.user)
    } catch (error: any) {
      console.error('정보 수정 오류:', error.response?.data || error.message)
      throw new Error(error.response?.data?.message || '정보 수정에 실패했습니다.')
    }
  }

  const toggleSidebar = () => {
    setIsSidebarOpen((prev) => !prev)
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        setUser,
        login,
        register,
        logout,
        updateUserInfo,
        loading,
        isSidebarOpen,
        toggleSidebar,
      }}
    >
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
