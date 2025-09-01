import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * 날짜 문자열을 'YYYY.MM.DD.' 형식으로 안전하게 변환합니다.
 * 유효하지 않거나 없는 날짜 문자열에 대해 오류를 발생시키지 않고 대체 텍스트를 반환합니다.
 * @param dateString - ISO 8601 형식의 날짜 문자열 (e.g., "2025-08-27T14:30:00Z") 또는 `normalizeDate`에서 변환된 빈 문자열.
 * @param fallbackText - 날짜가 유효하지 않을 경우 표시할 텍스트. 기본값은 '날짜 없음'.
 * @returns 포맷된 날짜 문자열 ('YYYY.MM.DD.') 또는 대체 텍스트.
 */
export function formatDate(dateString: string | null | undefined, fallbackText = '날짜 없음'): string {
  // dateString이 null, undefined, 빈 문자열('') 등 falsy 값이면 오류를 발생시키지 않고 fallbackText를 반환합니다.
  if (!dateString) {
    return fallbackText;
  }

  const date = new Date(dateString);

  // new Date()가 유효하지 않은 날짜 객체를 생성했는지 확인합니다.
  // (e.g., new Date('') 또는 new Date('invalid-date-string'))
  // Invalid Date 객체의 getTime() 메서드는 NaN을 반환합니다.
  if (isNaN(date.getTime())) {
    return fallbackText;
  }

  return new Intl.DateTimeFormat('ko-KR', { year: 'numeric', month: '2-digit', day: '2-digit' }).format(date).replace(/ /g, '') + '.';
}

/**
 * 날짜를 동적으로 포맷합니다.
 * - 1분 미만: "방금 전"
 * - 1시간 미만: "n분 전"
 * - 24시간 미만: "n시간 전"
 * - 24시간 이상: "YYYY/MM/DD HH:mm"
 * @param dateString - ISO 8601 형식의 날짜 문자열
 * @param fallbackText - 날짜가 유효하지 않을 경우 표시할 텍스트
 * @returns 포맷된 날짜 문자열 또는 대체 텍스트
 */
export function formatDynamicDate(dateString: string | null | undefined, fallbackText = '날짜 없음'): string {
  if (!dateString) {
    return fallbackText;
  }

  const date = new Date(dateString);
  if (isNaN(date.getTime())) {
    return fallbackText;
  }

  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  const diffInHours = Math.floor(diffInMinutes / 60);

  if (diffInMinutes < 1) {
    return '방금 전';
  }
  if (diffInMinutes < 60) {
    return `${diffInMinutes}분 전`;
  }
  if (diffInHours < 24) {
    return `${diffInHours}시간 전`;
  }

  // 24시간 이상이면 'YYYY/MM/DD HH:mm' 형식
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');

  return `${year}/${month}/${day} ${hours}:${minutes}`;
}