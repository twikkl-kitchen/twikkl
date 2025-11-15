import {
  StyleSheet,
  View,
  FlatList,
  Dimensions,
  NativeScrollEvent,
  NativeSyntheticEvent,
  Pressable,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Text } from "react-native-paper";
import { ViewVariant, TwikklIcon, EIcon } from "@twikkl/configs";
import { useColors } from "@twikkl/hooks";
import VideoFeedItem from "@twikkl/components/VideoFeedItem";
import { useEffect, useRef, useState } from "react";
import BottomNav from "@twikkl/components/BottomNav";
import { useRouter } from "expo-router";
import { useAuth } from "@twikkl/entities/auth.entity";
import { useThemeMode } from "@twikkl/entities/theme.entity";
import { API_ENDPOINTS } from "@twikkl/config/api";
import axios from "axios";

const DEFAULT_CAMERA_ACTION_COLOR = "#FFF";
const BACKGROUND_COLOR = "#041105";

const { height } = Dimensions.get("window");

export default function Following() {
  const router = useRouter();
  const { primary: colorPrimary } = useColors();
  const { isLoggedIn, token } = useAuth();
  const { isDarkMode } = useThemeMode();
  const [videos, setVideos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [visibleIndex, setVisibleIndex] = useState<number>(0);

  useEffect(() => {
    if (!isLoggedIn) {
      router.push("auth/Register");
      return;
    }
    fetchFollowingFeed();
  }, [isLoggedIn]);

  const fetchFollowingFeed = async () => {
    try {
      setLoading(true);
      const response = await axios.get(API_ENDPOINTS.FEED.FOLLOWING, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setVideos(response.data.videos || []);
    } catch (error) {
      console.error("Error fetching following feed:", error);
      setVideos([]);
    } finally {
      setLoading(false);
    }
  };

  const onScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const contentOffset = event.nativeEvent.contentOffset.y;
    const index = Math.floor(contentOffset / height);
    setVisibleIndex(index);
  };

  const backgroundColor = isDarkMode ? BACKGROUND_COLOR : "#fff";
  const textColor = isDarkMode ? "#fff" : "#000";

  if (loading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor }]}>
        <ActivityIndicator size="large" color={colorPrimary} />
        <Text style={{ color: textColor, marginTop: 16 }}>Loading your feed...</Text>
      </View>
    );
  }

  if (videos.length === 0) {
    return (
      <SafeAreaView style={[styles.emptyContainer, { backgroundColor }]}>
        <View style={styles.header}>
          <Pressable onPress={() => router.back()}>
            <TwikklIcon name={EIcon.ARROW_LEFT} size={24} color={textColor} />
          </Pressable>
          <Text variant="titleMedium" style={{ color: textColor, fontWeight: "600" }}>
            Following Feed
          </Text>
          <View style={{ width: 24 }} />
        </View>
        <View style={styles.emptyContent}>
          <TwikklIcon name={EIcon.USERS} size={80} color={colorPrimary} />
          <Text style={[styles.emptyTitle, { color: textColor }]}>No videos yet</Text>
          <Text style={[styles.emptyDescription, { color: textColor }]}>
            Start following users to see their videos here
          </Text>
          <Pressable
            style={[styles.exploreButton, { backgroundColor: colorPrimary }]}
            onPress={() => router.push("/(tabs)/NewHome")}
          >
            <Text style={styles.exploreButtonText}>Explore Videos</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <>
      <FlatList
        style={[StyleSheet.absoluteFill, { backgroundColor: BACKGROUND_COLOR }]}
        data={videos}
        renderItem={({ item, index }) => (
          <VideoFeedItem
            item={item}
            index={index}
            visibleIndex={visibleIndex}
            onShareClick={() => {}}
          />
        )}
        keyExtractor={(item, index) => item.id || index.toString()}
        pagingEnabled
        snapToInterval={height}
        snapToAlignment="start"
        decelerationRate="fast"
        showsVerticalScrollIndicator={false}
        showsHorizontalScrollIndicator={false}
        onScroll={onScroll}
        scrollEventThrottle={16}
        getItemLayout={(data, index) => ({
          length: height,
          offset: height * index,
          index,
        })}
      />
      <SafeAreaView style={styles.innerContainer}>
        <View style={ViewVariant.rowSpaceBetween}>
          <Pressable onPress={() => router.back()}>
            <TwikklIcon name={EIcon.ARROW_LEFT} size={24} color={DEFAULT_CAMERA_ACTION_COLOR} />
          </Pressable>
          <Text variant="titleMedium" style={styles.headActionText}>
            Following
          </Text>
          <View style={{ width: 24 }} />
        </View>
      </SafeAreaView>
      <BottomNav commentCount={0} />
    </>
  );
}

const styles = StyleSheet.create({
  innerContainer: {
    paddingTop: 10,
    marginHorizontal: 14,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyContainer: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingTop: 60,
    paddingBottom: 16,
  },
  emptyContent: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 32,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: "700",
    marginTop: 24,
    marginBottom: 12,
  },
  emptyDescription: {
    fontSize: 16,
    textAlign: "center",
    marginBottom: 32,
    opacity: 0.7,
  },
  exploreButton: {
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 24,
  },
  exploreButtonText: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "600",
  },
  headActionText: {
    color: DEFAULT_CAMERA_ACTION_COLOR,
    fontWeight: "600",
  },
});
