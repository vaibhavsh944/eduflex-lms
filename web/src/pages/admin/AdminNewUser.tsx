import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { useNavigate } from 'react-router-dom'
import { PageHeader } from '@/components/common/PageHeader'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'
import { ROUTES } from '@/lib/constants'
import { toast } from 'sonner'
import { UserPlus, Loader2, ArrowLeft } from 'lucide-react'
import { Link } from 'react-router-dom'

export function AdminNewUser() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [form, setForm] = useState({
    full_name: '',
    email: '',
    password: '',
    role: 'student',
    department: '',
    bio: '',
    send_welcome: true,
  })
  const [errors, setErrors] = useState<Record<string, string>>({})

  const validate = () => {
    const errs: Record<string, string> = {}
    if (!form.full_name.trim()) errs.full_name = 'Name is required'
    if (form.full_name.trim().length < 2) errs.full_name = 'Name must be at least 2 characters'
    if (!form.email.trim()) errs.email = 'Email is required'
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errs.email = 'Invalid email format'
    if (!form.password) errs.password = 'Password is required'
    if (form.password.length < 8) errs.password = 'Password must be at least 8 characters'
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  const createMutation = useMutation({
    mutationFn: async () => {
      const { data, error } = await supabase.functions.invoke('admin-create-user', {
        body: {
          email: form.email,
          password: form.password,
          full_name: form.full_name,
          role: form.role,
          department: form.department || null,
          bio: form.bio || null,
          send_welcome: form.send_welcome,
        },
      })
      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] })
      toast.success(`User ${form.full_name} created successfully`)
      navigate(ROUTES.ADMIN_USERS)
    },
    onError: (err: any) => toast.error(err.message || 'Failed to create user'),
  })

  const updateField = (key: string, value: string | boolean) => {
    setForm(prev => ({ ...prev, [key]: value }))
    if (typeof value === 'string' && errors[key]) setErrors(prev => ({ ...prev, [key]: '' }))
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <PageHeader
        title="Add New User"
        description="Create a new user account"
        actions={
          <Link to={ROUTES.ADMIN_USERS}>
            <Button variant="outline" size="sm"><ArrowLeft className="w-4 h-4 mr-1" /> Back</Button>
          </Link>
        }
      />
      <Card>
        <CardHeader><CardTitle className="text-lg flex items-center gap-2"><UserPlus className="w-4 h-4" /> User Details</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="name">Full Name <span className="text-red-500">*</span></Label>
            <Input id="name" value={form.full_name} onChange={e => updateField('full_name', e.target.value)} placeholder="Enter full name" className={errors.full_name ? 'border-red-500' : ''} />
            {errors.full_name && <p className="text-xs text-red-500 mt-1">{errors.full_name}</p>}
          </div>
          <div>
            <Label htmlFor="email">Email <span className="text-red-500">*</span></Label>
            <Input id="email" type="email" value={form.email} onChange={e => updateField('email', e.target.value)} placeholder="email@example.com" className={errors.email ? 'border-red-500' : ''} />
            {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email}</p>}
          </div>
          <div>
            <Label htmlFor="password">Password <span className="text-red-500">*</span></Label>
            <Input id="password" type="password" value={form.password} onChange={e => updateField('password', e.target.value)} placeholder="Min 8 characters" className={errors.password ? 'border-red-500' : ''} />
            {errors.password && <p className="text-xs text-red-500 mt-1">{errors.password}</p>}
          </div>
          <div>
            <Label>Role</Label>
            <Select value={form.role} onValueChange={(v: string | null) => v && updateField('role', v)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="student">Student</SelectItem>
                <SelectItem value="instructor">Instructor</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Department</Label>
            <Input value={form.department} onChange={e => updateField('department', e.target.value)} placeholder="e.g. Engineering, Design" />
          </div>
          <div>
            <Label>Bio</Label>
            <Textarea value={form.bio} onChange={e => updateField('bio', e.target.value)} placeholder="Short biography" className="min-h-[80px]" />
          </div>
          <div className="flex items-center justify-between py-2">
            <div>
              <div className="text-sm font-medium">Send Welcome Email</div>
              <div className="text-xs text-muted-foreground">Notify the user about their new account</div>
            </div>
            <Switch checked={form.send_welcome} onCheckedChange={(v) => updateField('send_welcome', v)} />
          </div>
          <Button
            className="w-full"
            onClick={() => { if (validate()) createMutation.mutate() }}
            disabled={createMutation.isPending}
          >
            {createMutation.isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <UserPlus className="w-4 h-4 mr-2" />}
            {createMutation.isPending ? 'Creating...' : 'Create User'}
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
