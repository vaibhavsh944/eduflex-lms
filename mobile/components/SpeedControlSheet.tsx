import { View, Text, TouchableOpacity, Modal, Pressable } from "react-native";
import { X } from "lucide-react-native";

interface SpeedControlSheetProps {
  visible: boolean;
  currentSpeed: number;
  onSelect: (speed: number) => void;
  onClose: () => void;
}

const speedOptions = [0.5, 0.75, 1, 1.25, 1.5, 2];

export default function SpeedControlSheet({
  visible,
  currentSpeed,
  onSelect,
  onClose,
}: SpeedControlSheetProps) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <Pressable
        onPress={onClose}
        className="flex-1 bg-black/50 justify-end"
      >
        <Pressable
          onPress={(e) => e.stopPropagation()}
          className="bg-white rounded-t-2xl p-6 pb-10"
        >
          <View className="flex-row justify-between items-center mb-6">
            <Text className="text-lg font-bold text-gray-900">Playback Speed</Text>
            <TouchableOpacity onPress={onClose}>
              <X size={24} color="#6B7280" />
            </TouchableOpacity>
          </View>
          <View className="space-y-2">
            {speedOptions.map((speed) => (
              <TouchableOpacity
                key={speed}
                onPress={() => onSelect(speed)}
                className={`flex-row items-center justify-between px-4 py-3.5 rounded-xl ${
                  currentSpeed === speed
                    ? "bg-primary-50 border border-primary-200"
                    : "bg-gray-50"
                }`}
              >
                <Text
                  className={`text-base ${
                    currentSpeed === speed
                      ? "text-primary-600 font-semibold"
                      : "text-gray-700"
                  }`}
                >
                  {speed}x
                </Text>
                {speed === 1 && (
                  <Text className="text-xs text-gray-400">Normal</Text>
                )}
                {currentSpeed === speed && (
                  <View className="w-3 h-3 rounded-full bg-primary-600" />
                )}
              </TouchableOpacity>
            ))}
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}
