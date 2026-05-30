import { useEffect } from 'react'
import { Dialog, DialogContent } from '@/components/ui/dialog'
import { Badge } from '@/lib/types'
import { useGamificationStore } from '@/store/gamificationStore'
import confetti from 'canvas-confetti'

export function BadgeCelebrationModal() {
  const { recentBadges, showBadgeCelebration, clearRecentBadges, setShowBadgeCelebration } = useGamificationStore()

  useEffect(() => {
    if (showBadgeCelebration && recentBadges.length > 0) {
      confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } })
    }
  }, [showBadgeCelebration, recentBadges.length])

  const handleClose = () => {
    setShowBadgeCelebration(false)
    setTimeout(clearRecentBadges, 300)
  }

  if (recentBadges.length === 0) return null

  return (
    <Dialog open={showBadgeCelebration} onOpenChange={(open) => { if (!open) handleClose() }}>
      <DialogContent className="max-w-sm text-center py-12">
        {recentBadges.map((badge) => (
          <div key={badge.id} className="space-y-4">
            <div className="text-6xl flex justify-center">
              {badge.icon_emoji || '🎉'}
            </div>
            <h2 className="text-2xl font-bold">New Badge Earned!</h2>
            <p className="text-xl font-semibold text-primary">{badge.name}</p>
            <p className="text-muted-foreground">{badge.description}</p>
            {badge.points_value && (
              <p className="text-sm font-medium text-green-600">+{badge.points_value} points</p>
            )}
          </div>
        ))}
      </DialogContent>
    </Dialog>
  )
}
