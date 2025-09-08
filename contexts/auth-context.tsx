"use client"

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { userStorage } from '@/lib/auth-storage'
// ⛔️ 더 이상 토큰을 직접 저장하지 않으므로 tokenStorage import를 제거합니다.
// import { tokenStorage } from '@/lib/token-storage' 
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

// Context 타입 정의는 변경 없음
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
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)

  // ★★★ 초기 인증 로직 수정
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        // 1. [CSRF 해결] 앱 시작 시, 인증이 필요 없는 API를 먼저 호출하여
        //    백엔드로부터 CSRF 토큰(XSRF-TOKEN)을 쿠키로 받아옵니다.
        //    이 "warm-up" 호출이 없으면, 로그인/회원가입 등 첫 POST 요청이 403 오류를 반환할 수 있습니다.
        await checkIdAvailability('__warmup__');

        // 2. localStorage에서 토큰을 확인하는 대신, 바로 내 프로필 정보를 요청합니다.
        //    이때 브라우저는 유효한 HttpOnly 세션 쿠키가 있다면 자동으로 함께 보냅니다.
        const userProfile = await apiGetMyProfile();
        setUser(userProfile);
        userStorage.setUser(userProfile); // UI 깜빡임 방지용 캐시는 계속 사용
      } catch (error) {
        // 3. 쿠키가 없거나 만료되어 프로필 조회에 실패하면 (정상적인 비로그인 상태),
        //    모든 로컬 정보를 깨끗하게 정리합니다.
        setUser(null);
        userStorage.removeUser();
      } finally {
        setLoading(false);
      }
    }
    initializeAuth();
  }, []); // 앱 시작 시 한 번만 실행

  // ★★★ 로그인 함수 수정
  const login = async (userId: string, password: string) => {
    try {
      // 1. 로그인 API 호출. 백엔드가 응답으로 HttpOnly 쿠키를 설정해줍니다.
      //    apiLogin 함수는 이제 토큰 대신 사용자 정보를 반환합니다. (api-client.ts 수정 내용)
      await apiLogin({ userId, password, clientType: 0 }); // clientType: 0은 웹을 의미

      // 2. 쿠키가 성공적으로 설정되었으므로, 내 프로필 정보를 다시 가져와 상태를 업데이트합니다.
      const userProfile = await apiGetMyProfile();
      setUser(userProfile);
      userStorage.setUser(userProfile);

      // ⛔️ 프론트엔드에서 토큰을 저장하는 코드는 모두 삭제합니다.
      // const tokenData = await apiLogin(...);
      // tokenStorage.setAccessToken(tokenData.accessToken);
      // tokenStorage.setRefreshToken(tokenData.refreshToken);

    } catch (error: any) {
      console.error('로그인 오류:', error.response?.data || error.message);
      setUser(null);
      userStorage.removeUser();
      throw new Error(error.response?.data?.message || '로그인에 실패했습니다.');
    }
  }

  // 회원가입 함수는 변경 없음
  const register = async (data: FormData) => {
    try {
      await apiRegister(data);
    } catch (error: any) {
      console.error('회원가입 오류:', error.response?.data || error.message)
      throw new Error(error.response?.data?.message || '회원가입에 실패했습니다.')
    }
  }

  // ★★★ 로그아웃 함수 수정
  const logout = async () => {
    try {
      // 1. 서버에 로그아웃을 요청하여 HttpOnly 쿠키를 무효화(삭제)하도록 합니다.
      await apiLogout();
    } catch (error: any) {
      console.error('로그아웃 오류:', error.response?.data || error.message);
    } finally {
      // 2. 프론트엔드의 상태와 캐시를 정리합니다.
      setUser(null);
      userStorage.removeUser();
      // ⛔️ tokenStorage 정리 코드는 더 이상 필요 없습니다.
      // tokenStorage.clearTokens();
    }
  }

  // 정보 수정 함수는 로직 변경 없음 (이미 인증된 세션을 기반으로 동작)
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
      {children}
    </AuthContext.Provider>
  )
}

// 커스텀 훅은 변경 없음
export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}