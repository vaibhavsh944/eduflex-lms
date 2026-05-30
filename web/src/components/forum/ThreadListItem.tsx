import { Link } from 'react-router-dom'
import type { ForumThread } from '@/lib/types'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { VoteButton } from './VoteButton'
import { InstructorBadge } from './InstructorBadge'
import { Pin, Lock, MessageSquare } from 'lucide-react'
import { formatRelativeTime } from '@/lib/utils'
import { cn } from '@/lib/utils'

interface ThreadListItemProps {
  thread: ForumThread
  link: string
  courseId: string
}

export function ThreadListItem({ thread, link, courseId }: ThreadListItemProps) {
  const author = thread.author
  const initials = author?.full_name?.substring(0, 2).toUpperCase() || '??'
  const bodyPreview = thread.body.replace(/<[^>]*>/g, '').substring(0, 150)

  return (
    <Link to={link} className={cn('block p-4 border-b hover:bg-muted/50 transition-colors', thread.is_off_topic && 'opacity-60')}>
      <div className="flex items-start gap-4">
        <div className="shrink-0 pt-1">
          <VoteButton
            targetId={thread.id}
            targetType="thread"
            upvoteCount={thread.upvote_count}
            size="sm"
          />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            {thread.is_pinned && <Pin className="h-3.5 w-3.5 text-primary shrink-0" />}
            {thread.is_locked && <Lock className="h-3.5 w-3.5 text-muted-foreground shrink-0" />}
            {thread.is_off_topic && (
              <span className="text-xs font-medium text-muted-foreground bg-muted px-1.5 py-0.5 rounded shrink-0">Off-topic</span>
            )}
            <h3 className="font-semibold text-sm truncate">{thread.title}</h3>
          </div>
          {bodyPreview && (
            <p className="text-xs text-muted-foreground line-clamp-2 mb-2">{bodyPreview}</p>
          )}
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            <div className="flex items-center gap-1.5">
              <Avatar className="h-5 w-5">
                <AvatarImage src={author?.avatar_url || undefined} />
                <AvatarFallback className="text-[8px]">{initials}</AvatarFallback>
              </Avatar>
              <span>{author?.full_name || 'Unknown'}</span>
              {author?.id && <InstructorBadge courseId={courseId} userId={author.id} />}
            </div>
            <span>{formatRelativeTime(thread.created_at)}</span>
            <span className="flex items-center gap-1">
              <MessageSquare className="h-3 w-3" />
              {thread.reply_count}
            </span>
          </div>
        </div>
      </div>
    </Link>
  )
}
