import { X } from 'lucide-react'
import type { CourseFilters } from '@/lib/types'

interface ActiveFiltersProps {
  filters:        CourseFilters
  onFilterChange: (updates: Partial<CourseFilters>) => void
  onClear:        () => void
}

interface FilterTag {
  key: string
  label: string
  onRemove: () => void
}

export function ActiveFilters({ filters, onFilterChange, onClear }: ActiveFiltersProps) {
  const tags: FilterTag[] = []

  if (filters.q) {
    tags.push({
      key: 'q',
      label: `"${filters.q}"`,
      onRemove: () => onFilterChange({ q: '' }),
    })
  }

  filters.category.forEach(cat => {
    tags.push({
      key: `cat-${cat}`,
      label: cat.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase()),
      onRemove: () => onFilterChange({ category: filters.category.filter(c => c !== cat) }),
    })
  })

  filters.level.forEach(lvl => {
    tags.push({
      key: `lvl-${lvl}`,
      label: lvl.charAt(0).toUpperCase() + lvl.slice(1),
      onRemove: () => onFilterChange({ level: filters.level.filter(l => l !== lvl) }),
    })
  })

  if (filters.pricing !== 'all') {
    const labels: Record<string, string> = {
      free: 'Free', paid: 'Paid', under500: 'Under ₹500',
      '500to2000': '₹500–₹2,000', above2000: '₹2,000+',
    }
    tags.push({
      key: 'pricing',
      label: labels[filters.pricing] || filters.pricing,
      onRemove: () => onFilterChange({ pricing: 'all' }),
    })
  }

  if (filters.rating !== null) {
    tags.push({
      key: 'rating',
      label: `⭐ ${filters.rating}+`,
      onRemove: () => onFilterChange({ rating: null }),
    })
  }

  filters.duration.forEach(dur => {
    const labels: Record<string, string> = {
      under2h: 'Under 2h', '2to5h': '2–5h', '5to10h': '5–10h', above10h: '10h+',
    }
    tags.push({
      key: `dur-${dur}`,
      label: labels[dur] || dur,
      onRemove: () => onFilterChange({ duration: filters.duration.filter(d => d !== dur) }),
    })
  })

  filters.language.forEach(lang => {
    tags.push({
      key: `lang-${lang}`,
      label: lang,
      onRemove: () => onFilterChange({ language: filters.language.filter(l => l !== lang) }),
    })
  })

  if (tags.length === 0) return null

  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="text-sm font-medium text-muted-foreground">Active filters:</span>
      {tags.map(tag => (
        <button
          key={tag.key}
          onClick={tag.onRemove}
          className="group inline-flex items-center gap-1 rounded-full bg-primary/10 px-3 py-1 text-sm font-medium text-primary transition-colors hover:bg-primary/20"
        >
          {tag.label}
          <X className="h-3 w-3 opacity-60 group-hover:opacity-100" />
        </button>
      ))}
      <button
        onClick={onClear}
        className="text-sm font-medium text-muted-foreground hover:text-destructive transition-colors"
      >
        Clear all
      </button>
    </div>
  )
}