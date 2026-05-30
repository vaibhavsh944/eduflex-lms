import { toast } from 'sonner'
import { PageHeader } from '@/components/common/PageHeader'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Calendar, HardDrive, MessageSquare, MessageCircle, Link2 } from 'lucide-react'

const PROVIDERS = [
  { provider: 'google_calendar', title: 'Google Calendar', desc: 'Sync course deadlines and live sessions', icon: Calendar, color: 'text-blue-600' },
  { provider: 'google_drive', title: 'Google Drive', desc: 'Import files directly into assignments and lessons', icon: HardDrive, color: 'text-green-600' },
  { provider: 'slack', title: 'Slack', desc: 'Receive grade and announcement notifications', icon: MessageSquare, color: 'text-purple-600' },
  { provider: 'discord', title: 'Discord', desc: 'Receive notifications in your Discord server', icon: MessageCircle, color: 'text-indigo-600' },
]

export function IntegrationsPage() {
  return (
    <div className="max-w-3xl mx-auto">
      <PageHeader title="Integrations" description="Connect your accounts to enhance your EduFlow experience" />
      <div className="grid gap-4">
        {PROVIDERS.map((p) => {
          const Icon = p.icon
          return (
            <Card key={p.provider}>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <Icon className={`w-6 h-6 ${p.color}`} />
                  <div>
                    <CardTitle className="text-lg">{p.title}</CardTitle>
                    <CardDescription>{p.desc}</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Button onClick={() => toast.info(`${p.title} — coming soon`)}>
                  <Link2 className="w-4 h-4 mr-1" /> Connect
                </Button>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
