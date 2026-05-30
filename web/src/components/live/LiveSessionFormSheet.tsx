import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/hooks/useAuth'
import { useParams } from 'react-router-dom'
import { toast } from 'sonner'
import { useQueryClient } from '@tanstack/react-query'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
} from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { CalendarDays, Loader2 } from 'lucide-react'
import type { LiveSession } from '@/lib/types'

const formSchema = z.object({
  name: z.string().min(5, 'Name must be at least 5 characters').max(120, 'Name must be at most 120 characters'),
  description: z.string().optional(),
  scheduled_at: z.string().min(1, 'Please select a date and time'),
  duration: z.string(),
  enable_whiteboard: z.boolean(),
  enable_polls: z.boolean(),
  allow_chat: z.boolean(),
  notify_students: z.boolean(),
})

type FormValues = z.infer<typeof formSchema>

interface LiveSessionFormSheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSave?: () => void
  editingSession?: LiveSession | null
}

const DURATION_OPTIONS = [
  { value: '30', label: '30 minutes' },
  { value: '60', label: '1 hour' },
  { value: '90', label: '1.5 hours' },
  { value: '120', label: '2 hours' },
  { value: 'custom', label: 'Custom' },
]

export function LiveSessionFormSheet({ open, onOpenChange, onSave, editingSession }: LiveSessionFormSheetProps) {
  const { user } = useAuth()
  const { courseId } = useParams<{ courseId: string }>()
  const queryClient = useQueryClient()

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: editingSession?.name ?? '',
      description: editingSession?.description ?? '',
      scheduled_at: editingSession?.scheduled_at ? editingSession.scheduled_at.slice(0, 16) : '',
      duration: '60',
      enable_whiteboard: editingSession?.enable_whiteboard ?? true,
      enable_polls: editingSession?.enable_polls ?? true,
      allow_chat: editingSession?.allow_chat ?? true,
      notify_students: true,
    },
  })

  const watchWhiteboard = watch('enable_whiteboard')
  const watchPolls = watch('enable_polls')
  const watchChat = watch('allow_chat')
  const watchNotify = watch('notify_students')

  const onSubmit = async (data: FormValues) => {
    if (!user || !courseId) return

    const scheduledAt = new Date(data.scheduled_at)
    const durationMinutes = data.duration === 'custom' ? 60 : parseInt(data.duration)
    const endedAt = new Date(scheduledAt.getTime() + durationMinutes * 60000).toISOString()

    const payload = {
      course_id: courseId,
      instructor_id: user.id,
      name: data.name,
      description: data.description || null,
      scheduled_at: scheduledAt.toISOString(),
      ended_at: endedAt,
      enable_whiteboard: data.enable_whiteboard,
      enable_polls: data.enable_polls,
      allow_chat: data.allow_chat,
    }

    if (editingSession) {
      const { error } = await supabase
        .from('live_sessions')
        .update(payload)
        .eq('id', editingSession.id)

      if (error) {
        toast.error('Failed to update session')
        return
      }
      toast.success('Session updated successfully')
    } else {
      const { error } = await supabase
        .from('live_sessions')
        .insert(payload)

      if (error) {
        toast.error('Failed to create session')
        return
      }
      toast.success('Session created successfully')
    }

    queryClient.invalidateQueries({ queryKey: ['live-sessions', courseId] })
    reset()
    onSave?.()
    onOpenChange(false)
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-md overflow-y-auto">
        <SheetHeader>
          <SheetTitle>{editingSession ? 'Edit Session' : 'Schedule a Live Session'}</SheetTitle>
          <SheetDescription>
            Configure your live streaming session details below.
          </SheetDescription>
        </SheetHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-1 flex-col gap-6 p-4">
          <div className="space-y-2">
            <Label htmlFor="name">Session Name *</Label>
            <Input
              id="name"
              placeholder="e.g. Week 4 Q&A Session"
              {...register('name')}
            />
            {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Optional session description..."
              rows={3}
              {...register('description')}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="scheduled_at">Scheduled At *</Label>
            <div className="relative">
              <CalendarDays className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                id="scheduled_at"
                type="datetime-local"
                className="pl-9"
                {...register('scheduled_at')}
              />
            </div>
            {errors.scheduled_at && <p className="text-xs text-destructive">{errors.scheduled_at.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="duration">Duration</Label>
            <Select
              value={watch('duration')}
              onValueChange={(val) => setValue('duration', val ?? '')}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select duration" />
              </SelectTrigger>
              <SelectContent>
                {DURATION_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-4">
            <Label>Session Features</Label>

            <div className="flex items-center justify-between">
              <Label htmlFor="whiteboard" className="font-normal">Enable Whiteboard</Label>
              <Switch
                id="whiteboard"
                checked={watchWhiteboard}
                onCheckedChange={(val) => setValue('enable_whiteboard', val)}
              />
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="polls" className="font-normal">Enable Polls</Label>
              <Switch
                id="polls"
                checked={watchPolls}
                onCheckedChange={(val) => setValue('enable_polls', val)}
              />
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="chat" className="font-normal">Allow Chat</Label>
              <Switch
                id="chat"
                checked={watchChat}
                onCheckedChange={(val) => setValue('allow_chat', val)}
              />
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="notify" className="font-normal">Notify Students</Label>
              <Switch
                id="notify"
                checked={watchNotify}
                onCheckedChange={(val) => setValue('notify_students', val)}
              />
            </div>
          </div>

          <SheetFooter className="mt-auto pt-4">
            <div className="flex w-full gap-2">
              <Button
                type="button"
                variant="outline"
                className="flex-1"
                onClick={() => { reset(); onOpenChange(false) }}
              >
                Cancel
              </Button>
              <Button type="submit" className="flex-1" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {editingSession ? 'Update' : 'Schedule'}
              </Button>
            </div>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  )
}
