import type { AppNotification } from '@/lib/types';
import { cn, formatRelativeTime } from '@/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Bell, 
  MessageSquare, 
  CheckCircle, 
  XCircle, 
  FileText, 
  Megaphone, 
  BookOpen, 
  Clock, 
  Trophy, 
  CornerDownRight 
} from 'lucide-react';
import { Link } from 'react-router-dom';

interface NotificationItemProps {
  notification: AppNotification;
  onRead?: (id: string) => void;
}

export function NotificationItem({ notification, onRead }: NotificationItemProps) {
  const isUnread = !notification.read_at;

  const getIcon = () => {
    switch (notification.type) {
      case 'new_message': return <MessageSquare className="h-5 w-5 text-blue-500" />;
      case 'quiz_passed': return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'quiz_failed': return <XCircle className="h-5 w-5 text-destructive" />;
      case 'assignment_graded': return <FileText className="h-5 w-5 text-purple-500" />;
      case 'assignment_returned': return <FileText className="h-5 w-5 text-orange-500" />;
      case 'course_announcement': return <Megaphone className="h-5 w-5 text-amber-500" />;
      case 'new_enrollment': return <BookOpen className="h-5 w-5 text-indigo-500" />;
      case 'deadline_reminder': return <Clock className="h-5 w-5 text-red-500" />;
      case 'course_complete': return <Trophy className="h-5 w-5 text-yellow-500" />;
      case 'reply_to_post': return <CornerDownRight className="h-5 w-5 text-blue-400" />;
      default: return <Bell className="h-5 w-5 text-muted-foreground" />;
    }
  };

  const content = (
    <div className={cn(
      "flex gap-4 p-4 transition-colors hover:bg-muted/50 rounded-lg",
      isUnread ? "bg-muted/30" : "bg-transparent"
    )}>
      <div className="shrink-0 mt-1">
        {notification.actor ? (
          <Avatar className="h-10 w-10">
            <AvatarImage src={notification.actor.avatar_url || undefined} />
            <AvatarFallback>{notification.actor.full_name.substring(0, 2).toUpperCase()}</AvatarFallback>
          </Avatar>
        ) : (
          <div className="h-10 w-10 rounded-full bg-background border flex items-center justify-center">
            {getIcon()}
          </div>
        )}
      </div>
      
      <div className="flex-1 space-y-1">
        <div className="flex items-start justify-between gap-2">
          <p className={cn("text-sm", isUnread ? "font-semibold" : "font-medium")}>
            {notification.title}
          </p>
          <span className="text-xs text-muted-foreground shrink-0 mt-0.5">
            {formatRelativeTime(notification.created_at)}
          </span>
        </div>
        <p className="text-sm text-muted-foreground line-clamp-2">
          {notification.body?.replace(/<[^>]*>/g, '')}
        </p>
      </div>
      
      {isUnread && (
        <div className="shrink-0 flex items-center justify-center">
          <span className="h-2.5 w-2.5 rounded-full bg-primary" />
        </div>
      )}
    </div>
  );

  const wrapper = notification.action_url ? (
    <Link to={notification.action_url} onClick={() => isUnread && onRead?.(notification.id)} className="block">
      {content}
    </Link>
  ) : (
    <button onClick={() => isUnread && onRead?.(notification.id)} className="w-full text-left block">
      {content}
    </button>
  );

  return wrapper;
}
