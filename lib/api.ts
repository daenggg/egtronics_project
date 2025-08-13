// API 요청 유틸리티 함수들

import { tokenStorage } from './auth-storage'

// 토큰을 포함한 fetch 함수
export async function fetchWithAuth(url: string, options: RequestInit = {}) {
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  }

  return fetch(url, {
    ...options,
    headers,
    credentials: 'include', // 쿠키 포함
  })
}


// GET 요청
export async function apiGet(url: string) {
  return fetchWithAuth(url, { method: 'GET' })
}

// POST 요청
export async function apiPost(url: string, data: any) {
  return fetchWithAuth(url, {
    method: 'POST',
    body: JSON.stringify(data),
  })
}

// PUT 요청
export async function apiPut(url: string, data: any) {
  return fetchWithAuth(url, {
    method: 'PUT',
    body: JSON.stringify(data),
  })
}

// DELETE 요청
export async function apiDelete(url: string) {
  return fetchWithAuth(url, { method: 'DELETE' })
}

// API 응답 처리 유틸리티
export async function handleApiResponse(response: Response) {
  const data = await response.json()
  
  if (!response.ok) {
    throw new Error(data.message || 'API 요청에 실패했습니다.')
  }
  
  return data
}
