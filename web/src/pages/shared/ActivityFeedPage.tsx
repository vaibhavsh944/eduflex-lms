import { useState, useRef, useCallback, useEffect } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import type { ActivityEvent } from '@/lib/types'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { ErrorState } from '@/components/common/ErrorState'
import { PageHeader } from '@/components/common/PageHeader'
import { ActivityFeedItem } from '@/components/live/ActivityFeedItem'
import { Bell, ArrowUp } from 'lucide-react'

const PAGE_SIZE = 20

export function ActivityFeedPage() {
  const queryClient = useQueryClient()
  const [events, setEvents] = useState<ActivityEvent[]>([])
  const [cursor, setCursor] = useState<string | null>(null)
  const [hasMore, setHasMore] = useState(true)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  const [newEventPill, setNewEventPill] = useState(false)
  const loaderRef = useRef<HTMLDivElement>(null)
  const channelRef = useRef<any>(null)

  const fetchEvents = useCallback(async (cursorVal: string | null) => {
    let query = supabase
      .from('activity_events')
      .select('*, profile:user_id(full_name, avatar_url)')
      .order('created_at', { ascending: false })
      .limit(PAGE_SIZE)

    if (cursorVal) {
      query = query.lt('created_at', cursorVal)
    }

    const { data, error } = await query
    if (error) throw error
    return data
  }, [])

  const loadMore = useCallback(async () => {
    if (!hasMore || loading) return
    setLoading(true)
    try {
      const data = await fetchEvents(cursor)
      if (data.length < PAGE_SIZE) setHasMore(false)
      if (data.length > 0) {
        setCursor(data[data.length - 1].created_at)
        setEvents((prev) => [...prev, ...data])
      }
    } catch (err) {
      setError(err as Error)
    } finally {
      setLoading(false)
    }
  }, [cursor, hasMore, loading, fetchEvents])

  useEffect(() => {
    loadMore()
  }, [])

  useEffect(() => {
    const channel = supabase
      .channel('activity-events')
      .on('postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'activity_events' },
        (payload) => {
          setNewEventPill(true)
        }
      )
      .subscribe()
    channelRef.current = channel
    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loading) {
          loadMore()
        }
      },
      { threshold: 0.1 }
    )
    if (loaderRef.current) observer.observe(loaderRef.current)
    return () => observer.disconnect()
  }, [loadMore, hasMore, loading])

  const refreshFeed = async () => {
    setEvents([])
    setCursor(null)
    setHasMore(true)
    setNewEventPill(false)
    await loadMore()
  }

  if (error && events.length === 0) return <ErrorState title="Failed to load activity" onRetry={refreshFeed} />

  return (
    <div className="max-w-3xl mx-auto pb-12">
      <PageHeader title="Activity Feed" description="Recent activity from your classmates" />

      {newEventPill && (
        <div className="flex justify-center mb-4">
          <Button variant="secondary" size="sm" className="rounded-full gap-2 shadow-sm" onClick={refreshFeed}>
            <ArrowUp className="h-4 w-4" />
            New activity
          </Button>
        </div>
      )}

      {events.length === 0 && !loading ? (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-8 text-center mt-8">
          <Bell className="h-10 w-10 text-muted-foreground mb-3" />
          <h3 className="text-lg font-semibold">No recent activity</h3>
          <p className="text-sm text-muted-foreground mt-1">There is no recent activity from your classmates.</p>
        </div>
      ) : (
        <div className="bg-card rounded-xl border shadow-sm divide-y mt-6">
          {events.map((event) => (
            <div key={event.id} className="px-4">
              <ActivityFeedItem event={event} />
            </div>
          ))}
        </div>
      )}

      {loading && (
        <div className="space-y-4 mt-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-start gap-3 px-4">
              <Skeleton className="h-9 w-9 rounded-full shrink-0" />
              <div className="flex-1 space-y-1">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-20" />
              </div>
            </div>
          ))}
        </div>
      )}

      <div ref={loaderRef} className="h-4" />
    </div>
  )
}
