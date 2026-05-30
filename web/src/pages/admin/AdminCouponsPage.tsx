import React, { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { PageHeader } from '@/components/common/PageHeader'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription,
} from '@/components/ui/dialog'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts'
import { toast } from 'sonner'
import { Plus, Search, Tag, Percent, DollarSign, CalendarDays, TrendingUp } from 'lucide-react'

const COLORS = ['#22c55e', '#eab308', '#ef4444', '#3b82f6', '#a855f7']

export function AdminCouponsPage() {
  const queryClient = useQueryClient()
  const [search, setSearch] = useState('')
  const [showCreate, setShowCreate] = useState(false)
  const [form, setForm] = useState({
    code: '', discount_type: 'percentage' as 'percentage' | 'flat',
    discount_value: 10, max_uses: 100, expires_at: '', course_id: '', min_order_value: ''
  })

  const { data: coupons } = useQuery({
    queryKey: ['coupons'],
    queryFn: async () => {
      const { data } = await supabase.from('coupons').select('*').order('created_at', { ascending: false })
      return data ?? []
    }
  })

  const createMutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from('coupons').insert({
        code: form.code.toUpperCase(),
        discount_type: form.discount_type,
        discount_value: form.discount_value,
        max_uses: form.max_uses || null,
        expires_at: form.expires_at || null,
        min_order_value: form.min_order_value ? Number(form.min_order_value) : null,
      })
      if (error) throw error
    },
    onSuccess: () => {
      toast.success('Coupon created!')
      setShowCreate(false)
      setForm({ code: '', discount_type: 'percentage', discount_value: 10, max_uses: 100, expires_at: '', course_id: '', min_order_value: '' })
      queryClient.invalidateQueries({ queryKey: ['coupons'] })
    },
    onError: (err) => toast.error(err.message)
  })

  const toggleActive = useMutation({
    mutationFn: async ({ id, is_active }: { id: string; is_active: boolean }) => {
      const { error } = await supabase.from('coupons').update({ is_active: !is_active }).eq('id', id)
      if (error) throw error
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['coupons'] })
  })

  const filtered = (coupons || []).filter(c =>
    c.code.toLowerCase().includes(search.toLowerCase())
  )

  const activeCoupons = (coupons || []).filter(c => c.is_active && !(c.expires_at && new Date(c.expires_at) < new Date()))
  const exhaustedCoupons = (coupons || []).filter(c => c.max_uses !== null && c.used_count >= c.max_uses)
  const expiredCoupons = (coupons || []).filter(c => c.expires_at && new Date(c.expires_at) < new Date())

  const pieData = [
    { name: 'Active', value: activeCoupons.length },
    { name: 'Exhausted', value: exhaustedCoupons.length },
    { name: 'Expired', value: expiredCoupons.length },
  ].filter(d => d.value > 0)

  const topCoupons = [...(coupons || [])]
    .sort((a, b) => (b.used_count || 0) - (a.used_count || 0))
    .slice(0, 5)

  return (
    <div className="space-y-6">
      <PageHeader title="Coupons" description="Create and manage discount codes" />

      {/* Analytics */}
      {(coupons || []).length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader><CardTitle className="text-sm font-medium flex items-center gap-2"><TrendingUp className="w-4 h-4" /> Coupon Status</CardTitle></CardHeader>
            <CardContent>
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={pieData} cx="50%" cy="50%" outerRadius={60} dataKey="value" label={({ name, value }) => `${name}: ${value}`}>
                      {pieData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                    </Pie>
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle className="text-sm font-medium flex items-center gap-2"><Tag className="w-4 h-4" /> Top Coupons by Usage</CardTitle></CardHeader>
            <CardContent>
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={topCoupons.map(c => ({ code: c.code, uses: c.used_count || 0 }))} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" />
                    <YAxis type="category" dataKey="code" width={80} fontSize={11} />
                    <Tooltip />
                    <Bar dataKey="uses" fill="#3b82f6" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-lg">All Coupons</CardTitle>
          <Button onClick={() => setShowCreate(true)}><Plus className="w-4 h-4 mr-1" /> Create Coupon</Button>
        </CardHeader>
        <CardContent>
          <div className="relative mb-4">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search by code..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Code</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Value</TableHead>
                <TableHead>Uses</TableHead>
                <TableHead>Expires</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((c) => {
                const expired = c.expires_at && new Date(c.expires_at) < new Date()
                const exhausted = c.max_uses !== null && c.used_count >= c.max_uses
                const status = !c.is_active ? 'Disabled' : expired ? 'Expired' : exhausted ? 'Exhausted' : 'Active'
                return (
                  <TableRow key={c.id}>
                    <TableCell className="font-mono font-bold">{c.code}</TableCell>
                    <TableCell className="capitalize">{c.discount_type}</TableCell>
                    <TableCell>{c.discount_type === 'percentage' ? `${c.discount_value}%` : `₹${c.discount_value}`}</TableCell>
                    <TableCell>{c.used_count}/{c.max_uses ?? '∞'}</TableCell>
                    <TableCell className="text-xs">{c.expires_at ? new Date(c.expires_at).toLocaleDateString() : 'Never'}</TableCell>
                    <TableCell>
                      <Badge variant={status === 'Active' ? 'default' : 'secondary'}>{status}</Badge>
                    </TableCell>
                    <TableCell>
                      <Button variant="ghost" size="sm" className="h-8" onClick={() => toggleActive.mutate({ id: c.id, is_active: c.is_active })}>
                        {c.is_active ? 'Disable' : 'Enable'}
                      </Button>
                    </TableCell>
                  </TableRow>
                )
              })}
              {filtered.length === 0 && (
                <TableRow><TableCell colSpan={7} className="text-center py-8 text-muted-foreground">No coupons found</TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={showCreate} onOpenChange={setShowCreate}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Coupon</DialogTitle>
            <DialogDescription>Create a new discount code</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Code</Label>
              <Input placeholder="SUMMER20" value={form.code} onChange={(e) => setForm(f => ({ ...f, code: e.target.value }))} className="font-mono uppercase" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Type</Label>
                <Select value={form.discount_type} onValueChange={(v: any) => setForm(f => ({ ...f, discount_type: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="percentage">Percentage</SelectItem>
                    <SelectItem value="flat">Flat</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Value</Label>
                <Input type="number" min={1} value={form.discount_value} onChange={(e) => setForm(f => ({ ...f, discount_value: Number(e.target.value) }))} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Max Uses</Label>
                <Input type="number" min={1} value={form.max_uses} onChange={(e) => setForm(f => ({ ...f, max_uses: Number(e.target.value) }))} />
              </div>
              <div>
                <Label>Expires</Label>
                <Input type="datetime-local" value={form.expires_at} onChange={(e) => setForm(f => ({ ...f, expires_at: e.target.value }))} />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreate(false)}>Cancel</Button>
            <Button onClick={() => createMutation.mutate()} disabled={!form.code}>Create</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
