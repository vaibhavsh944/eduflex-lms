import { useState, useEffect, useCallback } from "react"
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  TextInput,
  Alert,
} from "react-native"
import { useLocalSearchParams, useRouter, Stack } from "expo-router"
import { SafeAreaView } from "react-native-safe-area-context"
import {
  CheckCircle,
  Lock,
  User,
  Clock,
  ChevronLeft,
} from "lucide-react-native"
import { supabase, getCurrentUser } from "@shared/utils/supabase"
import type { ForumThread, ForumReply } from "@shared/types"

type ThreadWithAuthor = ForumThread & {
  author?: { id: string; full_name: string | null; avatar_url: string | null }
}

type ReplyWithAuthor = ForumReply & {
  author?: { id: string; full_name: string | null; avatar_url: string | null }
}

export default function ThreadDetailScreen() {
  const { courseId, threadId } = useLocalSearchParams<{ courseId: string; threadId: string }>()
  const [thread, setThread] = useState<ThreadWithAuthor | null>(null)
  const [replies, setReplies] = useState<ReplyWithAuthor[]>([])
  const [loading, setLoading] = useState(true)
  const [replyText, setReplyText] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const [currentUserId, setCurrentUserId] = useState<string | null>(null)

  useEffect(() => {
    getCurrentUser().then(user => setCurrentUserId(user?.id ?? null))
  }, [])

  const fetchThread = useCallback(async () => {
    try {
      const [threadResult, repliesResult] = await Promise.all([
        supabase
          .from("forum_threads")
          .select("*, author:profiles!user_id(id, full_name, avatar_url)")
          .eq("id", threadId)
          .single(),
        supabase
          .from("forum_replies")
          .select("*, author:profiles!user_id(id, full_name, avatar_url)")
          .eq("thread_id", threadId)
          .order("created_at", { ascending: true }),
      ])
      if (threadResult.data) setThread(threadResult.data as unknown as ThreadWithAuthor)
      setReplies((repliesResult.data ?? []) as unknown as ReplyWithAuthor[])
    } catch {
      // silently handle
    } finally {
      setLoading(false)
    }
  }, [threadId])

  useEffect(() => {
    fetchThread()
  }, [fetchThread])

  useEffect(() => {
    if (!threadId) return
    const channel = supabase
      .channel(`mobile-thread-${threadId}`)
      .on("postgres_changes", {
        event: "INSERT",
        schema: "public",
        table: "forum_replies",
        filter: `thread_id=eq.${threadId}`,
      }, () => {
        fetchThread()
      })
      .subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [threadId, fetchThread])

  const handleReply = async () => {
    if (!replyText.trim() || !currentUserId) return
    setSubmitting(true)
    try {
      const { error } = await supabase.from("forum_replies").insert({
        thread_id: threadId,
        user_id: currentUserId,
        body: replyText.trim(),
      })
      if (error) throw error
      setReplyText("")
      await fetchThread()
    } catch {
      Alert.alert("Error", "Failed to post reply.")
    } finally {
      setSubmitting(false)
    }
  }

  const formatTime = (dateStr: string) => {
    const d = new Date(dateStr)
    const now = new Date()
    const diff = Math.floor((now.getTime() - d.getTime()) / 1000)
    if (diff < 60) return "just now"
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`
    return `${Math.floor(diff / 86400)}d ago`
  }

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-white justify-center items-center">
        <ActivityIndicator size="large" color="#4F46E5" />
      </SafeAreaView>
    )
  }

  if (!thread) {
    return (
      <SafeAreaView className="flex-1 bg-white justify-center items-center">
        <Text className="text-gray-500">Thread not found</Text>
      </SafeAreaView>
    )
  }

  const topLevelReplies = replies.filter(r => !r.parent_reply_id)
  const nestedReplies = replies.filter(r => r.parent_reply_id)

  return (
    <>
      <Stack.Screen options={{ headerTitle: thread.title }} />
      <SafeAreaView className="flex-1 bg-white" edges={["bottom"]}>
        <ScrollView className="flex-1">
          {/* Thread header */}
          <View className="px-4 py-5 border-b border-gray-100">
            <View className="flex-row items-center gap-2 mb-2">
              {thread.is_pinned && (
                <View className="bg-primary-100 px-1.5 py-0.5 rounded">
                  <Text className="text-[10px] font-bold text-primary-600">PIN</Text>
                </View>
              )}
              {thread.is_locked && <Lock size={12} color="#9CA3AF" />}
            </View>
            <Text className="text-lg font-bold text-gray-900">{thread.title}</Text>
            <View className="flex-row items-center gap-3 mt-2">
              <View className="flex-row items-center gap-1">
                <User size={12} color="#6B7280" />
                <Text className="text-xs text-gray-500">{thread.author?.full_name || "Unknown"}</Text>
              </View>
              <View className="flex-row items-center gap-1">
                <Clock size={12} color="#6B7280" />
                <Text className="text-xs text-gray-500">{formatTime(thread.created_at)}</Text>
              </View>
            </View>
            {thread.body && (
              <Text className="text-sm text-gray-700 mt-4 leading-6">{thread.body}</Text>
            )}
          </View>

          {/* Replies */}
          <View className="px-4 pt-4 pb-24">
            {topLevelReplies.length === 0 ? (
              <Text className="text-center text-gray-400 py-8">No replies yet. Be the first to respond!</Text>
            ) : (
              topLevelReplies.map(reply => (
                <View key={reply.id}>
                  <View className="py-3 border-b border-gray-50">
                    {reply.is_accepted && (
                      <View className="flex-row items-center gap-1 mb-2">
                        <CheckCircle size={14} color="#10B981" />
                        <Text className="text-xs font-medium text-green-600">Accepted Answer</Text>
                      </View>
                    )}
                    <View className="flex-row items-center gap-2 mb-1">
                      <View className="w-6 h-6 rounded-full bg-primary-100 items-center justify-center">
                        <User size={12} color="#4F46E5" />
                      </View>
                      <Text className="text-xs font-medium text-gray-700">
                        {reply.author?.full_name || "Unknown"}
                      </Text>
                      <Text className="text-xs text-gray-400">{formatTime(reply.created_at)}</Text>
                    </View>
                    <Text className="text-sm text-gray-700 ml-8">{reply.body}</Text>
                  </View>
                  {/* Nested replies */}
                  {nestedReplies.filter(r => r.parent_reply_id === reply.id).map(nested => (
                    <View key={nested.id} className="ml-6 pl-4 border-l-2 border-gray-100 py-2">
                      <View className="flex-row items-center gap-2 mb-1">
                        <View className="w-5 h-5 rounded-full bg-gray-100 items-center justify-center">
                          <User size={10} color="#6B7280" />
                        </View>
                        <Text className="text-xs font-medium text-gray-600">
                          {nested.author?.full_name || "Unknown"}
                        </Text>
                        <Text className="text-xs text-gray-400">{formatTime(nested.created_at)}</Text>
                      </View>
                      <Text className="text-sm text-gray-600 ml-7">{nested.body}</Text>
                    </View>
                  ))}
                </View>
              ))
            )}
          </View>
        </ScrollView>

        {/* Reply input */}
        {thread.is_locked ? (
          <View className="px-4 py-3 bg-gray-50 border-t border-gray-200">
            <View className="flex-row items-center justify-center gap-2">
              <Lock size={14} color="#9CA3AF" />
              <Text className="text-xs text-gray-500">Thread is locked</Text>
            </View>
          </View>
        ) : (
          <View className="px-4 py-3 bg-white border-t border-gray-200">
            <View className="flex-row items-center gap-2">
              <TextInput
                value={replyText}
                onChangeText={setReplyText}
                placeholder="Write a reply..."
                multiline
                className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm max-h-20"
              />
              <TouchableOpacity
                onPress={handleReply}
                disabled={submitting || !replyText.trim() || !currentUserId}
                className={`px-4 py-2 rounded-full items-center justify-center ${submitting || !replyText.trim() || !currentUserId ? "bg-gray-300" : "bg-primary-600"}`}
              >
                {submitting ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <Text className="text-white font-semibold text-sm">Reply</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        )}
      </SafeAreaView>
    </>
  )
}
