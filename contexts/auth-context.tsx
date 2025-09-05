"use client"

import { createContext, useContext, useState, useEffect, ReactNode, useCallback, use } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { userStorage } from '@/lib/auth-storage' // tokenStorage import 제거
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
    // 이 효과는 앱이 처음 마운트될 때 단 한 번만 실행되어야 합니다.
    const initializeAuth = async () => {
      // 1. 로컬 스토리지에서 사용자 정보를 먼저 확인합니다. (Optimistic UI)
      const storedUser = userStorage.getUser();
      if (!storedUser) {
        // 2. 정보가 없으면, 비로그인 상태로 확정하고 CSRF 토큰만 갱신 후 종료합니다.
        await refreshCsrfToken();
        setLoading(false);
        return;
      }

      // 3. 정보가 있으면, UI를 먼저 업데이트하고 서버에 실제 세션 유효성을 확인합니다.
      setUser(storedUser);
      try {
        const userProfile = await apiGetMyProfile();
        // 4. 성공 시, 최신 정보로 상태와 로컬 스토리지를 업데이트합니다.
        setUser(userProfile);
        userStorage.setUser(userProfile);
        await refreshCsrfToken();
      } catch (error) {
        // 5. API 호출 실패 시 (예: 서버 세션 만료) 로그아웃 처리합니다.
        setUser(null);
        userStorage.removeUser();
      } finally {
        setLoading(false);
      }
    }
    initializeAuth();
  }, []); // 의존성 배열을 비워서 앱이 처음 로드될 때 한 번만 실행되도록 합니다.

const login = async (userId: string, password: string) => {
    try {
      // 1. apiLogin을 호출합니다. 백엔드는 응답으로 HttpOnly 쿠키를 설정하고,
      //    본문(body)에는 로그인한 사용자 정보를 반환합니다. (AuthController.java 참고)
      const loggedInUser = await apiLogin({ userId, password });

      // 2. apiLogin의 응답 본문을 바로 상태에 저장합니다.
      //    이렇게 하면 /users/me 를 또 호출할 필요가 없어 더 효율적입니다.
      setUser(loggedInUser);
      userStorage.setUser(loggedInUser); // 로컬 스토리지에도 저장

    } catch (error: any) {
      console.error('로그인 오류:', error.response?.data || error.message);
      // 로그인 실패 시 기존 상태를 확실히 정리합니다.
      setUser(null);
      userStorage.removeUser();
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
