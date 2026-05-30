import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { useAskQuestion } from '@/hooks/queries/useForum'
import { Loader2, HelpCircle } from 'lucide-react'
import { toast } from 'sonner'

interface AskQuestionModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  lessonId: string
}

export function AskQuestionModal({ open, onOpenChange, lessonId }: AskQuestionModalProps) {
  const [title, setTitle] = useState('')
  const [body, setBody] = useState('')
  const { mutateAsync: askQuestion, isPending } = useAskQuestion()

  const handleSubmit = async () => {
    if (!title.trim() || !body.trim()) return
    await askQuestion({ lessonId, body: `**${title.trim()}**\n\n${body.trim()}` })
    setTitle('')
    setBody('')
    toast.success('Question posted successfully!')
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Ask a Question</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-1 block">Title</label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Summarize your question..."
              required
            />
          </div>
          <div>
            <label className="text-sm font-medium mb-1 block">Question</label>
            <textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder="Provide more details about your question..."
              className="w-full min-h-[120px] rounded-lg border border-input bg-transparent px-3 py-2 text-sm resize-y focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button onClick={handleSubmit} disabled={isPending || !title.trim() || !body.trim()}>
              {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              <HelpCircle className="mr-1 h-4 w-4" />
              Submit Question
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
