// utils/api.ts
import axios, { AxiosRequestConfig } from "axios"
import { tokenStorage } from "./auth-storage"

// axios 인스턴스 생성
const api = axios.create({
  baseURL: "http://localhost:8080", // 필요 시 기본 URL 지정
  withCredentials: true, // 쿠키 포함
  headers: {
    "Content-Type": "application/json",
  },
})

// 요청 인터셉터로 토큰 자동 추가
api.interceptors.request.use((config: AxiosRequestConfig) => {
  const token = tokenStorage.get() // 토큰 가져오기
  if (token) {
    // headers가 undefined일 수 있으므로 기본 객체로 초기화
    config.headers = {
      ...(config.headers || {}),
      Authorization: `Bearer ${token}`,
    }
  }
  return config
})

// GET 요청
export async function apiGet<T = any>(url: string, params?: any): Promise<T> {
  try {
    const res = await api.get<T>(url, { params })
    return res.data
  } catch (err: any) {
    handleApiError(err)
  }
}

// POST 요청
export async function apiPost<T = any>(url: string, data: any): Promise<T> {
  try {
    const res = await api.post<T>(url, data)
    return res.data
  } catch (err: any) {
    handleApiError(err)
  }
}

// PUT 요청
export async function apiPut<T = any>(url: string, data: any): Promise<T> {
  try {
    const res = await api.put<T>(url, data)
    return res.data
  } catch (err: any) {
    handleApiError(err)
  }
}

// DELETE 요청
export async function apiDelete<T = any>(url: string): Promise<T> {
  try {
    const res = await api.delete<T>(url)
    return res.data
  } catch (err: any) {
    handleApiError(err)
  }
}

// 에러 처리
function handleApiError(err: any): never {
  if (err.response && err.response.data) {
    throw new Error(err.response.data.message || "API 요청 실패")
  } else {
    throw new Error(err.message || "API 요청 실패")
  }
}

export default api
