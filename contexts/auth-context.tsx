"use client"

import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { userStorage } from '@/lib/auth-storage'
import { tokenStorage } from '@/lib/token-storage'
import {
  login as apiLogin,
  signUp as apiRegister,
  logout as apiLogout,
  updateMyProfile as apiUpdateMyProfile,
  setAccessTokenInClient,
  checkIdAvailability,
  getMyProfile as apiGetMyProfile,
  handleApiError,
} from '@/lib/api-client'
import { User } from '@/lib/types'

// Context에 제공될 값들의 타입 정의
interface AuthContextType {
  user: User | null
  setUser: React.Dispatch<React.SetStateAction<User | null>>
  login: (userId: string, password: string) => Promise<void>
  register: (data: FormData) => Promise<void>
  logout: () => void
  updateUserInfo: (userData: FormData) => Promise<void>
  loading: boolean
  isSidebarOpen: boolean
  toggleSidebar: () => void
}

// Context 생성
const AuthContext = createContext<AuthContextType | undefined>(undefined)

// Provider 컴포넌트
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const queryClient = useQueryClient();

  useEffect(() => {
    const initializeAuth = async () => {
      // 1. localStorage에서 Access Token과 Refresh Token을 확인
      const accessToken = tokenStorage.getAccessToken();
      const refreshToken = tokenStorage.getRefreshToken();

      if (accessToken) {
        // 2. Access Token이 있으면, 우선 로그인 상태로 간주하고 API 클라이언트에 설정
        setAccessTokenInClient(accessToken);
      } else if (!refreshToken) {
        // 3. 두 토큰이 모두 없으면 비로그인으로 확정
        setLoading(false);
        return;
      }
      
      // 4. 토큰 유효성 검증을 위해 프로필 정보를 요청
      // (accessToken이 만료 시, api-client의 인터셉터가 refreshToken으로 재발급 시도)
      try {
        const userProfile = await apiGetMyProfile();
        setUser(userProfile);
        userStorage.setUser(userProfile);
      } catch (error) {
        // 5. 유효성 검증 실패 시 (e.g., Refresh Token 만료) 모든 정보 정리
        setUser(null);
        userStorage.removeUser();
        tokenStorage.clearTokens(); // Access, Refresh 토큰 모두 삭제
        setAccessTokenInClient(null);
      } finally {
        setLoading(false);
      }
    }
    initializeAuth();
  }, []); // 앱 시작 시 한 번만 실행

  const login = async (userId: string, password: string) => {
    try {
      const receivedTokens = await apiLogin({ userId, password });

      // 👇 [수정] Access Token과 Refresh Token을 모두 localStorage에 저장
      tokenStorage.setAccessToken(receivedTokens.accessToken);
      tokenStorage.setRefreshToken(receivedTokens.refreshToken);
      
      // API 클라이언트의 헤더에도 Access Token을 설정
      setAccessTokenInClient(receivedTokens.accessToken);

      const userProfile = await apiGetMyProfile();
      setUser(userProfile);
      userStorage.setUser(userProfile);
    } catch (error: any) {
      console.error('로그인 오류:', error.response?.data || error.message);
      setUser(null);
      userStorage.removeUser();
      tokenStorage.clearTokens();
      setAccessTokenInClient(null);
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
      // 👇 [수정] 모든 토큰을 삭제하는 clearTokens() 호출
      tokenStorage.clearTokens(); 
      setAccessTokenInClient(null);
    }
  }

  const updateUserInfo = useCallback(async (userData: FormData) => {
    try {
      await apiUpdateMyProfile(userData);
      const updatedUser = await apiGetMyProfile();
      setUser(updatedUser);
      userStorage.setUser(updatedUser);
      queryClient.invalidateQueries({ queryKey: ['my-profile'] });
    } catch (error: any) {
      throw new Error(handleApiError(error));
    }
  }, [queryClient]);

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

// Context를 사용하기 위한 커스텀 훅
export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}