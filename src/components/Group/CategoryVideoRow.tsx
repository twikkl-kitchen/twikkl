import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Image, Dimensions } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useThemeMode } from "@twikkl/entities/theme.entity";

interface VideoItem {
  id: string;
  title: string;
  thumbnail: any;
  duration: string;
  views: string;
  time: string;
  creator: string;
}

interface CategoryVideoRowProps {
  category: string;
  videos: VideoItem[];
  serverId: string;
}

const { width } = Dimensions.get("window");
const THUMBNAIL_WIDTH = width * 0.42;
const THUMBNAIL_HEIGHT = THUMBNAIL_WIDTH * 0.56;

const CategoryVideoRow = ({ category, videos, serverId }: CategoryVideoRowProps): JSX.Element => {
  const router = useRouter();
  const { isDarkMode } = useThemeMode();
  
  const backgroundColor = isDarkMode ? "#000" : "#fff";
  const textColor = isDarkMode ? "#fff" : "#000";
  const mutedTextColor = isDarkMode ? "#888" : "#666";
  const cardBackground = isDarkMode ? "#1a1a1a" : "#f8f8f8";

  if (videos.length === 0) return <></>;

  return (
    <View style={[styles.container, { backgroundColor }]}>
      <View style={styles.header}>
        <Text style={[styles.categoryTitle, { color: textColor }]}>{category}</Text>
        <TouchableOpacity 
          style={styles.viewAllButton}
          onPress={() => router.push(`/server/category/${serverId}/${category}`)}
        >
          <Text style={styles.viewAllText}>View All</Text>
          <Ionicons name="chevron-forward" size={16} color="#50A040" />
        </TouchableOpacity>
      </View>

      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {videos.slice(0, 6).map((video) => (
          <TouchableOpacity 
            key={video.id} 
            style={[styles.videoCard, { backgroundColor: cardBackground }]}
            onPress={() => {
              console.log("Play video:", video.id);
            }}
          >
            <View style={styles.thumbnailContainer}>
              <Image 
                source={video.thumbnail} 
                style={styles.thumbnail}
                resizeMode="cover"
              />
              <View style={styles.durationBadge}>
                <Text style={styles.durationText}>{video.duration}</Text>
              </View>
            </View>
            <View style={styles.videoInfo}>
              <Text style={[styles.videoTitle, { color: textColor }]} numberOfLines={2}>
                {video.title}
              </Text>
              <Text style={[styles.videoMeta, { color: mutedTextColor }]} numberOfLines={1}>
                {video.views} • {video.time}
              </Text>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 20,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  categoryTitle: {
    fontSize: 18,
    fontWeight: "700",
  },
  viewAllButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  viewAllText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#50A040",
  },
  scrollContent: {
    paddingLeft: 16,
    paddingRight: 8,
  },
  videoCard: {
    marginRight: 12,
    borderRadius: 12,
    overflow: "hidden",
    width: THUMBNAIL_WIDTH,
  },
  thumbnailContainer: {
    position: "relative",
    width: THUMBNAIL_WIDTH,
    height: THUMBNAIL_HEIGHT,
  },
  thumbnail: {
    width: "100%",
    height: "100%",
  },
  durationBadge: {
    position: "absolute",
    bottom: 8,
    right: 8,
    backgroundColor: "rgba(0, 0, 0, 0.8)",
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 4,
  },
  durationText: {
    color: "#fff",
    fontSize: 11,
    fontWeight: "600",
  },
  videoInfo: {
    padding: 10,
  },
  videoTitle: {
    fontSize: 13,
    fontWeight: "600",
    marginBottom: 4,
    lineHeight: 17,
  },
  videoMeta: {
    fontSize: 11,
  },
});

export default CategoryVideoRow;
