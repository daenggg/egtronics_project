"use client"

import { useState, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { useToast } from '@/hooks/use-toast'
import { Upload, X, Image, Video, File } from 'lucide-react'

interface MediaFile {
  id: string
  file: File
  url: string
  type: 'image' | 'video' | 'other'
}

interface MediaUploadProps {
  onFilesChange?: (files: MediaFile[]) => void
  maxFiles?: number
}

export function MediaUpload({ onFilesChange, maxFiles = 5 }: MediaUploadProps) {
  const [files, setFiles] = useState<MediaFile[]>([])
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { toast } = useToast()

  const getFileType = (file: File): 'image' | 'video' | 'other' => {
    if (file.type.startsWith('image/')) return 'image'
    if (file.type.startsWith('video/')) return 'video'
    return 'other'
  }

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(event.target.files || [])
    
    if (files.length + selectedFiles.length > maxFiles) {
      toast({
        title: "파일 개수 초과",
        description: `최대 ${maxFiles}개의 파일만 업로드할 수 있습니다.`,
        variant: "destructive",
      })
      return
    }

    const newFiles: MediaFile[] = selectedFiles.map(file => ({
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      file,
      url: URL.createObjectURL(file),
      type: getFileType(file)
    }))

    const updatedFiles = [...files, ...newFiles]
    setFiles(updatedFiles)
    onFilesChange?.(updatedFiles)
  }

  const removeFile = (fileId: string) => {
    const updatedFiles = files.filter(f => {
      if (f.id === fileId) {
        URL.revokeObjectURL(f.url)
        return false
      }
      return true
    })
    setFiles(updatedFiles)
    onFilesChange?.(updatedFiles)
  }

  const getFileIcon = (type: string) => {
    switch (type) {
      case 'image': return <Image className="h-4 w-4" />
      case 'video': return <Video className="h-4 w-4" />
      default: return <File className="h-4 w-4" />
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Button
          type="button"
          variant="outline"
          onClick={() => fileInputRef.current?.click()}
          className="flex items-center gap-2"
        >
          <Upload className="h-4 w-4" />
          파일 업로드
        </Button>
        <span className="text-sm text-gray-500">
          ({files.length}/{maxFiles})
        </span>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept="image/*,video/*"
        onChange={handleFileSelect}
        className="hidden"
      />

      {files.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {files.map((mediaFile) => (
            <Card key={mediaFile.id} className="relative">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    {getFileIcon(mediaFile.type)}
                    <span className="truncate max-w-[150px]">{mediaFile.file.name}</span>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeFile(mediaFile.id)}
                    className="text-red-500 hover:text-red-600"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
                
                {mediaFile.type === 'image' && (
                  <div className="aspect-video bg-gray-100 rounded-lg overflow-hidden">
                    <img
                      src={mediaFile.url || "/placeholder.svg"}
                      alt="Preview"
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                
                {mediaFile.type === 'video' && (
                  <div className="aspect-video bg-gray-100 rounded-lg overflow-hidden">
                    <video
                      src={mediaFile.url}
                      controls
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                
                <div className="mt-2 text-xs text-gray-500">
                  {(mediaFile.file.size / 1024 / 1024).toFixed(2)} MB
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
