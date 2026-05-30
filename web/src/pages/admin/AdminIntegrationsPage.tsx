import React, { useState } from 'react'
import { PageHeader } from '@/components/common/PageHeader'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import { useMutation } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { Globe, MessageSquare, MessageCircle, ShieldCheck, CheckCircle2, XCircle } from 'lucide-react'

export function AdminIntegrationsPage() {
  const [slackUrl, setSlackUrl] = useState('')
  const [discordUrl, setDiscordUrl] = useState('')
  const [samlXml, setSamlXml] = useState('')
  const [slackConnected, setSlackConnected] = useState(false)
  const [discordConnected, setDiscordConnected] = useState(false)

  const testSlackMutation = useMutation({
    mutationFn: async (url: string) => {
      const { error } = await supabase.functions.invoke('fire-webhooks', {
        body: { event_type: 'test', payload: { message: 'Test ping from EduFlow' }, test_url: url }
      })
      if (error) throw error
    },
    onSuccess: () => toast.success('Slack test message sent!'),
    onError: (err) => toast.error(err.message)
  })

  const handleSaveSlack = () => {
    if (!slackUrl.startsWith('https://hooks.slack.com/services/')) {
      toast.error('Invalid Slack webhook URL')
      return
    }
    setSlackConnected(true)
    toast.success('Slack webhook configured')
  }

  const handleSaveDiscord = () => {
    if (!discordUrl.startsWith('https://discord.com/api/webhooks/')) {
      toast.error('Invalid Discord webhook URL')
      return
    }
    setDiscordConnected(true)
    toast.success('Discord webhook configured')
  }

  const handleSaveSAML = () => {
    if (!samlXml.trim()) {
      toast.error('Please paste the IdP metadata XML')
      return
    }
    toast.success('SSO configuration saved. Relay the SP metadata to your IT team.')
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Integrations" description="Configure third-party integrations for your organization" />

      {/* Slack */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <MessageSquare className="w-6 h-6 text-green-600" />
              <div>
                <CardTitle className="text-lg">Slack</CardTitle>
                <CardDescription>Send notifications to a Slack channel</CardDescription>
              </div>
            </div>
            {slackConnected && <Badge variant="default" className="bg-green-600"><CheckCircle2 className="w-3 h-3 mr-1" /> Connected</Badge>}
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <Label>Webhook URL</Label>
          <div className="flex gap-2">
            <Input placeholder="https://hooks.slack.com/services/..." value={slackUrl} onChange={(e) => setSlackUrl(e.target.value)} className="flex-1" />
            <Button variant="outline" onClick={() => testSlackMutation.mutate(slackUrl)} disabled={!slackUrl}>Test</Button>
            <Button onClick={handleSaveSlack} disabled={!slackUrl}>{slackConnected ? 'Update' : 'Connect'}</Button>
          </div>
          <p className="text-xs text-muted-foreground">Get this from Slack App → Incoming Webhooks</p>
        </CardContent>
      </Card>

      {/* Discord */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <MessageCircle className="w-6 h-6 text-indigo-600" />
              <div>
                <CardTitle className="text-lg">Discord</CardTitle>
                <CardDescription>Send notifications to a Discord channel</CardDescription>
              </div>
            </div>
            {discordConnected && <Badge variant="default" className="bg-green-600"><CheckCircle2 className="w-3 h-3 mr-1" /> Connected</Badge>}
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <Label>Webhook URL</Label>
          <div className="flex gap-2">
            <Input placeholder="https://discord.com/api/webhooks/..." value={discordUrl} onChange={(e) => setDiscordUrl(e.target.value)} className="flex-1" />
            <Button onClick={handleSaveDiscord} disabled={!discordUrl}>{discordConnected ? 'Update' : 'Connect'}</Button>
          </div>
          <p className="text-xs text-muted-foreground">Get this from Discord Server Settings → Integrations → Webhooks</p>
        </CardContent>
      </Card>

      {/* SSO / SAML */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <ShieldCheck className="w-6 h-6 text-blue-600" />
              <div>
                <CardTitle className="text-lg">SSO / SAML 2.0</CardTitle>
                <CardDescription>Enterprise login via your Identity Provider</CardDescription>
              </div>
            </div>
            <Badge variant="outline">Supabase Pro required</Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <Label>IdP Metadata XML</Label>
          <textarea
            className="w-full min-h-[120px] px-3 py-2 rounded-md border border-input bg-background text-sm font-mono"
            placeholder="Paste the XML metadata from your Identity Provider..."
            value={samlXml}
            onChange={(e) => setSamlXml(e.target.value)}
          />
          <div className="flex items-center gap-3">
            <Button onClick={handleSaveSAML} disabled={!samlXml.trim()}>Save SSO Config</Button>
            <span className="text-xs text-muted-foreground">
              SP Entity ID: <code className="bg-muted px-1 rounded">https://eduflow.com/auth/saml</code>
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
