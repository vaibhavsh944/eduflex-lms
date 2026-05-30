import React from 'react'
import { useQuery } from '@tanstack/react-query'
import { useAuthStore } from '@/store/authStore'
import { supabase } from '@/lib/supabase'
import { PageHeader } from '@/components/common/PageHeader'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table'
import { SkeletonPage } from '@/components/common/SkeletonPage'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { DollarSign, TrendingUp, Wallet, Clock } from 'lucide-react'

export function InstructorRevenuePage() {
  const user = useAuthStore((s) => s.user)

  const { data: earnings, isLoading } = useQuery({
    queryKey: ['instructor-earnings', user?.id],
    queryFn: async () => {
      if (!user) return []
      const { data } = await supabase
        .from('instructor_earnings')
        .select('*, course:course_id(title)')
        .eq('instructor_id', user.id)
        .order('created_at', { ascending: false })
      return data ?? []
    },
    enabled: !!user
  })

  if (isLoading) return <SkeletonPage />

  const totalEarned = (earnings || []).reduce((s, e) => s + Number(e.instructor_amount), 0)
  const pendingPayout = (earnings || []).filter(e => e.payout_status === 'pending').reduce((s, e) => s + Number(e.instructor_amount), 0)
  const paidOut = (earnings || []).filter(e => e.payout_status === 'paid').reduce((s, e) => s + Number(e.instructor_amount), 0)

  // Build monthly chart data
  const monthlyMap: Record<string, { month: string; gross: number; instructor: number }> = {}
  for (const e of earnings || []) {
    const key = new Date(e.created_at).toLocaleString('default', { month: 'short', year: '2-digit' })
    if (!monthlyMap[key]) monthlyMap[key] = { month: key, gross: 0, instructor: 0 }
    monthlyMap[key].gross += Number(e.gross_amount)
    monthlyMap[key].instructor += Number(e.instructor_amount)
  }
  const chartData = Object.values(monthlyMap).reverse()

  return (
    <div className="space-y-6">
      <PageHeader title="My Revenue" description="Track your earnings and payouts" />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2 flex flex-row items-center justify-between">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Earned</CardTitle>
            <DollarSign className="w-4 h-4 text-green-600" />
          </CardHeader>
          <CardContent><p className="text-2xl font-bold">₹{totalEarned.toLocaleString()}</p></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2 flex flex-row items-center justify-between">
            <CardTitle className="text-sm font-medium text-muted-foreground">Pending Payout</CardTitle>
            <Clock className="w-4 h-4 text-amber-600" />
          </CardHeader>
          <CardContent><p className="text-2xl font-bold text-amber-600">₹{pendingPayout.toLocaleString()}</p></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2 flex flex-row items-center justify-between">
            <CardTitle className="text-sm font-medium text-muted-foreground">Paid Out</CardTitle>
            <Wallet className="w-4 h-4 text-blue-600" />
          </CardHeader>
          <CardContent><p className="text-2xl font-bold text-blue-600">₹{paidOut.toLocaleString()}</p></CardContent>
        </Card>
      </div>

      {chartData.length > 0 && (
        <Card>
          <CardHeader><CardTitle className="text-lg flex items-center gap-2"><TrendingUp className="w-5 h-5" /> Monthly Earnings</CardTitle></CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" fontSize={12} />
                  <YAxis fontSize={12} />
                  <Tooltip formatter={(value: any) => [`₹${Number(value).toLocaleString()}`, undefined]} />
                  <Bar dataKey="gross" fill="#94a3b8" name="Gross" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="instructor" fill="#22c55e" name="Your Share" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Earnings History</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Course</TableHead>
                <TableHead>Gross</TableHead>
                <TableHead>Your Share</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {(earnings || []).map((e) => (
                <TableRow key={e.id}>
                  <TableCell>{(e.course as any)?.title || 'N/A'}</TableCell>
                  <TableCell>₹{Number(e.gross_amount).toLocaleString()}</TableCell>
                  <TableCell className="font-medium text-green-600">₹{Number(e.instructor_amount).toLocaleString()}</TableCell>
                  <TableCell>
                    <Badge variant={e.payout_status === 'paid' ? 'default' : 'secondary'}>{e.payout_status}</Badge>
                  </TableCell>
                  <TableCell className="text-xs">{new Date(e.created_at).toLocaleDateString()}</TableCell>
                </TableRow>
              ))}
              {(earnings || []).length === 0 && (
                <TableRow><TableCell colSpan={5} className="text-center py-8 text-muted-foreground">No earnings yet</TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
