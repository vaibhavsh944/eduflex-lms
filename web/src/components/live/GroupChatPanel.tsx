import { useState, useEffect, useRef, useCallback } from 'react'
import { useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/store/authStore'
import type { StudyGroupMessage } from '@/lib/types'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Skeleton } from '@/components/ui/skeleton'
import { TypingIndicator } from '@/components/live/TypingIndicator'
import { getInitials, formatRelativeTime } from '@/lib/utils'
import { Send, Paperclip, Pencil, Trash2 } from 'lucide-react'

interface Props {
  groupId: string
}

const PAGE_SIZE = 30

export function GroupChatPanel({ groupId }: Props) {
  const user = useAuthStore((s) => s.user)
  const queryClient = useQueryClient()
  const [input, setInput] = useState('')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editText, setEditText] = useState('')
  const [typingUsers, setTypingUsers] = useState<string[]>([])
  const scrollRef = useRef<HTMLDivElement>(null)
  const bottomRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const {
    data,
    isLoading,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteQuery({
    queryKey: ['group-messages', groupId],
    queryFn: async ({ pageParam }: { pageParam: number }) => {
      const from = pageParam * PAGE_SIZE
      const to = from + PAGE_SIZE - 1
      const { data, error } = await supabase
        .from('study_group_messages')
        .select('*, profile:profiles!user_id(id, full_name, avatar_url)')
        .eq('group_id', groupId)
        .order('created_at', { ascending: false })
        .range(from, to)
      if (error) throw error
      return data
    },
    getNextPageParam: (lastPage, allPages) => {
      if (lastPage.length < PAGE_SIZE) return undefined
      return allPages.length
    },
    initialPageParam: 0,
    enabled: !!groupId,
  })

  const { mutate: sendMessage } = useMutation({
    mutationFn: async (body: string) => {
      const { error } = await supabase.from('study_group_messages').insert({
        group_id: groupId,
        user_id: user!.id,
        body,
      })
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['group-messages', groupId] })
      setInput('')
    },
    onError: () => toast.error('Failed to send message'),
  })

  const { mutate: editMessage } = useMutation({
    mutationFn: async ({ messageId, body }: { messageId: string; body: string }) => {
      const { error } = await supabase
        .from('study_group_messages')
        .update({ body, edited_at: new Date().toISOString() })
        .eq('id', messageId)
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['group-messages', groupId] })
      setEditingId(null)
      setEditText('')
    },
    onError: () => toast.error('Failed to edit message'),
  })

  const { mutate: deleteMessage } = useMutation({
    mutationFn: async (messageId: string) => {
      const { error } = await supabase
        .from('study_group_messages')
        .delete()
        .eq('id', messageId)
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['group-messages', groupId] })
    },
    onError: () => toast.error('Failed to delete message'),
  })

  useEffect(() => {
    if (bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }, [data])

  const handleSend = useCallback(() => {
    const trimmed = input.trim()
    if (!trimmed) return
    sendMessage(trimmed)
  }, [input, sendMessage])

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value)
  }

  const messages = data ? data.pages.flat().reverse() : []

  if (isLoading) {
    return (
      <div className="flex-1 flex flex-col p-4 space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex items-start gap-3">
            <Skeleton className="h-8 w-8 rounded-full shrink-0" />
            <div className="space-y-1 flex-1">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-8 w-3/4" />
            </div>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="flex-1 flex flex-col min-h-0">
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.length === 0 && (
          <div className="flex items-center justify-center h-full text-sm text-muted-foreground">
            No messages yet. Start the conversation!
          </div>
        )}
        {messages.map((msg) => {
          const isOwn = msg.user_id === user?.id
          return (
            <div key={msg.id} className={`flex items-start gap-3 ${isOwn ? 'flex-row-reverse' : ''}`}>
              <Avatar className="h-8 w-8 shrink-0">
                <AvatarImage src={msg.profile?.avatar_url ?? undefined} />
                <AvatarFallback className="text-xs">{getInitials(msg.profile?.full_name ?? '?')}</AvatarFallback>
              </Avatar>
              <div className={`max-w-[70%] ${isOwn ? 'items-end' : ''}`}>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-medium">{msg.profile?.full_name ?? 'Unknown'}</span>
                  <span className="text-xs text-muted-foreground">{formatRelativeTime(msg.created_at)}</span>
                </div>
                {editingId === msg.id ? (
                  <div className="flex gap-2">
                    <Textarea
                      value={editText}
                      onChange={(e) => setEditText(e.target.value)}
                      className="min-h-[60px] text-sm"
                    />
                    <div className="flex flex-col gap-1">
                      <Button size="sm" onClick={() => editMessage({ messageId: msg.id, body: editText })}>Save</Button>
                      <Button size="sm" variant="ghost" onClick={() => setEditingId(null)}>Cancel</Button>
                    </div>
                  </div>
                ) : (
                  <div className={`rounded-xl px-3 py-2 text-sm ${isOwn ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
                    <p className="whitespace-pre-wrap break-words">{msg.body}</p>
                    {msg.edited_at && <span className="text-xs opacity-60">(edited)</span>}
                  </div>
                )}
                {isOwn && editingId !== msg.id && (
                  <div className="flex gap-1 mt-1">
                    <button onClick={() => { setEditingId(msg.id); setEditText(msg.body) }} className="text-xs text-muted-foreground hover:text-foreground">
                      <Pencil className="h-3 w-3" />
                    </button>
                    <button onClick={() => deleteMessage(msg.id)} className="text-xs text-muted-foreground hover:text-destructive">
                      <Trash2 className="h-3 w-3" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          )
        })}
        <div ref={bottomRef} />
      </div>

      <TypingIndicator typingUsers={typingUsers} />

      <div className="border-t p-3">
        <div className="flex gap-2 items-end">
          <Button variant="ghost" size="icon" className="h-9 w-9 shrink-0">
            <Paperclip className="h-4 w-4" />
          </Button>
          <Textarea
            ref={inputRef}
            value={input}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            placeholder="Type a message..."
            className="min-h-[40px] max-h-[120px] resize-none text-sm"
            rows={1}
          />
          <Button size="icon" className="h-9 w-9 shrink-0" onClick={handleSend} disabled={!input.trim()}>
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}
