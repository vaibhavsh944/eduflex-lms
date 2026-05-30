import { useState, useRef, useCallback, useEffect } from "react";
import { View, Text, TouchableOpacity, Dimensions, Platform } from "react-native";
import { ResizeMode, Video, Audio, AVPlaybackStatus } from "expo-av";
import {
  Play,
  Pause,
  Maximize,
  Minimize,
  SkipForward,
  SkipBack,
} from "lucide-react-native";
import SpeedControlSheet from "./SpeedControlSheet";
import BookmarkButton from "./BookmarkButton";

interface VideoPlayerProps {
  videoUrl: string;
  lessonId: string;
  courseId: string;
  onProgress?: (progress: number) => void;
  onComplete?: () => void;
}

export default function VideoPlayer({
  videoUrl,
  lessonId,
  courseId,
  onProgress,
  onComplete,
}: VideoPlayerProps) {
  const videoRef = useRef<Video>(null);
  const [status, setStatus] = useState<AVPlaybackStatus | null>(null);
  const [showSpeedSheet, setShowSpeedSheet] = useState(false);
  const [speed, setSpeed] = useState(1);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const controlsTimeout = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => {
    Audio.setAudioModeAsync({
      allowsRecordingIOS: false,
      playsInSilentModeIOS: true,
      staysActiveInBackground: false,
    });
  }, []);

  const isPlaying = status?.isLoaded ? status.isPlaying : false;
  const progress = status?.isLoaded
    ? ((status.positionMillis ?? 0) / (status.durationMillis ?? 1)) * 100
    : 0;

  const togglePlayback = useCallback(async () => {
    if (!videoRef.current) return;
    if (isPlaying) {
      await videoRef.current.pauseAsync();
    } else {
      await videoRef.current.playAsync();
    }
  }, [isPlaying]);

  const handleSeek = useCallback(async (direction: "back" | "forward") => {
    if (!videoRef.current || !status?.isLoaded) return;
    const seekAmount = direction === "back" ? -10000 : 10000;
    const newPosition = Math.max(
      0,
      Math.min(
        (status.positionMillis ?? 0) + seekAmount,
        status.durationMillis ?? 0
      )
    );
    await videoRef.current.setPositionAsync(newPosition, { toleranceMillisBefore: 100 });
  }, [status]);

  const handleSpeedChange = useCallback((newSpeed: number) => {
    setSpeed(newSpeed);
    videoRef.current?.setRateAsync(newSpeed, true);
    setShowSpeedSheet(false);
  }, []);

  const toggleFullscreen = useCallback(async () => {
    setIsFullscreen((prev) => !prev);
    if (!isFullscreen) {
      await videoRef.current?.presentFullscreenPlayer();
    } else {
      await videoRef.current?.dismissFullscreenPlayer();
    }
  }, [isFullscreen]);

  const handlePlaybackStatusUpdate = useCallback(
    (playbackStatus: AVPlaybackStatus) => {
      setStatus(playbackStatus);
      if (playbackStatus.isLoaded) {
        const pct =
          ((playbackStatus.positionMillis ?? 0) /
            (playbackStatus.durationMillis ?? 1)) *
          100;
        onProgress?.(pct);
        if (pct >= 90 && playbackStatus.didJustFinish) {
          onComplete?.();
        }
      }
    },
    [onProgress, onComplete]
  );

  const formatTime = (millis: number) => {
    const totalSeconds = Math.floor(millis / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  return (
    <View className={`${isFullscreen ? "flex-1" : "w-full"} bg-black`}>
      <TouchableOpacity
        activeOpacity={1}
        onPress={() => {
          setShowControls(true);
          clearTimeout(controlsTimeout.current);
          controlsTimeout.current = setTimeout(() => setShowControls(false), 3000);
        }}
      >
        <Video
          ref={videoRef}
          source={{ uri: videoUrl }}
          style={{
            width: "100%",
            height: isFullscreen ? Dimensions.get("window").height : 240,
          }}
          resizeMode={ResizeMode.CONTAIN}
          isLooping={false}
          onPlaybackStatusUpdate={handlePlaybackStatusUpdate}
          rate={speed}
        />
      </TouchableOpacity>

      {showControls && (
        <View className="absolute inset-0 bg-black/40 justify-center">
          <View className="flex-row justify-center items-center space-x-6 mb-4">
            <TouchableOpacity onPress={() => handleSeek("back")} className="p-3">
              <SkipBack size={28} color="#FFFFFF" />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={togglePlayback}
              className="w-16 h-16 rounded-full bg-white/20 items-center justify-center"
            >
              {isPlaying ? (
                <Pause size={32} color="#FFFFFF" />
              ) : (
                <Play size={32} color="#FFFFFF" />
              )}
            </TouchableOpacity>
            <TouchableOpacity onPress={() => handleSeek("forward")} className="p-3">
              <SkipForward size={28} color="#FFFFFF" />
            </TouchableOpacity>
          </View>

          <View className="flex-row justify-center items-center space-x-4">
            <TouchableOpacity
              onPress={() => setShowSpeedSheet(true)}
              className="px-3 py-1.5 rounded-full bg-white/20"
            >
              <Text className="text-white text-sm font-semibold">{speed}x</Text>
            </TouchableOpacity>
            <BookmarkButton lessonId={lessonId} courseId={courseId} />
            <TouchableOpacity onPress={toggleFullscreen} className="p-2">
              {isFullscreen ? (
                <Minimize size={20} color="#FFFFFF" />
              ) : (
                <Maximize size={20} color="#FFFFFF" />
              )}
            </TouchableOpacity>
          </View>

          <View className="absolute bottom-0 left-0 right-0 px-4 py-2 flex-row justify-between">
            <Text className="text-white text-xs">
              {status?.isLoaded
                ? formatTime(status.positionMillis ?? 0)
                : "0:00"}
            </Text>
            <Text className="text-white text-xs">
              {status?.isLoaded
                ? formatTime(status.durationMillis ?? 0)
                : "0:00"}
            </Text>
          </View>
        </View>
      )}

      <View className="w-full bg-gray-200 h-1">
        <View
          className="h-full bg-primary-600"
          style={{ width: `${progress}%` }}
        />
      </View>

      <SpeedControlSheet
        visible={showSpeedSheet}
        currentSpeed={speed}
        onSelect={handleSpeedChange}
        onClose={() => setShowSpeedSheet(false)}
      />
    </View>
  );
}
