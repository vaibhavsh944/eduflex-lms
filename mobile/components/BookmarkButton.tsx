import { useEffect, useState } from "react";
import { TouchableOpacity } from "react-native";
import { Bookmark } from "lucide-react-native";
import { supabase, getCurrentUser } from "@shared/utils/supabase";

interface BookmarkButtonProps {
  lessonId: string;
  courseId: string;
}

export default function BookmarkButton({ lessonId, courseId }: BookmarkButtonProps) {
  const [bookmarked, setBookmarked] = useState(false);
  const [bookmarkId, setBookmarkId] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const user = await getCurrentUser();
      if (!user) return;
      setUserId(user.id);

      const { data } = await supabase
        .from("video_bookmarks")
        .select("id")
        .eq("user_id", user.id)
        .eq("lesson_id", lessonId)
        .maybeSingle();

      if (data) {
        setBookmarked(true);
        setBookmarkId(data.id);
      }
    })();
  }, [lessonId]);

  const toggleBookmark = async () => {
    try {
      if (!userId) return;

      if (bookmarked && bookmarkId) {
        const { error } = await supabase
          .from("video_bookmarks")
          .delete()
          .eq("id", bookmarkId);
        if (error) throw error;
        setBookmarked(false);
        setBookmarkId(null);
      } else {
        const { data, error } = await supabase
          .from("video_bookmarks")
          .insert({ user_id: userId, lesson_id: lessonId, timestamp_seconds: 0, label: "" })
          .select("id")
          .single();
        if (error) throw error;
        setBookmarked(true);
        setBookmarkId(data.id);
      }
    } catch {
      // Silently handle
    }
  };

  return (
    <TouchableOpacity onPress={toggleBookmark} className="p-2">
      <Bookmark
        size={20}
        color="#FFFFFF"
        fill={bookmarked ? "#FFFFFF" : "transparent"}
      />
    </TouchableOpacity>
  );
}
