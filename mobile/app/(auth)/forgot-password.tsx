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
} from "react-native";
import { useRouter } from "expo-router";
import { BookOpen, Mail, ArrowLeft } from "lucide-react-native";
import { supabase } from "@shared/utils/supabase";

export default function ForgotPasswordScreen() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleResetPassword = async () => {
    if (!email.trim()) {
      Alert.alert("Error", "Please enter your email address");
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(
        email.trim().toLowerCase(),
        {
          redirectTo: "eduflow://reset-password",
        }
      );

      if (error) {
        Alert.alert("Error", error.message);
      } else {
        setSent(true);
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
      <View className="flex-1 px-6 justify-center">
        <TouchableOpacity
          onPress={() => router.back()}
          className="absolute top-12 left-4 p-2"
        >
          <ArrowLeft size={24} color="#374151" />
        </TouchableOpacity>

        <View className="items-center mb-10">
          <View className="w-20 h-20 bg-primary-600 rounded-2xl items-center justify-center mb-4">
            <BookOpen size={40} color="#FFFFFF" />
          </View>
          <Text className="text-3xl font-bold text-gray-900">
            Reset Password
          </Text>
          <Text className="mt-2 text-gray-500 text-center">
            {sent
              ? "Check your email for the reset link"
              : "Enter your email and we'll send you a reset link"}
          </Text>
        </View>

        {!sent ? (
          <>
            <View className="flex-row items-center bg-gray-50 rounded-xl border border-gray-200 px-4 mb-6">
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

            <TouchableOpacity
              onPress={handleResetPassword}
              disabled={loading}
              className={`py-4 rounded-xl items-center ${
                loading ? "bg-primary-400" : "bg-primary-600"
              }`}
            >
              {loading ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text className="text-white font-semibold text-lg">
                  Send Reset Link
                </Text>
              )}
            </TouchableOpacity>
          </>
        ) : (
          <View className="items-center">
            <View className="w-16 h-16 rounded-full bg-green-100 items-center justify-center mb-4">
              <Mail size={32} color="#10B981" />
            </View>
            <TouchableOpacity
              onPress={() => router.replace("/(auth)/login")}
              className="mt-4"
            >
              <Text className="text-primary-600 font-semibold">
                Back to Sign In
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </KeyboardAvoidingView>
  );
}
