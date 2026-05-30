import { X } from 'lucide-react'
import type { CourseFilters } from '@/lib/types'
import { FilterPanel } from './FilterPanel'

interface FilterDrawerProps {
  isOpen:         boolean
  onClose:        () => void
  filters:        CourseFilters
  onFilterChange: (updates: Partial<CourseFilters>) => void
  onClear:        () => void
  activeCount:    number
}

export function FilterDrawer({ isOpen, onClose, filters, onFilterChange, onClear, activeCount }: FilterDrawerProps) {
  if (!isOpen) return null

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      {/* Drawer */}
      <div className="fixed inset-y-0 left-0 z-50 w-80 max-w-[85vw] bg-background shadow-xl overflow-y-auto animate-in slide-in-from-left duration-300">
        <div className="sticky top-0 z-10 flex items-center justify-between border-b bg-background p-4">
          <h2 className="text-lg font-semibold">
            Filters {activeCount > 0 && <span className="text-primary">({activeCount})</span>}
          </h2>
          <button onClick={onClose} className="rounded-lg p-1.5 hover:bg-muted transition-colors">
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="p-4">
          <FilterPanel filters={filters} onFilterChange={onFilterChange} onClear={onClear} />
        </div>
      </div>
    </>
  )
}