import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { PageHeader } from '@/components/common/PageHeader'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table'
import {
  Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious,
} from '@/components/ui/pagination'
import { Skeleton } from '@/components/ui/skeleton'
import { Download, Search, Filter } from 'lucide-react'
import { format } from 'date-fns'
import { toast } from 'sonner'

const PAGE_SIZE = 50

const ACTION_FILTERS = [
  { value: '', label: 'All Actions' },
  { value: 'user.created', label: 'User Created' },
  { value: 'user.deleted', label: 'User Deleted' },
  { value: 'user.account_deleted', label: 'Account Deleted' },
  { value: 'enrollment.created', label: 'Enrollment Created' },
  { value: 'enrollment.cancelled', label: 'Enrollment Cancelled' },
  { value: 'payment.verified', label: 'Payment Verified' },
  { value: 'coupon.used', label: 'Coupon Used' },
  { value: 'webhook.fired', label: 'Webhook Fired' },
  { value: 'course.created', label: 'Course Created' },
  { value: 'course.published', label: 'Course Published' },
  { value: 'certificate.issued', label: 'Certificate Issued' },
]

export function AdminAuditLogs() {
  const [search, setSearch] = useState('')
  const [actionFilter, setActionFilter] = useState('')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [page, setPage] = useState(1)

  const { data, isLoading } = useQuery({
    queryKey: ['audit-logs', actionFilter, dateFrom, dateTo, page],
    queryFn: async () => {
      const from = (page - 1) * PAGE_SIZE
      const to = from + PAGE_SIZE - 1

      let countQuery = supabase
        .from('audit_logs')
        .select('*', { count: 'exact', head: true })
      let dataQuery = supabase
        .from('audit_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .range(from, to)

      if (actionFilter) {
        countQuery = countQuery.eq('action_type', actionFilter)
        dataQuery = dataQuery.eq('action_type', actionFilter)
      }
      if (dateFrom) {
        countQuery = countQuery.gte('created_at', new Date(dateFrom).toISOString())
        dataQuery = dataQuery.gte('created_at', new Date(dateFrom).toISOString())
      }
      if (dateTo) {
        countQuery = countQuery.lte('created_at', new Date(dateTo + 'T23:59:59').toISOString())
        dataQuery = dataQuery.lte('created_at', new Date(dateTo + 'T23:59:59').toISOString())
      }

      const [countRes, dataRes] = await Promise.all([countQuery, dataQuery])
      return {
        logs: dataRes.data ?? [],
        total: countRes.count ?? 0,
      }
    },
  })

  const logs = data?.logs ?? []
  const total = data?.total ?? 0
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE))

  const filtered = logs.filter(log =>
    !search || log.action?.toLowerCase().includes(search.toLowerCase()) ||
    log.target_id?.toLowerCase().includes(search.toLowerCase())
  )

  const exportCSV = () => {
    const headers = ['Action', 'Actor', 'Target', 'Timestamp', 'Metadata']
    const rows = filtered.map((log: any) => [
      log.action,
      log.actor_id || '',
      log.target_id || '',
      new Date(log.created_at).toISOString(),
      JSON.stringify(log.details || {}),
    ])
    const csv = [headers, ...rows].map(r => r.map(c => `"${c.replace(/"/g, '""')}"`).join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url; a.download = `audit-logs-${format(new Date(), 'yyyy-MM-dd')}.csv`
    a.click()
    URL.revokeObjectURL(url)
    toast.success('Audit log exported')
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Audit Logs" description="Platform activity logs — immutable record" />

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg flex items-center gap-2"><Filter className="w-4 h-4" /> Filters</CardTitle>
            <Button variant="outline" size="sm" onClick={exportCSV} disabled={filtered.length === 0}>
              <Download className="w-4 h-4 mr-1" /> Export CSV
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <Label className="text-xs">Search</Label>
              <div className="relative">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Action or target..." value={search} onChange={(e) => { setSearch(e.target.value); setPage(1) }} className="pl-9 h-9" />
              </div>
            </div>
            <div>
              <Label className="text-xs">Action Type</Label>
              <Select value={actionFilter} onValueChange={(v: string | null) => { setActionFilter(v || ''); setPage(1) }}>
                <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {ACTION_FILTERS.map(a => (
                    <SelectItem key={a.value} value={a.value}>{a.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs">From</Label>
              <Input type="date" value={dateFrom} onChange={(e) => { setDateFrom(e.target.value); setPage(1) }} className="h-9" />
            </div>
            <div>
              <Label className="text-xs">To</Label>
              <Input type="date" value={dateTo} onChange={(e) => { setDateTo(e.target.value); setPage(1) }} className="h-9" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-6 space-y-3">
              {Array(10).fill(0).map((_, i) => <Skeleton key={i} className="h-8 w-full" />)}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Action</TableHead>
                  <TableHead>Actor</TableHead>
                  <TableHead>Target</TableHead>
                  <TableHead>Timestamp</TableHead>
                  <TableHead>Metadata</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((log: any) => (
                  <TableRow key={log.id}>
                    <TableCell><Badge variant="secondary" className="font-mono text-xs">{log.action}</Badge></TableCell>
                    <TableCell className="text-xs">{log.actor_email || log.actor_id?.slice(0, 8) || '-'}</TableCell>
                    <TableCell className="text-xs">{log.target_name || log.target_id?.slice(0, 8) || '-'}</TableCell>
                    <TableCell className="text-xs">{new Date(log.created_at).toLocaleString()}</TableCell>
                    <TableCell className="text-xs max-w-[200px] truncate">{JSON.stringify(log.details)}</TableCell>
                  </TableRow>
                ))}
                {filtered.length === 0 && (
                  <TableRow><TableCell colSpan={5} className="text-center py-12 text-muted-foreground">No audit log entries found</TableCell></TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">Showing page {page} of {totalPages} ({total} entries)</p>
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious onClick={() => setPage(Math.max(1, page - 1))} className={page <= 1 ? 'pointer-events-none opacity-50' : ''} />
              </PaginationItem>
              {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
                const start = Math.max(1, Math.min(page - 3, totalPages - 6))
                const p = start + i
                if (p > totalPages) return null
                return (
                  <PaginationItem key={p}>
                    <PaginationLink isActive={p === page} onClick={() => setPage(p)}>{p}</PaginationLink>
                  </PaginationItem>
                )
              })}
              <PaginationItem>
                <PaginationNext onClick={() => setPage(Math.min(totalPages, page + 1))} className={page >= totalPages ? 'pointer-events-none opacity-50' : ''} />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      )}
    </div>
  )
}
