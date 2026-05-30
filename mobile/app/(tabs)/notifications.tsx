import { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Bell, CheckCheck } from "lucide-react-native";
import { supabase, getCurrentUser, fetchNotifications } from "@shared/utils/supabase";
import type { Notification } from "@shared/types";
import NotificationRow from "@components/NotificationRow";

export default function NotificationsScreen() {
  const router = useRouter();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadData = useCallback(async () => {
    try {
      const user = await getCurrentUser();
      if (!user) return;

      const items = await fetchNotifications(user.id);
      setNotifications(items);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  }, [loadData]);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const handleMarkAllRead = async () => {
    setNotifications((prev) =>
      prev.map((n) => ({ ...n, read: true }))
    );
    const user = await getCurrentUser();
    if (user) {
      await supabase
        .from("notifications")
        .update({ read_at: new Date().toISOString() })
        .eq("user_id", user.id)
        .is("read_at", null);
    }
  };

  const handleMarkRead = async (notification: Notification) => {
    setNotifications((prev) =>
      prev.map((n) =>
        n.id === notification.id ? { ...n, read: true } : n
      )
    );
    await supabase
      .from("notifications")
      .update({ read_at: new Date().toISOString() })
      .eq("id", notification.id);
  };

  const handleDismiss = async (notification: Notification) => {
    setNotifications((prev) => prev.filter((n) => n.id !== notification.id));
  };

  const handlePress = async (notification: Notification) => {
    if (notification.action_url) {
      router.push(notification.action_url);
    }
  };

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50 justify-center items-center">
        <ActivityIndicator size="large" color="#4F46E5" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <View className="px-6 pt-4 pb-2 flex-row items-center justify-between">
        <View>
          <Text className="text-2xl font-bold text-gray-900">Notifications</Text>
          {unreadCount > 0 && (
            <Text className="text-sm text-gray-500 mt-1">
              {unreadCount} unread {unreadCount === 1 ? "notification" : "notifications"}
            </Text>
          )}
        </View>
        {unreadCount > 0 && (
          <TouchableOpacity
            onPress={handleMarkAllRead}
            className="flex-row items-center px-3 py-2 bg-primary-50 rounded-lg"
          >
            <CheckCheck size={16} color="#4F46E5" />
            <Text className="ml-1 text-sm font-medium text-primary-600">
              Mark All Read
            </Text>
          </TouchableOpacity>
        )}
      </View>

      <FlatList
        data={notifications}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <NotificationRow
            notification={item}
            onPress={handlePress}
            onDismiss={handleDismiss}
            onMarkRead={handleMarkRead}
          />
        )}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <View className="flex-1 items-center justify-center py-20">
            <Bell size={48} color="#D1D5DB" />
            <Text className="mt-4 text-gray-400 text-lg">
              No notifications yet
            </Text>
            <Text className="text-gray-400 text-sm mt-1">
              We'll notify you when something arrives
            </Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}
