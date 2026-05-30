import { useState, useRef, useCallback } from 'react';
import { UploadCloud, Film, X, AlertCircle, CheckCircle } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { supabase } from '@/lib/supabase';

interface VideoUploadZoneProps {
  onUploadComplete: (url: string) => void;
  onError?: (error: string) => void;
  accept?: string;
  maxSizeMb?: number;
  currentUrl?: string | null;
}

export function VideoUploadZone({
  onUploadComplete,
  onError,
  accept = 'video/mp4,video/mov,video/avi,video/webm',
  maxSizeMb = 2048,
  currentUrl,
}: VideoUploadZoneProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState('');
  const [previewUrl, setPreviewUrl] = useState<string | null>(currentUrl ?? null);
  const [uploadingFileSize, setUploadingFileSize] = useState<number>(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback(async (file: File) => {
    setError('');
    setUploadingFileSize(file.size);

    if (!file.type.startsWith('video/')) {
      const msg = 'Invalid file type. Please select a video file.';
      setError(msg);
      onError?.(msg);
      return;
    }

    if (file.size > maxSizeMb * 1024 * 1024) {
      const msg = `File exceeds ${String(maxSizeMb)}MB limit.`;
      setError(msg);
      onError?.(msg);
      return;
    }

    setUploading(true);
    setProgress(0);

    try {
      const fileExt = file.name.split('.').pop() ?? 'mp4';
      const filePath = `uploads/${crypto.randomUUID()}.${fileExt}`;

      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const storageUrl = `${supabaseUrl}/storage/v1`;
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('You must be logged in to upload');

      const uploadUrl = `${storageUrl}/object/lesson-videos/${filePath}`;

      await new Promise<void>((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open('POST', uploadUrl);
        xhr.setRequestHeader('Authorization', `Bearer ${session.access_token}`);

        xhr.timeout = 300000;
        xhr.ontimeout = () => reject(new Error('Upload timed out after 5 minutes'));

        xhr.upload.onprogress = (e) => {
          if (e.lengthComputable) {
            const pct = Math.round((e.loaded / e.total) * 100);
            setProgress(pct);
          }
        };

        xhr.onload = () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            resolve();
          } else {
            let msg = `Upload failed (${xhr.status})`;
            try {
              const body = JSON.parse(xhr.responseText);
              if (body.error) msg = body.error;
            } catch {}
            reject(new Error(msg));
          }
        };

        xhr.onerror = () => reject(new Error('Network error during upload'));

        const formData = new FormData();
        formData.append('cacheControl', '3600');
        formData.append('', file);

        xhr.send(formData);
      });

      const publicUrl = `${storageUrl}/object/public/lesson-videos/${filePath}`;
      setPreviewUrl(publicUrl);
      onUploadComplete(publicUrl);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Upload failed';
      setError(msg);
      onError?.(msg);
    } finally {
      setUploading(false);
    }
  }, [maxSizeMb, onUploadComplete, onError]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) { void handleFile(file); }
  }, [handleFile]);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => { setIsDragging(false); };

  const handleClick = () => { inputRef.current?.click(); };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) { void handleFile(file); }
  };

  const handleRemove = () => {
    setPreviewUrl(null);
    setError('');
    setProgress(0);
    onUploadComplete('');
  };

  return (
    <div className="space-y-2">
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={handleClick}
        className={cn(
          'relative flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed p-8 transition-colors',
          isDragging ? 'border-primary bg-primary/5' : 'border-muted-foreground/25 hover:border-muted-foreground/50',
          uploading && 'pointer-events-none opacity-60',
          previewUrl && 'border-solid border-green-500/50 bg-green-500/5',
        )}
      >
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          className="hidden"
          onChange={handleInputChange}
          disabled={uploading}
        />

        {previewUrl ? (
          <div className="flex flex-col items-center gap-2">
            <CheckCircle className="h-10 w-10 text-green-500" />
            <p className="text-sm font-medium text-green-600 dark:text-green-400">Video uploaded</p>
            <video src={previewUrl} className="mt-2 max-h-32 rounded-md" controls />
          </div>
        ) : uploading ? (
          <div className="flex flex-col items-center gap-3 w-full max-w-xs">
            <Film className="h-10 w-10 text-primary" />
            <p className="text-sm font-medium">Uploading... {progress}%</p>
            <Progress value={progress} className="w-full" />
            <p className="text-xs text-muted-foreground">
              {uploadingFileSize > 0 ? `${(uploadingFileSize / (1024 * 1024)).toFixed(1)}MB` : 'Large'} file — don't close this page
            </p>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2">
            <UploadCloud className="h-10 w-10 text-muted-foreground" />
            <p className="text-sm font-medium">
              Drop video here, or <span className="text-primary">browse</span>
            </p>
            <p className="text-xs text-muted-foreground">
              MP4, MOV, AVI, or WebM — up to {maxSizeMb}MB
            </p>
          </div>
        )}
      </div>

      {error && (
        <div className="flex items-center gap-2 rounded-md bg-destructive/10 p-3 text-sm text-destructive">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {previewUrl && (
        <Button variant="outline" size="sm" onClick={handleRemove} className="gap-2">
          <X className="h-4 w-4" />
          Remove video
        </Button>
      )}
    </div>
  );
}
