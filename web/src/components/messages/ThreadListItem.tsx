import type { MessageThread } from '@/lib/types';
import { cn, formatRelativeTime } from '@/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { OnlinePresenceDot } from '@/components/messages/OnlinePresenceDot';
import { useMessageStore } from '@/store/messageStore';

interface ThreadListItemProps {
  thread: MessageThread;
  isActive: boolean;
  onClick: () => void;
}

export function ThreadListItem({ thread, isActive, onClick }: ThreadListItemProps) {
  const otherUser = thread.other_user;
  const initials = otherUser.full_name.substring(0, 2).toUpperCase();
  const unreadCount = useMessageStore(state => state.unreadPerThread[thread.id] || 0);
  const showUnread = thread.has_unread || unreadCount > 0;

  return (
    <button
      onClick={onClick}
      className={cn(
        "w-full flex items-start gap-3 p-3 text-left transition-colors hover:bg-muted/50 border-b last:border-0",
        isActive && "bg-muted",
        showUnread && !isActive && "bg-primary/5"
      )}
    >
      <div className="relative shrink-0">
        <Avatar className="h-12 w-12">
          <AvatarImage src={otherUser.avatar_url || undefined} />
          <AvatarFallback>{initials}</AvatarFallback>
        </Avatar>
        <OnlinePresenceDot 
          userId={otherUser.id} 
          lastSeenAt={otherUser.last_seen_at} 
          className="absolute bottom-0 right-0 ring-2 ring-background" 
        />
      </div>
      
      <div className="flex-1 min-w-0 overflow-hidden">
        <div className="flex items-center justify-between gap-2">
          <span className={cn("font-semibold truncate", showUnread && "font-bold text-foreground")}>
            {otherUser.full_name}
          </span>
          <span className={cn("text-xs whitespace-nowrap", showUnread ? "text-primary font-medium" : "text-muted-foreground")}>
            {formatRelativeTime(thread.last_message_at)}
          </span>
        </div>
        <div className="flex items-center justify-between gap-2 mt-1">
          <p className={cn(
            "text-sm truncate", 
            showUnread ? "text-foreground font-medium" : "text-muted-foreground"
          )}>
            {thread.last_message_preview || 'No messages yet'}
          </p>
          {showUnread && (
            <span className="h-2 w-2 rounded-full bg-primary shrink-0" />
          )}
        </div>
      </div>
    </button>
  );
}
