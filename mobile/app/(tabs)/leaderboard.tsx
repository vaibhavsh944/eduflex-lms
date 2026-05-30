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
import {
  Trophy,
  Medal,
  Award,
  Crown,
  TrendingUp,
} from "lucide-react-native";
import {
  getCurrentUser,
  getProfile,
  supabase,
} from "@shared/utils/supabase";
import type { LeaderboardEntry } from "@shared/types";

const TAB_OPTIONS = [
  { key: "global", label: "Global" },
  { key: "my-courses", label: "My Courses" },
];

const podiumColors = ["#F59E0B", "#9CA3AF", "#CD7F32"];

export default function LeaderboardScreen() {
  const [activeTab, setActiveTab] = useState("global");
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    try {
      const user = await getCurrentUser();
      setCurrentUserId(user?.id ?? null);

      const { data } = await supabase
        .from("profiles")
        .select("user_id, full_name, avatar_url, points")
        .order("points", { ascending: false })
        .limit(50);

      const ranked: LeaderboardEntry[] = (data ?? []).map((item, index) => ({
        user_id: item.user_id,
        full_name: item.full_name,
        avatar_url: item.avatar_url,
        points: item.points ?? 0,
        rank: index + 1,
        course_count: 0,
      }));

      setEntries(ranked);
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

  const top3 = entries.slice(0, 3);
  const rest = entries.slice(3);

  const renderPodium = () => {
    if (top3.length === 0) return null;
    const order = top3.length >= 3
      ? [top3[1], top3[0], top3[2]]
      : top3;

    return (
      <View className="flex-row items-end justify-center px-6 pt-8 pb-6">
        {order.map((entry, index) => {
          const originalRank = entries.indexOf(entry) + 1;
          const height = originalRank === 1 ? 100 : originalRank === 2 ? 80 : 60;
          const isCenter = originalRank === 1;
          const color = podiumColors[originalRank - 1] ?? "#9CA3AF";

          return (
            <View
              key={entry.user_id}
              className={`items-center ${isCenter ? "mx-4" : "mx-2"}`}
            >
              <View className="relative">
                {originalRank === 1 && (
                  <Crown size={22} color="#F59E0B" className="absolute -top-5 self-center z-10" />
                )}
                {entry.avatar_url ? (
                  <Image
                    source={{ uri: entry.avatar_url }}
                    className={`rounded-full border-2 ${isCenter ? "w-16 h-16" : "w-12 h-12"}`}
                    style={{ borderColor: color }}
                  />
                ) : (
                  <View
                    className={`rounded-full bg-gray-100 border-2 items-center justify-center ${
                      isCenter ? "w-16 h-16" : "w-12 h-12"
                    }`}
                    style={{ borderColor: color }}
                  >
                    <TrendingUp size={isCenter ? 24 : 18} color={color} />
                  </View>
                )}
              </View>
              <Text
                className={`mt-2 font-bold text-gray-900 ${
                  isCenter ? "text-base" : "text-sm"
                }`}
                numberOfLines={1}
              >
                {entry.full_name.split(" ")[0]}
              </Text>
              <Text className="text-xs text-gray-500">{entry.points} pts</Text>
              <View
                className="mt-1 w-8 h-8 rounded-full items-center justify-center"
                style={{ backgroundColor: `${color}20` }}
              >
                <Medal size={16} color={color} />
              </View>
            </View>
          );
        })}
      </View>
    );
  };

  const renderItem = ({ item }: { item: LeaderboardEntry }) => {
    const isCurrentUser = item.user_id === currentUserId;
    const isTop3 = item.rank <= 3;

    return (
      <View
        className={`flex-row items-center px-6 py-3.5 ${
          isCurrentUser ? "bg-primary-50 border border-primary-100 rounded-xl mx-6" : ""
        }`}
      >
        <Text
          className={`w-8 text-center font-bold text-sm ${
            isTop3
              ? ["text-amber-500", "text-gray-400", "text-amber-700"][item.rank - 1]
              : "text-gray-400"
          }`}
        >
          {item.rank}
        </Text>

        {item.avatar_url ? (
          <Image
            source={{ uri: item.avatar_url }}
            className="w-10 h-10 rounded-full ml-3 bg-gray-200"
          />
        ) : (
          <View className="w-10 h-10 rounded-full ml-3 bg-gray-100 items-center justify-center">
            <TrendingUp size={18} color="#9CA3AF" />
          </View>
        )}

        <View className="flex-1 ml-3">
          <Text
            className={`text-sm font-semibold ${
              isCurrentUser ? "text-primary-600" : "text-gray-900"
            }`}
            numberOfLines={1}
          >
            {item.full_name}
            {isCurrentUser && (
              <Text className="text-primary-400 text-xs ml-1"> (You)</Text>
            )}
          </Text>
        </View>

        <View className="items-end">
          <Text className="text-sm font-bold text-gray-900">
            {item.points}
          </Text>
          <Text className="text-xs text-gray-400">pts</Text>
        </View>
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
        <Text className="text-2xl font-bold text-gray-900">Leaderboard</Text>
      </View>

      {/* Tabs */}
      <View className="flex-row px-6 py-2 space-x-2">
        {TAB_OPTIONS.map((tab) => (
          <TouchableOpacity
            key={tab.key}
            onPress={() => setActiveTab(tab.key)}
            className={`px-5 py-2 rounded-full ${
              activeTab === tab.key
                ? "bg-primary-600"
                : "bg-white border border-gray-200"
            }`}
          >
            <Text
              className={`text-sm font-medium ${
                activeTab === tab.key ? "text-white" : "text-gray-600"
              }`}
            >
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <FlatList
        data={activeTab === "global" ? rest : entries}
        keyExtractor={(item) => item.user_id}
        renderItem={renderItem}
        showsVerticalScrollIndicator={false}
        contentContainerClassName="pb-8"
        ListHeaderComponent={activeTab === "global" ? renderPodium : null}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <View className="flex-1 items-center justify-center py-20">
            <Trophy size={48} color="#D1D5DB" />
            <Text className="mt-4 text-gray-400 text-lg">
              No rankings yet
            </Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}
