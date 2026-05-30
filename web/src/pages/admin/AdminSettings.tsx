import { useState, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { PageHeader } from '@/components/common/PageHeader'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { toast } from 'sonner'
import { Save, Globe, Lock, Bell, Palette, CreditCard, Loader2 } from 'lucide-react'

const SETTING_KEYS = [
  'platform_name', 'support_email', 'default_role', 'allow_registration',
  'maintenance_mode', 'min_password_length', 'require_email_verification',
  'enable_2fa', 'session_timeout_hours', 'welcome_email', 'weekly_digest',
  'assignment_reminders', 'certificate_emails', 'currency', 'platform_fee',
  'auto_payout', 'razorpay_live_mode',
] as const

const defaults: Record<string, string> = {
  platform_name: 'EduFlow LMS',
  support_email: 'support@eduflow.app',
  default_role: 'student',
  allow_registration: 'true',
  maintenance_mode: 'false',
  min_password_length: '8',
  require_email_verification: 'true',
  enable_2fa: 'false',
  session_timeout_hours: '24',
  welcome_email: 'true',
  weekly_digest: 'true',
  assignment_reminders: 'true',
  certificate_emails: 'true',
  currency: 'INR',
  platform_fee: '10',
  auto_payout: 'false',
  razorpay_live_mode: 'false',
}

export function AdminSettings() {
  const [settings, setSettings] = useState<Record<string, string>>(defaults)
  const queryClient = useQueryClient()

  const { isLoading } = useQuery({
    queryKey: ['admin-settings'],
    queryFn: async () => {
      const { data } = await supabase.from('admin_settings').select('key, value')
      if (data) {
        const map: Record<string, string> = { ...defaults }
        data.forEach((s) => { map[s.key] = s.value })
        setSettings(map)
      }
      return data
    },
  })

  const saveMutation = useMutation({
    mutationFn: async (section: string) => {
      const changed = SETTING_KEYS.filter((k) => settings[k] !== defaults[k])
      const upserts = changed.map((key) => ({
        key,
        value: settings[key],
      }))
      if (upserts.length > 0) {
        const { error } = await supabase.from('admin_settings').upsert(upserts, { onConflict: 'key' })
        if (error) throw error
      }
      return section
    },
    onSuccess: (section) => {
      queryClient.invalidateQueries({ queryKey: ['admin-settings'] })
      toast.success(`${section} settings saved`)
    },
    onError: () => toast.error('Failed to save settings'),
  })

  const update = (key: string, value: string) => {
    setSettings((prev) => ({ ...prev, [key]: value }))
  }

  const SettingRow = ({ label, description, children }: { label: string; description?: string; children: React.ReactNode }) => (
    <div className="flex items-center justify-between py-3 border-b last:border-0">
      <div>
        <div className="text-sm font-medium">{label}</div>
        {description && <div className="text-xs text-muted-foreground">{description}</div>}
      </div>
      {children}
    </div>
  )

  const getBool = (key: string) => settings[key] === 'true'
  const setBool = (key: string, val: boolean) => update(key, val ? 'true' : 'false')

  if (isLoading) {
    return (
      <div className="space-y-6">
        <PageHeader title="Platform Settings" description="Loading..." />
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Platform Settings" description="Configure platform-wide settings" />
      <Tabs defaultValue="general">
        <TabsList>
          <TabsTrigger value="general"><Globe className="w-4 h-4 mr-1" /> General</TabsTrigger>
          <TabsTrigger value="security"><Lock className="w-4 h-4 mr-1" /> Security</TabsTrigger>
          <TabsTrigger value="notifications"><Bell className="w-4 h-4 mr-1" /> Notifications</TabsTrigger>
          <TabsTrigger value="branding"><Palette className="w-4 h-4 mr-1" /> Branding</TabsTrigger>
          <TabsTrigger value="payments"><CreditCard className="w-4 h-4 mr-1" /> Payments</TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="mt-4 space-y-4">
          <Card>
            <CardHeader><CardTitle className="text-lg">General Settings</CardTitle><CardDescription>Basic platform configuration</CardDescription></CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Platform Name</Label>
                <Input value={settings.platform_name} onChange={e => update('platform_name', e.target.value)} />
              </div>
              <div>
                <Label>Support Email</Label>
                <Input type="email" value={settings.support_email} onChange={e => update('support_email', e.target.value)} />
              </div>
              <div>
                <Label>Default User Role</Label>
                <select className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm" value={settings.default_role} onChange={e => update('default_role', e.target.value)}>
                  <option value="student">Student</option>
                  <option value="instructor">Instructor</option>
                </select>
              </div>
              <SettingRow label="Allow New Registrations" description="Enable or disable user signups">
                <Switch checked={getBool('allow_registration')} onCheckedChange={(v) => setBool('allow_registration', v)} />
              </SettingRow>
              <SettingRow label="Maintenance Mode" description="Only admins can access the platform">
                <Switch checked={getBool('maintenance_mode')} onCheckedChange={(v) => setBool('maintenance_mode', v)} />
              </SettingRow>
              <Button onClick={() => saveMutation.mutate('General')} disabled={saveMutation.isPending}>
                {saveMutation.isPending ? <Loader2 className="w-4 h-4 mr-1 animate-spin" /> : <Save className="w-4 h-4 mr-1" />} Save Changes
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="mt-4 space-y-4">
          <Card>
            <CardHeader><CardTitle className="text-lg">Security Settings</CardTitle><CardDescription>Authentication and access control</CardDescription></CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Minimum Password Length</Label>
                <Input type="number" value={settings.min_password_length} onChange={e => update('min_password_length', e.target.value)} className="w-32" />
              </div>
              <SettingRow label="Require Email Verification" description="Users must verify email before accessing the platform">
                <Switch checked={getBool('require_email_verification')} onCheckedChange={(v) => setBool('require_email_verification', v)} />
              </SettingRow>
              <SettingRow label="Enable 2FA" description="Two-factor authentication for all users">
                <Switch checked={getBool('enable_2fa')} onCheckedChange={(v) => setBool('enable_2fa', v)} />
              </SettingRow>
              <SettingRow label="Session Timeout (hours)" description="Automatically log out inactive users">
                <Input type="number" value={settings.session_timeout_hours} onChange={e => update('session_timeout_hours', e.target.value)} className="w-20" />
              </SettingRow>
              <Button onClick={() => saveMutation.mutate('Security')} disabled={saveMutation.isPending}>
                {saveMutation.isPending ? <Loader2 className="w-4 h-4 mr-1 animate-spin" /> : <Save className="w-4 h-4 mr-1" />} Save Changes
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="mt-4 space-y-4">
          <Card>
            <CardHeader><CardTitle className="text-lg">Notification Settings</CardTitle><CardDescription>Configure platform-wide notifications</CardDescription></CardHeader>
            <CardContent className="space-y-4">
              <SettingRow label="Welcome Email" description="Send welcome email to new users">
                <Switch checked={getBool('welcome_email')} onCheckedChange={(v) => setBool('welcome_email', v)} />
              </SettingRow>
              <SettingRow label="Weekly Digest" description="Send weekly activity digest to all users">
                <Switch checked={getBool('weekly_digest')} onCheckedChange={(v) => setBool('weekly_digest', v)} />
              </SettingRow>
              <SettingRow label="Assignment Reminders" description="Send reminders before assignment deadlines">
                <Switch checked={getBool('assignment_reminders')} onCheckedChange={(v) => setBool('assignment_reminders', v)} />
              </SettingRow>
              <SettingRow label="Certificate Emails" description="Notify users when they earn a certificate">
                <Switch checked={getBool('certificate_emails')} onCheckedChange={(v) => setBool('certificate_emails', v)} />
              </SettingRow>
              <Button onClick={() => saveMutation.mutate('Notifications')} disabled={saveMutation.isPending}>
                {saveMutation.isPending ? <Loader2 className="w-4 h-4 mr-1 animate-spin" /> : <Save className="w-4 h-4 mr-1" />} Save Changes
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="branding" className="mt-4 space-y-4">
          <Card>
            <CardHeader><CardTitle className="text-lg">Branding Settings</CardTitle><CardDescription>Customize platform appearance</CardDescription></CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Platform Logo</Label>
                <Input type="file" accept="image/*" onChange={(e) => {
                  if (e.target.files?.[0]) toast.info('Logo upload — coming soon')
                }} />
                <p className="text-xs text-muted-foreground mt-1">Recommended: 140x32px, SVG or PNG</p>
              </div>
              <div>
                <Label>Favicon</Label>
                <Input type="file" accept="image/*" onChange={(e) => {
                  if (e.target.files?.[0]) toast.info('Favicon upload — coming soon')
                }} />
              </div>
              <Button onClick={() => saveMutation.mutate('Branding')} disabled={saveMutation.isPending}>
                {saveMutation.isPending ? <Loader2 className="w-4 h-4 mr-1 animate-spin" /> : <Save className="w-4 h-4 mr-1" />} Save Changes
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="payments" className="mt-4 space-y-4">
          <Card>
            <CardHeader><CardTitle className="text-lg">Payment Settings</CardTitle><CardDescription>Configure payment and billing</CardDescription></CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Currency</Label>
                <select className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm" value={settings.currency} onChange={e => update('currency', e.target.value)}>
                  <option value="INR">INR - Indian Rupee</option>
                  <option value="USD">USD - US Dollar</option>
                  <option value="EUR">EUR - Euro</option>
                </select>
              </div>
              <div>
                <Label>Platform Fee (%)</Label>
                <Input type="number" value={settings.platform_fee} onChange={e => update('platform_fee', e.target.value)} className="w-32" />
                <p className="text-xs text-muted-foreground mt-1">Percentage deducted from instructor earnings</p>
              </div>
              <SettingRow label="Auto-payout Instructors" description="Automatically process instructor payouts">
                <Switch checked={getBool('auto_payout')} onCheckedChange={(v) => setBool('auto_payout', v)} />
              </SettingRow>
              <SettingRow label="Razorpay Live Mode" description="Switch between test and live payment gateway">
                <Switch checked={getBool('razorpay_live_mode')} onCheckedChange={(v) => setBool('razorpay_live_mode', v)} />
              </SettingRow>
              <Button onClick={() => saveMutation.mutate('Payments')} disabled={saveMutation.isPending}>
                {saveMutation.isPending ? <Loader2 className="w-4 h-4 mr-1 animate-spin" /> : <Save className="w-4 h-4 mr-1" />} Save Changes
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
