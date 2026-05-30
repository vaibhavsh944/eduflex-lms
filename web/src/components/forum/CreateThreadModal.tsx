import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { useCreateThread } from '@/hooks/queries/useForum'
import { Loader2 } from 'lucide-react'

interface CreateThreadModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  courseId: string
}

export function CreateThreadModal({ open, onOpenChange, courseId }: CreateThreadModalProps) {
  const [title, setTitle] = useState('')
  const [body, setBody] = useState('')
  const { mutateAsync: createThread, isPending } = useCreateThread()

  const handleSubmit = async () => {
    if (!title.trim() || !body.trim()) return
    await createThread({ courseId, title: title.trim(), body: body.trim() })
    setTitle('')
    setBody('')
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Create a Discussion Thread</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-1 block">Title</label>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="What's on your mind?" required />
          </div>
          <div>
            <label className="text-sm font-medium mb-1 block">Body</label>
            <textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder="Write your post content... Use **bold**, *italic*, and [links](url) with markdown syntax."
              className="w-full min-h-[120px] rounded-lg border border-input bg-transparent px-3 py-2 text-sm resize-y focus:outline-none focus:ring-2 focus:ring-ring"
              required
            />
            <p className="text-xs text-muted-foreground mt-1">
              Supports markdown: **bold**, *italic*, `code`, [links](url)
            </p>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button onClick={handleSubmit} disabled={isPending || !title.trim() || !body.trim()}>
              {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Post Thread
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
