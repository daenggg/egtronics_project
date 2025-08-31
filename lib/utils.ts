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
 * 날짜를 'n분 전', '어제' 등 상대 시간으로 변환합니다.
 * @param dateString - ISO 8601 형식의 날짜 문자열
 * @param fallbackText - 날짜가 유효하지 않을 경우 표시할 텍스트
 * @returns 상대 시간 문자열 (e.g., "5분 전") 또는 대체 텍스트
 */
export function formatRelativeTime(dateString: string | null | undefined, fallbackText = '날짜 없음'): string {
  if (!dateString) {
    return fallbackText;
  }

  const date = new Date(dateString);
  if (isNaN(date.getTime())) {
    return fallbackText;
  }

  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  const rtf = new Intl.RelativeTimeFormat('ko', { numeric: 'auto' });

  if (diffInSeconds < 60) {
    return '방금 전';
  }

  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) {
    return rtf.format(-diffInMinutes, 'minute');
  }

  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) {
    return rtf.format(-diffInHours, 'hour');
  }

  // 하루 이상 차이 나면 'YYYY.MM.DD.' 형식으로 표시
  return formatDate(dateString);
}