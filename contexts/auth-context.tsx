"use client"

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { userStorage } from '@/lib/auth-storage'
import {
  login as apiLogin,
  signUp as apiRegister,
  logout as apiLogout,
  updateMyProfile,
  checkIdAvailability, // CSRF 토큰을 얻기 위해 추가
  getMyProfile,
} from '@/lib/api-client'

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
  phoneNumber: string
  nickname: string
  authority: boolean
  profilePicture: string
}

interface AuthContextType {
  user: User | null
  setUser: React.Dispatch<React.SetStateAction<User | null>>
  login: (userId: string, password: string) => Promise<void>
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
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        // [CSRF 해결]
        // 애플리케이션 시작 시, 인증이 필요 없는 API를 먼저 호출하여
        // 백엔드로부터 CSRF 토큰 (XSRF-TOKEN)을 쿠키로 받아옵니다.
        // 이 "warm-up" 호출이 없으면, 로그인/회원가입 등 첫 POST 요청이 403 오류를 반환합니다.
        await checkIdAvailability('__warmup__');

        // 이제 CSRF 토큰이 있으므로, 안전하게 프로필 정보를 요청합니다.
        const userProfile = await getMyProfile();
        setUser(userProfile);
        userStorage.setUser(userProfile);
      } catch (error) {
        // 로그인되어 있지 않으면 401/403 오류가 발생하며, 이는 정상적인 동작입니다.
        // 이 경우 로컬 스토리지의 사용자 정보를 삭제하여 상태를 동기화합니다.
        setUser(null);
        userStorage.removeUser();
      } finally {
        setLoading(false);
      }
    }
    initializeAuth();
  }, []);

  const login = async (userId: string, password: string) => {
    try {
      // api-client의 login 함수 사용 (HttpOnly 쿠키 방식)
      await apiLogin({ userId, password })
      // 로그인 성공 후, 전체 사용자 프로필 정보를 가져옴
      const userProfile = await getMyProfile()
      setUser(userProfile)
      userStorage.setUser(userProfile)
    } catch (error: any) {
      console.error('로그인 오류:', error.response?.data || error.message)
      throw new Error(error.response?.data?.message || '로그인에 실패했습니다.')
    }
  }

  const register = async (data: RegisterData) => {
    try {
      // api-client의 signUp 함수 사용
      await apiRegister(data)
      // 회원가입 성공 후, 자동으로 로그인 처리되므로 프로필 정보를 가져옴
      const userProfile = await getMyProfile()
      setUser(userProfile)
      userStorage.setUser(userProfile)
    } catch (error: any) {
      console.error('회원가입 오류:', error.response?.data || error.message)
      throw new Error(error.response?.data?.message || '회원가입에 실패했습니다.')
    }
  }

  const logout = async () => {
    try {
      await apiLogout()
    } catch (error: any) {
      console.error('로그아웃 오류:', error.response?.data || error.message)
    } finally {
      setUser(null)
      userStorage.removeUser()
    }
  }

  const updateUserInfo = async (userData: Partial<User>) => {
    try {
      await updateMyProfile(userData)
      const updatedUser = await getMyProfile()
      setUser(updatedUser)
      userStorage.setUser(updatedUser)
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
