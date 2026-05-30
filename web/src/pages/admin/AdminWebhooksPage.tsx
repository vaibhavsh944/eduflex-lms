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
import { Plus, RefreshCw, Copy, CheckCircle2, XCircle, Clock, ExternalLink, Eye } from 'lucide-react'

const WEBHOOK_EVENTS = [
  'enrollment.created', 'enrollment.cancelled', 'grade.updated',
  'course.completed', 'payment.confirmed', 'user.registered',
  'certificate.issued', 'live_session.started'
]

export function AdminWebhooksPage() {
  const queryClient = useQueryClient()
  const [showAddModal, setShowAddModal] = useState(false)
  const [newUrl, setNewUrl] = useState('')
  const [newEvents, setNewEvents] = useState<string[]>([])
  const [newSecret, setNewSecret] = useState('')
  const [selectedSubId, setSelectedSubId] = useState<string | null>(null)
  const [showPayloadPreview, setShowPayloadPreview] = useState<string | null>(null)

  const { data: subscriptions } = useQuery({
    queryKey: ['webhook-subscriptions'],
    queryFn: async () => {
      const { data } = await supabase.from('webhook_subscriptions').select('*').order('created_at', { ascending: false })
      return data ?? []
    }
  })

  const { data: deliveries } = useQuery({
    queryKey: ['webhook-deliveries', selectedSubId],
    queryFn: async () => {
      if (!selectedSubId) return []
      const { data } = await supabase.from('webhook_deliveries').select('*').eq('subscription_id', selectedSubId).order('delivered_at', { ascending: false }).limit(20)
      return data ?? []
    },
    enabled: !!selectedSubId
  })

  const createMutation = useMutation({
    mutationFn: async () => {
      const secret = newSecret || Array.from({ length: 32 }, () => Math.random().toString(36)[2]).join('')
      const { error } = await supabase.from('webhook_subscriptions').insert({
        url: newUrl, events: newEvents, secret_hash: secret, is_active: true
      })
      if (error) throw error
      return secret
    },
    onSuccess: (secret) => {
      toast.success(`Webhook created! Secret: ${secret} (shown once)`)
      setShowAddModal(false)
      setNewUrl(''); setNewEvents([]); setNewSecret('')
      queryClient.invalidateQueries({ queryKey: ['webhook-subscriptions'] })
    },
    onError: (err) => toast.error(err.message)
  })

  const toggleActive = useMutation({
    mutationFn: async ({ id, is_active }: { id: string; is_active: boolean }) => {
      const { error } = await supabase.from('webhook_subscriptions').update({ is_active: !is_active }).eq('id', id)
      if (error) throw error
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['webhook-subscriptions'] })
  })

  const retryMutation = useMutation({
    mutationFn: async (deliveryId: string) => {
      const { error } = await supabase.functions.invoke('retry-webhooks', { body: { delivery_id: deliveryId } })
      if (error) throw error
    },
    onSuccess: () => {
      toast.success('Retry scheduled')
      queryClient.invalidateQueries({ queryKey: ['webhook-deliveries'] })
    }
  })

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    toast.success('Copied to clipboard')
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Webhooks" description="Manage webhook subscriptions and view delivery logs" />

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-lg">Subscriptions</CardTitle>
          <Button onClick={() => setShowAddModal(true)}>
            <Plus className="w-4 h-4 mr-1" /> Add Webhook
          </Button>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>URL</TableHead>
                <TableHead>Events</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Created</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {(subscriptions || []).map((sub) => (
                <TableRow key={sub.id} className={selectedSubId === sub.id ? 'bg-muted/50' : ''}>
                  <TableCell className="max-w-xs truncate font-mono text-xs">{sub.url}</TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {sub.events.slice(0, 2).map((e: string) => (
                        <Badge key={e} variant="outline" className="text-xs">{e}</Badge>
                      ))}
                      {sub.events.length > 2 && <Badge variant="outline" className="text-xs">+{sub.events.length - 2}</Badge>}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={sub.is_active ? 'default' : 'secondary'}>{sub.is_active ? 'Active' : 'Paused'}</Badge>
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">{new Date(sub.created_at).toLocaleDateString()}</TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="sm" className="h-8" onClick={() => setSelectedSubId(selectedSubId === sub.id ? null : sub.id)}>
                        <Clock className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="sm" className="h-8" onClick={() => setShowPayloadPreview(sub.id)}>
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="sm" className="h-8" onClick={() => toggleActive.mutate({ id: sub.id, is_active: sub.is_active })}>
                        {sub.is_active ? <XCircle className="w-4 h-4" /> : <CheckCircle2 className="w-4 h-4" />}
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {(subscriptions || []).length === 0 && (
                <TableRow><TableCell colSpan={5} className="text-center py-8 text-muted-foreground">No webhooks configured</TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Delivery log */}
      {selectedSubId && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Delivery Log</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Event</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Code</TableHead>
                  <TableHead>Attempts</TableHead>
                  <TableHead>Delivered</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {(deliveries || []).map((d) => (
                  <TableRow key={d.id}>
                    <TableCell className="text-xs">{d.event_type}</TableCell>
                    <TableCell>
                      <Badge variant={d.status === 'success' ? 'default' : d.status === 'failed' ? 'destructive' : 'secondary'} className="text-xs">
                        {d.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-xs">{d.status_code || '-'}</TableCell>
                    <TableCell className="text-xs">{d.attempt_count}</TableCell>
                    <TableCell className="text-xs">{d.delivered_at ? new Date(d.delivered_at).toLocaleString() : '-'}</TableCell>
                    <TableCell>
                      {d.status === 'failed' && (
                        <Button variant="ghost" size="sm" className="h-8" onClick={() => retryMutation.mutate(d.id)}>
                          <RefreshCw className="w-4 h-4" />
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
                {(deliveries || []).length === 0 && (
                  <TableRow><TableCell colSpan={6} className="text-center py-4 text-muted-foreground">No deliveries yet</TableCell></TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* Add webhook modal */}
      <Dialog open={showAddModal} onOpenChange={setShowAddModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Webhook</DialogTitle>
            <DialogDescription>Subscribe to events and receive HTTP POST notifications</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Target URL</Label>
              <Input placeholder="https://your-system.com/webhooks/eduflow" value={newUrl} onChange={(e) => setNewUrl(e.target.value)} />
            </div>
            <div>
              <Label>Events</Label>
              <div className="flex flex-wrap gap-2 mt-1">
                {WEBHOOK_EVENTS.map((evt) => (
                  <Badge
                    key={evt}
                    variant={newEvents.includes(evt) ? 'default' : 'outline'}
                    className="cursor-pointer"
                    onClick={() => setNewEvents(prev => prev.includes(evt) ? prev.filter(e => e !== evt) : [...prev, evt])}
                  >
                    {evt}
                  </Badge>
                ))}
              </div>
            </div>
            <div>
              <Label>Secret (optional — auto-generated if empty)</Label>
              <Input placeholder="Leave empty for auto-generated" value={newSecret} onChange={(e) => setNewSecret(e.target.value)} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddModal(false)}>Cancel</Button>
            <Button onClick={() => createMutation.mutate()} disabled={!newUrl || newEvents.length === 0}>Create</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Payload preview modal */}
      <Dialog open={!!showPayloadPreview} onOpenChange={(v) => !v && setShowPayloadPreview(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Webhook Payload Preview</DialogTitle>
            <DialogDescription>Example JSON payload structure for each event type</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 max-h-96 overflow-y-auto">
            {WEBHOOK_EVENTS.map((evt) => {
              const example = getPayloadExample(evt)
              return (
                <div key={evt}>
                  <h4 className="text-sm font-semibold mb-1">{evt}</h4>
                  <pre className="text-xs p-3 rounded-lg bg-muted overflow-x-auto whitespace-pre-wrap font-mono">{JSON.stringify(example, null, 2)}</pre>
                </div>
              )
            })}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

function getPayloadExample(eventType: string): Record<string, unknown> {
  const examples: Record<string, Record<string, unknown>> = {
    'enrollment.created': { event: 'enrollment.created', user_id: 'uuid', course_id: 'uuid', enrolled_at: '2025-01-15T10:00:00Z' },
    'enrollment.cancelled': { event: 'enrollment.cancelled', user_id: 'uuid', course_id: 'uuid', cancelled_at: '2025-01-16T10:00:00Z' },
    'grade.updated': { event: 'grade.updated', enrollment_id: 'uuid', grade: 85, max_grade: 100, updated_at: '2025-01-17T10:00:00Z' },
    'course.completed': { event: 'course.completed', user_id: 'uuid', course_id: 'uuid', completed_at: '2025-01-18T10:00:00Z' },
    'payment.confirmed': { event: 'payment.confirmed', user_id: 'uuid', order_id: 'order_xxx', amount: 50000, currency: 'INR', payment_method: 'razorpay' },
    'user.registered': { event: 'user.registered', user_id: 'uuid', email: 'user@example.com', role: 'student', registered_at: '2025-01-19T10:00:00Z' },
    'certificate.issued': { event: 'certificate.issued', user_id: 'uuid', course_id: 'uuid', certificate_url: 'https://storage.eduflow.com/certs/uuid.pdf' },
    'live_session.started': { event: 'live_session.started', session_id: 'uuid', course_id: 'uuid', instructor_id: 'uuid', started_at: '2025-01-20T10:00:00Z' },
  }
  return examples[eventType] || { event: eventType, data: {} }
}
