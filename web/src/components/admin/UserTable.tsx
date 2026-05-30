import { useState } from 'react';
import { Search, MoreHorizontal } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

interface UserTableUser {
  id: string;
  full_name: string | null;
  email: string | null;
  avatar_url: string | null;
  role: string;
  status: string;
  created_at: string;
  enrollment_count?: number;
}

interface UserTableProps {
  users: UserTableUser[];
  isLoading?: boolean;
  pageCount?: number;
  currentPage?: number;
  onPageChange?: (page: number) => void;
  onViewProfile?: (userId: string) => void;
  onChangeRole?: (userId: string, role: string) => void;
  onToggleActive?: (userId: string, isActive: boolean) => void;
  onImpersonate?: (userId: string, name: string) => void;
  onDelete?: (userId: string) => void;
  selectedIds?: string[];
  onToggleSelect?: (id: string) => void;
  onSelectAll?: () => void;
}

export function UserTable({
  users,
  isLoading,
  pageCount = 1,
  currentPage = 1,
  onPageChange,
  onViewProfile,
  onChangeRole,
  onToggleActive,
  onImpersonate,
  onDelete,
  selectedIds = [],
  onToggleSelect,
  onSelectAll,
}: UserTableProps) {
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  const filtered = users.filter((u) => {
    const matchesSearch = !search ||
      u.full_name?.toLowerCase().includes(search.toLowerCase()) ||
      u.email?.toLowerCase().includes(search.toLowerCase());
    const matchesRole = roleFilter === 'all' || u.role === roleFilter;
    const matchesStatus = statusFilter === 'all' ||
      (statusFilter === 'active' ? u.status === 'active' : u.status !== 'active');
    return matchesSearch && matchesRole && matchesStatus;
  });

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by name or email..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); }}
            className="pl-9 h-9"
          />
        </div>
        <Select value={roleFilter} onValueChange={(v) => { if (v) setRoleFilter(v); }}>
          <SelectTrigger className="w-[140px] h-9"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Roles</SelectItem>
            <SelectItem value="student">Student</SelectItem>
            <SelectItem value="instructor">Instructor</SelectItem>
            <SelectItem value="admin">Admin</SelectItem>
          </SelectContent>
        </Select>
        <Select value={statusFilter} onValueChange={(v) => { if (v) setStatusFilter(v); }}>
          <SelectTrigger className="w-[140px] h-9"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="inactive">Deactivated</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              {onToggleSelect && (
                <TableHead className="w-10">
                  <input
                    type="checkbox"
                    checked={selectedIds.length === filtered.length && filtered.length > 0}
                    onChange={onSelectAll}
                    className="h-4 w-4"
                  />
                </TableHead>
              )}
              <TableHead>User</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Enrolled</TableHead>
              <TableHead>Joined</TableHead>
              <TableHead className="w-12" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading
              ? Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i}>
                    {onToggleSelect && <TableCell><Skeleton className="h-4 w-4" /></TableCell>}
                    <TableCell><Skeleton className="h-8 w-48" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-20" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-16" /></TableCell>
                    <TableCell className="text-right"><Skeleton className="h-4 w-12 ml-auto" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                    <TableCell><Skeleton className="h-8 w-8" /></TableCell>
                  </TableRow>
                ))
              : filtered.map((user) => (
                  <TableRow key={user.id}>
                    {onToggleSelect && (
                      <TableCell>
                        <input
                          type="checkbox"
                          checked={selectedIds.includes(user.id)}
                          onChange={() => { onToggleSelect(user.id); }}
                          className="h-4 w-4"
                        />
                      </TableCell>
                    )}
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={user.avatar_url ?? undefined} />
                          <AvatarFallback>
                            {(user.full_name?.[0] || user.email?.[0] || '?').toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="text-sm font-medium">{user.full_name || 'Unnamed'}</p>
                          <p className="text-xs text-muted-foreground">{user.email}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={cn(
                        user.role === 'admin' && 'border-purple-500 text-purple-600',
                        user.role === 'instructor' && 'border-blue-500 text-blue-600',
                      )}>
                        {user.role}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={user.status === 'active' ? 'default' : 'secondary'} className={cn(
                        user.status === 'active' ? 'bg-green-100 text-green-700 hover:bg-green-100' : '',
                      )}>
                        {user.status === 'active' ? 'Active' : 'Inactive'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">{user.enrollment_count ?? '-'}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {format(new Date(user.created_at), 'MMM d, yyyy')}
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          {onViewProfile && (
                            <DropdownMenuItem onClick={() => { onViewProfile(user.id); }}>
                              View Profile
                            </DropdownMenuItem>
                          )}
                          {onChangeRole && (
                            <DropdownMenuItem onClick={() => { onChangeRole(user.id, 'instructor'); }}>
                              Make Instructor
                            </DropdownMenuItem>
                          )}
                          {onChangeRole && (
                            <DropdownMenuItem onClick={() => { onChangeRole(user.id, 'admin'); }}>
                              Make Admin
                            </DropdownMenuItem>
                          )}
                          {onToggleActive && (
                            <DropdownMenuItem onClick={() => { onToggleActive(user.id, user.status !== 'active'); }}>
                              {user.status === 'active' ? 'Deactivate' : 'Activate'}
                            </DropdownMenuItem>
                          )}
                          {onImpersonate && (
                            <DropdownMenuItem onClick={() => { onImpersonate(user.id, user.full_name || 'User'); }}>
                              Impersonate
                            </DropdownMenuItem>
                          )}
                          {onDelete && (
                            <DropdownMenuItem onClick={() => { onDelete(user.id); }} className="text-destructive">
                              Delete Account
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <p>Showing {filtered.length} of {users.length} users</p>
        {pageCount > 1 && onPageChange && (
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={currentPage <= 1}
              onClick={() => { onPageChange(currentPage - 1); }}
            >
              Previous
            </Button>
            <span>Page {String(currentPage)} of {String(pageCount)}</span>
            <Button
              variant="outline"
              size="sm"
              disabled={currentPage >= pageCount}
              onClick={() => { onPageChange(currentPage + 1); }}
            >
              Next
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
