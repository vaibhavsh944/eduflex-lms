import type { RatingBreakdown as RatingBreakdownType } from '@/lib/types'

interface RatingBreakdownProps {
  rating:    number
  breakdown: RatingBreakdownType
}

export function RatingBreakdown({ rating, breakdown }: RatingBreakdownProps) {
  const { percentages } = breakdown

  return (
    <div className="flex flex-col md:flex-row gap-8 items-center bg-card rounded-xl border border-border p-6">
      {/* Big Rating */}
      <div className="flex flex-col items-center justify-center text-center">
        <div className="text-5xl font-bold text-foreground mb-2">{rating.toFixed(1)}</div>
        <div className="flex text-amber-500 mb-2">
          {'★★★★★'}
        </div>
        <div className="text-sm font-medium text-primary">Course Rating</div>
      </div>

      {/* Bars */}
      <div className="flex-1 w-full space-y-3">
        {[5, 4, 3, 2, 1].map((star) => {
          const pct = percentages[star as 1|2|3|4|5] || 0
          return (
            <div key={star} className="flex items-center gap-3">
              <div className="w-16 flex items-center gap-1 text-sm font-medium text-muted-foreground">
                <span>{star}</span>
                <span className="text-amber-500">★</span>
              </div>
              <div className="h-2 flex-1 rounded-full bg-secondary overflow-hidden">
                <div 
                  className="h-full bg-primary transition-all duration-500" 
                  style={{ width: `${pct}%` }}
                />
              </div>
              <div className="w-10 text-right text-xs text-muted-foreground">
                {pct}%
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}