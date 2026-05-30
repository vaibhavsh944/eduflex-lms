import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { ChevronUp, ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useForumVote } from '@/hooks/queries/useForum'

interface VoteButtonProps {
  targetId: string
  targetType: 'thread' | 'reply'
  upvoteCount: number
  currentVote?: 1 | -1 | null
  size?: 'sm' | 'md'
  showDownvote?: boolean
}

export function VoteButton({ targetId, targetType, upvoteCount, currentVote, size = 'md', showDownvote = false }: VoteButtonProps) {
  const { mutateAsync: vote } = useForumVote()
  const [optimisticCount, setOptimisticCount] = useState(upvoteCount)
  const [optimisticVote, setOptimisticVote] = useState(currentVote || null)

  const handleVote = async (value: 1 | -1) => {
    const prevVote = optimisticVote
    const prevCount = optimisticCount

    if (prevVote === value) {
      setOptimisticVote(null)
      setOptimisticCount(prevCount - value)
    } else {
      setOptimisticVote(value)
      setOptimisticCount(prevCount + (prevVote ? value * 2 : value))
    }

    try {
      await vote({ targetId, targetType, value })
    } catch {
      setOptimisticVote(prevVote)
      setOptimisticCount(prevCount)
    }
  }

  const btnSize = size === 'sm' ? 'h-7 w-7' : 'h-8 w-8'

  return (
    <div className="flex items-center gap-1">
      <Button
        variant="ghost"
        size="icon"
        className={cn(btnSize, optimisticVote === 1 && 'text-primary bg-primary/10')}
        onClick={() => handleVote(1)}
      >
        <ChevronUp className={size === 'sm' ? 'h-3.5 w-3.5' : 'h-4 w-4'} />
      </Button>
      <span className={cn('font-mono text-xs font-bold min-w-[1.5rem] text-center', optimisticCount > 0 && 'text-primary')}>
        {optimisticCount}
      </span>
      {showDownvote && (
        <Button
          variant="ghost"
          size="icon"
          className={cn(btnSize, optimisticVote === -1 && 'text-red-500 bg-red-50')}
          onClick={() => handleVote(-1)}
        >
          <ChevronDown className={size === 'sm' ? 'h-3.5 w-3.5' : 'h-4 w-4'} />
        </Button>
      )}
    </div>
  )
}
