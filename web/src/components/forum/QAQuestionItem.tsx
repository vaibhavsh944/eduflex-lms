import { useState } from 'react'
import type { LessonQA } from '@/lib/types'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { InstructorBadge } from './InstructorBadge'
import { Button } from '@/components/ui/button'
import { ChevronDown, ChevronUp, MessageSquare, ThumbsUp } from 'lucide-react'
import { formatRelativeTime } from '@/lib/utils'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/store/authStore'
import { useQueryClient } from '@tanstack/react-query'

interface QAQuestionItemProps {
  question: LessonQA
  lessonId: string
  courseId: string
}

export function QAQuestionItem({ question, lessonId, courseId }: QAQuestionItemProps) {
  const [expanded, setExpanded] = useState(false)
  const [replyText, setReplyText] = useState('')
  const user = useAuthStore(state => state.user)
  const queryClient = useQueryClient()

  const handleUpvote = async () => {
    if (!user) return
    try {
      await supabase.from('lesson_qa').update({ upvotes: (question.upvote_count || 0) + 1 }).eq('id', question.id)
      queryClient.invalidateQueries({ queryKey: ['forum', 'qa', lessonId] })
    } catch { /* table may not exist */ }
  }

  const handleSubmitReply = async () => {
    if (!replyText.trim() || !user) return
    const { error } = await supabase.from('lesson_qa_replies').insert({
      question_id: question.id,
      user_id: user.id,
      body: replyText.trim(),
    })
    if (!error) {
      setReplyText('')
      queryClient.invalidateQueries({ queryKey: ['forum', 'qa', lessonId] })
    }
  }

  const author = question.author
  const initials = author?.full_name?.substring(0, 2).toUpperCase() || '??'

  return (
    <div className="border rounded-lg">
      <button
        className="w-full flex items-start gap-3 p-4 text-left hover:bg-muted/30 transition-colors"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-center gap-1 shrink-0 pt-1">
          <button
            onClick={(e) => { e.stopPropagation(); handleUpvote() }}
            className="flex flex-col items-center gap-0.5 text-muted-foreground hover:text-primary"
          >
            <ThumbsUp className="h-4 w-4" />
            <span className="text-xs font-mono font-bold">{question.upvote_count}</span>
          </button>
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <Avatar className="h-6 w-6">
              <AvatarImage src={author?.avatar_url || undefined} />
              <AvatarFallback className="text-[10px]">{initials}</AvatarFallback>
            </Avatar>
            <span className="text-sm font-medium">{author?.full_name || 'Unknown'}</span>
            {author?.id && <InstructorBadge courseId={courseId} userId={author.id} />}
            <span className="text-xs text-muted-foreground">{formatRelativeTime(question.created_at)}</span>
          </div>
          <p className="text-sm">{question.body}</p>
          <div className="flex items-center gap-1 mt-2 text-xs text-muted-foreground">
            <MessageSquare className="h-3 w-3" />
            {question.replies?.length || 0} {(question.replies?.length || 0) === 1 ? 'answer' : 'answers'}
          </div>
        </div>
        <div className="shrink-0 pt-1">
          {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </div>
      </button>

      {expanded && (
        <div className="border-t px-4 py-3 space-y-3">
          {question.replies?.map(reply => (
            <div key={reply.id} className="flex gap-3 pl-4 border-l-2 border-muted">
              <Avatar className="h-6 w-6">
                <AvatarImage src={reply.author?.avatar_url || undefined} />
                <AvatarFallback className="text-[10px]">{(reply.author?.full_name || '??').substring(0, 2).toUpperCase()}</AvatarFallback>
              </Avatar>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-medium">{reply.author?.full_name}</span>
                  {reply.author?.id && <InstructorBadge courseId={courseId} userId={reply.author.id} />}
                  <span className="text-xs text-muted-foreground">{formatRelativeTime(reply.created_at)}</span>
                </div>
                <p className="text-sm mt-1">{reply.body}</p>
              </div>
            </div>
          ))}
          <div className="flex gap-2">
            <textarea
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              placeholder="Write an answer..."
              className="flex-1 text-sm rounded-lg border border-input bg-transparent px-3 py-2 resize-none min-h-[60px]"
            />
            <Button size="sm" className="self-end" onClick={handleSubmitReply} disabled={!replyText.trim()}>Post</Button>
          </div>
        </div>
      )}
    </div>
  )
}
