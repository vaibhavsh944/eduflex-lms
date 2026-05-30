import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'

interface CalendarSyncToggleProps {
  courseId: string
}

export function CalendarSyncToggle({ courseId }: CalendarSyncToggleProps) {
  return (
    <div className="flex items-center justify-between py-2">
      <div className="flex items-center gap-2">
        <CalendarIcon />
        <Label htmlFor={`cal-sync-${courseId}`} className="text-sm cursor-pointer">
          Sync course events to Google Calendar
        </Label>
      </div>
      <Switch
        id={`cal-sync-${courseId}`}
        checked={false}
        onCheckedChange={() => toast.info('Calendar sync — coming soon')}
      />
    </div>
  )
}

function CalendarIcon() {
  return <svg className="w-4 h-4 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
}
