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
import { toast } from 'sonner'
import { Plus, CalendarDays, RotateCcw, Copy } from 'lucide-react'

export function AdminSemestersPage() {
  const queryClient = useQueryClient()
  const [showCreate, setShowCreate] = useState(false)
  const [showRollover, setShowRollover] = useState(false)
  const [form, setForm] = useState({ name: '', starts_at: '', ends_at: '' })
  const [rollover, setRollover] = useState<{ sourceId: string; newName: string; newStartsAt: string; newEndsAt: string }>({ sourceId: '', newName: '', newStartsAt: '', newEndsAt: '' })

  const { data: semesters } = useQuery({
    queryKey: ['semesters'],
    queryFn: async () => {
      const { data } = await supabase.from('semesters').select('*').order('starts_at', { ascending: false })
      return data ?? []
    }
  })

  const createMutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from('semesters').insert({ name: form.name, starts_at: form.starts_at, ends_at: form.ends_at })
      if (error) throw error
    },
    onSuccess: () => {
      toast.success('Semester created')
      setShowCreate(false); setForm({ name: '', starts_at: '', ends_at: '' })
      queryClient.invalidateQueries({ queryKey: ['semesters'] })
    },
    onError: (err) => toast.error(err.message)
  })

  const activateMutation = useMutation({
    mutationFn: async (id: string) => {
      await supabase.from('semesters').update({ is_active: false }).neq('id', id)
      const { error } = await supabase.from('semesters').update({ is_active: true }).eq('id', id)
      if (error) throw error
    },
    onSuccess: () => {
      toast.success('Semester activated')
      queryClient.invalidateQueries({ queryKey: ['semesters'] })
    }
  })

  const rolloverMutation = useMutation({
    mutationFn: async () => {
      const { data: sourceSem } = await supabase
        .from('semesters')
        .select('id')
        .eq('id', rollover.sourceId)
        .single()
      if (!sourceSem) throw new Error('Source semester not found')

      const { data: newSem, error: semErr } = await supabase
        .from('semesters')
        .insert({ name: rollover.newName, starts_at: rollover.newStartsAt, ends_at: rollover.newEndsAt })
        .select()
        .single()
      if (semErr) throw semErr

      const { data: courses } = await supabase
        .from('courses')
        .select('*')
        .eq('semester_id', rollover.sourceId)

      if (courses && courses.length > 0) {
        const shells = courses.map(c => ({
          title: c.title,
          description: c.description,
          instructor_id: c.instructor_id,
          category: c.category,
          level: c.level,
          pricing_type: c.pricing_type,
          price: c.price,
          org_id: c.org_id,
          department_id: c.department_id,
          semester_id: newSem.id,
          status: 'draft' as const,
        }))
        const { error: copyErr } = await supabase.from('courses').insert(shells)
        if (copyErr) throw copyErr
      }
    },
    onSuccess: () => {
      toast.success('Semester rolled over')
      setShowRollover(false)
      queryClient.invalidateQueries({ queryKey: ['semesters'] })
      queryClient.invalidateQueries({ queryKey: ['instructor-courses'] })
    },
    onError: (err) => toast.error(err.message)
  })

  return (
    <div className="space-y-6">
      <PageHeader title="Semesters" description="Manage academic terms" />
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-lg">Academic Terms</CardTitle>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setShowRollover(true)}><Copy className="w-4 h-4 mr-1" /> Rollover</Button>
            <Button onClick={() => setShowCreate(true)}><Plus className="w-4 h-4 mr-1" /> Create Semester</Button>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow><TableHead>Name</TableHead><TableHead>Start</TableHead><TableHead>End</TableHead><TableHead>Status</TableHead><TableHead>Actions</TableHead></TableRow>
            </TableHeader>
            <TableBody>
              {(semesters || []).map((s) => (
                <TableRow key={s.id}>
                  <TableCell className="font-medium">{s.name}</TableCell>
                  <TableCell className="text-xs">{new Date(s.starts_at).toLocaleDateString()}</TableCell>
                  <TableCell className="text-xs">{new Date(s.ends_at).toLocaleDateString()}</TableCell>
                  <TableCell><Badge variant={s.is_active ? 'default' : 'secondary'}>{s.is_active ? 'Active' : 'Inactive'}</Badge></TableCell>
                  <TableCell>
                    {!s.is_active && (
                      <Button variant="outline" size="sm" className="h-8" onClick={() => activateMutation.mutate(s.id)}>
                        <RotateCcw className="w-3 h-3 mr-1" /> Activate
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
              {(semesters || []).length === 0 && <TableRow><TableCell colSpan={5} className="text-center py-8 text-muted-foreground">No semesters</TableCell></TableRow>}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={showCreate} onOpenChange={setShowCreate}>
        <DialogContent>
          <DialogHeader><DialogTitle>Create Semester</DialogTitle><DialogDescription>Define a new academic term</DialogDescription></DialogHeader>
          <div className="space-y-4">
            <div><Label>Name</Label><Input placeholder="Fall 2025" value={form.name} onChange={(e) => setForm(f => ({ ...f, name: e.target.value }))} /></div>
            <div className="grid grid-cols-2 gap-4">
              <div><Label>Start Date</Label><Input type="date" value={form.starts_at} onChange={(e) => setForm(f => ({ ...f, starts_at: e.target.value }))} /></div>
              <div><Label>End Date</Label><Input type="date" value={form.ends_at} onChange={(e) => setForm(f => ({ ...f, ends_at: e.target.value }))} /></div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreate(false)}>Cancel</Button>
            <Button onClick={() => createMutation.mutate()} disabled={!form.name || !form.starts_at || !form.ends_at}>Create</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showRollover} onOpenChange={setShowRollover}>
        <DialogContent>
          <DialogHeader><DialogTitle>Rollover to Next Term</DialogTitle><DialogDescription>Copy course associations from an existing semester into a new term</DialogDescription></DialogHeader>
          <div className="space-y-4">
            <div><Label>Source Semester</Label>
              <Select value={rollover.sourceId || ''} onValueChange={(v) => setRollover(r => ({ ...r, sourceId: v ?? '' }))}>
                <SelectTrigger><SelectValue placeholder="Select semester to rollover" /></SelectTrigger>
                <SelectContent>
                  {(semesters || []).map(s => (
                    <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div><Label>New Semester Name</Label><Input placeholder="Spring 2026" value={rollover.newName} onChange={(e) => setRollover(r => ({ ...r, newName: e.target.value }))} /></div>
            <div className="grid grid-cols-2 gap-4">
              <div><Label>Start Date</Label><Input type="date" value={rollover.newStartsAt} onChange={(e) => setRollover(r => ({ ...r, newStartsAt: e.target.value }))} /></div>
              <div><Label>End Date</Label><Input type="date" value={rollover.newEndsAt} onChange={(e) => setRollover(r => ({ ...r, newEndsAt: e.target.value }))} /></div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowRollover(false)}>Cancel</Button>
            <Button onClick={() => rolloverMutation.mutate()} disabled={!rollover.sourceId || !rollover.newName || !rollover.newStartsAt || !rollover.newEndsAt}>Rollover</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
