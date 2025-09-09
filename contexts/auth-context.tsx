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
  // 1. userStorage에서 초기 사용자 정보를 동기적으로 가져와 상태를 초기화합니다.
  const [user, setUser] = useState<User | null>(() => userStorage.getUser());
  const [loading, setLoading] = useState(true)
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)

  // ★★★ 초기 인증 로직 수정
useEffect(() => {
    const initializeAuth = async () => {
      // 2. localStorage에 사용자 정보가 있다면, 최신 정보로 업데이트를 시도합니다.
      try {
        // ⛔️ CSRF 토큰을 받기 위한 불필요한 warm-up 호출을 삭제합니다.
        // await checkIdAvailability('__warmup__');

        // 바로 내 프로필 정보를 요청해서 세션 유효 여부를 확인합니다.
        const userProfile = await apiGetMyProfile();
        // 3. 성공 시, 최신 정보로 상태와 localStorage를 업데이트합니다.
        setUser(userProfile);
        userStorage.setUser(userProfile); 
      } catch (error) {
        // 4. 실패 시 (토큰 만료 등), 비로그인 상태로 처리하고 로컬 정보를 정리합니다.
        //    이때, 이미 localStorage에서 읽어온 초기 user 정보가 있으므로,
        //    사용자는 잠시 이전 정보를 보다가 비로그인 상태로 전환됩니다.
        setUser(null);
        userStorage.removeUser();
      } finally {
        setLoading(false);
      }
    }
    initializeAuth();
  }, []);
  
  // ★★★ 로그인 함수 수정
  const login = async (userId: string, password: string) => {
    try {
      // 1. 로그인 API 호출. 백엔드가 응답으로 HttpOnly 쿠키를 설정해줍니다.
      //    apiLogin 함수는 이제 쿠키 설정과 동시에 사용자 정보를 반환합니다.
      const userProfile = await apiLogin({ userId, password, clientType: 0 }); // clientType: 0은 웹을 의미

      // 2. 반환받은 사용자 정보로 상태를 즉시 업데이트합니다. (추가 API 호출 불필요)
      setUser(userProfile);
      userStorage.setUser(userProfile);

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