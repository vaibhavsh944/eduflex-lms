import { ChevronDown } from 'lucide-react'
import { useState } from 'react'
import type { CourseFilters, CourseCategory, CourseLevel, PricingFilter, DurationFilter } from '@/lib/types'

interface FilterPanelProps {
  filters:        CourseFilters
  onFilterChange: (updates: Partial<CourseFilters>) => void
  onClear:        () => void
}

const categories: { value: CourseCategory; label: string; count: number }[] = [
  { value: 'programming',    label: 'Programming',   count: 48 },
  { value: 'design',         label: 'Design',        count: 32 },
  { value: 'business',       label: 'Business',      count: 27 },
  { value: 'marketing',      label: 'Marketing',     count: 19 },
  { value: 'data-science',   label: 'Data Science',  count: 24 },
  { value: 'other',          label: 'Other',         count: 12 },
]

const levels: { value: CourseLevel; label: string; count: number }[] = [
  { value: 'beginner',     label: 'Beginner',     count: 62 },
  { value: 'intermediate', label: 'Intermediate', count: 54 },
  { value: 'advanced',     label: 'Advanced',     count: 46 },
]

const pricingOptions: { value: PricingFilter; label: string }[] = [
  { value: 'all',       label: 'All prices' },
  { value: 'free',      label: 'Free' },
  { value: 'paid',      label: 'Paid' },
  { value: 'under500',  label: 'Under ₹500' },
  { value: '500to2000', label: '₹500 – ₹2,000' },
  { value: 'above2000', label: '₹2,000+' },
]

const ratingOptions: { value: number | null; label: string }[] = [
  { value: null, label: 'Any rating' },
  { value: 4.5,  label: '⭐ 4.5 & above' },
  { value: 4.0,  label: '⭐ 4.0 & above' },
  { value: 3.5,  label: '⭐ 3.5 & above' },
]

const durationOptions: { value: DurationFilter; label: string }[] = [
  { value: 'under2h',  label: 'Under 2 hours' },
  { value: '2to5h',    label: '2 – 5 hours' },
  { value: '5to10h',   label: '5 – 10 hours' },
  { value: 'above10h', label: '10+ hours' },
]

const languageOptions = ['English', 'Hindi', 'Kannada']

function FilterSection({ title, defaultOpen = true, children }: { title: string; defaultOpen?: boolean; children: React.ReactNode }) {
  const [open, setOpen] = useState(defaultOpen)
  return (
    <div className="border-t border-border pt-4 first:border-t-0 first:pt-0">
      <button
        onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between pb-2 text-sm font-semibold"
      >
        {title}
        <ChevronDown className={`h-4 w-4 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && <div className="space-y-2 pb-2">{children}</div>}
    </div>
  )
}

export function FilterPanel({ filters, onFilterChange, onClear }: FilterPanelProps) {
  const hasAnyFilter = filters.category.length > 0 || filters.level.length > 0 ||
    filters.pricing !== 'all' || filters.rating !== null ||
    filters.duration.length > 0 || filters.language.length > 0

  const toggleArrayFilter = <T extends string>(key: 'category' | 'level' | 'duration' | 'language', value: T) => {
    const current = filters[key] as T[]
    const next = current.includes(value)
      ? current.filter(v => v !== value)
      : [...current, value]
    onFilterChange({ [key]: next })
  }

  return (
    <div className="space-y-4">
      {hasAnyFilter && (
        <button
          onClick={onClear}
          className="text-sm font-medium text-primary hover:underline"
        >
          Clear All Filters
        </button>
      )}

      {/* Category */}
      <FilterSection title="Category">
        {categories.map(cat => (
          <label key={cat.value} className="flex items-center gap-2.5 cursor-pointer group">
            <input
              type="checkbox"
              checked={filters.category.includes(cat.value)}
              onChange={() => toggleArrayFilter('category', cat.value)}
              className="h-4 w-4 rounded border-border text-primary accent-primary"
            />
            <span className="flex-1 text-sm group-hover:text-foreground">{cat.label}</span>
            <span className="text-xs text-muted-foreground">({cat.count})</span>
          </label>
        ))}
      </FilterSection>

      {/* Level */}
      <FilterSection title="Level">
        {levels.map(lvl => (
          <label key={lvl.value} className="flex items-center gap-2.5 cursor-pointer group">
            <input
              type="checkbox"
              checked={filters.level.includes(lvl.value)}
              onChange={() => toggleArrayFilter('level', lvl.value)}
              className="h-4 w-4 rounded border-border text-primary accent-primary"
            />
            <span className="flex-1 text-sm group-hover:text-foreground">{lvl.label}</span>
            <span className="text-xs text-muted-foreground">({lvl.count})</span>
          </label>
        ))}
      </FilterSection>

      {/* Price */}
      <FilterSection title="Price">
        {pricingOptions.map(opt => (
          <label key={opt.value} className="flex items-center gap-2.5 cursor-pointer group">
            <input
              type="radio"
              name="pricing"
              checked={filters.pricing === opt.value}
              onChange={() => onFilterChange({ pricing: opt.value })}
              className="h-4 w-4 border-border text-primary accent-primary"
            />
            <span className="text-sm group-hover:text-foreground">{opt.label}</span>
          </label>
        ))}
      </FilterSection>

      {/* Rating */}
      <FilterSection title="Rating">
        {ratingOptions.map((opt, i) => (
          <label key={i} className="flex items-center gap-2.5 cursor-pointer group">
            <input
              type="radio"
              name="rating"
              checked={filters.rating === opt.value}
              onChange={() => onFilterChange({ rating: opt.value })}
              className="h-4 w-4 border-border text-primary accent-primary"
            />
            <span className="text-sm group-hover:text-foreground">{opt.label}</span>
          </label>
        ))}
      </FilterSection>

      {/* Duration */}
      <FilterSection title="Duration">
        {durationOptions.map(opt => (
          <label key={opt.value} className="flex items-center gap-2.5 cursor-pointer group">
            <input
              type="checkbox"
              checked={filters.duration.includes(opt.value)}
              onChange={() => toggleArrayFilter('duration', opt.value)}
              className="h-4 w-4 rounded border-border text-primary accent-primary"
            />
            <span className="text-sm group-hover:text-foreground">{opt.label}</span>
          </label>
        ))}
      </FilterSection>

      {/* Language */}
      <FilterSection title="Language">
        {languageOptions.map(lang => (
          <label key={lang} className="flex items-center gap-2.5 cursor-pointer group">
            <input
              type="checkbox"
              checked={filters.language.includes(lang)}
              onChange={() => toggleArrayFilter('language', lang)}
              className="h-4 w-4 rounded border-border text-primary accent-primary"
            />
            <span className="text-sm group-hover:text-foreground">{lang}</span>
          </label>
        ))}
      </FilterSection>
    </div>
  )
}