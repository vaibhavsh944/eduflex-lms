import { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  FlatList,
  Image,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Award, Lock, Flame, Star, Zap } from "lucide-react-native";
import { getCurrentUser, fetchUserBadges } from "@shared/utils/supabase";
import type { UserBadge } from "@shared/types";
import ProgressBar from "@components/ProgressBar";

const FILTER_TABS = [
  { key: "all", label: "All" },
  { key: "learning", label: "Learning" },
  { key: "achievement", label: "Achievement" },
  { key: "streak", label: "Streak" },
  { key: "special", label: "Special" },
];

const categoryIcons: Record<string, typeof Award> = {
  learning: Star,
  achievement: Award,
  streak: Flame,
  special: Zap,
};

const categoryColors: Record<string, string> = {
  learning: "#4F46E5",
  achievement: "#10B981",
  streak: "#F59E0B",
  special: "#EC4899",
};

export default function BadgesScreen() {
  const [badges, setBadges] = useState<UserBadge[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeFilter, setActiveFilter] = useState("all");

  const loadData = useCallback(async () => {
    try {
      const user = await getCurrentUser();
      if (!user) return;

      const items = await fetchUserBadges(user.id);
      setBadges(items);
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

  const filteredBadges = badges.filter((ub) => {
    if (activeFilter === "all") return true;
    return ub.badge?.category === activeFilter;
  });

  const renderItem = ({ item }: { item: UserBadge }) => {
    const isEarned = !!item.earned_at;
    const badge = item.badge;

    if (!badge) return null;

    const Icon = categoryIcons[badge.category ?? ''] ?? Award;
    const color = categoryColors[badge.category ?? ''] ?? "#6B7280";

    return (
      <View
        className={`flex-1 m-1.5 p-4 rounded-xl border items-center ${
          isEarned
            ? "bg-white border-gray-100"
            : "bg-gray-50 border-gray-200 opacity-70"
        }`}
        style={{ minHeight: 140 }}
      >
        <View
          className={`w-14 h-14 rounded-full items-center justify-center ${
            isEarned ? "opacity-100" : "opacity-40"
          }`}
          style={{ backgroundColor: `${color}20` }}
        >
          {badge.image_url ? (
            <Image
              source={{ uri: badge.image_url }}
              className="w-12 h-12 rounded-full"
              resizeMode="cover"
            />
          ) : (
            <Icon size={28} color={isEarned ? color : "#9CA3AF"} />
          )}
        </View>

        <Text
          className={`mt-2 text-xs font-semibold text-center ${
            isEarned ? "text-gray-900" : "text-gray-400"
          }`}
          numberOfLines={2}
        >
          {badge.name}
        </Text>

        {isEarned ? (
          <View className="mt-1 flex-row items-center">
            <Award size={10} color="#10B981" />
            <Text className="ml-1 text-[10px] text-green-600">
              Earned
            </Text>
          </View>
        ) : (
          <View className="mt-2 w-full">
            <ProgressBar
              progress={item.progress ?? 0}
              color="#9CA3AF"
              height={3}
            />
            <Text className="mt-1 text-[10px] text-gray-400 text-center">
              {Math.round(item.progress ?? 0)}%
            </Text>
          </View>
        )}
      </View>
    );
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
      <View className="px-6 pt-4 pb-2">
        <Text className="text-2xl font-bold text-gray-900">Badges</Text>
        <Text className="text-sm text-gray-500 mt-1">
          {badges.filter((b) => b.earned_at).length} of {badges.length} earned
        </Text>
      </View>

      {/* Filter Tabs */}
      <FlatList
        horizontal
        data={FILTER_TABS}
        keyExtractor={(item) => item.key}
        showsHorizontalScrollIndicator={false}
        className="px-6 py-2 max-h-12"
        contentContainerStyle={{ paddingRight: 16 }}
        renderItem={({ item }) => (
          <TouchableOpacity
            onPress={() => setActiveFilter(item.key)}
            className={`mr-2 px-4 py-2 rounded-full ${
              activeFilter === item.key
                ? "bg-primary-600"
                : "bg-white border border-gray-200"
            }`}
          >
            <Text
              className={`text-sm font-medium ${
                activeFilter === item.key
                  ? "text-white"
                  : "text-gray-600"
              }`}
            >
              {item.label}
            </Text>
          </TouchableOpacity>
        )}
      />

      {/* Badge Grid */}
      <FlatList
        data={filteredBadges}
        keyExtractor={(item: UserBadge) => item.id!}
        renderItem={renderItem}
        numColumns={3}
        contentContainerClassName="px-5 pt-4 pb-8"
        columnWrapperClassName="flex-row"
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <View className="flex-1 items-center justify-center py-20">
            <Award size={48} color="#D1D5DB" />
            <Text className="mt-4 text-gray-400 text-lg">
              No badges found
            </Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}
