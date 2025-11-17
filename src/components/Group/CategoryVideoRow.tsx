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
const CARD_WIDTH = width * 0.42; // Landscape card width
const CARD_HEIGHT = CARD_WIDTH * 0.56; // Landscape aspect ratio (16:9)

const CategoryVideoRow = ({ category, videos, serverId }: CategoryVideoRowProps): JSX.Element => {
  const router = useRouter();
  const { isDarkMode } = useThemeMode();
  
  const backgroundColor = isDarkMode ? "#000" : "#fff";
  const textColor = isDarkMode ? "#fff" : "#000";
  const mutedTextColor = isDarkMode ? "#888" : "#666";
  const cardBackground = isDarkMode ? "#1a1a1a" : "#f8f8f8";

  if (videos.length === 0) return <></>;

  // Organize videos into columns of 2 (like YouTube grid)
  const columns: VideoItem[][] = [];
  for (let i = 0; i < videos.length; i += 2) {
    const column = [videos[i]];
    if (i + 1 < videos.length) {
      column.push(videos[i + 1]);
    }
    columns.push(column);
  }

  const renderVideoCard = (video: VideoItem) => (
    <TouchableOpacity 
      key={video.id} 
      style={[styles.videoCard, { backgroundColor: cardBackground }]}
      onPress={() => {
        console.log("Play video:", video.id);
        // Navigate to existing PlayVideo screen
        router.push({
          pathname: '/video/PlayVideo',
          params: {
            videoId: video.id,
            videoUrl: (video as any).videoUrl || '',
            caption: video.title,
            username: video.creator
          }
        });
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
  );

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

      {/* Horizontal scrolling grid with 2 rows */}
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {columns.map((column, columnIndex) => (
          <View key={columnIndex} style={styles.column}>
            {column.map(renderVideoCard)}
          </View>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 24,
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
    paddingRight: 16,
  },
  column: {
    flexDirection: "column",
    gap: 12,
    marginRight: 14,
  },
  videoCard: {
    borderRadius: 8,
    overflow: "hidden",
    width: CARD_WIDTH,
  },
  thumbnailContainer: {
    position: "relative",
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
  },
  thumbnail: {
    width: "100%",
    height: "100%",
  },
  durationBadge: {
    position: "absolute",
    bottom: 6,
    right: 6,
    backgroundColor: "rgba(0, 0, 0, 0.85)",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  durationText: {
    color: "#fff",
    fontSize: 10,
    fontWeight: "600",
  },
  videoInfo: {
    padding: 10,
    paddingTop: 8,
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
