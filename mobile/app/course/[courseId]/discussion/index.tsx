import { useState, useEffect, useCallback } from "react"
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  TextInput,
  Modal,
  Alert,
  RefreshControl,
} from "react-native"
import { useLocalSearchParams, useRouter, Stack } from "expo-router"
import { SafeAreaView } from "react-native-safe-area-context"
import {
  MessageCircle,
  ChevronUp,
  Plus,
  ChevronLeft,
  User,
  Clock,
} from "lucide-react-native"
import { supabase, getCurrentUser } from "@shared/utils/supabase"
import type { ForumThread } from "@shared/types"

type ThreadWithAuthor = ForumThread & {
  author?: { id: string; full_name: string | null; avatar_url: string | null }
}

export default function DiscussionListScreen() {
  const { courseId } = useLocalSearchParams<{ courseId: string }>()
  const router = useRouter()
  const [threads, setThreads] = useState<ThreadWithAuthor[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [showCreate, setShowCreate] = useState(false)
  const [newTitle, setNewTitle] = useState("")
  const [newBody, setNewBody] = useState("")
  const [creating, setCreating] = useState(false)

  const fetchThreads = useCallback(async () => {
    try {
      const { data } = await supabase
        .from("forum_threads")
        .select("*, author:profiles!user_id(id, full_name, avatar_url)")
        .eq("course_id", courseId)
        .order("is_pinned", { ascending: false })
        .order("created_at", { ascending: false })
      setThreads((data ?? []) as unknown as ThreadWithAuthor[])
    } catch {
      // silently handle
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [courseId])

  useEffect(() => {
    fetchThreads()
  }, [fetchThreads])

  useEffect(() => {
    if (!courseId) return
    const channel = supabase
      .channel(`mobile-forum-${courseId}`)
      .on("postgres_changes", {
        event: "*",
        schema: "public",
        table: "forum_threads",
        filter: `course_id=eq.${courseId}`,
      }, () => {
        fetchThreads()
      })
      .subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [courseId, fetchThreads])

  const handleCreate = async () => {
    if (!newTitle.trim()) return
    setCreating(true)
    try {
      const user = await getCurrentUser()
      if (!user) {
        Alert.alert("Sign in required", "Please sign in to create a discussion.")
        return
      }
      const { data, error } = await supabase.from("forum_threads").insert({
        course_id: courseId,
        user_id: user.id,
        title: newTitle.trim(),
        body: newBody.trim(),
      }).select().single()
      if (error) throw error
      setShowCreate(false)
      setNewTitle("")
      setNewBody("")
      if (data) {
        router.push(`/course/${courseId}/discussion/${data.id}`)
      }
    } catch {
      Alert.alert("Error", "Failed to create thread.")
    } finally {
      setCreating(false)
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

  const renderThread = ({ item }: { item: ThreadWithAuthor }) => (
    <TouchableOpacity
      onPress={() => router.push(`/course/${courseId}/discussion/${item.id}`)}
      className="flex-row items-start px-4 py-4 border-b border-gray-100"
    >
      <View className="flex-1">
        <View className="flex-row items-center gap-2 mb-1">
          {item.is_pinned && (
            <View className="bg-primary-100 px-1.5 py-0.5 rounded">
              <Text className="text-[10px] font-bold text-primary-600">PIN</Text>
            </View>
          )}
          <Text className="text-sm font-semibold text-gray-900 flex-1" numberOfLines={1}>
            {item.title}
          </Text>
        </View>
        <View className="flex-row items-center gap-3 mt-1">
          <View className="flex-row items-center gap-1">
            <User size={12} color="#6B7280" />
            <Text className="text-xs text-gray-500">{item.author?.full_name || "Unknown"}</Text>
          </View>
          <View className="flex-row items-center gap-1">
            <Clock size={12} color="#6B7280" />
            <Text className="text-xs text-gray-500">{formatTime(item.created_at)}</Text>
          </View>
        </View>
        <View className="flex-row items-center gap-3 mt-2">
          <View className="flex-row items-center gap-1">
            <ChevronUp size={12} color="#6B7280" />
            <Text className="text-xs text-gray-500">{item.vote_score ?? 0}</Text>
          </View>
          <View className="flex-row items-center gap-1">
            <MessageCircle size={12} color="#6B7280" />
            <Text className="text-xs text-gray-500">{item.reply_count ?? 0}</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  )

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-white justify-center items-center">
        <ActivityIndicator size="large" color="#4F46E5" />
      </SafeAreaView>
    )
  }

  return (
    <>
      <Stack.Screen
        options={{
          headerTitle: "Discussion",
          headerRight: () => (
            <TouchableOpacity onPress={() => setShowCreate(true)} className="mr-2">
              <Plus size={22} color="#4F46E5" />
            </TouchableOpacity>
          ),
        }}
      />
      <SafeAreaView className="flex-1 bg-white" edges={["bottom"]}>
        {threads.length === 0 ? (
          <View className="flex-1 justify-center items-center px-6">
            <MessageCircle size={48} color="#D1D5DB" />
            <Text className="text-lg font-semibold text-gray-900 mt-4">No discussions yet</Text>
            <Text className="text-sm text-gray-500 mt-2 text-center">
              Be the first to start a conversation!
            </Text>
            <TouchableOpacity
              onPress={() => setShowCreate(true)}
              className="mt-6 bg-primary-600 px-6 py-3 rounded-xl"
            >
              <Text className="text-white font-semibold">Start a Discussion</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <FlatList
            data={threads}
            keyExtractor={(item) => item.id}
            renderItem={renderThread}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchThreads() }} />
            }
          />
        )}

        <Modal visible={showCreate} animationType="slide" presentationStyle="pageSheet">
          <SafeAreaView className="flex-1 bg-white">
            <View className="flex-row items-center justify-between px-4 py-3 border-b border-gray-200">
              <TouchableOpacity onPress={() => setShowCreate(false)}>
                <ChevronLeft size={24} color="#4F46E5" />
              </TouchableOpacity>
              <Text className="text-lg font-semibold text-gray-900">New Thread</Text>
              <View style={{ width: 24 }} />
            </View>
            <View className="flex-1 p-4">
              <View className="mb-4">
                <Text className="text-sm font-medium text-gray-700 mb-1">Title</Text>
                <TextInput
                  value={newTitle}
                  onChangeText={setNewTitle}
                  placeholder="Thread title..."
                  className="border border-gray-300 rounded-lg px-3 py-2.5 text-sm"
                />
              </View>
              <View className="flex-1 mb-4">
                <Text className="text-sm font-medium text-gray-700 mb-1">Body</Text>
                <TextInput
                  value={newBody}
                  onChangeText={setNewBody}
                  placeholder="Write your message..."
                  multiline
                  className="border border-gray-300 rounded-lg px-3 py-2.5 text-sm flex-1"
                  textAlignVertical="top"
                />
              </View>
              <TouchableOpacity
                onPress={handleCreate}
                disabled={creating || !newTitle.trim()}
                className={`py-3 rounded-xl items-center ${creating || !newTitle.trim() ? "bg-primary-400" : "bg-primary-600"}`}
              >
                {creating ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <Text className="text-white font-semibold">Post Thread</Text>
                )}
              </TouchableOpacity>
            </View>
          </SafeAreaView>
        </Modal>
      </SafeAreaView>
    </>
  )
}
