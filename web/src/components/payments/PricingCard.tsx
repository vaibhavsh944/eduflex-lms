import { CheckCircle2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export type PricingTier = 'free' | 'pro' | 'enterprise'

interface PricingCardProps {
  tier: PricingTier
  name: string
  price: string
  period?: string
  description: string
  features: string[]
  highlighted?: boolean
  ctaLabel: string
  onCtaClick: () => void
  className?: string
}

const iconMap: Record<PricingTier, React.ReactNode> = {
  free: <CheckCircle2 className="h-5 w-5 text-emerald-500 shrink-0" />,
  pro: <CheckCircle2 className="h-5 w-5 text-primary shrink-0" />,
  enterprise: <CheckCircle2 className="h-5 w-5 text-emerald-500 shrink-0" />,
}

export function PricingCard({
  tier,
  name,
  price,
  period,
  description,
  features,
  highlighted,
  ctaLabel,
  onCtaClick,
  className,
}: PricingCardProps) {
  return (
    <div
      className={cn(
        'bg-card rounded-2xl p-8 border flex flex-col relative',
        highlighted
          ? 'border-2 border-primary shadow-xl transform lg:-translate-y-4'
          : 'border-border shadow-sm',
        className,
      )}
    >
      {highlighted && (
        <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-primary text-primary-foreground text-xs font-bold px-4 py-1 rounded-full uppercase tracking-wider">
          Most Popular
        </div>
      )}
      <div className="mb-8 mt-2">
        <h3 className="text-xl font-bold mb-1">{name}</h3>
        <p className="text-sm text-muted-foreground mb-4">{description}</p>
        <div className="flex items-baseline gap-1">
          <span className="text-4xl font-bold">{price}</span>
          {period && <span className="text-muted-foreground">/{period}</span>}
        </div>
      </div>
      <ul className="space-y-4 mb-8 flex-1">
        {features.map((feature, i) => (
          <li key={i} className="flex items-center gap-3">
            {iconMap[tier]}
            <span className="text-sm">{feature}</span>
          </li>
        ))}
      </ul>
      <Button
        variant={highlighted ? 'default' : 'outline'}
        className="w-full"
        size="lg"
        onClick={onCtaClick}
      >
        {ctaLabel}
      </Button>
    </div>
  )
}
