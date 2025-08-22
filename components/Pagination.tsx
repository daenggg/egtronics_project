"use client";
import { Button } from "@/components/ui/button";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export default function Pagination({ currentPage, totalPages, onPageChange }: PaginationProps) {
  const range = 2; // 현재 페이지 기준 앞뒤 몇 개 보여줄지

  const renderPageNumbers = () => {
    const pageButtons = [];
    let start = Math.max(1, currentPage - range);
    let end = Math.min(totalPages, currentPage + range);

    // 첫 페이지 + ...
    if (start > 1) {
      pageButtons.push(
        <Button
          key={1}
          variant={currentPage === 1 ? "outline3" : "outline2"}
          onClick={() => onPageChange(1)}
        >
          1
        </Button>
      );
      if (start > 2) pageButtons.push(<span key="start-ellipsis">...</span>);
    }

    // 가운데 페이지
    for (let i = start; i <= end; i++) {
      pageButtons.push(
        <Button
          key={i}
          variant={currentPage === i ? "outline3" : "outline2"}
          onClick={() => onPageChange(i)}
        >
          {i}
        </Button>
      );
    }

    // 끝 페이지 + ...
    if (end < totalPages) {
      if (end < totalPages - 1) pageButtons.push(<span key="end-ellipsis">...</span>);
      pageButtons.push(
        <Button
          key={totalPages}
          variant={currentPage === totalPages ? "default" : "outline2"}
          onClick={() => onPageChange(totalPages)}
        >
          {totalPages}
        </Button>
      );
    }

    return pageButtons;
  };

  return (
    <div className="flex justify-center space-x-2 mt-6">
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
    </div>
  );
}
