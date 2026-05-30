import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { PageHeader } from '@/components/common/PageHeader'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from '@/components/ui/dialog'
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table'
import { AlertTriangle, Download, History, Search, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { format } from 'date-fns'

export function AdminDataRetentionPage() {
  const qc = useQueryClient()
  const [search, setSearch] = useState('')
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [deleteEmail, setDeleteEmail] = useState('')
  const [deleteConfirmText, setDeleteConfirmText] = useState('')

  const { data: logs, isLoading } = useQuery({
    queryKey: ['data-retention-logs'],
    queryFn: async () => {
      const { data } = await supabase
        .from('data_retention_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100)
      return data ?? []
    }
  })

  const deleteAccountMutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.functions.invoke('delete-account', {
        body: { email: deleteEmail }
      })
      if (error) throw error
    },
    onSuccess: () => {
      toast.success(`Account deletion initiated for ${deleteEmail}`)
      setShowDeleteDialog(false)
      setDeleteEmail('')
      setDeleteConfirmText('')
      qc.invalidateQueries({ queryKey: ['data-retention-logs'] })
    },
    onError: (err) => toast.error(err.message),
  })

  const exportUserData = async () => {
    const email = prompt('Enter user email to export data:')
    if (!email) return
    try {
      const { data, error } = await supabase.functions.invoke('export-user-data', { body: { email } })
      if (error) throw error
      toast.success('Data export started. Check audit logs.')
    } catch (err: any) {
      toast.error(err.message)
    }
  }

  const actionLabels: Record<string, { label: string; variant: 'destructive' | 'secondary' | 'default' }> = {
    account_deleted: { label: 'Account Deleted', variant: 'destructive' },
    data_exported: { label: 'Data Exported', variant: 'secondary' },
    consent_revoked: { label: 'Consent Revoked', variant: 'default' },
    gdpr_request: { label: 'GDPR Request', variant: 'secondary' },
    data_anonymized: { label: 'Data Anonymized', variant: 'default' },
  }

  const filtered = (logs || []).filter((log: any) =>
    !search || log.action?.toLowerCase().includes(search.toLowerCase()) ||
    log.user_id?.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="space-y-6">
      <PageHeader
        title="Data Retention & GDPR"
        description="Manage GDPR compliance, data exports, and account deletions"
        actions={
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={exportUserData}>
              <Download className="w-4 h-4 mr-1" /> Export User Data
            </Button>
            <Button variant="destructive" size="sm" onClick={() => setShowDeleteDialog(true)}>
              <Trash2 className="w-4 h-4 mr-1" /> Delete Account
            </Button>
          </div>
        }
      />

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader><CardTitle className="text-sm font-medium">Total Events</CardTitle></CardHeader>
          <CardContent><div className="text-3xl font-bold">{logs?.length || 0}</div></CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle className="text-sm font-medium">Account Deletions</CardTitle></CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-red-600">
              {(logs || []).filter((l: any) => l.action === 'account_deleted').length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle className="text-sm font-medium">Data Exports</CardTitle></CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-600">
              {(logs || []).filter((l: any) => l.action === 'data_exported').length}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg flex items-center gap-2"><History className="w-4 h-4" /> Retention Events</CardTitle>
            <div className="relative w-64">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search events..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9 h-8" />
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-6 space-y-3">
              {Array(8).fill(0).map((_, i) => <Skeleton key={i} className="h-8 w-full" />)}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow><TableHead>Action</TableHead><TableHead>User ID</TableHead><TableHead>Date</TableHead><TableHead>Details</TableHead></TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((log: any) => {
                  const info = actionLabels[log.action] || { label: log.action, variant: 'secondary' as const }
                  return (
                    <TableRow key={log.id}>
                      <TableCell><Badge variant={info.variant}>{info.label}</Badge></TableCell>
                      <TableCell className="font-mono text-xs">{log.user_id?.slice(0, 12) || 'N/A'}</TableCell>
                      <TableCell className="text-xs">{new Date(log.created_at).toLocaleString()}</TableCell>
                      <TableCell className="text-xs max-w-[250px] truncate">{JSON.stringify(log.details || {})}</TableCell>
                    </TableRow>
                  )
                })}
                {filtered.length === 0 && (
                  <TableRow><TableCell colSpan={4} className="text-center py-12 text-muted-foreground">No retention events recorded</TableCell></TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Card className="border-amber-200">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2 text-amber-600">
            <AlertTriangle className="w-4 h-4" /> GDPR Compliance Notice
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li className="flex items-start gap-2"><span className="font-medium text-foreground">•</span> Users can request account deletion via their profile settings. All PII is soft-deleted within 30 days.</li>
            <li className="flex items-start gap-2"><span className="font-medium text-foreground">•</span> Data export requests create a ZIP file of all user data, available for download for 7 days.</li>
            <li className="flex items-start gap-2"><span className="font-medium text-foreground">•</span> Retention logs are immutable and stored for 3 years for compliance purposes.</li>
            <li className="flex items-start gap-2"><span className="font-medium text-foreground">•</span> Automated data anonymization runs daily for accounts inactive over 2 years.</li>
          </ul>
        </CardContent>
      </Card>

      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600"><AlertTriangle className="w-5 h-5" /> Delete User Account</DialogTitle>
            <DialogDescription>
              This will permanently delete the user account and anonymize all personal data.
              Type the email address to confirm.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>User Email</Label>
              <Input
                value={deleteEmail}
                onChange={e => setDeleteEmail(e.target.value)}
                placeholder="user@example.com"
              />
            </div>
            <div>
              <Label>Type the email to confirm</Label>
              <Input
                value={deleteConfirmText}
                onChange={e => setDeleteConfirmText(e.target.value)}
                placeholder="Type email to confirm"
                className={deleteConfirmText && deleteConfirmText !== deleteEmail ? 'border-red-500' : ''}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>Cancel</Button>
            <Button
              variant="destructive"
              disabled={deleteConfirmText !== deleteEmail || !deleteEmail}
              onClick={() => deleteAccountMutation.mutate()}
            >
              Permanently Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
