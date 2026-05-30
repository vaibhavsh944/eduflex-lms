import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/store/authStore'
import { useNavigate } from 'react-router-dom'
import { useStartThread } from '@/hooks/queries/useMessages'
import type { MentorshipPair, Profile } from '@/lib/types'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Skeleton } from '@/components/ui/skeleton'
import { ErrorState } from '@/components/common/ErrorState'
import { PageHeader } from '@/components/common/PageHeader'
import { EmptyState } from '@/components/common/EmptyState'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { MentorCard } from '@/components/live/MentorCard'
import { getInitials } from '@/lib/utils'
import { UserPlus, CheckCircle, XCircle, MessageSquare, Search } from 'lucide-react'

export function MentorshipPage() {
  const user = useAuthStore((s) => s.user)
  const queryClient = useQueryClient()
  const navigate = useNavigate()
  const { mutate: startThread } = useStartThread()
  const [view, setView] = useState<'mentee' | 'mentor'>(user?.role === 'instructor' ? 'mentor' : 'mentee')

  const { data: myMentorPairs, isLoading: mentorLoading, error: mentorError } = useQuery({
    queryKey: ['mentorship', user?.id],
    queryFn: async () => {
      const [asMentee, asMentor] = await Promise.all([
        supabase
          .from('mentorship_pairs')
          .select('*, mentor:profiles!mentor_id(id, full_name, avatar_url)')
          .eq('mentee_id', user!.id)
          .order('matched_at', { ascending: false }),
        supabase
          .from('mentorship_pairs')
          .select('*, mentee:profiles!mentee_id(id, full_name, avatar_url)')
          .eq('mentor_id', user!.id)
          .order('matched_at', { ascending: false }),
      ])
      return { asMentee: asMentee.data ?? [], asMentor: asMentor.data ?? [] }
    },
    enabled: !!user,
  })

  const { mutate: acceptRequest } = useMutation({
    mutationFn: async (pairId: string) => {
      const { error } = await supabase
        .from('mentorship_pairs')
        .update({ status: 'active' })
        .eq('id', pairId)
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['mentorship', user?.id] })
      toast.success('Request accepted!')
    },
    onError: () => toast.error('Failed to accept request'),
  })

  const { mutate: declineRequest } = useMutation({
    mutationFn: async (pairId: string) => {
      const { error } = await supabase
        .from('mentorship_pairs')
        .update({ status: 'declined' })
        .eq('id', pairId)
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['mentorship', user?.id] })
      toast.success('Request declined')
    },
    onError: () => toast.error('Failed to decline request'),
  })

  if (mentorLoading) {
    return (
      <div className="max-w-4xl mx-auto pb-12">
        <PageHeader title="Mentorship" description="Connect with mentors and mentees" />
        <div className="grid gap-4 md:grid-cols-2 mt-6">
          {[1, 2].map((i) => (
            <Card key={i}>
              <CardContent className="pt-4">
                <div className="flex items-center gap-3">
                  <Skeleton className="h-12 w-12 rounded-full" />
                  <div className="space-y-1">
                    <Skeleton className="h-5 w-32" />
                    <Skeleton className="h-4 w-24" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  if (mentorError) return <ErrorState title="Failed to load mentorship data" />

  const mentorPairs = myMentorPairs?.asMentee ?? []
  const menteePairs = myMentorPairs?.asMentor ?? []

  const activeMentor = mentorPairs.find((p) => p.status === 'active')
  const activeMentees = menteePairs.filter((p) => p.status === 'active')
  const pendingRequests = menteePairs.filter((p) => p.status === 'pending')

  return (
    <div className="max-w-4xl mx-auto pb-12">
      <div className="flex items-center justify-between mb-6">
        <PageHeader title="Mentorship" description="Connect with mentors and mentees" />
        {view === 'mentee' && !activeMentor && (
          <Button className="gap-2" onClick={() => navigate('/search')}>
            <Search className="h-4 w-4" />
            Find a Mentor
          </Button>
        )}
      </div>

      <Tabs value={view} onValueChange={(v) => setView(v as 'mentee' | 'mentor')}>
        <TabsList>
          <TabsTrigger value="mentee">As Mentee</TabsTrigger>
          <TabsTrigger value="mentor">As Mentor</TabsTrigger>
        </TabsList>

        <TabsContent value="mentee" className="mt-6 space-y-6">
          {activeMentor ? (
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  My Mentor
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={activeMentor.mentor?.avatar_url ?? undefined} />
                      <AvatarFallback>{getInitials(activeMentor.mentor?.full_name ?? '?')}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">{activeMentor.mentor?.full_name}</p>
                      <p className="text-xs text-muted-foreground">Active mentor</p>
                    </div>
                  </div>
                  <Button variant="outline" size="sm" className="gap-2" onClick={() => activeMentor?.mentor?.id && startThread(activeMentor.mentor.id, { onSuccess: (thread) => navigate(`/messages?thread=${thread.id}`) })}>
                    <MessageSquare className="h-4 w-4" />
                    Message
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <EmptyState
              title="No mentor yet"
              description="Find a mentor to guide your learning journey"
              action={{ label: 'Find a Mentor', onClick: () => navigate('/search') }}
            />
          )}

          {mentorPairs.filter((p) => p.status === 'pending').length > 0 && (
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Pending Requests</h3>
              {mentorPairs.filter((p) => p.status === 'pending').map((pair) => (
                <MentorCard
                  key={pair.id}
                  mentor={pair.mentor ?? { id: '', full_name: 'Unknown', avatar_url: null }}
                  status="pending"
                />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="mentor" className="mt-6 space-y-6">
          {pendingRequests.length > 0 && (
            <section>
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">Pending Requests</h3>
              <div className="space-y-3">
                {pendingRequests.map((pair) => (
                  <Card key={pair.id}>
                    <CardContent className="pt-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Avatar className="h-10 w-10">
                            <AvatarImage src={pair.mentee?.avatar_url ?? undefined} />
                            <AvatarFallback>{getInitials(pair.mentee?.full_name ?? '?')}</AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">{pair.mentee?.full_name}</p>
                            <p className="text-xs text-muted-foreground">Wants to be your mentee</p>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline" className="gap-1 text-destructive" onClick={() => declineRequest(pair.id)}>
                            <XCircle className="h-3.5 w-3.5" />
                            Decline
                          </Button>
                          <Button size="sm" className="gap-1" onClick={() => acceptRequest(pair.id)}>
                            <CheckCircle className="h-3.5 w-3.5" />
                            Accept
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </section>
          )}

          <section>
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">Active Mentees</h3>
            {activeMentees.length === 0 ? (
              <EmptyState title="No active mentees" description="Mentees you accept will appear here" />
            ) : (
              <div className="grid gap-4 md:grid-cols-2">
                {activeMentees.map((pair) => (
                  <Card key={pair.id}>
                    <CardContent className="pt-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Avatar className="h-10 w-10">
                            <AvatarImage src={pair.mentee?.avatar_url ?? undefined} />
                            <AvatarFallback>{getInitials(pair.mentee?.full_name ?? '?')}</AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">{pair.mentee?.full_name}</p>
                            <Badge variant="secondary" className="mt-1">Active</Badge>
                          </div>
                        </div>
                        <Button variant="ghost" size="icon" onClick={() => startThread(pair.mentee_id, { onSuccess: (thread: any) => navigate(`/messages?thread=${thread.id}`) })}>
                          <MessageSquare className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </section>
        </TabsContent>
      </Tabs>
    </div>
  )
}
