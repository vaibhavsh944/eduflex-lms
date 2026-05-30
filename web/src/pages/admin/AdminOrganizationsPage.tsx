import React, { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { PageHeader } from '@/components/common/PageHeader'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription,
} from '@/components/ui/dialog'
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table'
import { toast } from 'sonner'
import { Plus, Globe } from 'lucide-react'

export function AdminOrganizationsPage() {
  const queryClient = useQueryClient()
  const [showCreate, setShowCreate] = useState(false)
  const [form, setForm] = useState({ name: '', slug: '' })

  const { data: orgs } = useQuery({
    queryKey: ['organizations'],
    queryFn: async () => {
      const { data } = await supabase.from('organizations').select('*').order('name')
      return data ?? []
    }
  })

  const createMutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from('organizations').insert({ name: form.name, slug: form.slug.toLowerCase() })
      if (error) throw error
    },
    onSuccess: () => {
      toast.success('Organization created')
      setShowCreate(false); setForm({ name: '', slug: '' })
      queryClient.invalidateQueries({ queryKey: ['organizations'] })
    },
    onError: (err) => toast.error(err.message)
  })

  return (
    <div className="space-y-6">
      <PageHeader title="Organizations" description="Manage multi-tenant organizations" />
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-lg">All Organizations</CardTitle>
          <Button onClick={() => setShowCreate(true)}><Plus className="w-4 h-4 mr-1" /> Add Organization</Button>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow><TableHead>Name</TableHead><TableHead>Slug</TableHead><TableHead>Domain</TableHead><TableHead>Created</TableHead></TableRow>
            </TableHeader>
            <TableBody>
              {(orgs || []).map((o) => (
                <TableRow key={o.id}>
                  <TableCell className="font-medium">{o.name}</TableCell>
                  <TableCell className="font-mono text-xs">{o.slug}</TableCell>
                  <TableCell className="text-xs">{o.custom_domain || '-'}</TableCell>
                  <TableCell className="text-xs">{new Date(o.created_at).toLocaleDateString()}</TableCell>
                </TableRow>
              ))}
              {(orgs || []).length === 0 && <TableRow><TableCell colSpan={4} className="text-center py-8 text-muted-foreground">No organizations</TableCell></TableRow>}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={showCreate} onOpenChange={setShowCreate}>
        <DialogContent>
          <DialogHeader><DialogTitle>Add Organization</DialogTitle><DialogDescription>Create a new tenant</DialogDescription></DialogHeader>
          <div className="space-y-4">
            <div><Label>Name</Label><Input placeholder="Bangalore University" value={form.name} onChange={(e) => setForm(f => ({ ...f, name: e.target.value }))} /></div>
            <div><Label>Slug</Label><Input placeholder="bangaloreuni" value={form.slug} onChange={(e) => setForm(f => ({ ...f, slug: e.target.value }))} className="font-mono" /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreate(false)}>Cancel</Button>
            <Button onClick={() => createMutation.mutate()} disabled={!form.name || !form.slug}>Create</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
