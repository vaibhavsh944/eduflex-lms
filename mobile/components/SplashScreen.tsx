import { View, ActivityIndicator, Text } from "react-native";
import { BookOpen } from "lucide-react-native";

export default function SplashScreen() {
  return (
    <View className="flex-1 items-center justify-center bg-[#4F46E5]">
      <BookOpen size={64} color="#FFFFFF" />
      <Text className="mt-4 text-3xl font-bold text-white">EduFlow</Text>
      <ActivityIndicator size="large" color="#FFFFFF" className="mt-8" />
    </View>
  );
}
