import { useParams } from 'react-router-dom'
import { useState, useEffect, useRef } from 'react'
import { supabase } from '@/lib/supabase'
import { PageHeader } from '@/components/common/PageHeader'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { ThreadListItem } from '@/components/forum/ThreadListItem'
import { CreateThreadModal } from '@/components/forum/CreateThreadModal'
import { useForumThreads } from '@/hooks/queries/useForum'
import { useForumStore } from '@/store/forumStore'
import { useAuthStore } from '@/store/authStore'
import { useQueryClient } from '@tanstack/react-query'
import { ROUTES } from '@/lib/constants'
import { MessageSquare, Filter } from 'lucide-react'
import { SEO } from '@/components/shared/SEO'
import { cn } from '@/lib/utils'

const TABS = [
  { key: 'all', label: 'All' },
  { key: 'pinned', label: 'Pinned' },
  { key: 'unanswered', label: 'Unanswered' },
  { key: 'my-posts', label: 'My Posts' },
] as const

const SORT_OPTIONS = [
  { key: 'newest', label: 'Newest' },
  { key: 'upvotes', label: 'Most Upvoted' },
  { key: 'replies', label: 'Most Replies' },
] as const

export function ForumPage() {
  const { courseId } = useParams<{ courseId: string }>()
  const [showCreate, setShowCreate] = useState(false)
  const user = useAuthStore(state => state.user)
  const queryClient = useQueryClient()
  const { threadFilters, setThreadFilters } = useForumStore()
  const { data: threads, isLoading, fetchNextPage, hasNextPage, isFetchingNextPage } = useForumThreads(courseId || '', threadFilters)
  const [showSort, setShowSort] = useState(false)
  const loaderRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!courseId) return
    const channel = supabase
      .channel(`forum-threads-${courseId}`)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'forum_threads',
        filter: `course_id=eq.${courseId}`,
      }, () => {
        queryClient.invalidateQueries({ queryKey: ['forum', 'threads', courseId] })
      })
      .subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [courseId, queryClient])

  useEffect(() => {
    if (!loaderRef.current || !hasNextPage) return
    const observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) fetchNextPage()
    }, { threshold: 0.1 })
    observer.observe(loaderRef.current)
    return () => observer.disconnect()
  }, [hasNextPage, fetchNextPage])

  const allThreads = threads?.pages?.flatMap(p => p.data) || []

  return (
    <>
      <SEO title="Discussions | EduFlow" />
      <div className="max-w-4xl mx-auto pb-12">
      <div className="flex items-center justify-between mb-6">
        <PageHeader
          title="Course Discussion"
          description={allThreads ? `${allThreads.length} threads` : 'Forum'}
          actions={
            <Button onClick={() => setShowCreate(true)}>
              <MessageSquare className="mr-2 h-4 w-4" />
              New Thread
            </Button>
          }
        />
      </div>

      <div className="flex items-center justify-between mb-4 gap-2">
        <div className="flex gap-1">
          {TABS.map(tab => (
            <button
              key={tab.key}
              onClick={() => setThreadFilters({ tab: tab.key })}
              className={cn(
                'px-3 py-1.5 text-sm rounded-md transition-colors',
                threadFilters.tab === tab.key
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:bg-muted'
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>
        <div className="relative">
          <Button variant="outline" size="sm" onClick={() => setShowSort(!showSort)}>
            <Filter className="h-4 w-4 mr-1" />
            {SORT_OPTIONS.find(s => s.key === threadFilters.sort)?.label || 'Sort'}
          </Button>
          {showSort && (
            <div className="absolute right-0 top-full mt-1 bg-popover border rounded-lg shadow-lg z-10 min-w-[140px]">
              {SORT_OPTIONS.map(opt => (
                <button
                  key={opt.key}
                  onClick={() => { setThreadFilters({ sort: opt.key }); setShowSort(false) }}
                  className={cn(
                    'block w-full text-left px-3 py-2 text-sm hover:bg-muted transition-colors',
                    threadFilters.sort === opt.key && 'font-semibold'
                  )}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3, 4, 5].map(i => <Skeleton key={i} className="h-24 w-full rounded-lg" />)}
        </div>
      ) : !allThreads.length ? (
        <div className="text-center py-20 border rounded-xl bg-card">
          <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
          <h3 className="text-lg font-semibold">No discussions yet</h3>
          <p className="text-muted-foreground mt-2">Be the first to start a conversation!</p>
          <Button className="mt-4" onClick={() => setShowCreate(true)}>Start a Discussion</Button>
        </div>
      ) : (
        <div className="border rounded-xl bg-card overflow-hidden">
          {allThreads.map(thread => (
            <ThreadListItem
              key={thread.id}
              thread={thread}
              courseId={courseId!}
              link={ROUTES.FORUM_THREAD(courseId!, thread.id)}
            />
          ))}
          <div ref={loaderRef} className="py-4 text-center text-sm text-muted-foreground">
            {isFetchingNextPage ? 'Loading more...' : hasNextPage ? 'Scroll for more' : ''}
          </div>
        </div>
      )}

      {courseId && (
        <CreateThreadModal
          open={showCreate}
          onOpenChange={setShowCreate}
          courseId={courseId}
        />
      )}
    </div>
    </>
  )
}
