// c:\Users\dywjd\Desktop\egtronics_project-YJ-25\lib\token-storage.ts

const REFRESH_TOKEN_KEY = 'refreshToken';

export class TokenStorage {
  // Refresh Token 저장
  setRefreshToken(token: string): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem(REFRESH_TOKEN_KEY, token);
    }
  }

  // Refresh Token 가져오기
  getRefreshToken(): string | null {
    if (typeof window !== 'undefined') {
      return localStorage.getItem(REFRESH_TOKEN_KEY);
    }
    return null;
  }

  // Refresh Token 삭제
  removeRefreshToken(): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(REFRESH_TOKEN_KEY);
    }
  }
}

export const tokenStorage = new TokenStorage();
