import {
  StyleSheet,
  View,
  Pressable,
  Dimensions,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Text } from "react-native-paper";
import { Video, ResizeMode, AVPlaybackStatus } from "expo-av";
import { useState, useRef, useEffect } from "react";
import { useRouter, useLocalSearchParams } from "expo-router";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useThemeMode } from "@twikkl/entities/theme.entity";
import { useAuth } from "@twikkl/entities/auth.entity";
import { API_ENDPOINTS } from "@twikkl/config/api";
import axios from "axios";
import AppBottomSheet from "@twikkl/components/BottomSheet";
import CommentSheet from "@twikkl/components/CommentSheet";

const { width, height } = Dimensions.get("window");

export default function PlayVideo() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { isDarkMode } = useThemeMode();
  const { isLoggedIn, token } = useAuth();

  const videoRef = useRef<Video>(null);
  const [isPlaying, setIsPlaying] = useState(true);
  const [showComments, setShowComments] = useState(false);
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [commentCount, setCommentCount] = useState(0);
  const [viewCount, setViewCount] = useState(0);
  const [viewRecorded, setViewRecorded] = useState(false);
  const [watchDuration, setWatchDuration] = useState(0);

  const videoId = params.id as string || "demo-video-1";
  const videoUrl = params.url as string || "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4";
  const title = params.title as string || "Big Buck Bunny - Sample Video";
  const creator = params.creator as string || "Blender Foundation";

  const backgroundColor = isDarkMode ? "#000" : "#FFF";
  const textColor = isDarkMode ? "#FFF" : "#000";

  useEffect(() => {
    fetchVideoStats();
  }, [videoId]);

  const fetchVideoStats = async () => {
    try {
      const [likesRes, commentsRes, viewsRes, likedRes] = await Promise.all([
        axios.get(API_ENDPOINTS.LIKES.GET_COUNT(videoId)),
        axios.get(API_ENDPOINTS.COMMENTS.GET_VIDEO_COMMENTS(videoId)),
        axios.get(API_ENDPOINTS.VIEWS.GET_COUNT(videoId)),
        isLoggedIn
          ? axios.get(API_ENDPOINTS.LIKES.IS_LIKED(videoId), {
              headers: { Authorization: `Bearer ${token}` },
            })
          : Promise.resolve({ data: { liked: false } }),
      ]);

      setLikeCount(likesRes.data.likeCount || 0);
      setCommentCount(commentsRes.data.comments?.length || 0);
      setViewCount(viewsRes.data.viewCount || 0);
      setLiked(likedRes.data.liked || false);
    } catch (error) {
      console.error("Error fetching video stats:", error);
    }
  };

  const handlePlaybackStatusUpdate = (status: AVPlaybackStatus) => {
    if (status.isLoaded) {
      setIsPlaying(status.isPlaying);
      const currentTime = status.positionMillis / 1000;
      
      if (currentTime > watchDuration) {
        setWatchDuration(currentTime);
      }

      if (!viewRecorded && currentTime > 3) {
        recordView();
        setViewRecorded(true);
      }

      if (status.didJustFinish && !viewRecorded) {
        recordView(true);
        setViewRecorded(true);
      }
    }
  };

  const recordView = async (completed: boolean = false) => {
    try {
      await axios.post(API_ENDPOINTS.VIEWS.RECORD(videoId), {
        watchDuration: Math.floor(watchDuration),
        completed,
      });
      setViewCount((prev) => prev + 1);
    } catch (error) {
      console.error("Error recording view:", error);
    }
  };

  const togglePlayPause = async () => {
    if (videoRef.current) {
      if (isPlaying) {
        await videoRef.current.pauseAsync();
      } else {
        await videoRef.current.playAsync();
      }
    }
  };

  const handleLikeToggle = async () => {
    if (!isLoggedIn) {
      router.push("auth/Register");
      return;
    }

    const previousLiked = liked;
    const previousCount = likeCount;

    setLiked(!liked);
    setLikeCount(liked ? likeCount - 1 : likeCount + 1);

    try {
      const response = await axios.post(
        API_ENDPOINTS.LIKES.TOGGLE(videoId),
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setLiked(response.data.liked);
      setLikeCount(response.data.likeCount || 0);
    } catch (error) {
      console.error("Error toggling like:", error);
      setLiked(previousLiked);
      setLikeCount(previousCount);
    }
  };

  const handleCommentClick = () => {
    if (!isLoggedIn) {
      router.push("auth/Register");
      return;
    }
    setShowComments(true);
  };

  const formatCount = (count: number): string => {
    if (count >= 1000000) return `${(count / 1000000).toFixed(1)}M`;
    if (count >= 1000) return `${(count / 1000).toFixed(1)}K`;
    return count.toString();
  };

  return (
    <>
      <SafeAreaView style={[styles.container, { backgroundColor }]}>
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} style={styles.backButton}>
            <MaterialCommunityIcons name="arrow-left" size={28} color={textColor} />
          </Pressable>
          <Text style={[styles.headerTitle, { color: textColor }]} numberOfLines={1}>
            {title}
          </Text>
          <View style={{ width: 40 }} />
        </View>

        <ScrollView>
          <Pressable onPress={togglePlayPause} style={styles.videoContainer}>
            <Video
              ref={videoRef}
              source={{ uri: videoUrl }}
              resizeMode={ResizeMode.CONTAIN}
              shouldPlay={isPlaying}
              onPlaybackStatusUpdate={handlePlaybackStatusUpdate}
              style={styles.video}
              useNativeControls
            />
          </Pressable>

          <View style={styles.infoSection}>
            <Text style={[styles.videoTitle, { color: textColor }]}>{title}</Text>
            <Text style={[styles.videoStats, { color: isDarkMode ? "#888" : "#666" }]}>
              {formatCount(viewCount)} views
            </Text>

            <View style={styles.actionsContainer}>
              <TouchableOpacity onPress={handleLikeToggle} style={styles.actionItem}>
                <MaterialCommunityIcons
                  name={liked ? "thumb-up" : "thumb-up-outline"}
                  size={28}
                  color={liked ? "#50A040" : textColor}
                />
                <Text style={[styles.actionText, { color: textColor }]}>
                  {formatCount(likeCount)}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.actionItem}>
                <MaterialCommunityIcons name="thumb-down-outline" size={28} color={textColor} />
                <Text style={[styles.actionText, { color: textColor }]}>Dislike</Text>
              </TouchableOpacity>

              <TouchableOpacity onPress={handleCommentClick} style={styles.actionItem}>
                <MaterialCommunityIcons name="comment-outline" size={28} color={textColor} />
                <Text style={[styles.actionText, { color: textColor }]}>
                  {formatCount(commentCount)}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.actionItem}>
                <MaterialCommunityIcons name="share-outline" size={28} color={textColor} />
                <Text style={[styles.actionText, { color: textColor }]}>Share</Text>
              </TouchableOpacity>
            </View>

            <View style={[styles.creatorSection, { borderTopColor: isDarkMode ? "#333" : "#E5E5E5" }]}>
              <View style={styles.creatorInfo}>
                <MaterialCommunityIcons
                  name="account-circle"
                  size={40}
                  color={isDarkMode ? "#888" : "#666"}
                />
                <View style={styles.creatorDetails}>
                  <Text style={[styles.creatorName, { color: textColor }]}>
                    {creator}
                  </Text>
                  <Text style={[styles.creatorSubs, { color: isDarkMode ? "#888" : "#666" }]}>
                    1.2M subscribers
                  </Text>
                </View>
              </View>
              <TouchableOpacity style={styles.subscribeButton}>
                <Text style={styles.subscribeText}>Subscribe</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>

      {showComments && (
        <AppBottomSheet
          backgroundColor={isDarkMode ? "#1C1C1E" : "#FFFFFF"}
          height="85%"
          closeModal={() => setShowComments(false)}
        >
          <CommentSheet videoId={videoId} onClose={() => setShowComments(false)} />
        </AppBottomSheet>
      )}
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: "600",
    flex: 1,
    textAlign: "center",
    marginHorizontal: 8,
  },
  videoContainer: {
    width: width,
    height: width * (9 / 16),
    backgroundColor: "#000",
  },
  video: {
    width: "100%",
    height: "100%",
  },
  infoSection: {
    padding: 16,
  },
  videoTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 8,
  },
  videoStats: {
    fontSize: 14,
    marginBottom: 16,
  },
  actionsContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingVertical: 12,
  },
  actionItem: {
    alignItems: "center",
  },
  actionText: {
    fontSize: 12,
    marginTop: 4,
  },
  creatorSection: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: 16,
    marginTop: 16,
    borderTopWidth: 1,
  },
  creatorInfo: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  creatorDetails: {
    marginLeft: 12,
  },
  creatorName: {
    fontSize: 16,
    fontWeight: "600",
  },
  creatorSubs: {
    fontSize: 12,
    marginTop: 2,
  },
  subscribeButton: {
    backgroundColor: "#50A040",
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 20,
  },
  subscribeText: {
    color: "#FFF",
    fontWeight: "600",
    fontSize: 14,
  },
});
