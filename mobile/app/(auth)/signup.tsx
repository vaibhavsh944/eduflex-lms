import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ActivityIndicator,
  ScrollView,
} from "react-native";
import { useRouter } from "expo-router";
import { BookOpen, Mail, Lock, User, Eye, EyeOff } from "lucide-react-native";
import { supabase } from "@shared/utils/supabase";

export default function SignupScreen() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSignup = async () => {
    if (!name.trim() || !email.trim() || !password || !confirmPassword) {
      Alert.alert("Error", "Please fill in all fields");
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert("Error", "Passwords do not match");
      return;
    }

    if (password.length < 6) {
      Alert.alert("Error", "Password must be at least 6 characters");
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signUp({
        email: email.trim().toLowerCase(),
        password,
        options: {
          data: {
            full_name: name.trim(),
          },
        },
      });

      if (error) {
        Alert.alert("Sign Up Failed", error.message);
      } else if (data.user) {
        await supabase.from("profiles").insert({
          user_id: data.user.id,
          full_name: name.trim(),
          email: email.trim().toLowerCase(),
          role: "student",
          points: 0,
          streak_count: 0,
        });

        Alert.alert(
          "Account Created",
          "Welcome to EduFlow! Please check your email to verify your account.",
          [{ text: "OK", onPress: () => router.replace("/(auth)/login") }]
        );
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      className="flex-1 bg-white"
    >
      <ScrollView
        contentContainerStyle={{ flexGrow: 1, justifyContent: "center" }}
        keyboardShouldPersistTaps="handled"
      >
        <View className="px-6 py-8">
          <View className="items-center mb-8">
            <View className="w-20 h-20 bg-primary-600 rounded-2xl items-center justify-center mb-4">
              <BookOpen size={40} color="#FFFFFF" />
            </View>
            <Text className="text-3xl font-bold text-gray-900">Create Account</Text>
            <Text className="mt-2 text-gray-500">Start your learning journey</Text>
          </View>

          <View className="space-y-4 mb-6">
            <View className="flex-row items-center bg-gray-50 rounded-xl border border-gray-200 px-4">
              <User size={20} color="#9CA3AF" />
              <TextInput
                className="flex-1 py-4 ml-3 text-gray-900"
                placeholder="Full name"
                placeholderTextColor="#9CA3AF"
                value={name}
                onChangeText={setName}
                autoCapitalize="words"
              />
            </View>

            <View className="flex-row items-center bg-gray-50 rounded-xl border border-gray-200 px-4">
              <Mail size={20} color="#9CA3AF" />
              <TextInput
                className="flex-1 py-4 ml-3 text-gray-900"
                placeholder="Email address"
                placeholderTextColor="#9CA3AF"
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                keyboardType="email-address"
                autoComplete="email"
              />
            </View>

            <View className="flex-row items-center bg-gray-50 rounded-xl border border-gray-200 px-4">
              <Lock size={20} color="#9CA3AF" />
              <TextInput
                className="flex-1 py-4 ml-3 text-gray-900"
                placeholder="Password"
                placeholderTextColor="#9CA3AF"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                autoCapitalize="none"
              />
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                {showPassword ? (
                  <EyeOff size={20} color="#9CA3AF" />
                ) : (
                  <Eye size={20} color="#9CA3AF" />
                )}
              </TouchableOpacity>
            </View>

            <View className="flex-row items-center bg-gray-50 rounded-xl border border-gray-200 px-4">
              <Lock size={20} color="#9CA3AF" />
              <TextInput
                className="flex-1 py-4 ml-3 text-gray-900"
                placeholder="Confirm password"
                placeholderTextColor="#9CA3AF"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry={!showPassword}
                autoCapitalize="none"
              />
            </View>
          </View>

          <TouchableOpacity
            onPress={handleSignup}
            disabled={loading}
            className={`py-4 rounded-xl items-center ${
              loading ? "bg-primary-400" : "bg-primary-600"
            }`}
          >
            {loading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text className="text-white font-semibold text-lg">Create Account</Text>
            )}
          </TouchableOpacity>

          <View className="flex-row justify-center mt-8">
            <Text className="text-gray-500">Already have an account? </Text>
            <TouchableOpacity onPress={() => router.push("/(auth)/login")}>
              <Text className="text-primary-600 font-semibold">Sign In</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
