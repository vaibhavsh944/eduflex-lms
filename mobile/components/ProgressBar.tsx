import { View } from "react-native";

interface ProgressBarProps {
  progress: number;
  color?: string;
  height?: number;
  className?: string;
}

export default function ProgressBar({
  progress,
  color = "#4F46E5",
  height = 6,
  className = "",
}: ProgressBarProps) {
  const clampedProgress = Math.min(Math.max(progress, 0), 100);

  return (
    <View
      className={`w-full rounded-full bg-gray-200 overflow-hidden ${className}`}
      style={{ height }}
    >
      <View
        className="rounded-full"
        style={{
          width: `${clampedProgress}%`,
          height: "100%",
          backgroundColor: color,
        }}
      />
    </View>
  );
}
