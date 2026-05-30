import type { DirectMessage } from '@/lib/types';
import { cn, formatRelativeTime } from '@/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Check, CheckCheck } from 'lucide-react';

interface MessageBubbleProps {
  message: DirectMessage;
  isOwn: boolean;
  isRead: boolean;
  showAvatar: boolean;
}

export function MessageBubble({ message, isOwn, isRead, showAvatar }: MessageBubbleProps) {
  const initials = message.sender.full_name.substring(0, 2).toUpperCase();

  return (
    <div className={cn("flex w-full gap-2", isOwn ? "justify-end" : "justify-start")}>
      {!isOwn && (
        <div className="w-8 shrink-0">
          {showAvatar && (
            <Avatar className="h-8 w-8">
              <AvatarImage src={message.sender.avatar_url || undefined} />
              <AvatarFallback className="text-xs">{initials}</AvatarFallback>
            </Avatar>
          )}
        </div>
      )}

      <div className={cn("flex flex-col max-w-[70%]", isOwn ? "items-end" : "items-start")}>
        <div 
          className={cn(
            "px-4 py-2 rounded-2xl whitespace-pre-wrap break-words",
            isOwn 
              ? "bg-primary text-primary-foreground rounded-br-sm" 
              : "bg-muted rounded-bl-sm"
          )}
        >
          {message.body}
        </div>
        <div className="flex items-center gap-1 mt-1 px-1">
          <span className="text-[10px] text-muted-foreground">
            {formatRelativeTime(message.sent_at)}
          </span>
          {isOwn && (
            isRead ? (
              <CheckCheck className="h-3 w-3 text-primary" />
            ) : (
              <Check className="h-3 w-3 text-muted-foreground" />
            )
          )}
        </div>
      </div>
    </div>
  );
}
