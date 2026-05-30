import { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { useLocalSearchParams, useRouter, Stack } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  ChevronLeft,
  ChevronRight,
  CheckCircle,
  BookOpen,
} from "lucide-react-native";
import {
  fetchLessonById,
  fetchLessonsByCourse,
  getCurrentUser,
  supabase,
} from "@shared/utils/supabase";
import type { Lesson } from "@shared/types";
import VideoPlayer from "@components/VideoPlayer";

export default function LessonPlayerScreen() {
  const { courseId, lessonId } = useLocalSearchParams<{
    courseId: string;
    lessonId: string;
  }>();
  const router = useRouter();
  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState(0);
  const [markedComplete, setMarkedComplete] = useState(false);

  const currentIndex = lessons.findIndex((l) => l.id === lessonId);
  const prevLesson = currentIndex > 0 ? lessons[currentIndex - 1] : null;
  const nextLesson =
    currentIndex < lessons.length - 1 ? lessons[currentIndex + 1] : null;

  useEffect(() => {
    const load = async () => {
      try {
        const [lessonData, lessonsData] = await Promise.all([
          fetchLessonById(lessonId),
          fetchLessonsByCourse(courseId),
        ]);
        setLesson(lessonData);
        setLessons(lessonsData);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [lessonId, courseId]);

  const handleProgress = useCallback((pct: number) => {
    setProgress(pct);
  }, []);

  const handleComplete = useCallback(async () => {
    if (markedComplete) return;

    try {
      const user = await getCurrentUser();
      if (!user) return;

      const { data: enrollment } = await supabase
        .from("enrollments")
        .select("*")
        .eq("course_id", courseId)
        .eq("user_id", user.id)
        .single();

      if (!enrollment) return;

      const completedLessons = enrollment.completed_lessons ?? [];
      if (!completedLessons.includes(lessonId)) {
        completedLessons.push(lessonId);
      }

      const newProgress = Math.min(
        Math.round((completedLessons.length / lessons.length) * 100),
        100
      );

      await supabase
        .from("enrollments")
        .update({
          completed_lessons: completedLessons,
          progress_percent: newProgress,
          last_accessed_lesson_id: lessonId,
          completed_at: newProgress >= 100 ? new Date().toISOString() : null,
        })
        .eq("id", enrollment.id);

      setMarkedComplete(true);
    } catch {
      // Silently handle
    }
  }, [courseId, lessonId, lessons.length, markedComplete]);

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-white justify-center items-center">
        <ActivityIndicator size="large" color="#4F46E5" />
      </SafeAreaView>
    );
  }

  if (!lesson) {
    return (
      <SafeAreaView className="flex-1 bg-white justify-center items-center">
        <Text className="text-gray-500">Lesson not found</Text>
      </SafeAreaView>
    );
  }

  return (
    <>
      <Stack.Screen options={{ headerTitle: lesson.title }} />
      <View className="flex-1 bg-gray-50">
        <ScrollView showsVerticalScrollIndicator={false}>
          {/* Video Player */}
          {lesson.video_url && (
            <VideoPlayer
              videoUrl={lesson.video_url}
              lessonId={lessonId}
              courseId={courseId}
              onProgress={handleProgress}
              onComplete={handleComplete}
            />
          )}

          {/* Lesson Content */}
          <View className="px-6 pt-4 pb-32">
            <Text className="text-xl font-bold text-gray-900">
              {lesson.title}
            </Text>
            <Text className="mt-1 text-sm text-gray-400">
              Duration: {Math.floor((lesson.duration_seconds ?? 0) / 60)}:
              {String((lesson.duration_seconds ?? 0) % 60).padStart(2, "0")}
            </Text>

            {lesson.description && (
              <Text className="mt-4 text-sm text-gray-600 leading-6">
                {lesson.description}
              </Text>
            )}

            {/* Progress indicator */}
            {progress >= 90 && !markedComplete && (
              <TouchableOpacity
                onPress={handleComplete}
                className="flex-row items-center justify-center mt-6 py-3 bg-green-50 rounded-xl border border-green-200"
              >
                <CheckCircle size={20} color="#10B981" />
                <Text className="ml-2 text-green-700 font-semibold">
                  Mark as Completed
                </Text>
              </TouchableOpacity>
            )}

            {markedComplete && (
              <View className="flex-row items-center justify-center mt-6 py-3 bg-green-50 rounded-xl border border-green-200">
                <CheckCircle size={20} color="#10B981" />
                <Text className="ml-2 text-green-700 font-semibold">
                  Completed
                </Text>
              </View>
            )}

            {/* Lesson Navigation */}
            <View className="flex-row mt-8 space-x-3">
              {prevLesson ? (
                <TouchableOpacity
                  onPress={() =>
                    router.replace(
                      `/course/${courseId}/lesson/${prevLesson.id}`
                    )
                  }
                  className="flex-1 flex-row items-center justify-center py-3 bg-white border border-gray-200 rounded-xl"
                >
                  <ChevronLeft size={18} color="#4F46E5" />
                  <Text className="ml-1 text-primary-600 font-medium text-sm">
                    Previous
                  </Text>
                </TouchableOpacity>
              ) : (
                <View className="flex-1" />
              )}

              {nextLesson ? (
                <TouchableOpacity
                  onPress={() =>
                    router.replace(
                      `/course/${courseId}/lesson/${nextLesson.id}`
                    )
                  }
                  className="flex-1 flex-row items-center justify-center py-3 bg-primary-600 rounded-xl"
                >
                  <Text className="text-white font-medium text-sm">Next</Text>
                  <ChevronRight size={18} color="#FFFFFF" />
                </TouchableOpacity>
              ) : (
                <TouchableOpacity
                  onPress={() => router.push(`/course/${courseId}`)}
                  className="flex-1 flex-row items-center justify-center py-3 bg-primary-600 rounded-xl"
                >
                  <BookOpen size={18} color="#FFFFFF" />
                  <Text className="ml-1 text-white font-medium text-sm">
                    Back to Course
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        </ScrollView>
      </View>
    </>
  );
}
