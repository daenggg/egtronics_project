"use client"

import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { useToast } from '@/hooks/use-toast'
import { Flag, AlertTriangle } from 'lucide-react'

interface ReportDialogProps {
  type: 'post' | 'comment'
  targetId: string
  children?: React.ReactNode
}

const reportReasons = [
  { value: 'spam', label: '스팸/광고' },
  { value: 'harassment', label: '괴롭힘/혐오 발언' },
  { value: 'inappropriate', label: '부적절한 내용' },
  { value: 'copyright', label: '저작권 침해' },
  { value: 'misinformation', label: '허위 정보' },
  { value: 'other', label: '기타' }
]

export function ReportDialog({ type, targetId, children }: ReportDialogProps) {
  const [open, setOpen] = useState(false)
  const [reason, setReason] = useState('')
  const [description, setDescription] = useState('')
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!reason) {
      toast({
        title: "신고 사유 선택",
        description: "신고 사유를 선택해주세요.",
        variant: "destructive",
      })
      return
    }

    setLoading(true)

    try {
      // 실제 구현에서는 API 호출
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      toast({
        title: "신고 접수 완료",
        description: "신고가 접수되었습니다. 검토 후 조치하겠습니다.",
      })
      
      setOpen(false)
      setReason('')
      setDescription('')
    } catch (error) {
      toast({
        title: "신고 실패",
        description: "다시 시도해주세요.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children || (
          <Button variant="ghost" size="sm" className="text-red-500 hover:text-red-600 hover:bg-red-50">
            <Flag className="h-4 w-4 mr-1" />
            신고
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-red-600">
            <AlertTriangle className="h-5 w-5" />
            {type === 'post' ? '게시글' : '댓글'} 신고하기
          </DialogTitle>
          <DialogDescription>
            부적절한 콘텐츠를 신고해주세요. 신고 내용은 관리자가 검토합니다.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-3">
            <Label>신고 사유</Label>
            <RadioGroup value={reason} onValueChange={setReason}>
              {reportReasons.map((item) => (
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
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              취소
            </Button>
            <Button 
              type="submit" 
              disabled={loading}
              className="bg-red-500 hover:bg-red-600 text-white"
            >
              {loading ? '신고 중...' : '신고하기'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
