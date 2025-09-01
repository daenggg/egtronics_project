"use client";

import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useToast } from "@/hooks/use-toast";
import { PostWithDetails } from "@/lib/types";
import { Flag, AlertTriangle } from "lucide-react";

interface ReportDialogProps {
  type: "post" | "comment";
  targetId: string;
  alreadyReported?: boolean;
  children?: React.ReactNode;
}

const Reasons = [
  { value: "1", label: "스팸/광고" },
  { value: "2", label: "괴롭힘/혐오 발언" },
  { value: "3", label: "부적절한 내용" },
  { value: "4", label: "저작권 침해" },
  { value: "5", label: "허위 정보" },
  { value: "6", label: "기타" },
];

export function ReportDialog({
  type,
  targetId,
  alreadyReported = false,
  children,
}: ReportDialogProps) {
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!reason) {
      toast({
        title: "신고 사유 선택",
        description: "신고 사유를 선택해주세요.",
        variant: "destructive",
        duration: 2000,
      });
      return;
    }

    setLoading(true);

    try {
      // 실제 구현에서는 API 호출
      // 예: await api.reportPost(targetId, reason, description);
      await new Promise((resolve) => setTimeout(resolve, 1000));

      toast({
        title: "신고 완료",
        description: (
          <>
            신고가 접수되었습니다.
            <br />
            다량의 신고 접수 시, 게시물은 숨김 처리됩니다.
          </>
        ),
        duration: 2000,
      });

      // 신고가 성공하면, react-query 캐시를 직접 업데이트하여
      // UI가 즉시 '신고 완료' 상태로 바뀌도록 합니다. (낙관적 업데이트)
      if (type === 'post') {
        queryClient.setQueryData<PostWithDetails>(['post', targetId], (oldData) => 
          oldData ? { ...oldData, reportedByCurrentUser: true } : oldData
        );
      }

      setOpen(false);
      setReason("");
      setDescription("");
    } catch (error) {
      toast({
        title: "신고 실패",
        description: "다시 시도해주세요.",
        variant: "destructive",
        duration: 2000,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant={alreadyReported ? "outline" : "ghost"} // 신고 완료면 outline
          size="sm"
          disabled={alreadyReported} // 이미 신고했으면 비활성화
          className={`${
            alreadyReported
              ? "text-gray-400 cursor-not-allowed"
              : "text-red-500 hover:text-red-600 hover:bg-red-50"
          }`}
        >
          <Flag className="h-4 w-4 mr-1" />
          {alreadyReported ? "신고 완료" : "신고"}
        </Button>
      </DialogTrigger>

      {!alreadyReported && ( // 이미 신고했으면 다이얼로그 열지 않음
        <DialogContent className="sm:max-w-md bg-white">
          <DialogHeader>
            <DialogTitle className="flex bg-white items-center gap-2 text-red-600">
              <AlertTriangle className="h-5 w-5" />
              {type === "post" ? "게시글" : "댓글"} 신고하기
            </DialogTitle>
            <DialogDescription>
              부적절한 콘텐츠를 신고해주세요. 신고 내용은 관리자가 검토합니다.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-3">
              <Label>신고 사유</Label>
              <RadioGroup value={reason} onValueChange={setReason}>
                {Reasons.map((item) => (
                  <div key={item.value} className="flex items-center space-x-2">
                    <RadioGroupItem value={item.value} id={item.value} />
                    <Label htmlFor={item.value} className="text-sm font-normal">
                      {item.label}
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">상세 설명 (선택사항)</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="추가 설명이 있다면 입력해주세요..."
                className="min-h-[80px]"
              />
            </div>

            <div className="flex justify-end space-x-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
              >
                취소
              </Button>
              <Button
                disabled={alreadyReported}
                className={
                  alreadyReported
                    ? "text-gray-400 cursor-not-allowed"
                    : "bg-red-500 hover:bg-red-600 text-white"
                }
              >
                {alreadyReported ? "신고 완료" : "신고"}
              </Button>
            </div>
          </form>
        </DialogContent>
      )}
    </Dialog>
  );
}
