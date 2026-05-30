import { Star } from 'lucide-react'

interface StarRatingProps {
  rating:      number
  count?:      number
  interactive?: boolean
  onChange?:   (rating: number) => void
  size?:       'sm' | 'md' | 'lg'
}

const sizes = {
  sm: { star: 'h-3 w-3', text: 'text-xs' },
  md: { star: 'h-4 w-4', text: 'text-sm' },
  lg: { star: 'h-5 w-5', text: 'text-base' },
}

export function StarRating({ rating, count, interactive = false, onChange, size = 'md' }: StarRatingProps) {
  const s = sizes[size]

  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((star) => {
        const filled = star <= Math.floor(rating)
        const half = !filled && star === Math.ceil(rating) && rating % 1 >= 0.25

        return (
          <button
            key={star}
            type="button"
            disabled={!interactive}
            onClick={() => interactive && onChange?.(star)}
            className={interactive ? 'cursor-pointer' : 'cursor-default'}
          >
            <Star
              className={`${s.star} ${
                filled
                  ? 'fill-amber-500 text-amber-500'
                  : half
                  ? 'fill-amber-500/50 text-amber-500'
                  : 'fill-muted text-muted-foreground/30'
              } transition-colors`}
            />
          </button>
        )
      })}
      <span className={`ml-1 font-medium ${s.text}`}>{rating.toFixed(1)}</span>
      {count !== undefined && (
        <span className={`text-muted-foreground ${s.text}`}>
          ({count.toLocaleString()} {count === 1 ? 'rating' : 'ratings'})
        </span>
      )}
    </div>
  )
}