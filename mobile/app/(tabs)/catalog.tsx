import { useState, useEffect, useCallback, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
} from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Search } from "lucide-react-native";
import { fetchCourses } from "@shared/utils/supabase";
import type { Course } from "@shared/types";
import CourseCard from "@components/CourseCard";

const CATEGORIES = [
  "All",
  "Technology",
  "Business",
  "Design",
  "Marketing",
  "Science",
  "Health",
  "Music",
];

export default function CatalogScreen() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [courses, setCourses] = useState<Course[]>([]);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const debounceTimer = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => {
    clearTimeout(debounceTimer.current);
    debounceTimer.current = setTimeout(() => {
      setDebouncedQuery(searchQuery);
      setPage(1);
    }, 400);
    return () => clearTimeout(debounceTimer.current);
  }, [searchQuery]);

  const loadCourses = useCallback(
    async (pageNum: number, append: boolean = false) => {
      try {
        const result = await fetchCourses({
          search: debouncedQuery || undefined,
          category:
            selectedCategory === "All" ? undefined : selectedCategory,
          page: pageNum,
          pageSize: 10,
        });

        if (append) {
          setCourses((prev) => [...prev, ...result.courses]);
        } else {
          setCourses(result.courses);
        }
        setTotal(result.total);
      } finally {
        setLoading(false);
        setRefreshing(false);
        setLoadingMore(false);
      }
    },
    [debouncedQuery, selectedCategory]
  );

  useEffect(() => {
    setLoading(true);
    setPage(1);
    loadCourses(1);
  }, [loadCourses, debouncedQuery, selectedCategory]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setPage(1);
    loadCourses(1);
  }, [loadCourses]);

  const handleLoadMore = useCallback(() => {
    if (loadingMore || courses.length >= total) return;
    setLoadingMore(true);
    const nextPage = page + 1;
    setPage(nextPage);
    loadCourses(nextPage, true);
  }, [loadingMore, courses.length, total, page, loadCourses]);

  const handleCategoryPress = useCallback((category: string) => {
    setSelectedCategory(category);
    setPage(1);
  }, []);

  const renderItem = useCallback(
    ({ item, index }: { item: Course; index: number }) => (
      <View className={`flex-1 ${index % 2 === 0 ? "mr-2" : "ml-2"}`}>
        <CourseCard
          course={item}
          onPress={(course) => router.push(`/course/${course.id}`)}
        />
      </View>
    ),
    [router]
  );

  const renderFooter = () => {
    if (!loadingMore) return null;
    return (
      <View className="py-4">
        <ActivityIndicator size="small" color="#4F46E5" />
      </View>
    );
  };

  const renderEmpty = () => {
    if (loading) return null;
    return (
      <View className="flex-1 items-center justify-center py-20">
        <Search size={48} color="#D1D5DB" />
        <Text className="mt-4 text-gray-400 text-lg">No courses found</Text>
        <Text className="text-gray-400 text-sm mt-1">
          Try adjusting your search or filters
        </Text>
      </View>
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      {/* Search Bar */}
      <View className="px-6 pt-4 pb-2">
        <View className="flex-row items-center bg-white rounded-xl border border-gray-200 px-4 shadow-sm">
          <Search size={20} color="#9CA3AF" />
          <TextInput
            className="flex-1 py-3 ml-3 text-gray-900"
            placeholder="Search courses..."
            placeholderTextColor="#9CA3AF"
            value={searchQuery}
            onChangeText={setSearchQuery}
            autoCapitalize="none"
          />
        </View>
      </View>

      {/* Category Filters */}
      <FlatList
        horizontal
        data={CATEGORIES}
        keyExtractor={(item) => item}
        showsHorizontalScrollIndicator={false}
        className="px-6 py-2 max-h-12"
        contentContainerStyle={{ paddingRight: 16 }}
        renderItem={({ item }) => (
          <TouchableOpacity
            onPress={() => handleCategoryPress(item)}
            className={`mr-2 px-4 py-2 rounded-full ${
              selectedCategory === item
                ? "bg-primary-600"
                : "bg-white border border-gray-200"
            }`}
          >
            <Text
              className={`text-sm font-medium ${
                selectedCategory === item
                  ? "text-white"
                  : "text-gray-600"
              }`}
            >
              {item}
            </Text>
          </TouchableOpacity>
        )}
      />

      {/* Course Grid */}
      <FlatList
        data={courses}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        numColumns={2}
        contentContainerClassName="px-6 pt-4 pb-6"
        columnWrapperClassName="flex-row"
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.5}
        ListFooterComponent={renderFooter}
        ListEmptyComponent={renderEmpty}
      />
    </SafeAreaView>
  );
}
