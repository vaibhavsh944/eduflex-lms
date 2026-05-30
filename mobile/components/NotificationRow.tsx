import { View, Text, TouchableOpacity, Animated } from "react-native";
import { useState, useRef } from "react";
import {
  Bell,
  BookOpen,
  Award,
  AlertCircle,
  Trash2,
  CheckCircle,
} from "lucide-react-native";
import type { Notification } from "@shared/types";

interface NotificationRowProps {
  notification: Notification;
  onPress?: (notification: Notification) => void;
  onDismiss?: (notification: Notification) => void;
  onMarkRead?: (notification: Notification) => void;
}

const typeIcons: Record<string, typeof Bell> = {
  course_update: BookOpen,
  achievement: Award,
  reminder: AlertCircle,
  system: Bell,
};

const typeColors: Record<string, string> = {
  course_update: "#4F46E5",
  achievement: "#10B981",
  reminder: "#F59E0B",
  system: "#6B7280",
};

function getRelativeTime(dateString: string): string {
  const now = new Date();
  const date = new Date(dateString);
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString();
}

export default function NotificationRow({
  notification,
  onPress,
  onDismiss,
  onMarkRead,
}: NotificationRowProps) {
  const [dismissed, setDismissed] = useState(false);
  const translateX = useRef(new Animated.Value(0)).current;

  const Icon = typeIcons[notification.type] ?? Bell;
  const iconColor = typeColors[notification.type] ?? "#6B7280";

  const handleDismiss = () => {
    Animated.timing(translateX, {
      toValue: 400,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      setDismissed(true);
      onDismiss?.(notification);
    });
  };

  if (dismissed) return null;

  return (
    <Animated.View style={{ transform: [{ translateX }] }}>
      <TouchableOpacity
        onPress={() => {
          onPress?.(notification);
          if (!notification.read) onMarkRead?.(notification);
        }}
        className={`flex-row items-start p-4 border-b border-gray-100 ${
          !notification.read ? "bg-primary-50/50" : "bg-white"
        }`}
        onLongPress={handleDismiss}
      >
        <View
          className="w-10 h-10 rounded-full items-center justify-center"
          style={{ backgroundColor: `${iconColor}15` }}
        >
          <Icon size={20} color={iconColor} />
        </View>
        <View className="flex-1 ml-3">
          <View className="flex-row items-center">
            <Text className="flex-1 text-sm font-semibold text-gray-900">
              {notification.title}
            </Text>
            {!notification.read && (
              <View className="w-2 h-2 rounded-full bg-primary-600 ml-2" />
            )}
          </View>
          <Text className="mt-1 text-sm text-gray-500 line-clamp-2" numberOfLines={2}>
            {notification.body}
          </Text>
          <Text className="mt-1 text-xs text-gray-400">
            {getRelativeTime(notification.created_at)}
          </Text>
        </View>
        <View className="ml-2 flex-col items-center justify-between">
          {onMarkRead && notification.read === false && (
            <TouchableOpacity
              onPress={() => onMarkRead(notification)}
              className="p-1"
            >
              <CheckCircle size={16} color="#4F46E5" />
            </TouchableOpacity>
          )}
          {onDismiss && (
            <TouchableOpacity onPress={handleDismiss} className="p-1 mt-2">
              <Trash2 size={16} color="#EF4444" />
            </TouchableOpacity>
          )}
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
}
