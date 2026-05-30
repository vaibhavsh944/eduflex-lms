import { Badge } from '@/components/ui/badge';
import { formatCurrency } from '@/lib/utils';

interface PriceBadgeProps {
  price: number;
  originalPrice?: number | null;
  pricingType?: string;
}

export function PriceBadge({ price, originalPrice, pricingType = 'paid' }: PriceBadgeProps) {
  if (pricingType === 'free' || price === 0) {
    return (
      <Badge variant="secondary" className="bg-green-100 text-green-700 hover:bg-green-100">
        Free
      </Badge>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <span className="text-lg font-bold text-primary">
        {formatCurrency(price)}
      </span>
      {originalPrice && originalPrice > price && (
        <span className="text-sm text-muted-foreground line-through">
          {formatCurrency(originalPrice)}
        </span>
      )}
    </div>
  );
}