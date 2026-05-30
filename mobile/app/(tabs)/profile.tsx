import { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
  SectionList,
} from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import * as ImagePicker from "expo-image-picker";
import {
  User,
  Mail,
  Award,
  BookOpen,
  Flame,
  Settings,
  LogOut,
  ChevronRight,
  Shield,
  HelpCircle,
  Info,
  FileText,
  Camera,
} from "lucide-react-native";
import { supabase, getCurrentUser, getProfile, updateProfile } from "@shared/utils/supabase";
import type { Profile } from "@shared/types";

type SettingsItem = { id: string; label: string; icon: React.ComponentType<{ size?: number; color?: string }>; route: string | null };
const SETTINGS_SECTIONS: { title: string; data: SettingsItem[] }[] = [
  {
    title: "Learning",
    data: [
      { id: "certificates", label: "Certificates", icon: FileText, route: "/(tabs)/certificates" },
      { id: "badges", label: "Badges", icon: Award, route: "/(tabs)/badges" },
      { id: "leaderboard", label: "Leaderboard", icon: Shield, route: "/(tabs)/leaderboard" },
    ],
  },
  {
    title: "Settings",
    data: [
      { id: "account", label: "Account Settings", icon: Settings, route: null },
      { id: "help", label: "Help & Support", icon: HelpCircle, route: null },
      { id: "about", label: "About EduFlow", icon: Info, route: null },
    ],
  },
];

export default function ProfileScreen() {
  const router = useRouter();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

  const loadProfile = useCallback(async () => {
    try {
      const user = await getCurrentUser();
      if (!user) return;

      const prof = await getProfile(user.id);
      setProfile(prof);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  const handleAvatarPick = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert("Permission Required", "We need camera roll access to change your avatar.");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (result.canceled || !result.assets[0]) return;

    setUploading(true);
    try {
      const currentUser = await getCurrentUser();
      if (!currentUser) return;

      const file = result.assets[0];
      const ext = file.uri.split(".").pop();
      const filePath = `avatars/${currentUser.id}.${ext}`;

      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(filePath, {
          uri: file.uri,
          type: file.mimeType ?? "image/jpeg",
          name: filePath,
        } as any, {
          upsert: true,
        });

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage
        .from("avatars")
        .getPublicUrl(filePath);

      await updateProfile(currentUser.id, {
        avatar_url: urlData.publicUrl,
      });

      setProfile((prev) =>
        prev ? { ...prev, avatar_url: urlData.publicUrl } : prev
      );
    } catch {
      Alert.alert("Error", "Failed to update avatar");
    } finally {
      setUploading(false);
    }
  };

  const handleSignOut = () => {
    Alert.alert("Sign Out", "Are you sure you want to sign out?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Sign Out",
        style: "destructive",
        onPress: async () => {
          await supabase.auth.signOut();
        },
      },
    ]);
  };

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50 justify-center items-center">
        <ActivityIndicator size="large" color="#4F46E5" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <SectionList
        sections={SETTINGS_SECTIONS}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <View className="items-center pt-8 pb-6 px-6">
            {/* Avatar */}
            <TouchableOpacity
              onPress={handleAvatarPick}
              disabled={uploading}
              className="relative"
            >
              {profile?.avatar_url ? (
                <Image
                  source={{ uri: profile.avatar_url }}
                  className="w-24 h-24 rounded-full border-4 border-primary-100"
                />
              ) : (
                <View className="w-24 h-24 rounded-full bg-primary-100 border-4 border-primary-100 items-center justify-center">
                  <User size={40} color="#4F46E5" />
                </View>
              )}
              <View className="absolute -bottom-1 -right-1 w-8 h-8 bg-primary-600 rounded-full items-center justify-center border-2 border-white">
                {uploading ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <Camera size={14} color="#FFFFFF" />
                )}
              </View>
            </TouchableOpacity>

            <Text className="mt-4 text-xl font-bold text-gray-900">
              {profile?.full_name ?? "User"}
            </Text>
            <View className="flex-row items-center mt-1">
              <Mail size={14} color="#9CA3AF" />
              <Text className="ml-1.5 text-sm text-gray-500">
                {profile?.email ?? ""}
              </Text>
            </View>

            {/* Stats Row */}
            <View className="flex-row mt-6 bg-white rounded-2xl border border-gray-100 p-4 w-full shadow-sm">
              <View className="flex-1 items-center">
                <Text className="text-xl font-bold text-gray-900">
                  {profile?.points ?? 0}
                </Text>
                <View className="flex-row items-center mt-1">
                  <Award size={14} color="#4F46E5" />
                  <Text className="ml-1 text-xs text-gray-500">Points</Text>
                </View>
              </View>
              <View className="w-px bg-gray-200" />
              <View className="flex-1 items-center">
                <Text className="text-xl font-bold text-gray-900">
                  {profile?.streak_count ?? 0}
                </Text>
                <View className="flex-row items-center mt-1">
                  <Flame size={14} color="#F59E0B" />
                  <Text className="ml-1 text-xs text-gray-500">Streak</Text>
                </View>
              </View>
              <View className="w-px bg-gray-200" />
              <View className="flex-1 items-center">
                <Text className="text-xl font-bold text-gray-900">0</Text>
                <View className="flex-row items-center mt-1">
                  <BookOpen size={14} color="#10B981" />
                  <Text className="ml-1 text-xs text-gray-500">Courses</Text>
                </View>
              </View>
            </View>
          </View>
        }
        renderSectionHeader={({ section }) => (
          <View className="px-6 pt-6 pb-2">
            <Text className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
              {section.title}
            </Text>
          </View>
        )}
        renderItem={({ item }) => (
          <TouchableOpacity
            onPress={() => {
              if (item.route) router.push(item.route);
            }}
            className="flex-row items-center px-6 py-4 bg-white border-b border-gray-50"
          >
            <View className="w-9 h-9 rounded-lg bg-gray-100 items-center justify-center">
              <item.icon size={18} color="#4F46E5" />
            </View>
            <Text className="flex-1 ml-3 text-sm text-gray-900">{item.label}</Text>
            <ChevronRight size={18} color="#D1D5DB" />
          </TouchableOpacity>
        )}
        ListFooterComponent={
          <View className="px-6 pt-6 pb-10">
            <TouchableOpacity
              onPress={handleSignOut}
              className="flex-row items-center justify-center py-4 bg-white rounded-xl border border-red-100"
            >
              <LogOut size={18} color="#EF4444" />
              <Text className="ml-2 text-sm font-semibold text-red-500">
                Sign Out
              </Text>
            </TouchableOpacity>
          </View>
        }
      />
    </SafeAreaView>
  );
}
