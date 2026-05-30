import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/store/authStore'
import type { StudyGroup, StudyGroupMember } from '@/lib/types'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Separator } from '@/components/ui/separator'
import { CreateGroupDialog } from '@/components/live/CreateGroupDialog'
import { ErrorState } from '@/components/common/ErrorState'
import { getInitials, formatRelativeTime } from '@/lib/utils'
import { toast } from 'sonner'
import { Users, Lock, Globe, Plus, UserPlus } from 'lucide-react'

interface GroupWithMeta extends StudyGroup {
  members: Pick<StudyGroupMember, 'user_id' | 'role' | 'profile'>[]
  member_count: number
  last_activity: string | undefined
}

export default function StudyGroupsListPage() {
  const { courseId } = useParams<{ courseId: string }>()
  const navigate = useNavigate()
  const user = useAuthStore((s) => s.user)
  const queryClient = useQueryClient()
  const [dialogOpen, setDialogOpen] = useState(false)

  const joinGroup = async (groupId: string) => {
    if (!user) return
    const { error } = await supabase.from('study_group_members').insert({ group_id: groupId, user_id: user.id })
    if (error) { toast.error('Failed to join group'); return }
    queryClient.invalidateQueries({ queryKey: ['study-groups', courseId] })
    toast.success('Joined group!')
  }

  const { data: groups, isLoading, error } = useQuery({
    queryKey: ['study-groups', courseId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('study_groups')
        .select(`
          *,
          members:study_group_members(
            user_id,
            role,
            profile:profiles!user_id(id, full_name, avatar_url)
          )
        `)
        .eq('course_id', courseId)
        .order('created_at', { ascending: false })
      if (error) throw error
      return data
    },
    enabled: !!courseId,
  })

  if (isLoading) {
    return (
      <div className="p-6 space-y-8">
        <div className="flex items-center justify-between">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-10 w-36" />
        </div>
        <div className="space-y-4">
          <Skeleton className="h-6 w-24" />
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <Card key={i}>
                <CardHeader><Skeleton className="h-6 w-3/4" /></CardHeader>
                <CardContent>
                  <Skeleton className="h-4 w-full mb-2" />
                  <div className="flex gap-1">
                    <Skeleton className="h-8 w-8 rounded-full" />
                    <Skeleton className="h-8 w-8 rounded-full" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (error) return <ErrorState title="Failed to load study groups" />

  const myGroups = groups?.filter((g) =>
    g.members.some((m) => m.user_id === user?.id)
  ) ?? []

  const openGroups = groups?.filter((g) =>
    g.visibility === 'open' && !g.members.some((m) => m.user_id === user?.id)
  ) ?? []

  return (
    <div className="p-6 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Study Groups</h1>
          <p className="text-muted-foreground text-sm mt-1">Collaborate with classmates</p>
        </div>
        <Button onClick={() => setDialogOpen(true)} className="gap-2">
          <Plus className="h-4 w-4" />
          Create Group
        </Button>
      </div>

      {myGroups.length > 0 && (
        <section>
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Users className="h-5 w-5 text-primary" />
            My Groups
          </h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {myGroups.map((group) => (
              <GroupCard key={group.id} group={group} isMember onOpen={() => navigate(`/learn/${courseId}/study-groups/${group.id}`)} />
            ))}
          </div>
        </section>
      )}

      <Separator />

      <section>
        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Globe className="h-5 w-5 text-primary" />
          Open Groups
        </h2>
        {openGroups.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-8 text-center">
            <Users className="h-10 w-10 text-muted-foreground mb-3" />
            <h3 className="text-lg font-semibold">You haven't joined any study groups yet</h3>
            <p className="text-sm text-muted-foreground mt-1">Create one or look for open groups to collaborate.</p>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {openGroups.map((group) => (
              <GroupCard key={group.id} group={group} onJoin={() => joinGroup(group.id)} />
            ))}
          </div>
        )}
      </section>

      <CreateGroupDialog open={dialogOpen} onOpenChange={setDialogOpen} courseId={courseId!} />
    </div>
  )
}

function GroupCard({ group, isMember, onOpen, onJoin }: {
  group: GroupWithMeta
  isMember?: boolean
  onOpen?: () => void
  onJoin?: () => void
}) {
  const memberAvatars = group.members.slice(0, 5)

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">{group.name}</CardTitle>
          <Badge variant={group.visibility === 'open' ? 'secondary' : 'outline'} className="gap-1">
            {group.visibility === 'open' ? <Globe className="h-3 w-3" /> : <Lock className="h-3 w-3" />}
            {group.visibility === 'open' ? 'Open' : 'Invite-only'}
          </Badge>
        </div>
        {group.description && (
          <p className="text-sm text-muted-foreground line-clamp-2">{group.description}</p>
        )}
      </CardHeader>
      <CardContent className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex -space-x-2">
            {memberAvatars.map((m) => (
              <Avatar key={m.user_id} className="h-8 w-8 border-2 border-background">
                <AvatarImage src={m.profile?.avatar_url ?? undefined} />
                <AvatarFallback className="text-xs">{getInitials(m.profile?.full_name ?? '?')}</AvatarFallback>
              </Avatar>
            ))}
            {group.member_count > 5 && (
              <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center text-xs text-muted-foreground border-2 border-background">
                +{group.member_count - 5}
              </div>
            )}
          </div>
          <span className="text-xs text-muted-foreground">{group.member_count} member{group.member_count !== 1 ? 's' : ''}</span>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between pt-0">
        {group.last_activity && (
          <span className="text-xs text-muted-foreground">Last active {formatRelativeTime(group.last_activity)}</span>
        )}
        <div className="ml-auto">
          {isMember ? (
            <Button size="sm" onClick={onOpen}>Open</Button>
          ) : (
            <Button size="sm" variant="outline" onClick={onJoin} className="gap-1">
              <UserPlus className="h-3 w-3" />
              Join
            </Button>
          )}
        </div>
      </CardFooter>
    </Card>
  )
}
