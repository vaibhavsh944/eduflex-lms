import { useState } from 'react';
import { Search, Filter, Download, ChevronDown, ChevronRight } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import { format } from 'date-fns';

interface AuditLogEntry {
  id: string;
  actor_id: string | null;
  actor_email?: string | null;
  action_type: string;
  target_type: string | null;
  target_id: string | null;
  target_name?: string | null;
  details: Record<string, unknown>;
  ip_address?: string | null;
  created_at: string;
  actor?: {
    id: string;
    full_name: string | null;
    email?: string | null;
  } | null;
}

interface AuditLogTableProps {
  logs: AuditLogEntry[];
  isLoading?: boolean;
  actionFilters?: { value: string; label: string }[];
  onExportCsv?: () => void;
}

const DEFAULT_ACTION_FILTERS = [
  { value: '', label: 'All Actions' },
  { value: 'user.role_changed', label: 'Role Changed' },
  { value: 'user.deactivated', label: 'User Deactivated' },
  { value: 'user.reactivated', label: 'User Reactivated' },
  { value: 'user.impersonation_started', label: 'Impersonation Started' },
  { value: 'user.impersonation_ended', label: 'Impersonation Ended' },
  { value: 'user.deleted', label: 'User Deleted' },
  { value: 'user.bulk_imported', label: 'Bulk Import' },
  { value: 'course.approved', label: 'Course Approved' },
  { value: 'course.rejected', label: 'Course Rejected' },
  { value: 'course.force_published', label: 'Force Published' },
  { value: 'course.unpublished', label: 'Course Unpublished' },
  { value: 'course.deleted', label: 'Course Deleted' },
  { value: 'announcement.sent', label: 'Announcement Sent' },
  { value: 'announcement.scheduled', label: 'Announcement Scheduled' },
];

export function AuditLogTable({
  logs,
  isLoading,
  actionFilters = DEFAULT_ACTION_FILTERS,
  onExportCsv,
}: AuditLogTableProps) {
  const [search, setSearch] = useState('');
  const [actionFilter, setActionFilter] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  const filtered = logs.filter((entry) => {
    const matchesSearch = !search ||
      entry.actor?.full_name?.toLowerCase().includes(search.toLowerCase()) ||
      entry.actor_email?.toLowerCase().includes(search.toLowerCase());
    const matchesAction = !actionFilter || entry.action_type === actionFilter;
    const matchesDateFrom = !dateFrom || new Date(entry.created_at) >= new Date(dateFrom);
    const matchesDateTo = !dateTo || new Date(entry.created_at) <= new Date(dateTo + 'T23:59:59');
    return matchesSearch && matchesAction && matchesDateFrom && matchesDateTo;
  });

  const actionColor = (action: string) => {
    if (action.includes('deleted')) return 'destructive' as const;
    if (action.includes('created') || action.includes('approved') || action.includes('sent')) return 'default' as const;
    if (action.includes('changed') || action.includes('updated')) return 'warning' as const;
    return 'secondary' as const;
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by actor name or email..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); }}
            className="pl-9 h-9"
          />
        </div>
        <Select value={actionFilter} onValueChange={(v) => { if (v !== null) setActionFilter(v); }}>
          <SelectTrigger className="w-[180px] h-9">
            <Filter className="h-3 w-3 mr-1" />
            <SelectValue placeholder="All Actions" />
          </SelectTrigger>
          <SelectContent>
            {actionFilters.map((f) => (
              <SelectItem key={f.value} value={f.value}>{f.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
          <Input
          type="date"
          value={dateFrom}
          onChange={(e) => { setDateFrom(e.target.value); }}
          className="w-[140px] h-9"
          title="From date"
        />
        <Input
          type="date"
          value={dateTo}
          onChange={(e) => { setDateTo(e.target.value); }}
          className="w-[140px] h-9"
          title="To date"
        />
        {onExportCsv && (
          <Button variant="outline" size="sm" className="h-9" onClick={onExportCsv}>
            <Download className="h-4 w-4 mr-1" /> Export CSV
          </Button>
        )}
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-8" />
              <TableHead>Timestamp</TableHead>
              <TableHead>Actor</TableHead>
              <TableHead>Action</TableHead>
              <TableHead>Target</TableHead>
              <TableHead>IP Address</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading
              ? Array.from({ length: 8 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell><Skeleton className="h-4 w-4" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-36" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-28" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-28" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                  </TableRow>
                ))
              : filtered.map((entry) => (
                  <>
                    <TableRow
                      key={entry.id}
                      className="cursor-pointer"
                      onClick={() => { setExpandedId(expandedId === entry.id ? null : entry.id); }}
                    >
                      <TableCell>
                        {expandedId === entry.id
                          ? <ChevronDown className="h-4 w-4" />
                          : <ChevronRight className="h-4 w-4" />
                        }
                      </TableCell>
                      <TableCell className="text-sm whitespace-nowrap">
                        {format(new Date(entry.created_at), 'MMM d, yyyy HH:mm')}
                      </TableCell>
                      <TableCell>
                        <span className="text-sm font-medium">
                          {entry.actor?.full_name || entry.actor_email || 'System'}
                        </span>
                      </TableCell>
                      <TableCell>
                        <Badge variant={actionColor(entry.action_type)}>
                          {entry.action_type.replace(/\./g, ' · ')}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {entry.target_name || entry.target_type || '—'}
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground font-mono">
                        {entry.ip_address || '—'}
                      </TableCell>
                    </TableRow>
                    {expandedId === entry.id && (
                      <TableRow key={`${entry.id}-detail`}>
                        <TableCell colSpan={6} className="bg-muted/30 p-4">
                          <div className="space-y-2 text-sm">
                            <p className="font-medium">Details</p>
                            <pre className="rounded bg-background p-3 text-xs overflow-auto max-h-[300px]">
                              {JSON.stringify(entry.details, null, 2)}
                            </pre>
                          </div>
                        </TableCell>
                      </TableRow>
                    )}
                  </>
                ))}
          </TableBody>
        </Table>
      </div>

      <div className="text-sm text-muted-foreground">
        Showing {filtered.length} of {logs.length} entries
      </div>
    </div>
  );
}
