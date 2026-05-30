import React, { useRef, useState } from 'react'
import { UploadCloud, File as FileIcon, X } from 'lucide-react'
import { cn } from '@/lib/utils'

interface FileUploadZoneProps {
  accept: string[]
  maxMb: number
  onFileSelect: (file: File | null) => void
  onError: (msg: string) => void
  selectedFile: File | null
}

export function FileUploadZone({ accept, maxMb, onFileSelect, onError, selectedFile }: FileUploadZoneProps) {
  const [isDragging, setIsDragging] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const handleFile = (file: File) => {
    if (!file) return

    // Validate size
    if (file.size > maxMb * 1024 * 1024) {
      onError(`File too large. Max size is ${maxMb}MB.`)
      return
    }

    const ext = '.' + file.name.split('.').pop()?.toLowerCase()
    const isExtMatch = accept.includes(ext)
    const isMimeMatch = accept.some(t => file.type.includes(t.replace('application/', ''))) || file.type.startsWith(ext.replace('.', '/'))
    if (!isExtMatch && !isMimeMatch) {
      onError(`Invalid file type. Accepted: ${accept.join(', ')}`)
      return
    }

    onFileSelect(file)
  }

  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const onDragLeave = () => {
    setIsDragging(false)
  }

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFile(e.dataTransfer.files[0])
    }
  }

  return (
    <div className="w-full">
      {selectedFile ? (
        <div className="flex items-center justify-between p-4 border border-border rounded-lg bg-card">
          <div className="flex items-center space-x-3 overflow-hidden">
            <div className="w-10 h-10 bg-primary/10 text-primary rounded flex items-center justify-center flex-shrink-0">
              <FileIcon className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-medium truncate">{selectedFile.name}</p>
              <p className="text-xs text-muted-foreground">{(selectedFile.size / 1024 / 1024).toFixed(2)} MB</p>
            </div>
          </div>
          <button 
            onClick={() => onFileSelect(null)}
            className="p-2 hover:bg-muted rounded-md text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ) : (
        <div
          className={cn(
            "border-2 border-dashed rounded-xl p-10 flex flex-col items-center justify-center text-center cursor-pointer transition-colors",
            isDragging ? "border-primary bg-primary/5" : "border-border hover:border-primary/50 hover:bg-muted/30"
          )}
          onClick={() => inputRef.current?.click()}
          onDragOver={onDragOver}
          onDragLeave={onDragLeave}
          onDrop={onDrop}
        >
          <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
            <UploadCloud className="w-8 h-8 text-muted-foreground" />
          </div>
          <h3 className="text-base font-medium mb-1">Drag & drop your file here, or click to select</h3>
          <p className="text-sm text-muted-foreground">
            Accepted: {accept.join(', ').replace(/\./g, '').toUpperCase()} · Max size: {maxMb}MB
          </p>
          <input
            type="file"
            className="hidden"
            ref={inputRef}
            accept={accept.join(',')}
            onChange={(e) => {
              if (e.target.files && e.target.files.length > 0) {
                handleFile(e.target.files[0])
              }
            }}
          />
        </div>
      )}
    </div>
  )
}
