import jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs'

// JWT 시크릿 키 (실제 프로덕션에서는 환경변수로 관리)
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key'
const JWT_EXPIRES_IN = '7d' // 7일

export interface User {
  id: string
  name: string
  email: string
  password: string
  avatar?: string
  nickname?: string
  phone?: string
  createdAt: Date
  updatedAt: Date
}

export interface JWTPayload {
  userId: string
  email: string
  iat: number
  exp: number
}

// 비밀번호 해싱
export async function hashPassword(password: string): Promise<string> {
  const saltRounds = 12
  return bcrypt.hash(password, saltRounds)
}

// 비밀번호 검증
export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword)
}

// JWT 토큰 생성
export function generateToken(userId: string, email: string): string {
  return jwt.sign(
    { userId, email },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  )
}

// JWT 토큰 검증
export function verifyToken(token: string): JWTPayload | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as JWTPayload
    return decoded
  } catch (error) {
    return null
  }
}

// 요청에서 토큰 추출 (Authorization 헤더 또는 쿠키에서)
export function extractTokenFromRequest(request: Request): string | null {
  // Authorization 헤더에서 토큰 확인
  const authHeader = request.headers.get('authorization')
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.substring(7)
  }

  // 쿠키에서 토큰 확인
  const cookieHeader = request.headers.get('cookie')
  if (cookieHeader) {
    const cookies = cookieHeader.split(';').reduce((acc, cookie) => {
      const [key, value] = cookie.trim().split('=')
      acc[key] = value
      return acc
    }, {} as Record<string, string>)
    
    return cookies['auth-token'] || null
  }

  return null
}

// 인증 미들웨어
export async function authenticateUser(request: Request): Promise<JWTPayload | null> {
  const token = extractTokenFromRequest(request)
  if (!token) {
    return null
  }
  return verifyToken(token)
}

// 간단한 인메모리 사용자 저장소 (실제로는 데이터베이스 사용)
export const users: Map<string, User> = new Map()

// 사용자 ID 생성
export function generateUserId(): string {
  return Date.now().toString() + Math.random().toString(36).substr(2, 9)
}
