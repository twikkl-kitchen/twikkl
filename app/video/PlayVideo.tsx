import {
  StyleSheet,
  View,
  Pressable,
  Dimensions,
  TouchableOpacity,
  ScrollView,
  Image,
  Animated,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Text, Badge } from "react-native-paper";
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
import Logo from "@twikkl/components/Logo";
import SunIcon from "@assets/svg/SunIcon";
import MoonIcon from "@assets/svg/MoonIcon";
import SearchIcon from "@assets/svg/SearchIcon";

const { width, height } = Dimensions.get("window");

const recommendedVideos = [
  {
    id: "rec-video-1",
    title: "Advanced React Native Performance Tips",
    creator: "TechGuru",
    creatorId: "creator-2",
    thumbnail: "https://picsum.photos/seed/video1/320/180",
    url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4",
    views: "245K",
    time: "3 days ago",
  },
  {
    id: "rec-video-2",
    title: "Building Scalable Mobile Apps with Expo",
    creator: "DevMaster",
    creatorId: "creator-3",
    thumbnail: "https://picsum.photos/seed/video2/320/180",
    url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
    views: "89K",
    time: "1 week ago",
  },
  {
    id: "rec-video-3",
    title: "State Management Best Practices 2025",
    creator: "CodeAcademy",
    creatorId: "creator-4",
    thumbnail: "https://picsum.photos/seed/video3/320/180",
    url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4",
    views: "512K",
    time: "2 weeks ago",
  },
  {
    id: "rec-video-4",
    title: "Creating Beautiful UI Animations",
    creator: "DesignHub",
    creatorId: "creator-5",
    thumbnail: "https://picsum.photos/seed/video4/320/180",
    url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4",
    views: "1.2M",
    time: "1 month ago",
  },
  {
    id: "rec-video-5",
    title: "TypeScript Tips Every Developer Should Know",
    creator: "TypeScript Pro",
    creatorId: "creator-6",
    thumbnail: "https://picsum.photos/seed/video5/320/180",
    url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
    views: "678K",
    time: "5 days ago",
  },
];

