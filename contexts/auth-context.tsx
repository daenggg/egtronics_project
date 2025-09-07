"use client"

import { createContext, useContext, useState, useEffect, ReactNode, useCallback, use } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { userStorage } from '@/lib/auth-storage'
import { tokenStorage } from '@/lib/token-storage';
import {
  login as apiLogin,
  signUp as apiRegister,
  logout as apiLogout,
  updateMyProfile as apiUpdateMyProfile,
  setAccessToken,
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
  isSidebarOpen: boolean
  toggleSidebar: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const queryClient = useQueryClient();

  useEffect(() => {
    // 이 효과는 앱이 처음 마운트될 때 단 한 번만 실행되어야 합니다.
    const initializeAuth = async () => {
      // 1. 로컬 스토리지에서 Refresh Token을 확인합니다.
      const refreshToken = tokenStorage.getRefreshToken();
      if (!refreshToken) {
        // 2. Refresh Token이 없으면 비로그인 상태로 확정하고 종료합니다.
        setLoading(false);
        return;
      }
  
      // 3. Refresh Token이 있으면, 서버에 사용자 프로필 정보를 요청하여 세션 유효성을 확인합니다.
      // 이 과정에서 api-client의 인터셉터가 토큰 갱신을 시도할 수 있습니다.
      try {
        const userProfile = await apiGetMyProfile();
        // 4. 성공 시, 최신 사용자 정보로 상태와 로컬 스토리지를 업데이트합니다.
        // 이 시점에는 Access Token이 (재발급되었을 수 있으므로) 유효합니다.
        setUser(userProfile);
        userStorage.setUser(userProfile);
        // api-client 인터셉터에서 토큰이 재발급되었을 수 있으므로,
        // 재발급된 토큰을 가져와 메모리에 설정합니다.
        // 이 시점에 getRefreshToken()은 갱신된 토큰을 반환합니다.
        // 하지만 더 확실한 방법은 apiGetMyProfile이 성공했다는 것은 accessToken이 유효하다는 것이므로, 이를 설정해주는 것입니다.
      } catch (error) {
        // 5. 프로필 조회 실패 시 (예: Refresh Token 만료) 로그아웃 처리합니다.
        setUser(null);
        userStorage.removeUser();
        tokenStorage.removeRefreshToken();
        setAccessToken(null);
      } finally {
        setLoading(false);
      }
    }
    initializeAuth();
  }, []); // 의존성 배열을 비워서 앱이 처음 로드될 때 한 번만 실행되도록 합니다.

  const login = async (userId: string, password: string) => {
    try {
      // 1. apiLogin을 호출하여 토큰 정보를 받습니다.
      const receivedTokens = await apiLogin({ userId, password });

      // 2. 받은 토큰을 저장하고 API 클라이언트에 설정합니다.
      tokenStorage.setRefreshToken(receivedTokens.refreshToken);
      setAccessToken(receivedTokens.accessToken);

      // 3. 토큰 설정 후, 사용자 프로필 정보를 가져옵니다.
      const userProfile = await apiGetMyProfile();

      // 4. 가져온 사용자 정보를 상태와 로컬 스토리지에 저장합니다.
      setUser(userProfile);
      userStorage.setUser(userProfile);
    } catch (error: any) {
      console.error('로그인 오류:', error.response?.data || error.message);
      // 로그인 실패 시 기존 상태를 확실히 정리합니다.
      setUser(null);
      userStorage.removeUser();
      tokenStorage.removeRefreshToken();
      setAccessToken(null);
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
      tokenStorage.removeRefreshToken();
      setAccessToken(null);
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
