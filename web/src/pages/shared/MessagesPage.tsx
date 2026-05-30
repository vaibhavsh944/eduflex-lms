import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { PageHeader } from '@/components/common/PageHeader';
import { ThreadList } from '@/components/messages/ThreadList';
import { MessageThreadView } from '@/components/messages/MessageThread';
import { EmptyThreadState } from '@/components/messages/EmptyThreadState';
import { useMessageThreads, useStartThread } from '@/hooks/queries/useMessages';
import { useMessageStore } from '@/store/messageStore';
import { useMobile } from '@/hooks/useMediaQuery';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { SEO } from '@/components/shared/SEO';
import { Plus, Loader2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/store/authStore';
import { toast } from 'sonner';

export function MessagesPage() {
  const user = useAuthStore(s => s.user);
  const { threadId } = useParams();
  const navigate = useNavigate();
  const isMobile = useMobile();
  const [showNewMessage, setShowNewMessage] = useState(false);
  const [searchUser, setSearchUser] = useState('');
  const [foundUsers, setFoundUsers] = useState<{ id: string; full_name: string; avatar_url: string | null }[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  
  const { data: threads } = useMessageThreads();
  const { mutate: createThread, isPending: isCreating } = useStartThread();
  const activeThreadId = useMessageStore(state => state.activeThreadId);
  const setActiveThread = useMessageStore(state => state.setActiveThread);

  // Search users for new conversation
  useEffect(() => {
    if (!searchUser.trim()) { setFoundUsers([]); return }
    const timer = setTimeout(async () => {
      const { data } = await supabase.from('profiles').select('id, full_name, avatar_url').ilike('full_name', `%${searchUser}%`).limit(10)
      setFoundUsers(data ?? [])
    }, 300)
    return () => clearTimeout(timer)
  }, [searchUser])

  const startConversation = () => {
    if (!user || !selectedUserId) return
    createThread(selectedUserId, {
      onSuccess: (thread) => {
        setShowNewMessage(false)
        setSearchUser('')
        setFoundUsers([])
        setSelectedUserId(null)
        setActiveThread(thread.id)
        navigate(`/messages/${thread.id}`)
      },
      onError: () => {
        toast.error('Failed to start conversation')
      },
    })
  }

  // Sync URL with store
  useEffect(() => {
    if (threadId && threadId !== activeThreadId) {
      setActiveThread(threadId);
    } else if (!threadId && activeThreadId && !isMobile) {
      navigate(`/messages/${activeThreadId}`, { replace: true });
    }
  }, [threadId, activeThreadId, navigate, setActiveThread, isMobile]);

  // Sync store with URL
  useEffect(() => {
    if (activeThreadId && activeThreadId !== threadId) {
      navigate(`/messages/${activeThreadId}`);
    } else if (!activeThreadId && threadId) {
      navigate('/messages');
    }
  }, [activeThreadId, threadId, navigate]);

  const activeThread = threads?.find(t => t.id === activeThreadId);

  // On mobile, if a thread is selected, we hide the list and show the thread full width
  const showList = !isMobile || !activeThreadId;
  const showThread = !isMobile || activeThreadId;

  return (
    <>
      <SEO title="Messages | EduFlow" />
      <div className="flex flex-col h-[calc(100vh-theme(spacing.16)-theme(spacing.8))] -m-4 md:-m-6 lg:-m-8">
      {/* Desktop Header */}
      <div className="hidden md:flex px-6 pt-6 pb-4 items-center justify-between shrink-0">
        <div>
          <PageHeader title="Messages" description="Chat with instructors and peers" />
        </div>
        <Dialog open={showNewMessage} onOpenChange={setShowNewMessage}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              New Message
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>New Message</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <Input placeholder="Search users..." value={searchUser} onChange={e => { setSearchUser(e.target.value); setSelectedUserId(null) }} />
              {foundUsers.length > 0 && (
                <div className="max-h-40 overflow-y-auto border rounded-md divide-y">
                  {foundUsers.map(u => (
                    <button key={u.id} onClick={() => setSelectedUserId(u.id)} className={`w-full text-left px-3 py-2 text-sm hover:bg-muted ${selectedUserId === u.id ? 'bg-primary/10' : ''}`}>
                      {u.full_name}
                    </button>
                  ))}
                </div>
              )}
              <Button className="w-full" disabled={!selectedUserId || isCreating} onClick={startConversation}>
                {isCreating && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                Start Conversation
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex flex-1 overflow-hidden border-t md:border md:rounded-xl md:mx-6 md:mb-6 md:shadow-sm bg-background">
        {/* Left Panel - Thread List */}
        {showList && (
          <div className={cn("flex flex-col border-r bg-muted/10 w-full", !isMobile && "w-80 shrink-0")}>
            <div className="p-3 md:hidden flex justify-between items-center border-b">
               <h2 className="font-bold text-xl">Messages</h2>
               <Button size="icon" variant="ghost" onClick={() => setShowNewMessage(true)}><Plus className="h-5 w-5" /></Button>
            </div>
            <ThreadList />
          </div>
        )}

        {/* Right Panel - Active Thread */}
        {showThread && (
          <div className="flex-1 flex flex-col min-w-0 bg-background">
            {activeThread ? (
              <MessageThreadView thread={activeThread} />
            ) : (
              <EmptyThreadState />
            )}
          </div>
        )}
      </div>
    </div>
    </>
  );
}
