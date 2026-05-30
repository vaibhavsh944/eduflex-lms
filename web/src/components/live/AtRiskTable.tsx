import { useState, useMemo } from 'react'
import { format } from 'date-fns'
import { CheckCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table'
import { Pagination } from '@/components/common/Pagination'
import type { AtRiskFlag } from '@/lib/types'

const REASON_LABELS: Record<string, { label: string; color: 'destructive' | 'warning' | 'secondary' | 'default' }> = {
  low_progress: { label: 'Low Progress', color: 'destructive' },
  declining_scores: { label: 'Declining Scores', color: 'warning' },
  inactive: { label: 'Inactive', color: 'secondary' },
  missed_deadlines: { label: 'Missed Deadlines', color: 'default' },
}

type SortKey = 'user_id' | 'course_id' | 'reason' | 'flagged_at'

interface AtRiskTableProps {
  flags: (AtRiskFlag & { profile?: { full_name: string; avatar_url: string | null } | null; course?: { title: string } | null })[]
  onResolve: (flagId: string) => void
  loading?: boolean
}

export function AtRiskTable({ flags, onResolve, loading }: AtRiskTableProps) {
  const [sortKey, setSortKey] = useState<SortKey>('flagged_at')
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc')
  const [page, setPage] = useState(1)
  const pageSize = 10

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'))
    } else {
      setSortKey(key)
      setSortDir('asc')
    }
  }

  const sorted = useMemo(() => {
    const arr = [...flags]
    arr.sort((a, b) => {
      let cmp = 0
      if (sortKey === 'flagged_at') {
        cmp = new Date(a.flagged_at).getTime() - new Date(b.flagged_at).getTime()
      } else if (sortKey === 'user_id') {
        cmp = (a.profile?.full_name ?? '').localeCompare(b.profile?.full_name ?? '')
      } else if (sortKey === 'course_id') {
        cmp = (a.course?.title ?? '').localeCompare(b.course?.title ?? '')
      } else if (sortKey === 'reason') {
        cmp = a.reason.localeCompare(b.reason)
      }
      return sortDir === 'asc' ? cmp : -cmp
    })
    return arr
  }, [flags, sortKey, sortDir])

  const totalPages = Math.max(1, Math.ceil(sorted.length / pageSize))
  const paginated = sorted.slice((page - 1) * pageSize, page * pageSize)

  if (loading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-12 w-full" />
        ))}
      </div>
    )
  }

  if (flags.length === 0) {
    return (
      <div className="py-8 text-center text-sm text-muted-foreground">
        No at-risk flags
      </div>
    )
  }

  const SortIcon = ({ active }: { active: boolean }) => (
    <span className={`ml-1 inline-block text-xs ${active ? 'opacity-100' : 'opacity-30'}`}>
      {sortDir === 'asc' ? '▲' : '▼'}
    </span>
  )

  return (
    <div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="cursor-pointer" onClick={() => handleSort('user_id')}>
              Student <SortIcon active={sortKey === 'user_id'} />
            </TableHead>
            <TableHead className="cursor-pointer" onClick={() => handleSort('course_id')}>
              Course <SortIcon active={sortKey === 'course_id'} />
            </TableHead>
            <TableHead className="cursor-pointer" onClick={() => handleSort('reason')}>
              Risk Reason <SortIcon active={sortKey === 'reason'} />
            </TableHead>
            <TableHead className="cursor-pointer" onClick={() => handleSort('flagged_at')}>
              Flagged Date <SortIcon active={sortKey === 'flagged_at'} />
            </TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {paginated.map((flag) => {
            const reasonMeta = REASON_LABELS[flag.reason] ?? { label: flag.reason, color: 'default' as const }
            return (
              <TableRow key={flag.id}>
                <TableCell className="font-medium">
                  {flag.profile?.full_name || flag.user_id.slice(0, 8)}
                </TableCell>
                <TableCell>{flag.course?.title || '—'}</TableCell>
                <TableCell>
                  <Badge variant={reasonMeta.color as any}>{reasonMeta.label}</Badge>
                </TableCell>
                <TableCell>{format(new Date(flag.flagged_at), 'MMM d, yyyy')}</TableCell>
                <TableCell>
                  <Button size="sm" variant="ghost" onClick={() => onResolve(flag.id)}>
                    <CheckCircle className="h-4 w-4 mr-1" />
                    Mark Resolved
                  </Button>
                </TableCell>
              </TableRow>
            )
          })}
        </TableBody>
      </Table>
      <div className="mt-4">
        <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
      </div>
    </div>
  )
}
