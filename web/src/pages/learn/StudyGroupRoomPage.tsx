import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/store/authStore'
import type { StudyGroup, StudyGroupMember } from '@/lib/types'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { ErrorState } from '@/components/common/ErrorState'
import { Skeleton } from '@/components/ui/skeleton'
import { GroupChatPanel } from '@/components/live/GroupChatPanel'
import { GroupDocPanel } from '@/components/live/GroupDocPanel'
import { getInitials } from '@/lib/utils'
import { ArrowLeft, MoreVertical, LogOut, Trash2, UserPlus, MessageSquare, FileText } from 'lucide-react'

interface GroupWithDetails extends StudyGroup {
  members: (StudyGroupMember & { profile?: { id: string; full_name: string; avatar_url: string | null } | null })[]
}

export default function StudyGroupRoomPage() {
  const { courseId, groupId } = useParams<{ courseId: string; groupId: string }>()
  const navigate = useNavigate()
  const user = useAuthStore((s) => s.user)
  const queryClient = useQueryClient()
  const [activeTab, setActiveTab] = useState('chat')

  const { data: group, isLoading, error } = useQuery({
    queryKey: ['study-group', groupId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('study_groups')
        .select(`
          *,
          members:study_group_members(
            user_id,
            role,
            joined_at,
            profile:profiles!user_id(id, full_name, avatar_url)
          )
        `)
        .eq('id', groupId)
        .single()
      if (error) throw error
      return data
    },
    enabled: !!groupId,
  })

  const currentMember = group?.members.find((m) => m.user_id === user?.id)
  const isOwner = currentMember?.role === 'owner'

  const { mutate: leaveGroup } = useMutation({
    mutationFn: async () => {
      const { error } = await supabase
        .from('study_group_members')
        .delete()
        .eq('group_id', groupId)
        .eq('user_id', user?.id)
      if (error) throw error
    },
    onSuccess: () => {
      toast.success('Left the study group')
      queryClient.invalidateQueries({ queryKey: ['study-groups', courseId] })
      navigate(`/learn/${courseId}/study-groups`)
    },
    onError: () => toast.error('Failed to leave group'),
  })

  const { mutate: deleteGroup } = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from('study_groups').delete().eq('id', groupId)
      if (error) throw error
    },
    onSuccess: () => {
      toast.success('Group deleted')
      queryClient.invalidateQueries({ queryKey: ['study-groups', courseId] })
      navigate(`/learn/${courseId}/study-groups`)
    },
    onError: () => toast.error('Failed to delete group'),
  })

  if (isLoading) {
    return (
      <div className="flex h-full">
        <div className="w-[360px] border-r p-4 space-y-4 shrink-0">
          <Skeleton className="h-6 w-3/4" />
          <Skeleton className="h-10 w-full" />
          <div className="space-y-2">
            {[1, 2, 3].map((i) => <Skeleton key={i} className="h-12 w-full" />)}
          </div>
        </div>
        <div className="flex-1 p-4"><Skeleton className="h-full w-full" /></div>
      </div>
    )
  }

  if (error || !group) return <ErrorState title="Couldn't load study group" />

  return (
    <div className="flex h-[calc(100vh-4rem)]">
      {/* Left Panel */}
      <div className="w-[360px] border-r shrink-0 flex flex-col bg-muted/10">
        <div className="p-4 border-b">
          <div className="flex items-center gap-2 mb-2">
            <Button variant="ghost" size="icon" onClick={() => navigate(`/learn/${courseId}/study-groups`)}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <h2 className="font-semibold text-lg truncate">{group.name}</h2>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="ml-auto">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {isOwner && (
                  <DropdownMenuItem className="text-destructive gap-2" onClick={() => deleteGroup()}>
                    <Trash2 className="h-4 w-4" /> Delete Group
                  </DropdownMenuItem>
                )}
                {!isOwner && (
                  <DropdownMenuItem className="text-destructive gap-2" onClick={() => leaveGroup()}>
                    <LogOut className="h-4 w-4" /> Leave Group
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          {group.description && (
            <p className="text-sm text-muted-foreground">{group.description}</p>
          )}
          <div className="flex items-center gap-2 mt-2">
            <Badge variant="secondary">{group.members.length} members</Badge>
            <Badge variant="outline">{group.visibility === 'open' ? 'Open' : 'Invite-only'}</Badge>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Members</h3>
            <Button variant="ghost" size="icon" className="h-7 w-7">
              <UserPlus className="h-4 w-4" />
            </Button>
          </div>
          <div className="space-y-2">
            {group.members.map((member) => (
              <div key={member.user_id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50">
                <div className="relative">
                  <Avatar className="h-9 w-9">
                    <AvatarImage src={member.profile?.avatar_url ?? undefined} />
                    <AvatarFallback>{getInitials(member.profile?.full_name ?? '?')}</AvatarFallback>
                  </Avatar>
                  <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full bg-green-500 ring-2 ring-background" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{member.profile?.full_name ?? 'Unknown'}</p>
                  <p className="text-xs text-muted-foreground capitalize">{member.role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right Panel */}
      <div className="flex-1 flex flex-col min-w-0">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
          <div className="border-b px-4">
            <TabsList>
              <TabsTrigger value="chat" className="gap-2">
                <MessageSquare className="h-4 w-4" />
                Chat
              </TabsTrigger>
              <TabsTrigger value="doc" className="gap-2">
                <FileText className="h-4 w-4" />
                Shared Document
              </TabsTrigger>
            </TabsList>
          </div>
          <TabsContent value="chat" className="flex-1 flex flex-col m-0">
            <GroupChatPanel groupId={groupId!} />
          </TabsContent>
          <TabsContent value="doc" className="flex-1 m-0">
            <GroupDocPanel groupId={groupId!} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
