// 사용자 정보 저장 관리
import { User } from './types';

export class UserStorage {
  // 사용자 정보 저장 (민감하지 않은 정보만)
  setUser(user: User): void {
    if (typeof window !== 'undefined') {
      // User 타입에서 localStorage에 저장할 안전한 정보만 선택합니다.
      // 비밀번호와 같은 민감한 정보는 제외합니다.
      const safeUser: Partial<User> = {
        userId: user.userId,
        email: user.email,
        name: user.name,
        nickname: user.nickname,
        phoneNumber: user.phoneNumber,
        profilePicture: user.profilePicture,
        authority: user.authority,
      };
      localStorage.setItem('user', JSON.stringify(safeUser));
    }
  }

  // 사용자 정보 가져오기
  getUser(): User | null {
    if (typeof window !== 'undefined') {
      const userStr = localStorage.getItem('user');
      return userStr ? (JSON.parse(userStr) as User) : null;
    }
    return null;
  }

  // 사용자 정보 삭제
  removeUser(): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('user')
    }
  }
}

// 기본 인스턴스들
export const userStorage = new UserStorage()
