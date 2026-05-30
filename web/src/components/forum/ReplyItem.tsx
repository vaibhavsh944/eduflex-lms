import { useState } from 'react'
import type { ForumReply } from '@/lib/types'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { VoteButton } from './VoteButton'
import { InstructorBadge } from './InstructorBadge'
import { AcceptedAnswerBadge } from './AcceptedAnswerBadge'
import { ModerationMenu } from './ModerationMenu'
import { ReplyComposer } from './ReplyComposer'
import { Button } from '@/components/ui/button'
import { MessageSquare } from 'lucide-react'
import { formatRelativeTime, sanitizeHtml, cn } from '@/lib/utils'

interface ReplyItemProps {
  reply: ForumReply
  threadId: string
  courseId: string
  isThreadAuthor?: boolean
  isInstructor?: boolean
  onAcceptAnswer?: (replyId: string) => void
  onDeleteReply?: (replyId: string) => void
}

export function ReplyItem({ reply, threadId, courseId, isThreadAuthor, isInstructor, onAcceptAnswer, onDeleteReply }: ReplyItemProps) {
  const [showReply, setShowReply] = useState(false)
  const author = reply.author
  const initials = author?.full_name?.substring(0, 2).toUpperCase() || '??'
  const bodyHtml = reply.body

  return (
    <div className={cn('py-4', reply.is_accepted && 'bg-green-50/50 dark:bg-green-950/20 -mx-4 px-4 rounded-lg')}>
      {reply.is_accepted && (
        <div className="mb-2">
          <AcceptedAnswerBadge />
        </div>
      )}
      <div className="flex gap-3">
        <Avatar className="h-8 w-8 shrink-0">
          <AvatarImage src={author?.avatar_url || undefined} />
          <AvatarFallback className="text-xs">{initials}</AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-sm font-medium">{author?.full_name || 'Unknown'}</span>
            {author?.id && <InstructorBadge courseId={courseId} userId={author.id} />}
            <span className="text-xs text-muted-foreground">{formatRelativeTime(reply.created_at)}</span>
          </div>
          <div
            className="text-sm prose prose-sm max-w-none"
            dangerouslySetInnerHTML={{ __html: sanitizeHtml(bodyHtml) }}
          />
          <div className="flex items-center gap-2 mt-2">
            <VoteButton
              targetId={reply.id}
              targetType="reply"
              upvoteCount={reply.upvote_count}
              size="sm"
            />
            <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={() => setShowReply(!showReply)}>
              <MessageSquare className="mr-1 h-3 w-3" />
              Reply
            </Button>
            {(isThreadAuthor || isInstructor) && onAcceptAnswer && !reply.is_accepted && (
              <Button variant="ghost" size="sm" className="h-7 text-xs text-green-600" onClick={() => onAcceptAnswer(reply.id)}>
                Accept Answer
              </Button>
            )}
            {onDeleteReply && (
              <ModerationMenu onDelete={() => onDeleteReply(reply.id)} />
            )}
          </div>
          {showReply && (
            <div className="mt-3">
              <ReplyComposer
                threadId={threadId}
                parentReplyId={reply.id}
                placeholder={`Reply to ${author?.full_name || 'user'}...`}
                mentionUsername={author?.full_name}
                onSuccess={() => setShowReply(false)}
                onCancel={() => setShowReply(false)}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
