"use client";
import { useState, KeyboardEvent } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export default function Pagination({ currentPage, totalPages, onPageChange }: PaginationProps) {
  const pageGroupSize = 5;
  const [inputValue, setInputValue] = useState("");

  const handleGoToPage = () => {
    const page = parseInt(inputValue, 10);
    if (!isNaN(page) && page >= 1 && page <= totalPages) {
      onPageChange(page);
      setInputValue(""); // 이동 후 입력 필드 초기화
    }
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      handleGoToPage();
    }
  };
  
  const renderPageNumbers = () => {
    const pageButtons = [];
    const range = Math.floor(pageGroupSize / 2); // 현재 페이지를 중심으로 좌우에 몇 개의 페이지를 보여줄지 결정

    let startPage = currentPage - range;
    let endPage = currentPage + range;

    // 마지막 페이지 그룹이 5개 미만일 경우, endPage가 totalPages를 넘지 않도록 조정하고 startPage를 다시 계산
    if (endPage > totalPages) {
      endPage = totalPages;
      startPage = Math.max(1, endPage - pageGroupSize + 1);
    }

    // 첫 페이지 그룹이 1보다 작아질 경우, startPage를 1로 고정하고 endPage를 다시 계산
    if (startPage < 1) {
      startPage = 1;
      endPage = Math.min(totalPages, startPage + pageGroupSize - 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pageButtons.push(
        <Button
          key={i}
          variant={currentPage === i ? "outline3" : "outline2"}
          onClick={() => onPageChange(i)}
          className="w-10 h-10 flex items-center justify-center" // 버튼 크기를 고정하여 일관된 UI를 제공합니다.
        >
          {i}
        </Button>
      );
    }

    return pageButtons;
  };

  return (
    <div className="flex justify-center items-center space-x-2 mt-6">
      {/* 맨 앞으로 */}
      <Button
        variant="outline2"
        disabled={currentPage === 1}
        onClick={() => onPageChange(1)}
      >
        맨 앞
      </Button>

      {/* 이전 */}
      <Button
        variant="outline2"
        disabled={currentPage === 1}
        onClick={() => onPageChange(currentPage - 1)}
      >
        ◁
      </Button>

      {/* 페이지 번호 */}
      {renderPageNumbers()}

      {/* 다음 */}
      <Button
        variant="outline2"
        disabled={currentPage === totalPages}
        onClick={() => onPageChange(currentPage + 1)}
      >
        ▷
      </Button>

      {/* 맨 뒤로 */}
      <Button
        variant="outline2"
        disabled={currentPage === totalPages}
        onClick={() => onPageChange(totalPages)}
      >
        맨 뒤
      </Button>

      {/* 페이지 입력 이동 */}
      <div className="flex items-center ml-4">
        <Input
          type="text"
          inputMode="numeric"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          className="h-10 w-20 text-center placeholder:text-slate-400"
          placeholder={`1-${totalPages}`}
        />
      </div>
    </div>
  );
}
