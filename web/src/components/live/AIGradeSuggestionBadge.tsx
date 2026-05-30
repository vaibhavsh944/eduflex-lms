import { Badge } from '@/components/ui/badge'

interface AIGradeSuggestionBadgeProps {
  label?: string
}

export function AIGradeSuggestionBadge({ label = 'AI-suggested' }: AIGradeSuggestionBadgeProps) {
  return (
    <Badge
      variant="secondary"
      className="text-[10px] leading-none px-1.5 py-0.5 font-normal"
    >
      {label}
    </Badge>
  )
}
