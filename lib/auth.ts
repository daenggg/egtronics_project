// auth.ts
import axios from "axios"

export interface User {
  id: string
  name: string
  email: string
  avatar?: string
  nickname?: string
  phone?: string
  createdAt: Date
  updatedAt: Date
}

// axios 인스턴스 생성
const api = axios.create({
  baseURL: "http://localhost:8080",
  withCredentials: true, // 쿠키 포함
  headers: {
    "Content-Type": "application/json",
  },
})

// 로그인 API 호출 함수
export async function login(email: string, password: string): Promise<User> {
  try {
    const res = await api.post("/api/auth/login", { email, password })
    return res.data.user
  } catch (err: any) {
    if (err.response && err.response.data) {
      throw new Error(err.response.data.message || "로그인 실패")
    }
    throw new Error(err.message || "로그인 실패")
  }
}

// 로그아웃 API 호출 함수
export async function logout() {
  try {
    await api.post("/api/auth/logout")
  } catch (err: any) {
    if (err.response && err.response.data) {
      throw new Error(err.response.data.message || "로그아웃 실패")
    }
    throw new Error(err.message || "로그아웃 실패")
  }
}

// 보호된 API 요청 함수 (쿠키 자동 포함, 인증 실패 시 에러 throw)
export async function apiWithAuth<T = any>(url: string, config?: any): Promise<T> {
  try {
    const res = await api({ url, ...config })
    return res.data
  } catch (err: any) {
    if (err.response) {
      if (err.response.status === 401) {
        throw new Error("인증 실패, 로그인 필요")
      }
      throw new Error(err.response.data?.message || "API 요청 실패")
    }
    throw new Error(err.message || "API 요청 실패")
  }
}
