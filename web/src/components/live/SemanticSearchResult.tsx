import { Badge } from '@/components/ui/badge'

interface SemanticSearchResultData {
  id: string
  title: string
  course_name: string
  similarity: number
}

interface SemanticSearchResultProps {
  result: SemanticSearchResultData
}

export function SemanticSearchResult({ result }: SemanticSearchResultProps) {
  const pct = Math.round(result.similarity * 100)

  return (
    <div className="flex items-center justify-between gap-3 rounded-lg border border-border bg-card px-4 py-3">
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate">{result.title}</p>
        <p className="text-xs text-muted-foreground truncate">{result.course_name}</p>
      </div>
      <div className="flex items-center gap-2 flex-shrink-0">
        <Badge variant="secondary" className="text-xs">
          {pct}% match
        </Badge>
        <Badge variant="outline" className="text-[10px] font-normal">
          🧠 Semantic match
        </Badge>
      </div>
    </div>
  )
}
