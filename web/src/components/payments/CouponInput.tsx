import { useState } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Tag, CheckCircle, XCircle } from 'lucide-react'

interface CouponInputProps {
  onApply: (code: string) => Promise<void>
  onRemove: () => void
  appliedCode: string | null
  discount?: { type: 'percent' | 'flat'; value: number } | null
}

export function CouponInput({ onApply, onRemove, appliedCode, discount }: CouponInputProps) {
  const [code, setCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleApply = async () => {
    if (!code.trim()) return
    setLoading(true)
    setError(null)
    try {
      await onApply(code.trim())
    } catch (err: any) {
      setError(err.message || 'Invalid coupon code')
    } finally {
      setLoading(false)
    }
  }

  if (appliedCode && discount) {
    return (
      <div className="flex items-center gap-2 p-2 bg-green-50 dark:bg-green-950/30 rounded-lg text-sm">
        <CheckCircle className="h-4 w-4 text-green-600 shrink-0" />
        <span className="flex-1">
          Coupon <strong>{appliedCode}</strong> applied
          {discount.type === 'percent' ? ` (${discount.value}% off)` : ` (₹${discount.value} off)`}
        </span>
        <Button variant="ghost" size="sm" onClick={onRemove}>Remove</Button>
      </div>
    )
  }

  return (
    <div className="space-y-2">
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Tag className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            placeholder="Enter coupon code"
            className="pl-9"
            onKeyDown={(e) => e.key === 'Enter' && handleApply()}
          />
        </div>
        <Button variant="outline" onClick={handleApply} disabled={loading || !code.trim()}>
          {loading ? 'Applying...' : 'Apply'}
        </Button>
      </div>
      {error && (
        <p className="flex items-center gap-1 text-sm text-red-600">
          <XCircle className="h-4 w-4" /> {error}
        </p>
      )}
    </div>
  )
}
