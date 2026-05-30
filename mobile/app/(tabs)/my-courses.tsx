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
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { BookOpen, ChevronRight, Clock, CheckCircle } from "lucide-react-native";
import { getCurrentUser, fetchEnrolledCourses } from "@shared/utils/supabase";
import { FALLBACK_THUMBNAIL_IMAGE } from "@/src/lib/constants";
import type { Enrollment, Course } from "@shared/types";
import ProgressBar from "@components/ProgressBar";

export default function MyCoursesScreen() {
  const router = useRouter();
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadData = useCallback(async () => {
    try {
      const user = await getCurrentUser();
      if (!user) return;

      const enrolled = await fetchEnrolledCourses(user.id);
      setEnrollments(enrolled);
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

  const renderItem = ({ item }: { item: Enrollment }) => {
    const enrollment = item as Enrollment & { course: Course };
    if (!enrollment.course) return null;

    return (
      <TouchableOpacity
        onPress={() => router.push(`/course/${enrollment.course.id}`)}
        className="bg-white rounded-xl border border-gray-100 p-4 mb-3 mx-6"
      >
        <View className="flex-row">
          <Image
            source={{
              uri:
                enrollment.course.thumbnail_url ??
                FALLBACK_THUMBNAIL_IMAGE,
            }}
            className="w-20 h-20 rounded-lg bg-gray-200"
            resizeMode="cover"
          />
          <View className="flex-1 ml-3 justify-between">
            <View>
              <Text
                className="text-sm font-semibold text-gray-900"
                numberOfLines={1}
              >
                {enrollment.course.title}
              </Text>
              <Text className="mt-1 text-xs text-gray-500">
                {enrollment.course.instructor_name ?? "Instructor"}
              </Text>
            </View>
            <View>
              <View className="flex-row items-center">
                <ProgressBar progress={enrollment.progress_percent!} height={4} className="flex-1" />
                <Text className="ml-2 text-xs text-gray-500">
                  {Math.round(enrollment.progress_percent!)}%
                </Text>
              </View>
              <View className="flex-row items-center mt-1">
                {enrollment.completed_at ? (
                  <View className="flex-row items-center">
                    <CheckCircle size={12} color="#10B981" />
                    <Text className="ml-1 text-xs text-green-600">Completed</Text>
                  </View>
                ) : (
                  <View className="flex-row items-center">
                    <Clock size={12} color="#F59E0B" />
                    <Text className="ml-1 text-xs text-amber-600">In Progress</Text>
                  </View>
                )}
              </View>
            </View>
          </View>
          <ChevronRight size={20} color="#9CA3AF" className="self-center" />
        </View>
      </TouchableOpacity>
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
        <Text className="text-2xl font-bold text-gray-900">My Courses</Text>
        <Text className="text-gray-500 text-sm mt-1">
          {enrollments.length} enrolled {enrollments.length === 1 ? "course" : "courses"}
        </Text>
      </View>

      <FlatList
        data={enrollments}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        showsVerticalScrollIndicator={false}
        contentContainerClassName="pt-2 pb-6"
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <View className="flex-1 items-center justify-center py-20">
            <BookOpen size={48} color="#D1D5DB" />
            <Text className="mt-4 text-gray-400 text-lg">
              No enrolled courses
            </Text>
            <Text className="text-gray-400 text-sm mt-1">
              Start learning today!
            </Text>
            <TouchableOpacity
              onPress={() => router.push("/(tabs)/catalog")}
              className="mt-4 px-6 py-3 bg-primary-600 rounded-xl"
            >
              <Text className="text-white font-semibold">Browse Catalog</Text>
            </TouchableOpacity>
          </View>
        }
      />
    </SafeAreaView>
  );
}
