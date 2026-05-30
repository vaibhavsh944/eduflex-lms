import React from 'react'
import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { toast } from 'sonner'
import { Gift, Users, Copy, Share2, IndianRupee } from 'lucide-react'

export function ReferralCard() {
  const { data: profile } = useQuery({
    queryKey: ['my-profile'],
    queryFn: async () => {
      const { data } = await supabase.from('profiles').select('referral_code').single()
      return data
    }
  })

  const referralLink = profile?.referral_code
    ? `${window.location.origin}/signup?ref=${profile.referral_code}`
    : ''

  const copyToClipboard = () => {
    if (referralLink) {
      navigator.clipboard.writeText(referralLink)
      toast.success('Referral link copied!')
    }
  }

  const shareLink = () => {
    if (referralLink) {
      window.open(`https://wa.me/?text=${encodeURIComponent(`Join me on EduFlow! ${referralLink}`)}`, '_blank')
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Gift className="w-5 h-5 text-primary" />
          <div>
            <CardTitle className="text-lg">Refer a Friend</CardTitle>
            <CardDescription>Share your referral link and earn ₹100 for each friend's first paid course</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex gap-2">
          <Input value={referralLink} readOnly className="font-mono text-xs" />
          <Button size="sm" variant="outline" onClick={copyToClipboard}><Copy className="w-4 h-4" /></Button>
          <Button size="sm" onClick={shareLink}><Share2 className="w-4 h-4" /></Button>
        </div>
      </CardContent>
    </Card>
  )
}

export function ReferralStats({ count, rewards }: { count: number; rewards: number }) {
  return (
    <div className="grid grid-cols-2 gap-4">
      <Card>
        <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">Successful Referrals</CardTitle></CardHeader>
        <CardContent><p className="text-2xl font-bold flex items-center gap-2"><Users className="w-5 h-5 text-primary" />{count}</p></CardContent>
      </Card>
      <Card>
        <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">Total Rewards Earned</CardTitle></CardHeader>
        <CardContent><p className="text-2xl font-bold flex items-center gap-2"><IndianRupee className="w-5 h-5 text-green-600" />{rewards.toFixed(2)}</p></CardContent>
      </Card>
    </div>
  )
}
