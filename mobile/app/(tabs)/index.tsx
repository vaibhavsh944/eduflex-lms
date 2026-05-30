import { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  ScrollView,
  Image,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
} from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  BookOpen,
  Clock,
  Award,
  ChevronRight,
  TrendingUp,
  Flame,
} from "lucide-react-native";
import { FALLBACK_THUMBNAIL_IMAGE } from "@/src/lib/constants";
import { supabase, getCurrentUser, getProfile, fetchEnrolledCourses } from "@shared/utils/supabase";
import type { Profile, Enrollment, Course } from "@shared/types";
import CourseCard from "@components/CourseCard";
import ProgressBar from "@components/ProgressBar";
import StreakDisplay from "@components/StreakDisplay";

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

function getDeadlineItems(enrollments: Enrollment[]) {
  return enrollments
    .filter((e) => e.course)
    .slice(0, 3)
    .map((e) => ({
      id: (e.course as { id: string } | null)?.id ?? '',
      title: (e.course as { title: string } | null)?.title ?? '',
      progress: e.progress_percent!,
      dueText: e.completed_at
        ? "Completed"
        : `${Math.round((100 - e.progress_percent!) / 10) || 1} days left`,
    }));
}

export default function HomeScreen() {
  const router = useRouter();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    try {
      const user = await getCurrentUser();
      if (!user) return;

      const [prof, enrolled] = await Promise.all([
        getProfile(user.id),
        fetchEnrolledCourses(user.id),
      ]);

      setProfile(prof);
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

  const mostRecentEnrollment: (Enrollment & { course: Course }) | undefined = enrollments
    .filter((e): e is Enrollment & { course: Course } => !!e.course)
    .sort(
      (a, b) =>
        new Date(b.updated_at ?? '').getTime() - new Date(a.updated_at ?? '').getTime()
    )[0] as any;

  const deadlineItems = getDeadlineItems(enrollments);

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50 justify-center items-center">
        <ActivityIndicator size="large" color="#4F46E5" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Greeting Header */}
        <View className="px-6 pt-4 pb-6 bg-primary-600 rounded-b-3xl">
          <View className="flex-row justify-between items-center">
            <View className="flex-1">
              <Text className="text-primary-100 text-sm">
                {getGreeting()}
              </Text>
              <Text className="text-2xl font-bold text-white mt-1">
                {profile?.full_name ?? "Learner"}
              </Text>
            </View>
            {profile?.avatar_url && (
              <Image
                source={{ uri: profile.avatar_url }}
                className="w-12 h-12 rounded-full border-2 border-white"
              />
            )}
          </View>

          <View className="flex-row mt-4 space-x-4">
            <View className="flex-row items-center bg-white/20 rounded-full px-4 py-2">
              <Award size={16} color="#FFFFFF" />
              <Text className="ml-2 text-white font-semibold">
                {profile?.points ?? 0} pts
              </Text>
            </View>
            <StreakDisplay count={profile?.streak_count ?? 0} />
          </View>
        </View>

        {/* Continue Learning */}
        {mostRecentEnrollment?.course && (
          <View className="mx-6 -mt-4">
            <TouchableOpacity
              onPress={() =>
                router.push(`/course/${mostRecentEnrollment.course!.id}`)
              }
              className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 flex-row"
            >
              <Image
                source={{
                  uri:
                    mostRecentEnrollment.course!.thumbnail_url ??
                    FALLBACK_THUMBNAIL_IMAGE,
                }}
                className="w-20 h-20 rounded-xl bg-gray-200"
                resizeMode="cover"
              />
              <View className="flex-1 ml-4 justify-center">
                <Text className="text-xs text-primary-600 font-medium uppercase tracking-wide">
                  Continue Learning
                </Text>
                <Text
                  className="mt-1 text-sm font-semibold text-gray-900"
                  numberOfLines={1}
                >
                  {mostRecentEnrollment.course!.title}
                </Text>
                <View className="mt-2">
                  <ProgressBar
                    progress={mostRecentEnrollment.progress_percent!}
                    height={4}
                  />
                </View>
                <Text className="mt-1 text-xs text-gray-500">
                  {Math.round(mostRecentEnrollment.progress_percent!)}% complete
                </Text>
              </View>
              <ChevronRight size={20} color="#9CA3AF" className="self-center" />
            </TouchableOpacity>
          </View>
        )}

        {/* Enrolled Courses */}
        <View className="mt-6 px-6">
          <View className="flex-row justify-between items-center mb-4">
            <Text className="text-lg font-bold text-gray-900">
              My Courses
            </Text>
            <TouchableOpacity onPress={() => router.push("/(tabs)/my-courses")}>
              <Text className="text-primary-600 text-sm font-medium">
                See All
              </Text>
            </TouchableOpacity>
          </View>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            className="-mx-6 px-6"
          >
            {enrollments
              .filter((e) => e.course)
              .map((enrollment) => (
                <CourseCard
                  key={enrollment.id}
                  course={enrollment.course as unknown as Course}
                  onPress={(course) =>
                    router.push(`/course/${course.id}`)
                  }
                  horizontal
                />
              ))}
            {enrollments.length === 0 && (
              <View className="w-full items-center py-8">
                <BookOpen size={40} color="#D1D5DB" />
                <Text className="mt-2 text-gray-400 text-sm">
                  No enrolled courses yet
                </Text>
                <TouchableOpacity
                  onPress={() => router.push("/(tabs)/catalog")}
                  className="mt-2 px-4 py-2 bg-primary-600 rounded-lg"
                >
                  <Text className="text-white text-sm font-medium">
                    Browse Catalog
                  </Text>
                </TouchableOpacity>
              </View>
            )}
          </ScrollView>
        </View>

        {/* Upcoming Deadlines */}
        {deadlineItems.length > 0 && (
          <View className="mt-6 px-6">
            <View className="flex-row items-center mb-4">
              <Clock size={18} color="#4F46E5" />
              <Text className="ml-2 text-lg font-bold text-gray-900">
                Upcoming Deadlines
              </Text>
            </View>
            {deadlineItems.map((item) => (
              <View
                key={item.id}
                className="bg-white rounded-xl border border-gray-100 p-4 mb-2"
              >
                <View className="flex-row justify-between items-center">
                  <Text className="flex-1 text-sm font-medium text-gray-900" numberOfLines={1}>
                    {item.title}
                  </Text>
                  <Text className="text-xs text-gray-500 ml-2">
                    {item.dueText}
                  </Text>
                </View>
                <ProgressBar progress={item.progress} height={3} className="mt-2" />
              </View>
            ))}
          </View>
        )}

        {/* Points Summary */}
        <View className="mx-6 mt-6 mb-8 bg-gradient-to-r from-primary-600 to-primary-500 rounded-2xl p-5">
          <View className="flex-row items-center">
            <TrendingUp size={24} color="#FFFFFF" />
            <Text className="ml-2 text-white font-semibold text-lg">
              Learning Stats
            </Text>
          </View>
          <View className="flex-row justify-around mt-4">
            <View className="items-center">
              <Text className="text-2xl font-bold text-white">
                {profile?.points ?? 0}
              </Text>
              <Text className="text-primary-200 text-xs mt-1">
                Total Points
              </Text>
            </View>
            <View className="items-center">
              <Text className="text-2xl font-bold text-white">
                {profile?.streak_count ?? 0}
              </Text>
              <Text className="text-primary-200 text-xs mt-1">
                Day Streak
              </Text>
            </View>
            <View className="items-center">
              <Text className="text-2xl font-bold text-white">
                {enrollments.filter((e) => e.completed_at).length}
              </Text>
              <Text className="text-primary-200 text-xs mt-1">
                Completed
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
