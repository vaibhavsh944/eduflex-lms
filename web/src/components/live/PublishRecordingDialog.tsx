import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useParams } from 'react-router-dom'
import { toast } from 'sonner'
import { useQuery } from '@tanstack/react-query'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Loader2 } from 'lucide-react'
import type { LiveSession, Module } from '@/lib/types'

interface PublishRecordingDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  session: LiveSession
  onPublish?: () => void
}

export function PublishRecordingDialog({ open, onOpenChange, session, onPublish }: PublishRecordingDialogProps) {
  const { courseId } = useParams<{ courseId: string }>()
  const [moduleId, setModuleId] = useState('')
  const [lessonTitle, setLessonTitle] = useState(session.name)
  const [isPublishing, setIsPublishing] = useState(false)
  const [createNewModule, setCreateNewModule] = useState(false)
  const [newModuleName, setNewModuleName] = useState('')

  const { data: modules } = useQuery({
    queryKey: ['modules', courseId],
    queryFn: async () => {
      const { data } = await supabase
        .from('modules')
        .select('*')
        .eq('course_id', courseId)
        .order('position', { ascending: true })
      return (data ?? [])
    },
    enabled: !!courseId,
  })

  const handlePublish = async () => {
    if (!courseId) return
    setIsPublishing(true)

    let targetModuleId = moduleId

    if (createNewModule && newModuleName.trim()) {
      const maxOrder = modules?.length ?? 0
      const { data: newMod, error: modErr } = await supabase
        .from('modules')
        .insert({
          course_id: courseId,
          title: newModuleName.trim(),
          position: maxOrder + 1,
        })
        .select()
        .single()

      if (modErr || !newMod) {
        toast.error('Failed to create module')
        setIsPublishing(false)
        return
      }
      targetModuleId = newMod.id
    }

    if (!targetModuleId) {
      toast.error('Please select a module')
      setIsPublishing(false)
      return
    }

    const { error: lessonErr } = await supabase.from('lessons').insert({
      course_id: courseId,
      module_id: targetModuleId,
      title: lessonTitle.trim(),
      content_type: 'video',
      video_url: session.recording_url,
      duration_mins: 0,
      position: 0,
      is_free_preview: false,
    })

    if (lessonErr) {
      toast.error('Failed to publish recording as lesson')
      setIsPublishing(false)
      return
    }

    toast.success('Recording published as lesson!')
    onPublish?.()
    onOpenChange(false)
    setIsPublishing(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Publish Recording as Lesson</DialogTitle>
          <DialogDescription>
            Promote this recording to a lesson that students can access on demand.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="lesson-title">Lesson Title</Label>
            <Input
              id="lesson-title"
              value={lessonTitle}
              onChange={(e) => setLessonTitle(e.target.value)}
            />
          </div>

          {!createNewModule ? (
            <div className="space-y-2">
              <Label htmlFor="module">Select Module</Label>
              <Select value={moduleId} onValueChange={(v) => setModuleId(v ?? '')}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Choose a module..." />
                </SelectTrigger>
                <SelectContent>
                  {modules?.map((mod) => (
                    <SelectItem key={mod.id} value={mod.id}>
                      {mod.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button
                variant="link"
                size="sm"
                className="px-0"
                onClick={() => setCreateNewModule(true)}
              >
                Create new module instead
              </Button>
            </div>
          ) : (
            <div className="space-y-2">
              <Label htmlFor="new-module">New Module Name</Label>
              <Input
                id="new-module"
                placeholder="e.g. Live Recordings"
                value={newModuleName}
                onChange={(e) => setNewModuleName(e.target.value)}
              />
              <Button
                variant="link"
                size="sm"
                className="px-0"
                onClick={() => { setCreateNewModule(false); setNewModuleName('') }}
              >
                Select existing module instead
              </Button>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handlePublish} disabled={isPublishing}>
            {isPublishing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Publish
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
