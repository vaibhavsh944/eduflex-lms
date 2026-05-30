import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/store/authStore'
import { toast } from 'sonner'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'

const groupSchema = z.object({
  name: z.string().min(3, 'Name must be at least 3 characters').max(60, 'Name must be under 60 characters'),
  description: z.string().max(200, 'Description must be under 200 characters').optional().or(z.literal('')),
  visibility: z.enum(['open', 'invite_only']),
})

type GroupForm = z.infer<typeof groupSchema>

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  courseId: string
}

export function CreateGroupDialog({ open, onOpenChange, courseId }: Props) {
  const user = useAuthStore((s) => s.user)
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { register, handleSubmit, watch, setValue, formState: { errors }, reset } = useForm<GroupForm>({
    resolver: zodResolver(groupSchema),
    defaultValues: { name: '', description: '', visibility: 'open' },
  })

  const { mutate, isPending } = useMutation({
    mutationFn: async (data: GroupForm) => {
      if (!user) throw new Error('Not authenticated')
      const { data: group, error } = await supabase
        .from('study_groups')
        .insert({
          course_id: courseId,
          name: data.name,
          description: data.description || null,
          created_by: user.id,
          visibility: data.visibility,
          max_members: 50,
        })
        .select()
        .single()
      if (error) throw error

      const { error: memberError } = await supabase
        .from('study_group_members')
        .insert({ group_id: group.id, user_id: user.id, role: 'owner' })
      if (memberError) throw memberError

      return group
    },
    onSuccess: (group) => {
      queryClient.invalidateQueries({ queryKey: ['study-groups', courseId] })
      toast.success('Study group created!')
      reset()
      onOpenChange(false)
      navigate(`/learn/${courseId}/study-groups/${group.id}`)
    },
    onError: (err) => {
      toast.error(err instanceof Error ? err.message : 'Failed to create group')
    },
  })

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Create Study Group</DialogTitle>
          <DialogDescription>Collaborate with classmates on this course.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit((data) => mutate(data))} className="space-y-4">
          <div>
            <Label htmlFor="name">Group Name</Label>
            <Input id="name" placeholder="e.g. Python Study Squad" {...register('name')} />
            {errors.name && <p className="text-sm text-destructive mt-1">{errors.name.message}</p>}
          </div>

          <div>
            <Label>Visibility</Label>
            <RadioGroup value={watch('visibility') || 'open'} onValueChange={(v) => setValue('visibility', v as 'open' | 'invite_only')} className="flex gap-4 mt-2">
              <div className="flex items-center gap-2">
                <RadioGroupItem value="open" id="open" />
                <Label htmlFor="open">Open</Label>
              </div>
              <div className="flex items-center gap-2">
                <RadioGroupItem value="invite_only" id="invite_only" />
                <Label htmlFor="invite_only">Invite-only</Label>
              </div>
            </RadioGroup>
          </div>

          <div>
            <Label htmlFor="description">Description (optional)</Label>
            <Textarea id="description" placeholder="What will your group focus on?" {...register('description')} />
            {errors.description && <p className="text-sm text-destructive mt-1">{errors.description.message}</p>}
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="submit" disabled={isPending}>{isPending ? 'Creating...' : 'Create Group'}</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
