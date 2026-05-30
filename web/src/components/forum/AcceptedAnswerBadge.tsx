import { CheckCircle } from 'lucide-react'

export function AcceptedAnswerBadge() {
  return (
    <span className="inline-flex items-center gap-1 text-xs font-medium bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 px-2 py-0.5 rounded-full">
      <CheckCircle className="h-3 w-3" />
      Accepted Answer
    </span>
  )
}
