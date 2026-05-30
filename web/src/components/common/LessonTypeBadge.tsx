import React from 'react'
import { Play, FileText, File, HelpCircle, PenLine } from 'lucide-react'
import { cn } from '@/lib/utils'

interface LessonTypeBadgeProps {
  type: 'video' | 'text' | 'pdf' | 'quiz' | 'assignment'
  variant?: 'icon-only' | 'pill'
  className?: string
}

export function LessonTypeBadge({ type, variant = 'icon-only', className }: LessonTypeBadgeProps) {
  const getIcon = () => {
    switch (type) {
      case 'video': return <Play className="w-3.5 h-3.5" />
      case 'text': return <FileText className="w-3.5 h-3.5" />
      case 'pdf': return <File className="w-3.5 h-3.5" />
      case 'quiz': return <HelpCircle className="w-3.5 h-3.5" />
      case 'assignment': return <PenLine className="w-3.5 h-3.5" />
      default: return <FileText className="w-3.5 h-3.5" />
    }
  }

  const getColorClass = () => {
    switch (type) {
      case 'video': return 'text-blue-500 bg-blue-500/10'
      case 'text': return 'text-slate-500 bg-slate-500/10 dark:text-slate-400 dark:bg-slate-400/10'
      case 'pdf': return 'text-red-500 bg-red-500/10'
      case 'quiz': return 'text-purple-500 bg-purple-500/10'
      case 'assignment': return 'text-orange-500 bg-orange-500/10'
      default: return 'text-slate-500 bg-slate-500/10'
    }
  }

  const getLabel = () => {
    switch (type) {
      case 'video': return 'Video'
      case 'text': return 'Text'
      case 'pdf': return 'PDF'
      case 'quiz': return 'Quiz'
      case 'assignment': return 'Assignment'
      default: return 'Lesson'
    }
  }

  if (variant === 'icon-only') {
    return (
      <div className={cn('flex items-center justify-center w-6 h-6 rounded-md', getColorClass(), className)}>
        {getIcon()}
      </div>
    )
  }

  return (
    <div className={cn('flex items-center space-x-1.5 px-2.5 py-1 text-xs font-medium rounded-full', getColorClass(), className)}>
      {getIcon()}
      <span>{getLabel()}</span>
    </div>
  )
}
