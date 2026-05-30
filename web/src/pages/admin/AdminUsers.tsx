import { useState, useMemo } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { PageHeader } from '@/components/common/PageHeader'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from '@/components/ui/dialog'
import { Link } from 'react-router-dom'
import { ROUTES } from '@/lib/constants'
import { UserDetailDrawer } from '@/components/admin/UserDetailDrawer'
import { Search, Plus, MoreHorizontal, Shield, UserCog, Ban, CheckCircle, Download, Upload } from 'lucide-react'
import { toast } from 'sonner'
import { format } from 'date-fns'

export function AdminUsers() {
  const qc = useQueryClient()
  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')
  const [page, setPage] = useState(1)
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [showRoleDialog, setShowRoleDialog] = useState(false)
  const [bulkRole, setBulkRole] = useState('student')
  const [drawerUserId, setDrawerUserId] = useState<string | null>(null)
  const [showImportDialog, setShowImportDialog] = useState(false)
  const [importFile, setImportFile] = useState<File | null>(null)
  const [importPreview, setImportPreview] = useState<any[]>([])
  const PAGE_SIZE = 25

  const { data: users, isLoading, error: usersError } = useQuery({
    queryKey: ['admin-users', roleFilter, statusFilter, page],
    queryFn: async () => {
      let query = supabase
        .from('profiles')
        .select('*', { count: 'exact' })
        .order('created_at', { ascending: false })
        .range((page - 1) * PAGE_SIZE, page * PAGE_SIZE - 1)

      if (roleFilter !== 'all') query = query.eq('role', roleFilter)
      if (statusFilter === 'active') query = query.eq('status', 'active')
      else if (statusFilter === 'inactive') query = query.eq('status', 'inactive')

      const { data, count, error } = await query
      if (error) throw error
      return { data: data ?? [], count: count ?? 0 }
    }
  })

  const changeRoleMutation = useMutation({
    mutationFn: async ({ userId, role }: { userId: string; role: string }) => {
      const { error } = await supabase.functions.invoke('admin/change-user-role', {
        body: { user_id: userId, new_role: role },
      })
      if (error) throw error
    },
    onSuccess: () => { toast.success('Role updated'); qc.invalidateQueries({ queryKey: ['admin-users'] }) },
    onError: (err) => toast.error(err.message),
  })

  const toggleActiveMutation = useMutation({
    mutationFn: async ({ userId, isActive }: { userId: string; isActive: boolean }) => {
      const { error } = await supabase.functions.invoke('admin/deactivate-user', {
        body: { user_id: userId, new_status: isActive ? 'active' : 'inactive' },
      })
      if (error) throw error
    },
    onSuccess: () => { toast.success('Status updated'); qc.invalidateQueries({ queryKey: ['admin-users'] }) },
    onError: (err) => toast.error(err.message),
  })

  const bulkRoleMutation = useMutation({
    mutationFn: async () => {
      const results = await Promise.allSettled(
        selectedIds.map(userId =>
          supabase.functions.invoke('admin/change-user-role', {
            body: { user_id: userId, new_role: bulkRole },
          })
        )
      )
      const failures = results.filter(r => r.status === 'rejected')
      if (failures.length > 0) throw new Error(`${failures.length} updates failed`)
    },
    onSuccess: () => {
      toast.success(`Updated ${selectedIds.length} users to ${bulkRole}`)
      setSelectedIds([]); setShowRoleDialog(false)
      qc.invalidateQueries({ queryKey: ['admin-users'] })
    },
    onError: (err) => toast.error(err.message),
  })

  const filtered = useMemo(() => {
    if (!users?.data) return []
    return users.data.filter((u: any) =>
      !search || u.full_name?.toLowerCase().includes(search.toLowerCase()) ||
      u.email?.toLowerCase().includes(search.toLowerCase())
    )
  }, [users, search])

  const toggleSelect = (id: string) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id])
  }

  const handleFileSelect = (file: File) => {
    setImportFile(file)
    const reader = new FileReader()
    reader.onload = (e) => {
      const text = e.target?.result as string
      const lines = text.split('\n').filter(l => l.trim())
      if (lines.length < 2) { toast.error('CSV must have a header row and at least one data row'); return }
      const headers = lines[0].split(',').map(h => h.trim().toLowerCase().replace(/^"|"$/g, ''))
      const rows = lines.slice(1).map(line => {
        const vals = line.split(',').map(v => v.trim().replace(/^"|"$/g, ''))
        const obj: any = {}
        headers.forEach((h, i) => { obj[h === 'name' ? 'full_name' : h] = vals[i] || '' })
        return obj
      })
      setImportPreview(rows)
    }
    reader.readAsText(file)
  }

  const exportCSV = () => {
    const data = filtered.length > 0 ? filtered : (users?.data || [])
    const headers = ['Name', 'Email', 'Role', 'Status', 'Joined']
    const rows = data.map((u: any) => [u.full_name, u.email, u.role, u.status === 'active' ? 'Active' : 'Inactive', format(new Date(u.created_at), 'yyyy-MM-dd')])
    const csv = [headers, ...rows].map(r => r.map(c => `"${c.replace(/"/g, '""')}"`).join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url; a.download = `users-export-${format(new Date(), 'yyyy-MM-dd')}.csv`
    a.click()
    URL.revokeObjectURL(url)
    toast.success('Users exported')
  }

  const pageCount = Math.ceil((users?.count || 0) / PAGE_SIZE)

  return (
    <div className="space-y-6">
      <PageHeader
        title="Users"
        description="Manage platform users"
        actions={
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={exportCSV}><Download className="w-4 h-4 mr-1" /> Export</Button>
            <Button variant="outline" size="sm" onClick={() => { setImportFile(null); setImportPreview([]); setShowImportDialog(true) }}><Upload className="w-4 h-4 mr-1" /> Import CSV</Button>
            <Link to={ROUTES.ADMIN_NEW_USER}><Button size="sm"><Plus className="w-4 h-4 mr-1" /> Add User</Button></Link>
          </div>
        }
      />

      <Card>
        <CardContent className="p-4">
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search by name or email..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9 h-9" />
            </div>
            <Select value={roleFilter} onValueChange={(v: string | null) => { if (v) { setRoleFilter(v); setPage(1) } }}>
              <SelectTrigger className="w-[140px] h-9"><SelectValue placeholder="All Roles" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Roles</SelectItem>
                <SelectItem value="student">Student</SelectItem>
                <SelectItem value="instructor">Instructor</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={(v: string | null) => { if (v) { setStatusFilter(v); setPage(1) } }}>
              <SelectTrigger className="w-[140px] h-9"><SelectValue placeholder="All Status" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
            <span className="text-sm text-muted-foreground whitespace-nowrap">
              {users?.count || 0} users
            </span>
          </div>
        </CardContent>
      </Card>

      {selectedIds.length > 0 && (
        <Card className="border-primary">
          <CardContent className="p-3 flex items-center justify-between">
            <span className="text-sm font-medium">{selectedIds.length} user(s) selected</span>
            <div className="flex gap-2">
              <Button size="sm" variant="outline" onClick={() => setShowRoleDialog(true)}>
                <Shield className="w-3 h-3 mr-1" /> Bulk Assign Role
              </Button>
              <Button size="sm" variant="outline" onClick={() => setSelectedIds([])}>Clear</Button>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardContent className="p-0">
          {usersError ? (
            <div className="p-6 text-center text-destructive">Failed to load users. Please try again.</div>
          ) : isLoading ? (
            <div className="p-6 space-y-3">
              {Array(8).fill(0).map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-10">
                    <input type="checkbox" className="rounded" onChange={e => {
                      if (e.target.checked) setSelectedIds(filtered.map((u: any) => u.id))
                      else setSelectedIds([])
                    }} checked={selectedIds.length === filtered.length && filtered.length > 0} />
                  </TableHead>
                  <TableHead>User</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Joined</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((user: any) => (
                  <TableRow key={user.id} className={selectedIds.includes(user.id) ? 'bg-muted/50' : ''}>
                    <TableCell>
                      <input type="checkbox" className="rounded" checked={selectedIds.includes(user.id)} onChange={() => toggleSelect(user.id)} />
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={user.avatar_url || undefined} />
                          <AvatarFallback className="text-xs">{user.full_name?.[0] || '?'}</AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="text-sm font-medium">{user.full_name}</div>
                          <div className="text-xs text-muted-foreground">{user.email}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={user.role === 'admin' ? 'default' : user.role === 'instructor' ? 'secondary' : 'outline'}>{user.role}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={user.status === 'active' ? 'default' : 'destructive'}>{user.status === 'active' ? 'Active' : 'Inactive'}</Badge>
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {format(new Date(user.created_at), 'MMM d, yyyy')}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Button size="sm" variant="ghost" className="h-8 px-2" onClick={() => setDrawerUserId(user.id)}><UserCog className="w-4 h-4" /></Button>
                        <select
                          className="h-8 text-xs rounded border border-input bg-background px-2"
                          value={user.role}
                          onChange={e => changeRoleMutation.mutate({ userId: user.id, role: e.target.value })}
                        >
                          <option value="student">Student</option>
                          <option value="instructor">Instructor</option>
                          <option value="admin">Admin</option>
                        </select>
                        <Button
                          size="sm" variant="ghost" className="h-8 px-2"
                          onClick={() => toggleActiveMutation.mutate({ userId: user.id, isActive: user.status !== 'active' })}
                        >
                          {user.status === 'active' ? <Ban className="w-4 h-4 text-red-500" /> : <CheckCircle className="w-4 h-4 text-green-500" />}
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {filtered.length === 0 && (
                  <TableRow><TableCell colSpan={6} className="text-center py-12 text-muted-foreground">No users found</TableCell></TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {pageCount > 1 && (
        <div className="flex items-center justify-center gap-2">
          <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage(p => p - 1)}>Previous</Button>
          <span className="text-sm text-muted-foreground">Page {page} of {pageCount}</span>
          <Button variant="outline" size="sm" disabled={page >= pageCount} onClick={() => setPage(p => p + 1)}>Next</Button>
        </div>
      )}

      <Dialog open={showRoleDialog} onOpenChange={setShowRoleDialog}>
        <DialogContent>
          <DialogHeader><DialogTitle>Bulk Assign Role</DialogTitle><DialogDescription>Change role for {selectedIds.length} selected users</DialogDescription></DialogHeader>
          <Select value={bulkRole} onValueChange={(v: string | null) => v && setBulkRole(v)}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="student">Student</SelectItem>
              <SelectItem value="instructor">Instructor</SelectItem>
              <SelectItem value="admin">Admin</SelectItem>
            </SelectContent>
          </Select>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowRoleDialog(false)}>Cancel</Button>
            <Button onClick={() => bulkRoleMutation.mutate()} disabled={bulkRoleMutation.isPending}>Update All</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showImportDialog} onOpenChange={setShowImportDialog}>
        <DialogContent className="max-w-xl">
          <DialogHeader><DialogTitle>Import Users (CSV)</DialogTitle><DialogDescription>Upload a CSV file with columns: name, email, role, password (optional)</DialogDescription></DialogHeader>
          <div className="space-y-4">
            <div className="border-2 border-dashed rounded-lg p-8 text-center cursor-pointer hover:bg-muted/30 transition-colors"
              onClick={() => document.getElementById('csv-upload')?.click()}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault()
                const file = e.dataTransfer.files[0]
                if (file) handleFileSelect(file)
              }}
            >
              <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">Drop CSV file here or click to browse</p>
              <input id="csv-upload" type="file" accept=".csv" className="hidden" onChange={(e) => e.target.files?.[0] && setImportFile(e.target.files[0])} />
            </div>
            {importPreview.length > 0 && (
              <div className="space-y-2">
                <p className="text-sm font-medium">Preview ({importPreview.length} rows)</p>
                <div className="overflow-x-auto border rounded-md text-xs">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-muted/50">
                        <th className="px-3 py-2 text-left">Name</th>
                        <th className="px-3 py-2 text-left">Email</th>
                        <th className="px-3 py-2 text-left">Role</th>
                      </tr>
                    </thead>
                    <tbody>
                      {importPreview.slice(0, 5).map((row: any, i: number) => (
                        <tr key={i} className="border-t">
                          <td className="px-3 py-2">{row.name}</td>
                          <td className="px-3 py-2">{row.email}</td>
                          <td className="px-3 py-2">{row.role}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {importPreview.length > 5 && <p className="px-3 py-1 text-xs text-muted-foreground border-t">... and {importPreview.length - 5} more rows</p>}
                </div>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowImportDialog(false)}>Cancel</Button>
            <Button disabled={!importPreview.length} onClick={async () => {
              try {
                const { error } = await supabase.functions.invoke('admin/bulk-import-users', { body: { users: importPreview } })
                if (error) throw error
                toast.success(`Imported ${importPreview.length} users`)
                setShowImportDialog(false)
                qc.invalidateQueries({ queryKey: ['admin-users'] })
              } catch (err: any) {
                toast.error(err.message || 'Import failed')
              }
            }}>Import Users</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <UserDetailDrawer open={!!drawerUserId} onOpenChange={(open) => { if (!open) setDrawerUserId(null) }} userId={drawerUserId} />
    </div>
  )
}
