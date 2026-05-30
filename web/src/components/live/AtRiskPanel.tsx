import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Select } from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import { ErrorState } from '@/components/common/ErrorState'
import { AtRiskTable } from './AtRiskTable'
import { AT_RISK_REASONS } from '@/lib/constants'
import type { AtRiskFlag } from '@/lib/types'
import { toast } from 'sonner'

type FlagRow = AtRiskFlag & {
  profile: { full_name: string; avatar_url: string | null } | null
  course: { title: string } | null
}

async function fetchFlags() {
  const { data, error } = await supabase
    .from('at_risk_flags')
    .select('*, profile:user_id(full_name, avatar_url), course:courses(title)')
    .eq('resolved', false)
    .order('flagged_at', { ascending: false })

  if (error) throw error
  return (data ?? []) as unknown as FlagRow[]
}

export function AtRiskPanel() {
  const queryClient = useQueryClient()
  const [courseFilter, setCourseFilter] = useState('')
  const [reasonFilter, setReasonFilter] = useState('')

  const { data: flags, isLoading, isError, refetch } = useQuery({
    queryKey: ['at-risk-flags'],
    queryFn: fetchFlags,
    staleTime: 1000 * 60 * 2,
  })

  const resolveMutation = useMutation({
    mutationFn: async (flagId: string) => {
      const { error } = await supabase
        .from('at_risk_flags')
        .update({ resolved: true, resolved_at: new Date().toISOString() })
        .eq('id', flagId)
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['at-risk-flags'] })
      toast.success('Flag resolved')
    },
    onError: () => {
      toast.error('Failed to resolve flag')
    },
  })

  const filtered = (flags ?? []).filter((f) => {
    if (courseFilter && f.course?.title !== courseFilter) return false
    if (reasonFilter && f.reason !== reasonFilter) return false
    return true
  })

  const uniqueCourses = Array.from(new Set((flags ?? []).map((f) => f.course?.title).filter(Boolean) as string[]))

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div className="flex items-center gap-2">
          <CardTitle className="text-lg">⚠ At-Risk Students</CardTitle>
          {flags && (
            <Badge variant="destructive">{flags.length}</Badge>
          )}
        </div>
        <div className="flex items-center gap-2">
          <select
            className="h-9 rounded-md border border-input bg-background px-3 text-sm"
            value={courseFilter}
            onChange={(e) => setCourseFilter(e.target.value)}
          >
            <option value="">All courses</option>
            {uniqueCourses.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
          <select
            className="h-9 rounded-md border border-input bg-background px-3 text-sm"
            value={reasonFilter}
            onChange={(e) => setReasonFilter(e.target.value)}
          >
            <option value="">All reasons</option>
            {AT_RISK_REASONS.map((r) => (
              <option key={r} value={r}>{r.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase())}</option>
            ))}
          </select>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        ) : isError ? (
          <ErrorState title="Failed to load at-risk flags" onRetry={refetch} />
        ) : (
          <AtRiskTable
            flags={filtered}
            onResolve={(id) => resolveMutation.mutate(id)}
            loading={resolveMutation.isPending}
          />
        )}
      </CardContent>
    </Card>
  )
}
