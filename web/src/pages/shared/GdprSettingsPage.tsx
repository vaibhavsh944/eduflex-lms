import React, { useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { PageHeader } from '@/components/common/PageHeader'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog'
import { toast } from 'sonner'
import { Trash2, Download, AlertTriangle } from 'lucide-react'

export function GdprSettingsPage() {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  const exportMutation = useMutation({
    mutationFn: async () => {
      // In production, calls Edge Function export-user-data which aggregates all user data into JSON
      const { error } = await supabase.functions.invoke('export-user-data')
      if (error) throw error
    },
    onSuccess: () => toast.success('Data export requested — you will receive an email with a download link'),
    onError: (err) => toast.error(err.message),
  })

  const deleteMutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.functions.invoke('delete-account')
      if (error) throw error
    },
    onSuccess: () => toast.success('Account deletion requested — you will receive a confirmation email'),
    onError: (err) => toast.error(err.message),
  })

  return (
    <div className="space-y-6">
      <PageHeader title="Privacy &amp; Data" description="GDPR account controls" />

      <Card>
        <CardHeader><CardTitle className="text-lg">Download Your Data</CardTitle></CardHeader>
        <CardContent className="space-y-2">
          <p className="text-sm text-muted-foreground">
            Request a copy of all your personal data stored in EduFlow. The archive will be
            emailed to you as a JSON file within 24 hours.
          </p>
          <Button variant="outline" onClick={() => exportMutation.mutate()} disabled={exportMutation.isPending}>
            <Download className="w-4 h-4 mr-2" />
            {exportMutation.isPending ? 'Requesting...' : 'Download My Data'}
          </Button>
        </CardContent>
      </Card>

      <Card className="border-destructive/50">
        <CardHeader><CardTitle className="text-lg text-destructive">Delete Account</CardTitle></CardHeader>
        <CardContent className="space-y-2">
          <p className="text-sm text-muted-foreground">
            Permanently delete your account and anonymise all personal data.
            Your course completions, certificates, and payment history will be preserved
            in anonymised form as required by financial regulations.
          </p>
          <Button variant="destructive" onClick={() => setShowDeleteConfirm(true)}>
            <Trash2 className="w-4 h-4 mr-2" /> Delete My Account
          </Button>
        </CardContent>
      </Card>

      <Dialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2"><AlertTriangle className="w-5 h-5 text-destructive" /> Confirm Account Deletion</DialogTitle>
            <DialogDescription>
              This action cannot be undone. All your personal information will be
              anonymised and you will lose access to your account.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteConfirm(false)}>Cancel</Button>
            <Button variant="destructive" onClick={() => { deleteMutation.mutate(); setShowDeleteConfirm(false) }}>
              Yes, Delete My Account
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
