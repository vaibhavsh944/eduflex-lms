import { useQuery, useMutation, useQueryClient, useInfiniteQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import type { ForumThread, ForumReply, LessonQA} from '@/lib/types';
import { ForumVote, LessonQAReply } from '@/lib/types'
import { useAuthStore } from '@/store/authStore'

export const forumKeys = {
  threads: (courseId: string) => ['forum', 'threads', courseId] as const,
  thread: (threadId: string) => ['forum', 'thread', threadId] as const,
  replies: (threadId: string) => ['forum', 'replies', threadId] as const,
  qa: (lessonId: string) => ['forum', 'qa', lessonId] as const,
}

export function useForumThreads(courseId: string, filters?: { tab: string; sort: string }) {
  return useInfiniteQuery({
    queryKey: [...forumKeys.threads(courseId), filters],
    queryFn: async ({ pageParam }) => {
      let query = supabase
        .from('forum_threads')
        .select('*, author:profiles!user_id(id, full_name, avatar_url, role)', { count: 'exact' })
        .eq('course_id', courseId)

      if (filters?.tab === 'pinned') {
        query = query.eq('is_pinned', true)
      } else if (filters?.tab === 'unanswered') {
        query = query.eq('reply_count', 0)
      } else if (filters?.tab === 'my-posts') {
        const user = useAuthStore.getState().user
        if (user) query = query.eq('user_id', user.id)
      }

      if (filters?.sort === 'upvotes') {
        query = query.order('upvote_count', { ascending: false })
      } else if (filters?.sort === 'replies') {
        query = query.order('reply_count', { ascending: false })
      } else {
        query = query.order('is_pinned', { ascending: false })
      }
      query = query.order('created_at', { ascending: false })

      const from = pageParam * 20
      const to = from + 19
      query = query.range(from, to)

      const { data, error, count } = await query
      if (error) throw error
      return { data: data, count: count || 0, nextPage: data?.length === 20 ? pageParam + 1 : undefined }
    },
    initialPageParam: 0,
    getNextPageParam: (lastPage) => lastPage.nextPage,
    enabled: !!courseId,
  })
}

export function useForumThread(threadId: string) {
  return useQuery({
    queryKey: forumKeys.thread(threadId),
    queryFn: async () => {
      const { data, error } = await supabase
        .from('forum_threads')
        .select('*, author:profiles!user_id(id, full_name, avatar_url, role)')
        .eq('id', threadId)
        .single()
      if (error) throw error
      return data
    },
    enabled: !!threadId,
  })
}

export function useForumReplies(threadId: string) {
  return useQuery({
    queryKey: forumKeys.replies(threadId),
    queryFn: async () => {
      const { data, error } = await supabase
        .from('forum_replies')
        .select('*, author:profiles!user_id(id, full_name, avatar_url, role)')
        .eq('thread_id', threadId)
        .order('created_at', { ascending: true })
      if (error) throw error
      const replies = data as ForumReply[]
      const accepted = replies.filter(r => r.is_accepted)
      const others = replies.filter(r => !r.is_accepted)
      return [...accepted, ...others]
    },
    enabled: !!threadId,
  })
}

export function useCreateThread() {
  const queryClient = useQueryClient()
  const currentUserId = useAuthStore(state => state.user?.id)

  return useMutation({
    mutationFn: async ({ courseId, title, body }: { courseId: string; title: string; body: string }) => {
      if (!currentUserId) throw new Error('Not authenticated')
      const { data, error } = await supabase
        .from('forum_threads')
        .insert({ course_id: courseId, user_id: currentUserId, title, body })
        .select()
        .single()
      if (error) throw error
      return data
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['forum', 'threads', data.course_id] })
    },
  })
}

export function useCreateReply() {
  const queryClient = useQueryClient()
  const currentUserId = useAuthStore(state => state.user?.id)

  return useMutation({
    mutationFn: async ({ threadId, body, parentReplyId }: { threadId: string; body: string; parentReplyId?: string | null }) => {
      if (!currentUserId) throw new Error('Not authenticated')
      const { data, error } = await supabase
        .from('forum_replies')
        .insert({ thread_id: threadId, user_id: currentUserId, body, parent_reply_id: parentReplyId || null })
        .select()
        .single()
      if (error) throw error
      return data
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['forum', 'replies', variables.threadId] })
    },
  })
}

export function useForumVote() {
  const currentUserId = useAuthStore(state => state.user?.id)
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ targetId, targetType, value }: { targetId: string; targetType: 'thread' | 'reply'; value: 1 | -1 }) => {
      if (!currentUserId) throw new Error('Not authenticated')

      const { data: existing } = await supabase
        .from('forum_votes')
        .select('value')
        .eq('user_id', currentUserId)
        .eq('target_id', targetId)
        .eq('target_type', targetType)
        .single()

      if (existing) {
        if (existing.value === value) {
          await supabase.from('forum_votes').delete()
            .eq('user_id', currentUserId).eq('target_id', targetId).eq('target_type', targetType)
        } else {
          await supabase.from('forum_votes').update({ value })
            .eq('user_id', currentUserId).eq('target_id', targetId).eq('target_type', targetType)
        }
      } else {
        await supabase.from('forum_votes').insert({ user_id: currentUserId, target_id: targetId, target_type: targetType, value })
      }
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['forum', 'threads'] })
      queryClient.invalidateQueries({ queryKey: ['forum', 'replies', variables.targetId] })
    },
  })
}

export function useLessonQA(lessonId: string) {
  return useQuery({
    queryKey: forumKeys.qa(lessonId),
    queryFn: async () => {
      const { data, error } = await supabase
        .from('lesson_qa')
        .select('*, author:profiles!user_id(id, full_name, avatar_url, role), replies:lesson_qa_replies(*, author:profiles!user_id(id, full_name, avatar_url, role))')
        .eq('lesson_id', lessonId)
        .order('upvote_count', { ascending: false })
      if (error) throw error
      return data
    },
    enabled: !!lessonId,
  })
}

export function useAskQuestion() {
  const queryClient = useQueryClient()
  const currentUserId = useAuthStore(state => state.user?.id)

  return useMutation({
    mutationFn: async ({ lessonId, body }: { lessonId: string; body: string }) => {
      if (!currentUserId) throw new Error('Not authenticated')
      const { data, error } = await supabase
        .from('lesson_qa')
        .insert({ lesson_id: lessonId, user_id: currentUserId, body })
        .select()
        .single()
      if (error) throw error
      return data
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['forum', 'qa', data.lesson_id] })
    },
  })
}

export function useAnswerQuestion() {
  const queryClient = useQueryClient()
  const currentUserId = useAuthStore(state => state.user?.id)

  return useMutation({
    mutationFn: async ({ questionId, body }: { questionId: string; body: string }) => {
      if (!currentUserId) throw new Error('Not authenticated')
      const { data, error } = await supabase
        .from('lesson_qa_replies')
        .insert({ question_id: questionId, user_id: currentUserId, body })
        .select()
        .single()
      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['forum', 'qa'] })
    },
  })
}
