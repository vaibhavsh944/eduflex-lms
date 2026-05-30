import { useParams } from 'react-router-dom'
import { useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useForumThread, useForumReplies } from '@/hooks/queries/useForum'
import { useAuthStore } from '@/store/authStore'
import { useForumStore } from '@/store/forumStore'
import { PageHeader } from '@/components/common/PageHeader'
import { ReplyItem } from '@/components/forum/ReplyItem'
import { ReplyComposer } from '@/components/forum/ReplyComposer'
import { VoteButton } from '@/components/forum/VoteButton'
import { InstructorBadge } from '@/components/forum/InstructorBadge'
import { ModerationMenu } from '@/components/forum/ModerationMenu'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Skeleton } from '@/components/ui/skeleton'
import { Card, CardContent } from '@/components/ui/card'
import { sanitizeHtml, formatRelativeTime } from '@/lib/utils'
import { Lock, ArrowLeft } from 'lucide-react'
import { Link } from 'react-router-dom'
import { ROUTES } from '@/lib/constants'
import { useQueryClient } from '@tanstack/react-query'

export function ForumThreadPage() {
  const { courseId, threadId } = useParams<{ courseId: string; threadId: string }>()
  const user = useAuthStore(state => state.user)
  const { setActiveThread } = useForumStore()
  const queryClient = useQueryClient()

  const { data: thread, isLoading: threadLoading } = useForumThread(threadId || '')
  const { data: replies, isLoading: repliesLoading } = useForumReplies(threadId || '')

  useEffect(() => {
    if (threadId) { setActiveThread(threadId) }
    return () => { setActiveThread(null) }
  }, [threadId, setActiveThread])

  useEffect(() => {
    if (!threadId) return
    const channel = supabase
      .channel(`thread-replies-${threadId}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'forum_replies',
        filter: `thread_id=eq.${threadId}`,
      }, () => {
        void queryClient.invalidateQueries({ queryKey: ['forum', 'replies', threadId] })
      })
      .subscribe()
    return () => { void supabase.removeChannel(channel) }
  }, [threadId, queryClient])

  if (threadLoading) {
    return <div className="max-w-3xl mx-auto py-8 space-y-4"><Skeleton className="h-12 w-3/4" /><Skeleton className="h-32 w-full" /></div>
  }

  if (!thread) {
    return <div className="max-w-3xl mx-auto py-8 text-center text-muted-foreground">Thread not found.</div>
  }

  const isInstructor = user?.role === 'instructor' || user?.role === 'admin'
  const isThreadAuthor = user?.id === thread.user_id
  const topLevelReplies = replies?.filter(r => !r.parent_reply_id) || []
  const nestedReplies = replies?.filter(r => r.parent_reply_id) || []

  const handleModerate = (action: string) => {
    void supabase.functions.invoke('forum/moderate-thread', {
      body: { thread_id: threadId, action },
    }).then(() => {
      void queryClient.invalidateQueries({ queryKey: ['forum', 'thread', threadId] })
    })
  }

  const handleAcceptAnswer = (replyId: string) => {
    void supabase.functions.invoke('forum/moderate-reply', {
      body: { reply_id: replyId, action: 'mark_accepted' },
    }).then(() => {
      void queryClient.invalidateQueries({ queryKey: ['forum', 'replies', threadId] })
    })
  }

  const handleDeleteReply = (replyId: string) => {
    void supabase.functions.invoke('forum/moderate-reply', {
      body: { reply_id: replyId, action: 'delete' },
    }).then(() => {
      void queryClient.invalidateQueries({ queryKey: ['forum', 'replies', threadId] })
    })
  }

  const author = thread.author as { id: string; full_name: string; avatar_url: string | null; role: string }
  const initials = author.full_name.substring(0, 2).toUpperCase() || '??'

  return (
    <div className="max-w-3xl mx-auto pb-12">
      <Link to={courseId ? ROUTES.FORUM(courseId) : '#'} className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-4">
        <ArrowLeft className="h-4 w-4" /> Back to Forum
      </Link>

      <Card className="mb-6">
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            <VoteButton targetId={thread.id} targetType="thread" upvoteCount={thread.upvote_count} />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-2">
                {thread.is_pinned && <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">Pinned</span>}
                {thread.is_locked && <Lock className="h-4 w-4 text-muted-foreground" />}
                <PageHeader title={thread.title} />
              </div>
              <div className="flex items-center gap-2 mb-4">
                <Avatar className="h-6 w-6">
                  <AvatarImage src={author.avatar_url || undefined} />
                  <AvatarFallback className="text-[10px]">{initials}</AvatarFallback>
                </Avatar>
                <span className="text-sm font-medium">{author.full_name || 'Unknown'}</span>
                {courseId && <InstructorBadge courseId={courseId} userId={author.id} />}
                <span className="text-xs text-muted-foreground">{formatRelativeTime(thread.created_at)}</span>
              </div>
              <div
                className="text-sm prose prose-sm max-w-none"
                dangerouslySetInnerHTML={{ __html: sanitizeHtml(thread.body) }}
              />
              {(isInstructor || isThreadAuthor) && (
                <div className="mt-4 flex justify-end">
                  <ModerationMenu
                    isPinned={thread.is_pinned}
                    isLocked={thread.is_locked}
                    onPin={() => { handleModerate(thread.is_pinned ? 'unpin' : 'pin') }}
                    onLock={() => { handleModerate(thread.is_locked ? 'unlock' : 'lock') }}
                    onMarkOffTopic={() => { handleModerate('mark_off_topic') }}
                    onDelete={() => { handleModerate('delete') }}
                  />
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-1">
        {repliesLoading ? (
          <div className="space-y-4">
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-24 w-full" />
          </div>
        ) : topLevelReplies.length === 0 ? (
          <p className="text-center text-muted-foreground py-8">No replies yet. Be the first to respond!</p>
        ) : (
          topLevelReplies.map(reply => (
            <div key={reply.id}>
              <ReplyItem
                reply={reply}
                threadId={thread.id}
                courseId={courseId || ''}
                isThreadAuthor={isThreadAuthor}
                isInstructor={isInstructor}
                onAcceptAnswer={handleAcceptAnswer}
                onDeleteReply={handleDeleteReply}
              />
              {courseId && <div className="ml-12 border-l-2 border-muted pl-4">
                {nestedReplies.filter(r => r.parent_reply_id === reply.id).map(nested => (
                  <ReplyItem
                    key={nested.id}
                    reply={nested}
                    threadId={thread.id}
                    courseId={courseId}
                    isThreadAuthor={isThreadAuthor}
                    isInstructor={isInstructor}
                    onAcceptAnswer={handleAcceptAnswer}
                    onDeleteReply={handleDeleteReply}
                  />
                ))}
              </div>}
            </div>
          ))
        )}
      </div>

      {thread.is_locked ? (
        <Card className="mt-6 bg-muted/30">
          <CardContent className="p-4 text-center text-sm text-muted-foreground flex items-center justify-center gap-2">
            <Lock className="h-4 w-4" /> This thread is locked. No new replies can be added.
          </CardContent>
        </Card>
      ) : (
        <div className="mt-6">
          <ReplyComposer threadId={thread.id} />
        </div>
      )}
    </div>
  )
}
