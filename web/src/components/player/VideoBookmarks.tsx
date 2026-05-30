import React, { useState, useEffect, useRef } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { toast } from 'sonner'
import { Bookmark, BookmarkCheck, List } from 'lucide-react'

interface VideoBookmarksProps {
  lessonId: string
  currentTime: number
  onSeek: (seconds: number) => void
}

export function VideoBookmarks({ lessonId, currentTime, onSeek }: VideoBookmarksProps) {
  const queryClient = useQueryClient()
  const [showBookmarks, setShowBookmarks] = useState(false)
  const [showAdd, setShowAdd] = useState(false)
  const [label, setLabel] = useState('')
  const bookmarksRef = useRef<HTMLDivElement>(null)
  const addRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (bookmarksRef.current && !bookmarksRef.current.contains(e.target as Node)) {
        setShowBookmarks(false)
      }
      if (addRef.current && !addRef.current.contains(e.target as Node)) {
        setShowAdd(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  const { data: bookmarks } = useQuery({
    queryKey: ['video-bookmarks', lessonId],
    queryFn: async () => {
      const { data } = await supabase
        .from('video_bookmarks')
        .select('*')
        .eq('lesson_id', lessonId)
        .order('timestamp_seconds', { ascending: true })
      return data ?? []
    }
  })

  const addMutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from('video_bookmarks').insert({
        lesson_id: lessonId,
        timestamp_seconds: Math.floor(currentTime),
        label: label || undefined,
      })
      if (error) throw error
    },
    onSuccess: () => {
      setLabel('')
      setShowAdd(false)
      toast.success('Bookmark added')
      queryClient.invalidateQueries({ queryKey: ['video-bookmarks', lessonId] })
    },
    onError: (err) => toast.error(err.message),
  })

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('video_bookmarks').delete().eq('id', id)
      if (error) throw error
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['video-bookmarks', lessonId] }),
    onError: (err) => toast.error(err.message),
  })

  return (
    <div className="flex items-center gap-1">
      <div className="relative" ref={bookmarksRef}>
        <Button variant="ghost" size="sm" className="h-8 px-2 text-white hover:text-white hover:bg-white/20" onClick={() => setShowBookmarks(v => !v)}>
          <List className="w-4 h-4 mr-1" />
          {bookmarks?.length || 0}
        </Button>
        {showBookmarks && (
          <div className="absolute bottom-full left-0 mb-1 w-56 bg-black/90 border border-white/20 rounded p-2 z-50">
            {(bookmarks || []).length === 0 && (
              <p className="text-xs text-white/60 p-2">No bookmarks yet</p>
            )}
            <div className="max-h-40 overflow-y-auto">
              {(bookmarks || []).map((b: any) => (
                <div key={b.id} className="flex items-center justify-between py-1 px-2 hover:bg-white/10 rounded cursor-pointer group" onClick={() => { onSeek(b.timestamp_seconds); setShowBookmarks(false) }}>
                  <div className="flex items-center gap-2">
                    <BookmarkCheck className="w-3 h-3 text-primary" />
                    <span className="text-xs text-white">{b.label || formatTime(b.timestamp_seconds)}</span>
                  </div>
                  <button
                    className="text-xs text-red-400 opacity-0 group-hover:opacity-100"
                    onClick={(e) => { e.stopPropagation(); deleteMutation.mutate(b.id) }}
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="relative" ref={addRef}>
        <Button variant="ghost" size="sm" className="h-8 px-2 text-white hover:text-white hover:bg-white/20" onClick={() => setShowAdd(v => !v)}>
          <Bookmark className="w-4 h-4" />
        </Button>
        {showAdd && (
          <div className="absolute bottom-full left-0 mb-1 w-56 bg-black/90 border border-white/20 rounded p-3 z-50">
            <p className="text-xs text-white/60 mb-2">
              Bookmark at {formatTime(Math.floor(currentTime))}
            </p>
            <div className="flex gap-2">
              <Input
                placeholder="Label (optional)"
                className="h-8 text-xs bg-white/10 border-white/20 text-white placeholder:text-white/40"
                value={label}
                onChange={(e) => setLabel(e.target.value)}
              />
              <Button size="sm" className="h-8" onClick={() => addMutation.mutate()}>
                Add
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${m}:${s.toString().padStart(2, '0')}`
}
