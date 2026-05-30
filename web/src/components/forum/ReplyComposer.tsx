import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { useCreateReply } from '@/hooks/queries/useForum'
import { Loader2 } from 'lucide-react'

interface ReplyComposerProps {
  threadId: string
  parentReplyId?: string | null
  placeholder?: string
  mentionUsername?: string
  onSuccess?: () => void
  onCancel?: () => void
}

export function ReplyComposer({ threadId, parentReplyId, placeholder, mentionUsername, onSuccess, onCancel }: ReplyComposerProps) {
  const [body, setBody] = useState('')
  const { mutateAsync: createReply, isPending } = useCreateReply()

  useEffect(() => {
    if (mentionUsername && parentReplyId && !body) {
      setBody(`@${mentionUsername} `)
    }
  }, [mentionUsername, parentReplyId])

  const handleSubmit = async () => {
    if (!body.trim()) return
    const bodyToSend = body.trim()
    await createReply({ threadId, body: bodyToSend, parentReplyId })
    setBody('')
    onSuccess?.()
  }

  return (
    <div className="space-y-2">
      <textarea
        value={body}
        onChange={(e) => setBody(e.target.value)}
        placeholder={placeholder || 'Write a reply... Use **bold**, *italic*, and @mentions.'}
        className="w-full min-h-[80px] rounded-lg border border-input bg-transparent px-3 py-2 text-sm resize-y focus:outline-none focus:ring-2 focus:ring-ring"
      />
      <div className="flex justify-end gap-2">
        {onCancel && (
          <Button variant="ghost" size="sm" onClick={onCancel}>Cancel</Button>
        )}
        <Button size="sm" onClick={handleSubmit} disabled={isPending || !body.trim()}>
          {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Post Reply
        </Button>
      </div>
    </div>
  )
}
