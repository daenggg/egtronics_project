"use client"

import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { userStorage, tokenStorage } from '@/lib/auth-storage' // tokenStorage는 로그아웃 시 정리 용도로 사용됩니다.
import {
  login as apiLogin,
  signUp as apiRegister,
  logout as apiLogout,
  updateMyProfile as apiUpdateMyProfile,
  checkIdAvailability,
  getMyProfile as apiGetMyProfile,
  handleApiError,
} from '@/lib/api-client'
import { User } from '@/lib/types' // 올바른 User 타입을 lib/types.ts에서 가져옵니다.

interface AuthContextType {
  user: User | null
  setUser: React.Dispatch<React.SetStateAction<User | null>>
  login: (userId: string, password: string) => Promise<void>
  register: (data: FormData) => Promise<void>
  logout: () => void
  updateUserInfo: (userData: FormData) => Promise<void>
  loading: boolean
  refreshCsrfToken: () => Promise<void>
  isSidebarOpen: boolean
  toggleSidebar: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const queryClient = useQueryClient();

  const refreshCsrfToken = async () => {
    try {
      // 이 API 호출의 주 목적은 백엔드로부터 새로운 CSRF 토큰을 받는 것입니다.
      await checkIdAvailability('__warmup__');
    } catch (error) {
      // 네트워크 오류 등으로 실패할 수 있지만, 이것만으로 로그아웃 처리하지는 않습니다.
      // 디버깅을 위해 콘솔에 에러를 기록할 수 있습니다.
      console.error("CSRF token refresh failed:", error);
    }
  };

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        await refreshCsrfToken();
        
        const userProfile = await apiGetMyProfile();
        setUser(userProfile);
        userStorage.setUser(userProfile);
      } catch (error) {
        // 로그인되어 있지 않으면 401/403 오류가 발생하며, 이는 정상적인 동작입니다.
        // 이 경우 로컬 스토리지의 사용자 정보를 삭제하여 상태를 동기화합니다.
        setUser(null);
        userStorage.removeUser();
        tokenStorage.removeToken(); // 저장된 토큰도 함께 삭제
      } finally {
        setLoading(false);
      }
    }
    initializeAuth();
  }, []);

const login = async (userId: string, password: string) => {
    try {
      // 1. apiLogin을 호출합니다. 백엔드는 응답으로 HttpOnly 쿠키를 설정해주고,
      //    본문(body)에는 사용자 정보를 반환합니다.
      //    이 함수가 성공적으로 실행되면, 브라우저에는 이미 accessToken 쿠키가 저장된 상태입니다.
      await apiLogin({ userId, password });

      // 2. 이제 쿠키가 설정되었으므로, 로컬 스토리지에 토큰을 저장할 필요가 없습니다.
      //    대신, 내 정보를 바로 가져와서 상태를 업데이트합니다.
      const userProfile = await apiGetMyProfile();
      
      setUser(userProfile);
      userStorage.setUser(userProfile); // 사용자 정보는 계속 로컬 스토리지에 저장

      // 아래 두 줄은 삭제합니다.
      // const tokenData = await apiLogin({ userId, password })
      // tokenStorage.setToken(tokenData.accessToken);

    } catch (error: any) {
      console.error('로그인 오류:', error.response?.data || error.message);
      throw new Error(error.response?.data?.message || '로그인에 실패했습니다.');
    }
  }

  const register = async (data: FormData) => {
    try {
      // api-client의 signUp 함수를 호출하여 회원가입만 진행합니다.
      // 백엔드에서 토큰이 반환되지만, 자동 로그인을 막기 위해 사용하지 않습니다.
      await apiRegister(data)
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
      tokenStorage.removeToken() // AccessToken 삭제
    }
  }

  const updateUserInfo = useCallback(async (userData: FormData) => {
    try {
      // 1. 프로필 업데이트 API 호출
      await apiUpdateMyProfile(userData);
      
      // 2. 성공 시, 최신 사용자 정보를 다시 가져옴
      const updatedUser = await apiGetMyProfile();
      
      // 3. 전역 상태와 로컬 스토리지 업데이트
      setUser(updatedUser);
      userStorage.setUser(updatedUser);

      // 4. 관련 React Query 캐시 무효화 (다른 컴포넌트의 데이터 동기화를 위해)
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
        refreshCsrfToken,
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
