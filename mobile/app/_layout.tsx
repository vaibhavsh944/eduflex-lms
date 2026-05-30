import { useEffect, useState } from "react";
import { Stack, useRouter, useSegments } from "expo-router";
import { StatusBar } from "expo-status-bar";
import * as Notifications from "expo-notifications";
import { Platform } from "react-native";
import { supabase, getCurrentUser, getProfile } from "@shared/utils/supabase";
import type { Profile } from "@shared/types";
import SplashScreen from "@components/SplashScreen";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

async function registerForPushNotifications(userId: string) {
  const perm = await Notifications.getPermissionsAsync();
  const existingStatus = (perm as { status: string }).status;
  let finalStatus = existingStatus;

  if (existingStatus !== "granted") {
    const req = await Notifications.requestPermissionsAsync();
    finalStatus = (req as { status: string }).status;
  }

  if (finalStatus !== "granted") {
    return;
  }

  const tokenData = await Notifications.getExpoPushTokenAsync();
  const pushToken = tokenData.data;

  await supabase.from("profiles").update({ push_token: pushToken }).eq("id", userId);

  if (Platform.OS === "android") {
    await Notifications.setNotificationChannelAsync("default", {
      name: "default",
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: "#FF231F7C",
    });
  }
}

export default function RootLayout() {
  const router = useRouter();
  const segments = useSegments();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<Profile | null>(null);

  useEffect(() => {
    const initialize = async () => {
      const currentUser = await getCurrentUser();
      setUser(currentUser);

      if (currentUser) {
        const prof = await getProfile(currentUser.id);
        setProfile(prof);
        registerForPushNotifications(currentUser.id);
      }

      setLoading(false);
    };

    initialize();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        const currentUser = session?.user ?? null;
        setUser(currentUser);

        if (currentUser) {
          const prof = await getProfile(currentUser.id);
          setProfile(prof);
          registerForPushNotifications(currentUser.id);
        } else {
          setProfile(null);
        }
      }
    );

    const responseListener = Notifications.addNotificationResponseReceivedListener(
      (response) => {
        const { data } = response.notification.request.content;
        if (data?.type === "course_update" && data?.reference_id) {
          router.push(`/course/${data.reference_id}`);
        }
      }
    );

    return () => {
      subscription?.unsubscribe();
      Notifications.removeNotificationSubscription(responseListener);
    };
  }, []);

  useEffect(() => {
    if (loading) return;

    const inAuthGroup = segments[0] === "(auth)";

    if (!user && !inAuthGroup) {
      router.replace("/(auth)/login");
    } else if (user && inAuthGroup) {
      router.replace("/(tabs)");
    }
  }, [user, loading, segments]);

  if (loading) {
    return <SplashScreen />;
  }

  return (
    <>
      <StatusBar style="auto" />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(auth)" options={{ headerShown: false }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen
          name="course/[courseId]/index"
          options={{ headerShown: true, headerTitle: "Course Details" }}
        />
        <Stack.Screen
          name="course/[courseId]/lesson/[lessonId]"
          options={{ headerShown: true, headerTitle: "Lesson" }}
        />
        <Stack.Screen
          name="course/[courseId]/quiz/[quizId]"
          options={{
            headerShown: true,
            headerTitle: "Quiz",
            headerBackTitle: "Back",
          }}
        />
      </Stack>
    </>
  );
}
