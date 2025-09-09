"use client"

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { userStorage } from '@/lib/auth-storage'
import {
  login as apiLogin,
  signUp as apiRegister,
  logout as apiLogout,
  updateMyProfile as apiUpdateMyProfile,
  checkIdAvailability,
  getMyProfile as apiGetMyProfile,
  handleApiError,
} from '@/lib/api-client'
import { User } from '@/lib/types'

// Context 타입 정의
interface AuthContextType {
  user: User | null
  setUser: React.Dispatch<React.SetStateAction<User | null>>;
  login: (userId: string, password: string) => Promise<void>
  register: (data: FormData) => Promise<void>
  logout: () => void
  updateUserInfo: (userData: FormData) => Promise<void>
  loading: boolean
  isSidebarOpen: boolean
  toggleSidebar: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  // 1. user 상태를 null로 시작하여, 새로고침 시 화면이 깜빡이는 현상을 방지합니다.
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true)
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        // 앱 시작 시, 브라우저가 자동으로 보내주는 쿠키를 통해 사용자 정보 조회를 시도합니다.
        const userProfile = await apiGetMyProfile();
        // 성공하면, 최신 정보로 상태와 localStorage 캐시를 업데이트합니다.
        setUser(userProfile);
        userStorage.setUser(userProfile); 
      } catch (error) {
        // 실패하면 (쿠키가 없거나 만료됨), 비로그인 상태로 처리합니다.
        setUser(null);
        userStorage.removeUser();
      } finally {
        // 인증 확인 절차가 끝나면 로딩 상태를 해제합니다.
        setLoading(false);
      }
    }
    initializeAuth();
  }, []);
  
  const login = async (userId: string, password: string) => {
    try {
      const userProfile = await apiLogin({ userId, password, clientType: 0 }); 
      setUser(userProfile);
      userStorage.setUser(userProfile);
    } catch (error: any) {
      console.error('로그인 오류:', error.response?.data || error.message);
      setUser(null);
      userStorage.removeUser();
      throw new Error(error.response?.data?.message || '로그인에 실패했습니다.');
    }
  }

  const register = async (data: FormData) => {
    try {
      await apiRegister(data);
    } catch (error: any) {
      console.error('회원가입 오류:', error.response?.data || error.message)
      throw new Error(error.response?.data?.message || '회원가입에 실패했습니다.')
    }
  }

  const logout = async () => {
    try {
      await apiLogout();
    } catch (error: any) {
      console.error('로그아웃 오류:', error.response?.data || error.message);
    } finally {
      setUser(null);
      userStorage.removeUser();
    }
  }

  const updateUserInfo = async (userData: FormData) => {
    try {
      await apiUpdateMyProfile(userData);
      const updatedUser = await apiGetMyProfile();
      setUser(updatedUser);
      userStorage.setUser(updatedUser);
    } catch (error: any) {
      console.error('정보 수정 오류:', error.response?.data || error.message)
      throw new Error(handleApiError(error));
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
      {/* 2. 로딩 중일 때는 자식 컴포넌트 렌더링을 보류하여 화면 깜빡임을 방지합니다. */}
      {!loading && children}
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