import { View, Text } from "react-native";
import { Flame } from "lucide-react-native";

interface StreakDisplayProps {
  count: number;
  size?: "sm" | "md" | "lg";
}

export default function StreakDisplay({ count, size = "md" }: StreakDisplayProps) {
  const iconSize = size === "sm" ? 16 : size === "lg" ? 28 : 20;
  const textSize = size === "sm" ? "text-xs" : size === "lg" ? "text-lg" : "text-sm";

  return (
    <View className="flex-row items-center space-x-1">
      <Flame size={iconSize} color="#F59E0B" fill="#F59E0B" />
      <Text className={`font-bold text-gray-900 ${textSize}`}>
        {count}
      </Text>
      <Text className={`text-gray-500 ${textSize}`}>day streak</Text>
    </View>
  );
}
