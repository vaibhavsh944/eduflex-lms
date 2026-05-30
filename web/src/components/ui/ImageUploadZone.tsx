import { useState, useRef, useCallback } from 'react';
import { X, AlertCircle, Image as ImageIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface ImageUploadZoneProps {
  bucket: string;
  path: string;
  onUploadComplete: (url: string) => void;
  onError?: (error: string) => void;
  accept?: string;
  maxSizeMb?: number;
  currentUrl?: string | null;
  className?: string;
}

export function ImageUploadZone({
  bucket,
  path: basePath,
  onUploadComplete,
  onError,
  accept = 'image/jpeg,image/png,image/webp',
  maxSizeMb = 5,
  currentUrl,
  className,
}: ImageUploadZoneProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [previewUrl, setPreviewUrl] = useState<string | null>(currentUrl ?? null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback(async (file: File) => {
    setError('');

    if (!file.type.startsWith('image/')) {
      const msg = 'Invalid file type. Please select an image.';
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

    try {
      const { supabase } = await import('@/lib/supabase');
      const fileExt = file.name.split('.').pop() ?? 'jpg';
      const filePath = `${basePath}/${crypto.randomUUID()}.${fileExt}`;

      const { data, error: uploadError } = await supabase.storage
        .from(bucket)
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: true,
        });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from(bucket)
        .getPublicUrl(data.path);

      setPreviewUrl(publicUrl);
      onUploadComplete(publicUrl);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Upload failed';
      setError(msg);
      onError?.(msg);
    } finally {
      setUploading(false);
    }
  }, [bucket, basePath, maxSizeMb, onUploadComplete, onError]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) { void handleFile(file); }
  }, [handleFile]);

  const handleDragOver = (e: React.DragEvent) => { e.preventDefault(); setIsDragging(true); };
  const handleDragLeave = () => { setIsDragging(false); };

  return (
    <div className={cn('space-y-2', className)}>
      <div
        className={cn(
          'relative flex flex-col items-center justify-center rounded-lg border-2 border-dashed p-6 transition-colors cursor-pointer',
          isDragging ? 'border-primary bg-primary/5' : 'border-muted-foreground/25 hover:border-muted-foreground/50',
          error && 'border-destructive',
          uploading && 'pointer-events-none opacity-60',
        )}
        onClick={() => inputRef.current?.click()}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
      >
        {uploading ? (
          <div className="flex flex-col items-center gap-2">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            <p className="text-sm text-muted-foreground">Uploading...</p>
          </div>
        ) : previewUrl ? (
          <div className="relative w-full">
            <img src={previewUrl} alt="Preview" className="max-h-40 rounded-lg object-contain mx-auto" />
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="absolute -top-2 -right-2 h-6 w-6 rounded-full bg-background border shadow-sm"
              onClick={(e) => { e.stopPropagation(); setPreviewUrl(null); }}
            >
              <X className="h-3 w-3" />
            </Button>
            <p className="text-xs text-center text-muted-foreground mt-2">Click to replace</p>
          </div>
        ) : (
          <>
            <ImageIcon className="h-8 w-8 text-muted-foreground mb-2" />
            <p className="text-sm font-medium">Upload Image</p>
            <p className="text-xs text-muted-foreground mt-1">Drag & drop or click to browse</p>
            <p className="text-xs text-muted-foreground">Max {String(maxSizeMb)}MB</p>
          </>
        )}
      </div>

      {error && (
        <div className="flex items-center gap-1.5 text-sm text-destructive">
          <AlertCircle className="h-4 w-4" />
          {error}
        </div>
      )}

      <input
        ref={inputRef}
        type="file"
        accept={accept}
        className="hidden"
        onChange={(e) => { const f = e.target.files?.[0]; if (f) { void handleFile(f); } }}
      />
    </div>
  );
}
