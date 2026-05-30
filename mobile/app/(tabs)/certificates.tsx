import { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  FlatList,
  Image,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  Alert,
  Linking,
} from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Award, Download, Eye, FileText } from "lucide-react-native";
import * as FileSystem from "expo-file-system";
import { getCurrentUser, fetchCertificates } from "@shared/utils/supabase";
import type { Certificate } from "@shared/types";

export default function CertificatesScreen() {
  const router = useRouter();
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadData = useCallback(async () => {
    try {
      const user = await getCurrentUser();
      if (!user) return;

      const items = await fetchCertificates(user.id);
      setCertificates(items);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  }, [loadData]);

  const handleView = async (certificate: Certificate) => {
    if (certificate.certificate_url) {
      await Linking.openURL(certificate.certificate_url);
    } else {
      Alert.alert("Unavailable", "Certificate PDF is not yet available.");
    }
  };

  const handleDownload = async (certificate: Certificate) => {
    if (!certificate.certificate_url) {
      Alert.alert("Unavailable", "Certificate PDF is not yet available.");
      return;
    }

    try {
      const fileUri = `${FileSystem.documentDirectory}certificate_${certificate.id}.pdf`;
      const download = await FileSystem.downloadAsync(
        certificate.certificate_url,
        fileUri
      );

      if (download.uri) {
        Alert.alert("Downloaded", "Certificate saved to your device.");
      }
    } catch {
      Alert.alert("Error", "Failed to download certificate.");
    }
  };

  const renderItem = ({ item }: { item: Certificate }) => (
    <View className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm mb-4">
      <View className="bg-gradient-to-r from-primary-600 to-primary-400 p-6 items-center">
        <Award size={48} color="#FFFFFF" />
        <Text className="mt-3 text-lg font-bold text-white text-center">
          Certificate of Completion
        </Text>
      </View>

      <View className="p-4">
        <Text className="text-sm font-semibold text-gray-900" numberOfLines={2}>
          {(item.course as { title?: string } | null)?.title ?? "Course"}
        </Text>
        <Text className="mt-1 text-xs text-gray-400">
          Issued: {new Date(item.issued_at).toLocaleDateString()}
        </Text>

        <View className="flex-row mt-4 space-x-3">
          <TouchableOpacity
            onPress={() => handleView(item)}
            className="flex-1 flex-row items-center justify-center py-2.5 bg-primary-50 rounded-lg"
          >
            <Eye size={16} color="#4F46E5" />
            <Text className="ml-1.5 text-sm font-medium text-primary-600">
              View
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => handleDownload(item)}
            className="flex-1 flex-row items-center justify-center py-2.5 bg-gray-50 rounded-lg border border-gray-200"
          >
            <Download size={16} color="#374151" />
            <Text className="ml-1.5 text-sm font-medium text-gray-700">
              Download
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50 justify-center items-center">
        <ActivityIndicator size="large" color="#4F46E5" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <View className="px-6 pt-4 pb-2">
        <Text className="text-2xl font-bold text-gray-900">Certificates</Text>
        <Text className="text-sm text-gray-500 mt-1">
          {certificates.length}{" "}
          {certificates.length === 1 ? "certificate" : "certificates"} earned
        </Text>
      </View>

      <FlatList
        data={certificates}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        showsVerticalScrollIndicator={false}
        contentContainerClassName="px-6 pt-2 pb-8"
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <View className="flex-1 items-center justify-center py-20">
            <FileText size={48} color="#D1D5DB" />
            <Text className="mt-4 text-gray-400 text-lg">
              No certificates yet
            </Text>
            <Text className="text-gray-400 text-sm mt-1 text-center">
              Complete courses to earn certificates
            </Text>
          </View>
        }
        numColumns={1}
      />
    </SafeAreaView>
  );
}