export default function PlayVideo() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { isDarkMode, toggleTheme } = useThemeMode();
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
  const [isFollowing, setIsFollowing] = useState(false);
  const [followerCount, setFollowerCount] = useState(0);
  const [showControls, setShowControls] = useState(true);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const controlsTimer = useRef<NodeJS.Timeout | null>(null);

  const videoId = params.id as string || "demo-video-1";
  const videoUrl = params.url as string || "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4";
  const title = params.title as string || "Big Buck Bunny - Sample Video";
  const creator = params.creator as string || "Blender Foundation";

  const backgroundColor = isDarkMode ? "#000" : "#FFF";
  const textColor = isDarkMode ? "#FFF" : "#000";

  useEffect(() => {
    fetchVideoStats();
    fetchFollowStatus();
  }, [videoId]);

  const creatorId = params.creatorId as string || "demo-creator-1";

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

  const fetchFollowStatus = async () => {
    if (!isLoggedIn) {
      setFollowerCount(Math.floor(Math.random() * 2000000) + 100000);
      return;
    }

    try {
      const [followingRes, followersRes] = await Promise.all([
        axios.get(API_ENDPOINTS.FOLLOWS.IS_FOLLOWING(creatorId), {
          headers: { Authorization: `Bearer ${token}` },
        }),
        axios.get(API_ENDPOINTS.FOLLOWS.GET_FOLLOWERS(creatorId)),
      ]);

      setIsFollowing(followingRes.data.isFollowing || false);
      setFollowerCount(followersRes.data.followerCount || 0);
    } catch (error) {
      console.error("Error fetching follow status:", error);
      setFollowerCount(Math.floor(Math.random() * 2000000) + 100000);
    }
  };

  const handleFollowToggle = async () => {
    if (!isLoggedIn) {
      router.push("auth/Register");
      return;
    }

    const previousFollowing = isFollowing;
    const previousCount = followerCount;

    setIsFollowing(!isFollowing);
    setFollowerCount(isFollowing ? followerCount - 1 : followerCount + 1);

    try {
      if (isFollowing) {
        await axios.delete(API_ENDPOINTS.FOLLOWS.UNFOLLOW_USER(creatorId), {
          headers: { Authorization: `Bearer ${token}` },
        });
      } else {
        await axios.post(
          API_ENDPOINTS.FOLLOWS.FOLLOW_USER(creatorId),
          {},
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
      }
    } catch (error) {
      console.error("Error toggling follow:", error);
      setIsFollowing(previousFollowing);
      setFollowerCount(previousCount);
    }
  };

  const handlePlaybackStatusUpdate = (status: AVPlaybackStatus) => {
    if (status.isLoaded) {
      setIsPlaying(status.isPlaying);
      const currentTime = status.positionMillis / 1000;
      const totalDuration = status.durationMillis ? status.durationMillis / 1000 : 0;
      
      setProgress(status.positionMillis || 0);
      setDuration(status.durationMillis || 0);
      
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

  const resetControlsTimer = () => {
    if (controlsTimer.current) {
      clearTimeout(controlsTimer.current);
    }
    setShowControls(true);
    controlsTimer.current = setTimeout(() => {
      if (isPlaying) {
        setShowControls(false);
      }
    }, 3000);
  };

  const handleVideoPress = () => {
    resetControlsTimer();
  };

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  const handleSeek = async (value: number) => {
    if (videoRef.current) {
      await videoRef.current.setPositionAsync(value);
    }
  };

  const formatTime = (millis: number) => {
    const totalSeconds = Math.floor(millis / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
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

  const handleProfileClick = () => {
    if (isLoggedIn) {
      router.push("/Profile");
    } else {
      router.push("/auth/Register");
    }
  };

  return (
    <>
      <SafeAreaView style={[styles.container, { backgroundColor }]}>
        <View style={styles.header}>
          <View style={styles.logoContainer}>
            <Logo width={40} height={40} />
            <Text style={[styles.logoText, { color: textColor }]}>twikkl</Text>
          </View>
          <View style={styles.headerActions}>
            <Pressable onPress={toggleTheme}>
              {isDarkMode ? (
                <SunIcon color={textColor} />
              ) : (
                <MoonIcon color={textColor} />
              )}
            </Pressable>
            <Pressable onPress={() => alert("Search feature coming soon!")}>
              <SearchIcon color={textColor} />
            </Pressable>
            <Pressable onPress={() => router.push("/Notification")}>
              <MaterialCommunityIcons name="bell" size={24} color={textColor} />
            </Pressable>
            <Pressable onPress={handleProfileClick}>
              <Image
                source={{ uri: "https://images.unsplash.com/photo-1683998215234-02fca98a3b54?w=200&h=200&fit=crop" }}
                style={styles.profileIcon}
              />
            </Pressable>
          </View>
        </View>

        <ScrollView>
          <Pressable onPress={handleVideoPress} style={[styles.videoContainer, isFullscreen && styles.videoContainerFullscreen]}>
            <Video
              ref={videoRef}
              source={{ uri: videoUrl }}
              resizeMode={ResizeMode.CONTAIN}
              shouldPlay={isPlaying}
              onPlaybackStatusUpdate={handlePlaybackStatusUpdate}
              style={styles.video}
            />
            
            {showControls && (
              <View style={styles.videoControls}>
                <Pressable onPress={togglePlayPause} style={styles.playPauseButton}>
                  <MaterialCommunityIcons
                    name={isPlaying ? "pause" : "play"}
                    size={64}
                    color="#FFF"
                  />
                </Pressable>

                <View style={styles.bottomControls}>
                  <View style={styles.progressContainer}>
                    <View style={[styles.progressBar, { width: `${(progress / duration) * 100}%` }]} />
                    <Pressable
                      style={[styles.progressThumb, { left: `${(progress / duration) * 100}%` }]}
                      onPressIn={() => {}}
                    />
                  </View>
                  <View style={styles.controlsBottom}>
                    <Text style={styles.timeText}>
                      {formatTime(progress)} / {formatTime(duration)}
                    </Text>
                    <Pressable onPress={toggleFullscreen}>
                      <MaterialCommunityIcons
                        name={isFullscreen ? "fullscreen-exit" : "fullscreen"}
                        size={24}
                        color="#FFF"
                      />
                    </Pressable>
                  </View>
                </View>
              </View>
            )}
          </Pressable>

          <View style={styles.infoSection}>
            <Text style={[styles.videoTitle, { color: textColor }]}>{title}</Text>
            <Text style={[styles.videoStats, { color: isDarkMode ? "#888" : "#666" }]}>
              {formatCount(viewCount)} views
            </Text>

            <View style={[styles.actionsContainer, { backgroundColor: isDarkMode ? "#1A1A1A" : "#F5F5F5" }]}>
              <TouchableOpacity onPress={handleLikeToggle} style={styles.actionItem}>
                <MaterialCommunityIcons
                  name={liked ? "thumb-up" : "thumb-up-outline"}
                  size={28}
                  color={liked ? "#50A040" : (isDarkMode ? "#FFF" : "#000")}
                />
                <Text style={[styles.actionText, { color: isDarkMode ? "#FFF" : "#000" }]}>
                  {formatCount(likeCount)}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.actionItem}>
                <MaterialCommunityIcons name="thumb-down-outline" size={28} color={isDarkMode ? "#FFF" : "#000"} />
                <Text style={[styles.actionText, { color: isDarkMode ? "#FFF" : "#000" }]}>Dislike</Text>
              </TouchableOpacity>

              <TouchableOpacity onPress={handleCommentClick} style={styles.actionItem}>
                <MaterialCommunityIcons name="comment-outline" size={28} color={isDarkMode ? "#FFF" : "#000"} />
                <Text style={[styles.actionText, { color: isDarkMode ? "#FFF" : "#000" }]}>
                  {formatCount(commentCount)}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.actionItem}>
                <MaterialCommunityIcons name="share-outline" size={28} color={isDarkMode ? "#FFF" : "#000"} />
                <Text style={[styles.actionText, { color: isDarkMode ? "#FFF" : "#000" }]}>Share</Text>
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
                    {formatCount(followerCount)} followers
                  </Text>
                </View>
              </View>
              <TouchableOpacity
                style={[
                  styles.followButton,
                  isFollowing && { backgroundColor: isDarkMode ? "#333" : "#E5E5E5" },
                ]}
                onPress={handleFollowToggle}
              >
                <Text
                  style={[
                    styles.followText,
                    isFollowing && { color: textColor },
                  ]}
                >
                  {isFollowing ? "Following" : "Follow"}
                </Text>
              </TouchableOpacity>
            </View>

            <View style={[styles.recommendedSection, { borderTopColor: isDarkMode ? "#333" : "#E5E5E5" }]}>
              <Text style={[styles.recommendedTitle, { color: textColor }]}>
                Recommended Videos
              </Text>
              {recommendedVideos.map((video) => (
                <Pressable
                  key={video.id}
                  style={styles.recommendedCard}
                  onPress={() =>
                    router.push({
                      pathname: "/video/PlayVideo",
                      params: {
                        id: video.id,
                        title: video.title,
                        creator: video.creator,
                        creatorId: video.creatorId,
                        url: video.url,
                      },
                    })
                  }
                >
                  <Image source={{ uri: video.thumbnail }} style={styles.recommendedThumbnail} />
                  <View style={styles.recommendedInfo}>
                    <Text style={[styles.recommendedVideoTitle, { color: textColor }]} numberOfLines={2}>
                      {video.title}
                    </Text>
                    <Text style={[styles.recommendedCreator, { color: isDarkMode ? "#888" : "#666" }]}>
                      {video.creator}
                    </Text>
                    <Text style={[styles.recommendedStats, { color: isDarkMode ? "#888" : "#666" }]}>
                      {video.views} views • {video.time}
                    </Text>
                  </View>
                </Pressable>
              ))}
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
  logoContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  logoText: {
    fontSize: 20,
    fontWeight: "bold",
  },
  headerActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  profileIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: "#50A040",
  },
  videoContainer: {
    width: width,
    height: width * (9 / 16),
    backgroundColor: "#000",
    position: "relative",
  },
  videoContainerFullscreen: {
    width: width,
    height: height,
  },
  video: {
    width: "100%",
    height: "100%",
  },
  videoControls: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.3)",
    justifyContent: "center",
    alignItems: "center",
  },
  playPauseButton: {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: [{ translateX: -32 }, { translateY: -32 }],
  },
  bottomControls: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
  },
  progressContainer: {
    width: "100%",
    height: 4,
    backgroundColor: "rgba(255, 255, 255, 0.3)",
    borderRadius: 2,
    marginBottom: 12,
    position: "relative",
  },
  progressBar: {
    height: "100%",
    backgroundColor: "#50A040",
    borderRadius: 2,
  },
  progressThumb: {
    position: "absolute",
    top: -6,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: "#50A040",
    marginLeft: -8,
  },
  controlsBottom: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  timeText: {
    color: "#FFF",
    fontSize: 14,
    fontWeight: "600",
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
    paddingVertical: 16,
    paddingHorizontal: 8,
    borderRadius: 12,
    marginVertical: 8,
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
  followButton: {
    backgroundColor: "#50A040",
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 20,
  },
  followText: {
    color: "#FFF",
    fontWeight: "600",
    fontSize: 14,
  },
  recommendedSection: {
    marginTop: 24,
    paddingTop: 16,
    borderTopWidth: 8,
  },
  recommendedTitle: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 16,
  },
  recommendedCard: {
    flexDirection: "row",
    marginBottom: 16,
  },
  recommendedThumbnail: {
    width: 168,
    height: 94,
    borderRadius: 8,
    backgroundColor: "#333",
  },
  recommendedInfo: {
    flex: 1,
    marginLeft: 12,
    justifyContent: "flex-start",
  },
  recommendedVideoTitle: {
    fontSize: 14,
    fontWeight: "600",
    lineHeight: 20,
  },
  recommendedCreator: {
    fontSize: 12,
    marginTop: 4,
  },
  recommendedStats: {
    fontSize: 12,
    marginTop: 2,
  },
});
