import type { ActivityEvent } from '@/lib/types'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { getInitials, formatRelativeTime } from '@/lib/utils'
import { Award, CheckCircle, Zap, UserPlus, Users, BookOpen, MessageSquare } from 'lucide-react'

interface Props {
  event: ActivityEvent
}

const eventConfig: Record<string, { icon: React.ReactNode; label: string }> = {
  lesson_completed: { icon: <CheckCircle className="h-4 w-4 text-green-500" />, label: 'completed' },
  badge_earned: { icon: <Award className="h-4 w-4 text-yellow-500" />, label: 'earned' },
  quiz_aced: { icon: <Zap className="h-4 w-4 text-purple-500" />, label: 'aced' },
  course_enrolled: { icon: <BookOpen className="h-4 w-4 text-blue-500" />, label: 'enrolled in' },
  study_group_joined: { icon: <Users className="h-4 w-4 text-indigo-500" />, label: 'joined' },
  peer_review_completed: { icon: <MessageSquare className="h-4 w-4 text-orange-500" />, label: 'completed a peer review' },
}

export function ActivityFeedItem({ event }: Props) {
  const cfg = eventConfig[event.event_type] ?? { icon: <CheckCircle className="h-4 w-4" />, label: event.event_type.replace(/_/g, ' ') }
  const name = event.profile?.full_name ?? 'Someone'
  const payload = event.payload ?? {}

  const getMessage = () => {
    switch (event.event_type) {
      case 'lesson_completed':
        return `${name} completed ${payload.lesson_title ?? 'a lesson'}`
      case 'badge_earned':
        return `${name} earned ${payload.badge_name ?? 'a badge'}`
      case 'quiz_aced':
        return `${name} scored 100% on ${payload.quiz_name ?? 'a quiz'}`
      case 'course_enrolled':
        return `${name} enrolled in ${payload.course_name ?? 'a course'}`
      case 'study_group_joined':
        return `${name} joined ${payload.group_name ?? 'a study group'}`
      case 'peer_review_completed':
        return `${name} completed a peer review`
      default:
        return `${name} ${cfg.label}`
    }
  }

  return (
    <div className="flex items-start gap-3 py-3">
      <div className="relative">
        <Avatar className="h-9 w-9">
          <AvatarImage src={event.profile?.avatar_url ?? undefined} />
          <AvatarFallback className="text-xs">{getInitials(event.profile?.full_name ?? '?')}</AvatarFallback>
        </Avatar>
        <div className="absolute -bottom-0.5 -right-0.5 h-4 w-4 rounded-full bg-background flex items-center justify-center">
          {cfg.icon}
        </div>
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm">
          {getMessage()}
        </p>
        <p className="text-xs text-muted-foreground mt-0.5">{formatRelativeTime(event.created_at)}</p>
      </div>
    </div>
  )
}
