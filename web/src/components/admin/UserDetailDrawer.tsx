import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { X, Mail, Calendar, Shield, BookOpen, Activity } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Skeleton } from '@/components/ui/skeleton';
import { format } from 'date-fns';

interface UserDetailDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userId: string | null;
}

export function UserDetailDrawer({ open, onOpenChange, userId }: UserDetailDrawerProps) {
  const { data: user, isLoading } = useQuery({
    queryKey: ['admin-user-detail', userId],
    queryFn: async () => {
      if (!userId) return null;
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: open && !!userId,
  });

  const { data: enrollments } = useQuery({
    queryKey: ['admin-user-enrollments', userId],
    queryFn: async () => {
      if (!userId) return [];
      const { data } = await supabase
        .from('enrollments')
        .select('*, course:courses(title)')
        .eq('user_id', userId);
      return data ?? [];
    },
    enabled: open && !!userId,
  });

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
        <SheetHeader>
          <SheetTitle>User Details</SheetTitle>
        </SheetHeader>

        {isLoading ? (
          <div className="space-y-4 py-6">
            <div className="flex items-center gap-3">
              <Skeleton className="h-12 w-12 rounded-full" />
              <div className="space-y-2">
                <Skeleton className="h-5 w-32" />
                <Skeleton className="h-3 w-24" />
              </div>
            </div>
            <Skeleton className="h-32 w-full" />
          </div>
        ) : user ? (
          <div className="py-6 space-y-6">
            <div className="flex items-center gap-4">
              <Avatar className="h-12 w-12">
                <AvatarImage src={user.avatar_url || undefined} />
                <AvatarFallback>{user.full_name?.substring(0, 2).toUpperCase()}</AvatarFallback>
              </Avatar>
              <div>
                <h3 className="font-semibold text-lg">{user.full_name}</h3>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Mail className="h-3 w-3" /> {user.email}
                </div>
              </div>
              <div className="ml-auto flex gap-2">
                <Badge variant={user.role === 'admin' ? 'destructive' : user.role === 'instructor' ? 'default' : 'secondary'}>{user.role}</Badge>
                <Badge variant={user.status === 'active' ? 'default' : 'outline'}>{user.status === 'active' ? 'Active' : 'Inactive'}</Badge>
              </div>
            </div>

            <Tabs defaultValue="overview">
              <TabsList>
                <TabsTrigger value="overview"><Shield className="h-4 w-4 mr-1" /> Overview</TabsTrigger>
                <TabsTrigger value="enrollments"><BookOpen className="h-4 w-4 mr-1" /> Enrollments</TabsTrigger>
                <TabsTrigger value="activity"><Activity className="h-4 w-4 mr-1" /> Activity</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-3 mt-4">
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <span className="text-muted-foreground">Joined</span>
                    <p className="font-medium">{format(new Date(user.created_at), 'MMM d, yyyy')}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Department</span>
                    <p className="font-medium">{user.department_id || '—'}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Bio</span>
                    <p className="font-medium text-xs">{user.bio || 'No bio'}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Updated</span>
                    <p className="font-medium">{format(new Date(user.updated_at), 'MMM d, yyyy')}</p>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="enrollments" className="mt-4">
                {!enrollments?.length ? (
                  <p className="text-sm text-muted-foreground">No enrollments found</p>
                ) : (
                  <div className="space-y-2">
                    {enrollments.map((e: any) => (
                      <div key={e.id} className="flex items-center justify-between border rounded-lg px-3 py-2 text-sm">
                        <span>{e.course?.title || 'Unknown Course'}</span>
                        <Badge variant="outline">{e.status}</Badge>
                      </div>
                    ))}
                  </div>
                )}
              </TabsContent>

              <TabsContent value="activity" className="mt-4">
                <p className="text-sm text-muted-foreground">Activity log coming soon</p>
              </TabsContent>
            </Tabs>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground py-6">User not found</p>
        )}
      </SheetContent>
    </Sheet>
  );
}
