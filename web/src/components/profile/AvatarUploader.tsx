import { useState, useRef } from 'react';
import { Camera, Loader2, Upload } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useUploadAvatar } from '@/hooks/mutations/useUploadAvatar';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface AvatarUploaderProps {
  userId: string;
  currentAvatarUrl?: string | null;
  fullName: string;
}

const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2MB

export function AvatarUploader({ userId, currentAvatarUrl, fullName }: AvatarUploaderProps) {
  const [isHovering, setIsHovering] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { mutate: uploadAvatar, isPending } = useUploadAvatar();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > MAX_FILE_SIZE) {
      toast.error('File size must be less than 2MB');
      return;
    }

    if (!file.type.startsWith('image/')) {
      toast.error('File must be an image');
      return;
    }

    uploadAvatar({ userId, file });
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsHovering(false);
    
    const file = e.dataTransfer.files?.[0];
    if (!file) return;

    if (file.size > MAX_FILE_SIZE) {
      toast.error('File size must be less than 2MB');
      return;
    }

    if (!file.type.startsWith('image/')) {
      toast.error('File must be an image');
      return;
    }

    uploadAvatar({ userId, file });
  };

  const initials = fullName.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);

  return (
    <div className="flex flex-col items-center gap-4">
      <div 
        className="relative group cursor-pointer"
        onMouseEnter={() => setIsHovering(true)}
        onMouseLeave={() => setIsHovering(false)}
        onDragOver={(e) => { e.preventDefault(); setIsHovering(true); }}
        onDragLeave={(e) => { e.preventDefault(); setIsHovering(false); }}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
      >
        <Avatar className={cn("h-32 w-32 border-4 border-background shadow-lg transition-all", isHovering && "opacity-80")}>
          <AvatarImage src={currentAvatarUrl || undefined} alt={fullName} />
          <AvatarFallback className="text-4xl">{initials}</AvatarFallback>
        </Avatar>
        
        <div className={cn(
          "absolute inset-0 flex flex-col items-center justify-center rounded-full bg-black/50 text-white transition-opacity",
          isHovering || isPending ? "opacity-100" : "opacity-0"
        )}>
          {isPending ? (
            <Loader2 className="h-8 w-8 animate-spin" />
          ) : (
            <>
              <Camera className="h-8 w-8 mb-1" />
              <span className="text-xs font-medium">Change</span>
            </>
          )}
        </div>

        <input 
          type="file" 
          ref={fileInputRef} 
          onChange={handleFileChange} 
          accept="image/*" 
          className="hidden" 
        />
      </div>
      <div className="text-center">
        <p className="text-sm font-medium">Profile Picture</p>
        <p className="text-xs text-muted-foreground">JPG, GIF or PNG. Max size 2MB</p>
      </div>
    </div>
  );
}
