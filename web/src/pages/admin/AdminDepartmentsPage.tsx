import React, { useState, useCallback } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { PageHeader } from '@/components/common/PageHeader'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription,
} from '@/components/ui/dialog'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'
import {
  DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors,
  type DragEndEvent,
} from '@dnd-kit/core'
import {
  SortableContext, sortableKeyboardCoordinates, useSortable, verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { toast } from 'sonner'
import { Plus, ChevronRight, ChevronDown, FolderTree, GripVertical, Users, GraduationCap, BarChart3 } from 'lucide-react'

interface Department {
  id: string; name: string; parent_id: string | null; head_user_id: string | null; org_id: string
}

function SortableDepartmentRow({ d, depth, hasChildren, isExpanded, onToggle, onSelect, isSelected }: {
  d: Department; depth: number; hasChildren: boolean; isExpanded: boolean
  onToggle: () => void; onSelect: () => void; isSelected: boolean
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: d.id })
  const style = { transform: CSS.Transform.toString(transform), transition, paddingLeft: `${12 + depth * 24}px` }

  return (
    <div
      ref={setNodeRef} style={style}
      className={`flex items-center gap-2 py-2 px-3 rounded cursor-pointer transition-colors ${isDragging ? 'opacity-50 shadow-lg bg-muted' : ''} ${isSelected ? 'bg-primary/10' : 'hover:bg-muted/50'}`}
      onClick={onSelect}
    >
      <button {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing p-0.5 hover:bg-muted-foreground/20 rounded" aria-label="Drag to reorder">
        <GripVertical className="w-3.5 h-3.5 text-muted-foreground" />
      </button>
      <button onClick={(e) => { e.stopPropagation(); onToggle() }} className="p-0.5" aria-label={isExpanded ? 'Collapse' : 'Expand'}>
        {hasChildren ? (isExpanded ? <ChevronDown className="w-4 h-4 text-muted-foreground" /> : <ChevronRight className="w-4 h-4 text-muted-foreground" />) : <div className="w-4" />}
      </button>
      <FolderTree className="w-4 h-4 text-muted-foreground shrink-0" />
      <span className="text-sm flex-1">{d.name}</span>
      {d.head_user_id && <GraduationCap className="w-3 h-3 text-muted-foreground" aria-label="Has department head" />}
    </div>
  )
}

function DepartmentAnalyticsPanel({ department, departments }: { department: Department; departments: Department[] }) {
  const childCount = departments.filter(d => d.parent_id === department.id).length
  const { data: enrollments } = useQuery({
    queryKey: ['dept-analytics', department.id],
    queryFn: async () => {
      const { data } = await supabase
        .from('enrollments')
        .select('id, completed_at, progress_pct')
        .in('course_id', (await supabase.from('courses').select('id').eq('department_id', department.id)).data?.map(c => c.id) || [])
      return data ?? []
    },
    enabled: !!department.id,
  })

  const totalEnrollments = enrollments?.length || 0
  const completed = enrollments?.filter(e => e.completed_at).length || 0
  const completionRate = totalEnrollments > 0 ? Math.round((completed / totalEnrollments) * 100) : 0

  return (
    <Card>
      <CardHeader><CardTitle className="text-sm flex items-center gap-2"><BarChart3 className="w-4 h-4" /> {department.name}</CardTitle></CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div><p className="text-muted-foreground text-xs">Sub-departments</p><p className="font-semibold text-lg">{childCount}</p></div>
          <div><p className="text-muted-foreground text-xs">Enrollments</p><p className="font-semibold text-lg">{totalEnrollments}</p></div>
          <div><p className="text-muted-foreground text-xs">Completed</p><p className="font-semibold text-lg text-green-600">{completed}</p></div>
          <div><p className="text-muted-foreground text-xs">Completion Rate</p><p className="font-semibold text-lg text-blue-600">{completionRate}%</p></div>
        </div>
      </CardContent>
    </Card>
  )
}

export function AdminDepartmentsPage() {
  const queryClient = useQueryClient()
  const [showCreate, setShowCreate] = useState(false)
  const [form, setForm] = useState({ name: '', parent_id: '' })
  const [expanded, setExpanded] = useState<Set<string>>(new Set())
  const [selectedDept, setSelectedDept] = useState<string | null>(null)

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  )

  const { data: departments } = useQuery({
    queryKey: ['departments'],
    queryFn: async () => {
      const { data } = await supabase.from('departments').select('*').order('name')
      return (data ?? [])
    }
  })

  const createMutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from('departments').insert({
        name: form.name,
        parent_id: form.parent_id || null,
      })
      if (error) throw error
    },
    onSuccess: () => {
      toast.success('Department created')
      setShowCreate(false); setForm({ name: '', parent_id: '' })
      queryClient.invalidateQueries({ queryKey: ['departments'] })
    },
    onError: (err) => toast.error(err.message)
  })

  const reorderMutation = useMutation({
    mutationFn: async ({ id, parent_id }: { id: string; parent_id: string | null }) => {
      const { error } = await supabase.from('departments').update({ parent_id }).eq('id', id)
      if (error) throw error
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['departments'] })
  })

  const toggleExpand = (id: string) => {
    const next = new Set(expanded)
    if (next.has(id)) next.delete(id)
    else next.add(id)
    setExpanded(next)
  }

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    if (!over || active.id === over.id) return
    const draggedDept = (departments || []).find(d => d.id === active.id)
    const targetDept = (departments || []).find(d => d.id === over.id)
    if (draggedDept && targetDept) {
      reorderMutation.mutate({ id: draggedDept.id, parent_id: targetDept.parent_id })
    }
  }

  const topLevel = (departments || []).filter(d => !d.parent_id)
  const getChildren = (parentId: string) => (departments || []).filter(d => d.parent_id === parentId)

  const selected = (departments || []).find(d => d.id === selectedDept)

  const renderTree = (items: Department[], depth: number = 0): React.ReactNode => {
    if (items.length === 0) return null
    return (
      <SortableContext items={items.map(d => d.id)} strategy={verticalListSortingStrategy}>
        {items.map(d => {
          const children = getChildren(d.id)
          const hasChildren = children.length > 0
          return (
            <div key={d.id}>
              <SortableDepartmentRow
                d={d} depth={depth} hasChildren={hasChildren}
                isExpanded={expanded.has(d.id)} isSelected={selectedDept === d.id}
                onToggle={() => toggleExpand(d.id)}
                onSelect={() => setSelectedDept(selectedDept === d.id ? null : d.id)}
              />
              {hasChildren && expanded.has(d.id) && renderTree(children, depth + 1)}
            </div>
          )
        })}
      </SortableContext>
    )
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Departments" description="Manage academic department hierarchy" />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg">Department Tree</CardTitle>
              <Button onClick={() => setShowCreate(true)}><Plus className="w-4 h-4 mr-1" /> Add Department</Button>
            </CardHeader>
            <CardContent>
              {topLevel.length > 0 ? (
                <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                  {renderTree(topLevel)}
                </DndContext>
              ) : (
                <p className="text-center py-8 text-muted-foreground">No departments created yet</p>
              )}
            </CardContent>
          </Card>
        </div>

        <div>
          {selected && departments ? (
            <DepartmentAnalyticsPanel department={selected} departments={departments} />
          ) : (
            <Card><CardContent className="py-12 text-center text-muted-foreground"><BarChart3 className="w-8 h-8 mx-auto mb-2 opacity-50" /><p className="text-sm">Select a department to view analytics</p></CardContent></Card>
          )}
        </div>
      </div>

      <Dialog open={showCreate} onOpenChange={setShowCreate}>
        <DialogContent>
          <DialogHeader><DialogTitle>Add Department</DialogTitle><DialogDescription>Create a new department</DialogDescription></DialogHeader>
          <div className="space-y-4">
            <div><Label>Name</Label><Input placeholder="Computer Science" value={form.name} onChange={(e) => setForm(f => ({ ...f, name: e.target.value }))} /></div>
            <div><Label>Head Instructor</Label>
              <Select value={form.parent_id} onValueChange={(v: any) => setForm(f => ({ ...f, parent_id: v }))}>
                <SelectTrigger><SelectValue placeholder="Select parent (optional)" /></SelectTrigger>
                <SelectContent>
                  {(departments || []).map((d) => (
                    <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div><Label>Parent Department</Label>
              <Select value={form.parent_id} onValueChange={(v: any) => setForm(f => ({ ...f, parent_id: v }))}>
                <SelectTrigger><SelectValue placeholder="None (top level)" /></SelectTrigger>
                <SelectContent>
                  {(departments || []).map((d) => (
                    <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreate(false)}>Cancel</Button>
            <Button onClick={() => createMutation.mutate()} disabled={!form.name}>Create</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
