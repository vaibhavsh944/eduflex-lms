import React, { useState, useMemo } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { PageHeader } from '@/components/common/PageHeader'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, Legend, PieChart, Pie, Cell } from 'recharts'
import { toast } from 'sonner'
import { DollarSign, TrendingUp, Users, CreditCard } from 'lucide-react'

export function AdminRevenuePage() {
  const queryClient = useQueryClient()
  const [payoutInstructor, setPayoutInstructor] = useState('')
  const [revenueSplit, setRevenueSplit] = useState(30)

  const { data: earnings } = useQuery({
    queryKey: ['admin-earnings'],
    queryFn: async () => {
      const { data } = await supabase
        .from('instructor_earnings')
        .select('*, course:course_id(title)')
        .order('created_at', { ascending: false })
      return data ?? []
    }
  })

  const stats = {
    totalGross: (earnings || []).reduce((s, e) => s + Number(e.gross_amount), 0),
    totalPlatform: (earnings || []).reduce((s, e) => s + Number(e.platform_cut), 0),
    totalInstructor: (earnings || []).reduce((s, e) => s + Number(e.instructor_amount), 0),
    pendingPayouts: (earnings || []).filter(e => e.payout_status === 'pending').reduce((s, e) => s + Number(e.instructor_amount), 0),
  }

  const instructors = [...new Set((earnings || []).map(e => e.instructor_id))]

  const { data: savedSplit } = useQuery({
    queryKey: ['admin-revenue-split'],
    queryFn: async () => {
      const { data } = await supabase.from('admin_settings').select('value').eq('key', 'platform_fee').single();
      return Number(data?.value ?? 30);
    }
  })

  React.useEffect(() => {
    if (savedSplit !== undefined) setRevenueSplit(savedSplit);
  }, [savedSplit])

  const saveRevenueSplitMutation = useMutation({
    mutationFn: async (pct: number) => {
      const { error } = await supabase.from('admin_settings').upsert({ key: 'platform_fee', value: String(pct) }, { onConflict: 'key' })
      if (error) throw error
    },
    onSuccess: () => {
      toast.success('Revenue split updated')
      queryClient.invalidateQueries({ queryKey: ['admin-revenue-split'] })
    },
    onError: (err) => toast.error(err.message)
  })

  const markPaidMutation = useMutation({
    mutationFn: async (instructorId: string) => {
      const { error } = await supabase
        .from('instructor_earnings')
        .update({ payout_status: 'paid', paid_at: new Date().toISOString() })
        .eq('instructor_id', instructorId)
        .eq('payout_status', 'pending')
      if (error) throw error
    },
    onSuccess: () => {
      toast.success('Payouts marked as paid')
      queryClient.invalidateQueries({ queryKey: ['admin-earnings'] })
    },
    onError: (err) => toast.error(err.message)
  })

  return (
    <div className="space-y-6">
      <PageHeader title="Revenue" description="Platform-wide revenue overview, instructor payouts, and payout history" />

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">Total Gross</CardTitle></CardHeader>
          <CardContent><p className="text-2xl font-bold">₹{stats.totalGross.toLocaleString()}</p></CardContent></Card>
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">Platform Cut</CardTitle></CardHeader>
          <CardContent><p className="text-2xl font-bold text-blue-600">₹{stats.totalPlatform.toLocaleString()}</p></CardContent></Card>
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">Instructor Payouts</CardTitle></CardHeader>
          <CardContent><p className="text-2xl font-bold text-green-600">₹{stats.totalInstructor.toLocaleString()}</p></CardContent></Card>
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">Pending Payouts</CardTitle></CardHeader>
          <CardContent><p className="text-2xl font-bold text-amber-600">₹{stats.pendingPayouts.toLocaleString()}</p></CardContent></Card>
      </div>

      {earnings && earnings.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2"><TrendingUp className="w-5 h-5" /> Platform Revenue Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={(() => {
                  const map: Record<string, { month: string; gross: number; platform: number; instructor: number }> = {}
                  for (const e of earnings) {
                    const key = new Date(e.created_at).toLocaleString('default', { month: 'short', year: '2-digit' })
                    if (!map[key]) map[key] = { month: key, gross: 0, platform: 0, instructor: 0 }
                    map[key].gross += Number(e.gross_amount)
                    map[key].platform += Number(e.platform_cut)
                    map[key].instructor += Number(e.instructor_amount)
                  }
                  return Object.values(map).reverse()
                })()}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" fontSize={12} />
                  <YAxis fontSize={12} />
                  <Tooltip formatter={(v: any) => [`₹${Number(v).toLocaleString()}`, undefined]} />
                  <Legend />
                  <Bar dataKey="gross" fill="#94a3b8" name="Gross" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="platform" fill="#3b82f6" name="Platform Cut" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="instructor" fill="#22c55e" name="Instructor Share" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Revenue Split Settings</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center gap-4">
          <div className="flex-1 max-w-xs">
            <Label>Platform Split (%)</Label>
            <div className="flex gap-2 mt-1">
              <Input type="number" min={0} max={100} value={revenueSplit} onChange={(e) => setRevenueSplit(Number(e.target.value))} />
              <Button variant="outline" onClick={() => saveRevenueSplitMutation.mutate(revenueSplit)} disabled={saveRevenueSplitMutation.isPending}>
                {saveRevenueSplitMutation.isPending ? 'Saving...' : 'Save'}
              </Button>
            </div>
            <p className="text-xs text-muted-foreground mt-1">Instructor gets {100 - revenueSplit}%</p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Instructor Payouts</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Instructor</TableHead>
                <TableHead>Course</TableHead>
                <TableHead>Gross</TableHead>
                <TableHead>Platform Cut</TableHead>
                <TableHead>Instructor Amt</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {(earnings || []).map((e) => (
                <TableRow key={e.id}>
                  <TableCell className="text-xs">{e.instructor_id.slice(0, 8)}...</TableCell>
                  <TableCell className="text-xs">{(e.course as any)?.title || 'N/A'}</TableCell>
                  <TableCell>₹{Number(e.gross_amount).toLocaleString()}</TableCell>
                  <TableCell className="text-blue-600">₹{Number(e.platform_cut).toLocaleString()}</TableCell>
                  <TableCell className="text-green-600 font-medium">₹{Number(e.instructor_amount).toLocaleString()}</TableCell>
                  <TableCell>
                    <Badge variant={e.payout_status === 'paid' ? 'default' : 'secondary'}>{e.payout_status}</Badge>
                  </TableCell>
                  <TableCell className="text-xs">{new Date(e.created_at).toLocaleDateString()}</TableCell>
                  <TableCell>
                    {e.payout_status === 'pending' && (
                      <Button variant="outline" size="sm" className="h-8" onClick={() => markPaidMutation.mutate(e.instructor_id)}>
                        <CreditCard className="w-3 h-3 mr-1" /> Mark Paid
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
              {(earnings || []).length === 0 && (
                <TableRow><TableCell colSpan={8} className="text-center py-8 text-muted-foreground">No earnings records yet</TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Payout History */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Payout History</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Instructor</TableHead>
                <TableHead>Total Paid</TableHead>
                <TableHead>Last Payout</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {(() => {
                const byInstructor = (earnings || [])
                  .filter(e => e.payout_status === 'paid')
                  .reduce((acc: Record<string, { total: number; lastPaid: string }>, e: any) => {
                    if (!acc[e.instructor_id]) acc[e.instructor_id] = { total: 0, lastPaid: '' }
                    acc[e.instructor_id].total += Number(e.instructor_amount)
                    if (e.paid_at && e.paid_at > acc[e.instructor_id].lastPaid) acc[e.instructor_id].lastPaid = e.paid_at
                    return acc
                  }, {})
                return Object.entries(byInstructor).length > 0
                  ? Object.entries(byInstructor).map(([instId, data]) => (
                      <TableRow key={instId}>
                        <TableCell className="text-xs font-mono">{instId.slice(0, 8)}...</TableCell>
                        <TableCell className="font-semibold text-green-600">₹{data.total.toLocaleString()}</TableCell>
                        <TableCell className="text-xs">{data.lastPaid ? new Date(data.lastPaid).toLocaleDateString() : '-'}</TableCell>
                        <TableCell><Badge variant="default">Paid</Badge></TableCell>
                      </TableRow>
                    ))
                  : <TableRow><TableCell colSpan={4} className="text-center py-8 text-muted-foreground">No payouts recorded yet</TableCell></TableRow>
              })()}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
