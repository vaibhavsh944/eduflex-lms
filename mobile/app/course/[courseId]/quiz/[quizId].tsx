import { useState, useEffect, useCallback, useRef } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from "react-native";
import { useLocalSearchParams, useRouter, Stack } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Timer, AlertTriangle, CheckCircle, XCircle, RotateCcw } from "lucide-react-native";
import { fetchLessonById, getCurrentUser, supabase } from "@shared/utils/supabase";
import type { Quiz, QuizQuestion, QuizAttempt } from "@shared/types";
import QuizPlayerMobile from "@components/QuizPlayerMobile";

export default function QuizPlayerScreen() {
  const { courseId, quizId } = useLocalSearchParams<{
    courseId: string;
    quizId: string;
  }>();
  const router = useRouter();
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [timeLeft, setTimeLeft] = useState(0);
  const [submitted, setSubmitted] = useState(false);
  const [result, setResult] = useState<{
    score: number;
    total: number;
    passed: boolean;
    details: { questionId: string; correct: boolean }[];
  } | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval>>();

  useEffect(() => {
    const load = async () => {
      try {
        const { data: quizData } = await supabase
          .from("quizzes")
          .select("*")
          .eq("id", quizId)
          .single();

        const { data: questionData } = await supabase
          .from("quiz_questions")
          .select("*")
          .eq("quiz_id", quizId)
          .order("order_index", { ascending: true });

        setQuiz(quizData);
        setQuestions(questionData ?? []);

        if (quizData?.time_limit_minutes) {
          setTimeLeft(quizData.time_limit_minutes * 60);
        }
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [quizId]);

  useEffect(() => {
    if (timeLeft <= 0 || !quiz?.time_limit_minutes || submitted) return;

    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          handleSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timerRef.current);
  }, [timeLeft, quiz?.time_limit_minutes, submitted]);

  const currentQuestion = questions[currentQuestionIndex];

  const handleAnswer = useCallback((answer: string) => {
    setAnswers((prev) => ({
      ...prev,
      [currentQuestion.id]: answer,
    }));
  }, [currentQuestion?.id]);

  const goToNext = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
    }
  };

  const goToPrev = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex((prev) => prev - 1);
    }
  };

  const handleSubmit = useCallback(async () => {
    clearInterval(timerRef.current);

    let score = 0;
    let totalPoints = 0;
    const details = questions.map((q) => {
      totalPoints += q.points ?? 0;
      const isCorrect = answers[q.id]?.toLowerCase() === q.correct_answer?.toLowerCase();
      if (isCorrect) score += q.points ?? 0;
      return { questionId: q.id, correct: isCorrect };
    });

    const passed = score / totalPoints >= (quiz?.passing_score ?? 70) / 100;
    setResult({ score, total: totalPoints, passed, details });
    setSubmitted(true);

    try {
      const user = await getCurrentUser();
      if (!user || !quiz) return;

      await supabase.from("quiz_attempts").insert({
        user_id: user.id,
        quiz_id: quizId,
        score,
        total_points: totalPoints,
        answers,
        started_at: new Date().toISOString(),
        completed_at: new Date().toISOString(),
      });

      if (passed) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("points")
          .eq("user_id", user.id)
          .single();

        if (profile) {
          await supabase
            .from("profiles")
            .update({ points: (profile.points ?? 0) + score })
            .eq("user_id", user.id);
        }
      }
    } catch {
      // Silently handle
    }
  }, [answers, questions, quiz, quizId]);

  const handleFinish = () => {
    router.push(`/course/${courseId}`);
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-white justify-center items-center">
        <ActivityIndicator size="large" color="#4F46E5" />
      </SafeAreaView>
    );
  }

  if (!quiz || questions.length === 0) {
    return (
      <SafeAreaView className="flex-1 bg-white justify-center items-center">
        <Text className="text-gray-500">Quiz not found</Text>
      </SafeAreaView>
    );
  }

  // Results Screen
  if (submitted && result) {
    const correctCount = result.details.filter((d) => d.correct).length;
    const percentage = Math.round((result.score / result.total) * 100);

    return (
      <>
        <Stack.Screen options={{ headerTitle: "Quiz Results" }} />
        <SafeAreaView className="flex-1 bg-gray-50">
          <ScrollView contentContainerClassName="p-6 items-center">
            <View
              className={`w-28 h-28 rounded-full items-center justify-center mb-6 ${
                result.passed ? "bg-green-100" : "bg-red-100"
              }`}
            >
              {result.passed ? (
                <CheckCircle size={56} color="#10B981" />
              ) : (
                <XCircle size={56} color="#EF4444" />
              )}
            </View>

            <Text
              className={`text-2xl font-bold ${
                result.passed ? "text-green-600" : "text-red-500"
              }`}
            >
              {result.passed ? "Congratulations!" : "Try Again"}
            </Text>
            <Text className="mt-2 text-gray-500 text-center">
              {result.passed
                ? "You passed the quiz!"
                : "You didn't reach the passing score."}
            </Text>

            <View className="w-full bg-white rounded-2xl border border-gray-100 p-6 mt-8">
              <Text className="text-4xl font-bold text-gray-900 text-center">
                {percentage}%
              </Text>
              <Text className="text-gray-500 text-center mt-1">
                Score: {result.score}/{result.total}
              </Text>
              <Text className="text-gray-500 text-center">
                Correct: {correctCount}/{questions.length}
              </Text>
            </View>

            {/* Question Review */}
            <View className="w-full mt-6">
              <Text className="text-lg font-bold text-gray-900 mb-4">
                Review
              </Text>
              {questions.map((q, i) => {
                const detail = result.details.find(
                  (d) => d.questionId === q.id
                );
                return (
                  <View
                    key={q.id}
                    className={`flex-row items-center p-4 mb-2 rounded-xl border ${
                      detail?.correct
                        ? "bg-green-50 border-green-200"
                        : "bg-red-50 border-red-200"
                    }`}
                  >
                    {detail?.correct ? (
                      <CheckCircle size={18} color="#10B981" />
                    ) : (
                      <XCircle size={18} color="#EF4444" />
                    )}
                    <Text className="ml-3 text-sm text-gray-700 flex-1" numberOfLines={2}>
                      {q.question_text}
                    </Text>
                  </View>
                );
              })}
            </View>

            <TouchableOpacity
              onPress={handleFinish}
              className="w-full mt-8 py-4 bg-primary-600 rounded-xl items-center"
            >
              <Text className="text-white font-semibold text-lg">
                Back to Course
              </Text>
            </TouchableOpacity>
          </ScrollView>
        </SafeAreaView>
      </>
    );
  }

  return (
    <>
      <Stack.Screen options={{ headerTitle: quiz.title }} />
      <SafeAreaView className="flex-1 bg-gray-50">
        {/* Timer & Progress */}
        <View className="px-6 py-3 bg-white border-b border-gray-100">
          <View className="flex-row justify-between items-center">
            <View className="flex-row items-center">
              <View className="flex-row">
                {questions.map((_, i) => (
                  <View
                    key={i}
                    className={`w-2.5 h-2.5 rounded-full mx-0.5 ${
                      answers[questions[i]?.id]
                        ? "bg-primary-600"
                        : i === currentQuestionIndex
                        ? "bg-primary-300"
                        : "bg-gray-200"
                    }`}
                  />
                ))}
              </View>
            </View>
            {quiz.time_limit_minutes && (
              <View className="flex-row items-center">
                <Timer size={16} color={timeLeft < 60 ? "#EF4444" : "#6B7280"} />
                <Text
                  className={`ml-1.5 text-sm font-mono ${
                    timeLeft < 60 ? "text-red-500" : "text-gray-600"
                  }`}
                >
                  {formatTime(timeLeft)}
                </Text>
              </View>
            )}
          </View>
        </View>

        {/* Question */}
        <ScrollView className="flex-1" keyboardShouldPersistTaps="handled">
          {currentQuestion && (
            <QuizPlayerMobile
              question={currentQuestion}
              questionNumber={currentQuestionIndex + 1}
              totalQuestions={questions.length}
              selectedAnswer={answers[currentQuestion.id] ?? null}
              onAnswer={handleAnswer}
            />
          )}
        </ScrollView>

        {/* Bottom Navigation */}
        <View className="bg-white border-t border-gray-100 px-6 py-4">
          <View className="flex-row space-x-3">
            <TouchableOpacity
              onPress={goToPrev}
              disabled={currentQuestionIndex === 0}
              className={`flex-1 py-3 rounded-xl items-center ${
                currentQuestionIndex === 0
                  ? "bg-gray-100"
                  : "bg-white border border-gray-200"
              }`}
            >
              <Text
                className={`font-medium text-sm ${
                  currentQuestionIndex === 0 ? "text-gray-400" : "text-gray-700"
                }`}
              >
                Previous
              </Text>
            </TouchableOpacity>

            {currentQuestionIndex < questions.length - 1 ? (
              <TouchableOpacity
                onPress={goToNext}
                disabled={!answers[currentQuestion.id]}
                className={`flex-1 py-3 rounded-xl items-center ${
                  answers[currentQuestion.id]
                    ? "bg-primary-600"
                    : "bg-gray-300"
                }`}
              >
                <Text className="text-white font-medium text-sm">Next</Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                onPress={handleSubmit}
                className="flex-1 py-3 bg-green-600 rounded-xl items-center"
              >
                <Text className="text-white font-medium text-sm">Submit</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </SafeAreaView>
    </>
  );
}
