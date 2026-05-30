import { useState } from "react";
import { View, Text, TextInput, TouchableOpacity } from "react-native";
import { CheckCircle, Circle } from "lucide-react-native";
import type { QuizQuestion, QuestionType } from "@shared/types";

interface QuizPlayerMobileProps {
  question: QuizQuestion;
  questionNumber: number;
  totalQuestions: number;
  selectedAnswer: string | null;
  onAnswer: (answer: string) => void;
  showResult?: boolean;
  correctAnswer?: string;
}

export default function QuizPlayerMobile({
  question,
  questionNumber,
  totalQuestions,
  selectedAnswer,
  onAnswer,
  showResult = false,
  correctAnswer,
}: QuizPlayerMobileProps) {
  const [shortAnswer, setShortAnswer] = useState(
    selectedAnswer ?? ""
  );

  const isCorrect = showResult && selectedAnswer === correctAnswer;
  const isWrong = showResult && selectedAnswer && selectedAnswer !== correctAnswer;

  const submitShortAnswer = () => {
    if (shortAnswer.trim()) {
      onAnswer(shortAnswer.trim());
    }
  };

  const renderMultipleChoice = () => {
    return (question.options as Array<string> | null)?.map((option, index) => {
      const isSelected = selectedAnswer === option;
      const isOptionCorrect = showResult && option === correctAnswer;
      const isOptionWrong = showResult && isSelected && option !== correctAnswer;

      return (
        <TouchableOpacity
          key={index}
          onPress={() => onAnswer(option)}
          disabled={showResult}
          className={`flex-row items-center p-4 mb-2 rounded-xl border ${
            isOptionCorrect
              ? "border-green-400 bg-green-50"
              : isOptionWrong
              ? "border-red-400 bg-red-50"
              : isSelected
              ? "border-primary-500 bg-primary-50"
              : "border-gray-200 bg-white"
          }`}
        >
          {isSelected || isOptionCorrect ? (
            <CheckCircle
              size={20}
              color={isOptionCorrect ? "#10B981" : isOptionWrong ? "#EF4444" : "#4F46E5"}
              fill={isOptionCorrect ? "#10B981" : isOptionWrong ? "#EF4444" : "#4F46E5"}
            />
          ) : (
            <Circle size={20} color="#D1D5DB" />
          )}
          <Text
            className={`ml-3 text-sm flex-1 ${
              isOptionCorrect
                ? "text-green-700 font-medium"
                : isOptionWrong
                ? "text-red-700 font-medium"
                : isSelected
                ? "text-primary-700 font-medium"
                : "text-gray-700"
            }`}
          >
            {option}
          </Text>
        </TouchableOpacity>
      );
    });
  };

  const renderTrueFalse = () => {
    return ["True", "False"].map((option) => {
      const isSelected = selectedAnswer === option.toLowerCase();
      const isOptionCorrect = showResult && option.toLowerCase() === correctAnswer;
      const isOptionWrong = showResult && isSelected && option.toLowerCase() !== correctAnswer;

      return (
        <TouchableOpacity
          key={option}
          onPress={() => onAnswer(option.toLowerCase())}
          disabled={showResult}
          className={`flex-row items-center p-4 mb-2 rounded-xl border ${
            isOptionCorrect
              ? "border-green-400 bg-green-50"
              : isOptionWrong
              ? "border-red-400 bg-red-50"
              : isSelected
              ? "border-primary-500 bg-primary-50"
              : "border-gray-200 bg-white"
          }`}
        >
          {isSelected || isOptionCorrect ? (
            <CheckCircle
              size={20}
              color={isOptionCorrect ? "#10B981" : "#4F46E5"}
              fill={isOptionCorrect ? "#10B981" : "#4F46E5"}
            />
          ) : (
            <Circle size={20} color="#D1D5DB" />
          )}
          <Text
            className={`ml-3 text-sm flex-1 ${
              isOptionCorrect
                ? "text-green-700 font-medium"
                : isOptionWrong
                ? "text-red-700 font-medium"
                : isSelected
                ? "text-primary-700 font-medium"
                : "text-gray-700"
            }`}
          >
            {option}
          </Text>
        </TouchableOpacity>
      );
    });
  };

  const renderShortAnswer = () => {
    return (
      <View>
        <TextInput
          value={shortAnswer}
          onChangeText={setShortAnswer}
          placeholder="Type your answer here..."
          placeholderTextColor="#9CA3AF"
          multiline
          numberOfLines={3}
          editable={!showResult}
          className="p-4 border border-gray-200 rounded-xl bg-white text-gray-900 text-sm min-h-[80px]"
        />
        {!showResult && (
          <TouchableOpacity
            onPress={submitShortAnswer}
            disabled={!shortAnswer.trim()}
            className={`mt-3 py-3 rounded-xl items-center ${
              shortAnswer.trim() ? "bg-primary-600" : "bg-gray-300"
            }`}
          >
            <Text className="text-white font-semibold text-sm">Submit Answer</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  };

  const renderQuestion = () => {
    switch (question.question_type) {
      case "true_false":
        return renderTrueFalse();
      case "short_answer":
        return renderShortAnswer();
      default:
        return renderMultipleChoice();
    }
  };

  return (
    <View className="p-4">
      <View className="flex-row justify-between items-center mb-4">
        <Text className="text-xs text-gray-500">
          Question {questionNumber} of {totalQuestions}
        </Text>
        <Text className="text-xs text-gray-400">
           {question.points ?? 0} pts
        </Text>
      </View>

      <Text className="text-lg font-semibold text-gray-900 mb-4">
        {question.question_text ?? question.body}
      </Text>

      {renderQuestion()}

      {showResult && (
        <View
          className={`mt-4 p-3 rounded-xl ${
            isCorrect ? "bg-green-50 border border-green-200" : "bg-red-50 border border-red-200"
          }`}
        >
          <Text
            className={`text-sm font-medium ${
              isCorrect ? "text-green-700" : "text-red-700"
            }`}
          >
            {isCorrect
              ? "Correct!"
              : `Incorrect. The correct answer was: ${correctAnswer}`}
          </Text>
        </View>
      )}
    </View>
  );
}
