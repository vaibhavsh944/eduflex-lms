interface SemanticSearchToggleProps {
  value: 'keyword' | 'semantic'
  onChange: (value: 'keyword' | 'semantic') => void
}

export function SemanticSearchToggle({ value, onChange }: SemanticSearchToggleProps) {
  return (
    <div className="inline-flex items-center gap-1 rounded-full bg-muted p-0.5">
      <button
        type="button"
        onClick={() => onChange('keyword')}
        className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-medium transition-colors ${
          value === 'keyword'
            ? 'bg-background text-foreground shadow-sm'
            : 'text-muted-foreground hover:text-foreground'
        }`}
      >
        🔍 Keyword
      </button>
      <button
        type="button"
        onClick={() => onChange('semantic')}
        className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-medium transition-colors ${
          value === 'semantic'
            ? 'bg-background text-foreground shadow-sm'
            : 'text-muted-foreground hover:text-foreground'
        }`}
      >
        🧠 Semantic
      </button>
    </div>
  )
}
