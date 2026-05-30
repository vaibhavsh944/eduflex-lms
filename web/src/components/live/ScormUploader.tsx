import { useState, useRef, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Upload, FileArchive, Loader2, CheckCircle2, XCircle } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ScormUploaderProps {
  onUpload: (file: File) => Promise<void>
}

const MAX_SIZE_MB = 50
const MAX_SIZE_BYTES = MAX_SIZE_MB * 1024 * 1024
const ACCEPTED_TYPES = ['.zip', 'application/zip', 'application/x-zip-compressed']

export function ScormUploader({ onUpload }: ScormUploaderProps) {
  const [dragOver, setDragOver] = useState(false)
  const [file, setFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [status, setStatus] = useState<'idle' | 'processing' | 'ready' | 'error'>('idle')
  const [error, setError] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  const validateFile = useCallback((f: File): string | null => {
    if (!ACCEPTED_TYPES.includes(f.type) && !f.name.endsWith('.zip')) {
      return 'Only ZIP files are accepted.'
    }
    if (f.size > MAX_SIZE_BYTES) {
      return `File size exceeds the ${MAX_SIZE_MB}MB limit.`
    }
    return null
  }, [])

  const handleFile = useCallback(
    async (f: File) => {
      const validationError = validateFile(f)
      if (validationError) {
        setError(validationError)
        setFile(null)
        return
      }

      setError('')
      setFile(f)
      setUploading(true)
      setProgress(0)
      setStatus('processing')

      try {
        const interval = setInterval(() => {
          setProgress((prev) => Math.min(prev + 10, 90))
        }, 300)

        await onUpload(f)

        clearInterval(interval)
        setProgress(100)
        setStatus('ready')
      } catch {
        setStatus('error')
        setError('Upload failed. Please try again.')
      } finally {
        setUploading(false)
      }
    },
    [validateFile, onUpload],
  )

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      setDragOver(false)
      const droppedFile = e.dataTransfer.files[0]
      if (droppedFile) handleFile(droppedFile)
    },
    [handleFile],
  )

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const selectedFile = e.target.files?.[0]
      if (selectedFile) handleFile(selectedFile)
    },
    [handleFile],
  )

  const handleReset = () => {
    setFile(null)
    setProgress(0)
    setStatus('idle')
    setError('')
    if (inputRef.current) inputRef.current.value = ''
  }

  return (
    <div className="space-y-4">
      <div
        onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        onClick={() => !uploading && inputRef.current?.click()}
        className={cn(
          'relative flex flex-col items-center justify-center rounded-lg border-2 border-dashed p-8 transition-colors cursor-pointer',
          dragOver
            ? 'border-primary bg-primary/5'
            : 'border-muted-foreground/25 hover:border-muted-foreground/50',
          uploading && 'pointer-events-none opacity-60',
        )}
      >
        <input
          ref={inputRef}
          type="file"
          accept=".zip"
          className="hidden"
          onChange={handleInputChange}
        />

        {status === 'ready' ? (
          <CheckCircle2 className="w-10 h-10 text-green-500 mb-2" />
        ) : status === 'error' ? (
          <XCircle className="w-10 h-10 text-destructive mb-2" />
        ) : (
          <Upload className="w-10 h-10 text-muted-foreground mb-2" />
        )}

        <p className="text-sm font-medium">
          {status === 'ready'
            ? 'Upload complete!'
            : status === 'error'
              ? 'Upload failed'
              : 'Drop SCORM package here'}
        </p>
        <p className="text-xs text-muted-foreground mt-1">
          {status === 'idle' && 'or click to browse (.zip, max 50MB)'}
        </p>

        {file && status !== 'ready' && (
          <div className="flex items-center gap-2 mt-3 text-xs text-muted-foreground">
            <FileArchive className="w-4 h-4" />
            <span>{file.name}</span>
          </div>
        )}
      </div>

      {uploading && (
        <div className="space-y-1">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <Loader2 className="w-3 h-3 animate-spin" />
              Uploading...
            </span>
            <span>{progress}%</span>
          </div>
          <Progress value={progress} className="h-1.5" />
        </div>
      )}

      {status === 'processing' && !uploading && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="w-4 h-4 animate-spin" />
          Processing SCORM package...
        </div>
      )}

      {error && (
        <p className="text-xs text-destructive">{error}</p>
      )}

      {(status === 'ready' || status === 'error') && (
        <Button variant="outline" size="sm" onClick={handleReset}>
          Upload Another
        </Button>
      )}
    </div>
  )
}
