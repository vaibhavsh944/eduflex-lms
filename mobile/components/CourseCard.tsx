import { View, Text, Image, TouchableOpacity } from "react-native";
import { Star, User } from "lucide-react-native";
import type { Course } from "@shared/types";
import { FALLBACK_THUMBNAIL_IMAGE } from "@/src/lib/constants";

interface CourseCardProps {
  course: Course;
  onPress: (course: Course) => void;
  horizontal?: boolean;
}

export default function CourseCard({ course, onPress, horizontal = false }: CourseCardProps) {
  return (
    <TouchableOpacity
      onPress={() => onPress(course)}
      className={`bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden ${
        horizontal ? "w-64 mr-3" : "flex-1 mb-4"
      }`}
    >
      <Image
        source={{
          uri: course.thumbnail_url ?? FALLBACK_THUMBNAIL_IMAGE,
        }}
        className="w-full h-36 bg-gray-200"
        resizeMode="cover"
      />
      <View className="p-3">
        <Text className="text-xs font-medium text-primary-600 uppercase tracking-wide">
          {course.category}
        </Text>
        <Text className="mt-1 text-sm font-semibold text-gray-900 line-clamp-2" numberOfLines={2}>
          {course.title}
        </Text>
        <View className="mt-2 flex-row items-center">
          <User size={12} color="#6B7280" />
          <Text className="ml-1 text-xs text-gray-500">
            {course.instructor_name ?? "Instructor"}
          </Text>
        </View>
        <View className="mt-2 flex-row items-center justify-between">
          <View className="flex-row items-center">
            <Star size={14} color="#F59E0B" fill="#F59E0B" />
            <Text className="ml-1 text-xs text-gray-600">
              {(course.rating ?? 0).toFixed(1)}
            </Text>
          </View>
          <Text className="text-sm font-bold text-primary-600">
            {course.price === 0 ? "Free" : `$${course.price.toFixed(2)}`}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}
