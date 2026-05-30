import { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  Image,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from "react-native";
import { useLocalSearchParams, useRouter, Stack } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { FALLBACK_COURSE_IMAGE } from "@/src/lib/constants";
import {
  Star,
  Clock,
  BookOpen,
  Users,
  PlayCircle,
  FileText,
  ChevronDown,
  ChevronRight,
  ChevronUp,
  ShoppingCart,
  Play,
  CheckCircle,
  MessageCircle,
} from "lucide-react-native";
import {
  fetchCourseById,
  fetchLessonsByCourse,
  getCurrentUser,
  supabase,
} from "@shared/utils/supabase";
import type { Course, Lesson } from "@shared/types";

export default function CourseDetailScreen() {
  const { courseId } = useLocalSearchParams<{ courseId: string }>();
  const router = useRouter();
  const [course, setCourse] = useState<Course | null>(null);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"overview" | "curriculum" | "reviews">("overview");
  const [expandedCurriculum, setExpandedCurriculum] = useState(true);
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [enrolling, setEnrolling] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const [courseData, lessonsData] = await Promise.all([
          fetchCourseById(courseId),
          fetchLessonsByCourse(courseId),
        ]);
        setCourse(courseData);
        setLessons(lessonsData);

        const user = await getCurrentUser();
        if (user) {
          const { data } = await supabase
            .from("enrollments")
            .select("id")
            .eq("course_id", courseId)
            .eq("user_id", user.id)
            .single();
          setIsEnrolled(!!data);
        }
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [courseId]);

  const handleEnroll = async () => {
    setEnrolling(true);
    try {
      const user = await getCurrentUser();
      if (!user) {
        router.push("/(auth)/login");
        return;
      }

      const { error } = await supabase.from("enrollments").insert({
        user_id: user.id,
        course_id: courseId,
        progress_percent: 0,
        completed_lessons: [],
      });

      if (error) throw error;
      setIsEnrolled(true);
      Alert.alert("Enrolled!", "You have successfully enrolled in this course.");
    } catch {
      Alert.alert("Error", "Failed to enroll in this course");
    } finally {
      setEnrolling(false);
    }
  };

  const handleContinue = () => {
    if (lessons.length > 0) {
      router.push(`/course/${courseId}/lesson/${lessons[0].id}`);
    }
  };

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-white justify-center items-center">
        <ActivityIndicator size="large" color="#4F46E5" />
      </SafeAreaView>
    );
  }

  if (!course) {
    return (
      <SafeAreaView className="flex-1 bg-white justify-center items-center">
        <Text className="text-gray-500">Course not found</Text>
      </SafeAreaView>
    );
  }

  return (
    <>
      <Stack.Screen options={{ headerTitle: course.title }} />
      <View className="flex-1 bg-gray-50">
        <ScrollView showsVerticalScrollIndicator={false} className="flex-1">
          {/* Hero Image */}
          <Image
            source={{
              uri:
                course.hero_image_url ??
                course.thumbnail_url ??
                FALLBACK_COURSE_IMAGE,
            }}
            className="w-full h-56 bg-gray-200"
            resizeMode="cover"
          />

          <View className="px-6 pt-5 pb-32">
            {/* Title & Instructor */}
            <Text className="text-2xl font-bold text-gray-900">
              {course.title}
            </Text>
            <Text className="mt-1 text-sm text-gray-500">
              Created by {course.instructor_name ?? "Instructor"}
            </Text>

            {/* Rating & Meta */}
            <View className="flex-row items-center mt-3 space-x-4">
              <View className="flex-row items-center">
                <Star size={16} color="#F59E0B" fill="#F59E0B" />
                <Text className="ml-1 text-sm font-semibold text-gray-700">
                  {(course.rating ?? 0).toFixed(1)}
                </Text>
                <Text className="ml-1 text-xs text-gray-400">
                  ({course.review_count})
                </Text>
              </View>
              <View className="flex-row items-center">
                <Users size={16} color="#6B7280" />
                <Text className="ml-1 text-xs text-gray-500">
                  {course.level}
                </Text>
              </View>
            </View>

            {/* Stats */}
            <View className="flex-row mt-4 bg-white rounded-xl border border-gray-100 p-4 space-x-4">
              <View className="flex-1 items-center">
                <Clock size={18} color="#4F46E5" />
                <Text className="mt-1 text-xs font-medium text-gray-600">
                  {course.duration_hours}h
                </Text>
              </View>
              <View className="flex-1 items-center">
                <BookOpen size={18} color="#4F46E5" />
                <Text className="mt-1 text-xs font-medium text-gray-600">
                  {course.lesson_count} lessons
                </Text>
              </View>
              <View className="flex-1 items-center">
                <FileText size={18} color="#4F46E5" />
                <Text className="mt-1 text-xs font-medium text-gray-600">
                  {course.category}
                </Text>
              </View>
            </View>

            {/* Tabs */}
            <View className="flex-row mt-6 border-b border-gray-200">
              {(["overview", "curriculum", "reviews"] as const).map((tab) => (
                <TouchableOpacity
                  key={tab}
                  onPress={() => setActiveTab(tab)}
                  className={`pb-3 mr-6 ${
                    activeTab === tab
                      ? "border-b-2 border-primary-600"
                      : ""
                  }`}
                >
                  <Text
                    className={`text-sm font-medium capitalize ${
                      activeTab === tab
                        ? "text-primary-600"
                        : "text-gray-500"
                    }`}
                  >
                    {tab}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Tab Content */}
            {activeTab === "overview" && (
              <View className="mt-4">
                <Text className="text-sm text-gray-600 leading-6">
                  {course.description}
                </Text>
                {course.what_you_learn && (
                  <View className="mt-6">
                    <Text className="text-base font-semibold text-gray-900 mb-3">
                      What you'll learn
                    </Text>
                    {course.what_you_learn.map((item, i) => (
                      <View key={i} className="flex-row items-start mb-2">
                        <CheckCircle size={16} color="#10B981" className="mt-0.5" />
                        <Text className="ml-2 text-sm text-gray-600 flex-1">
                          {item}
                        </Text>
                      </View>
                    ))}
                  </View>
                )}
              </View>
            )}

            {activeTab === "curriculum" && (
              <View className="mt-4">
                <TouchableOpacity
                  onPress={() => setExpandedCurriculum(!expandedCurriculum)}
                  className="flex-row items-center justify-between mb-3"
                >
                  <Text className="text-base font-semibold text-gray-900">
                    Course Content ({lessons.length} lessons)
                  </Text>
                  {expandedCurriculum ? (
                    <ChevronUp size={20} color="#6B7280" />
                  ) : (
                    <ChevronDown size={20} color="#6B7280" />
                  )}
                </TouchableOpacity>
                {expandedCurriculum &&
                  lessons.map((lesson, index) => (
                    <TouchableOpacity
                      key={lesson.id}
                      onPress={() => {
                        if (isEnrolled || lesson.is_free) {
                          router.push(
                            `/course/${courseId}/lesson/${lesson.id}`
                          );
                        } else {
                          Alert.alert(
                            "Enroll Required",
                            "Please enroll in this course to access this lesson."
                          );
                        }
                      }}
                      className="flex-row items-center py-3 border-b border-gray-100"
                    >
                      <View className="w-8 h-8 rounded-full bg-primary-50 items-center justify-center">
                        <PlayCircle size={16} color="#4F46E5" />
                      </View>
                      <View className="flex-1 ml-3">
                        <Text className="text-sm font-medium text-gray-900">
                          {lesson.title}
                        </Text>
                        <Text className="text-xs text-gray-400 mt-0.5">
                          {Math.floor((lesson.duration_seconds ?? 0) / 60)}:{String(
                            (lesson.duration_seconds ?? 0) % 60
                          ).padStart(2, "0")}
                        </Text>
                      </View>
                      {lesson.is_free && (
                        <View className="px-2 py-1 bg-green-50 rounded">
                          <Text className="text-xs font-medium text-green-600">
                            Free
                          </Text>
                        </View>
                      )}
                    </TouchableOpacity>
                  ))}
                {isEnrolled && (
                  <TouchableOpacity
                    onPress={() => router.push(`/course/${courseId}/discussion`)}
                    className="flex-row items-center py-4 mt-2 border-t border-gray-100"
                  >
                    <View className="w-8 h-8 rounded-full bg-primary-50 items-center justify-center">
                      <MessageCircle size={16} color="#4F46E5" />
                    </View>
                    <View className="flex-1 ml-3">
                      <Text className="text-sm font-semibold text-primary-600">
                        Course Discussion
                      </Text>
                      <Text className="text-xs text-gray-400 mt-0.5">
                        Ask questions and chat with fellow students
                      </Text>
                    </View>
                    <ChevronRight size={18} color="#9CA3AF" />
                  </TouchableOpacity>
                )}
              </View>
            )}

            {activeTab === "reviews" && (
              <View className="mt-4 items-center py-8">
                <Star size={40} color="#D1D5DB" />
                <Text className="mt-3 text-gray-400">
                  No reviews yet
                </Text>
              </View>
            )}
          </View>
        </ScrollView>

        {/* Bottom CTA Bar */}
        <View className="absolute bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-6 py-4">
          <View className="flex-row items-center justify-between">
            <View>
              <Text className="text-2xl font-bold text-gray-900">
                {course.price === 0 ? "Free" : `$${course.price.toFixed(2)}`}
              </Text>
              {course.price > 0 && (
                <Text className="text-xs text-gray-400">Full course access</Text>
              )}
            </View>
            {isEnrolled ? (
              <TouchableOpacity
                onPress={handleContinue}
                className="flex-row items-center bg-primary-600 px-6 py-3 rounded-xl"
              >
                <Play size={18} color="#FFFFFF" />
                <Text className="ml-2 text-white font-semibold">Continue</Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                onPress={handleEnroll}
                disabled={enrolling}
                className={`flex-row items-center px-6 py-3 rounded-xl ${
                  enrolling ? "bg-primary-400" : "bg-primary-600"
                }`}
              >
                {enrolling ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <>
                    <ShoppingCart size={18} color="#FFFFFF" />
                    <Text className="ml-2 text-white font-semibold">
                      {course.price === 0 ? "Enroll Now" : "Buy Now"}
                    </Text>
                  </>
                )}
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>
    </>
  );
}
