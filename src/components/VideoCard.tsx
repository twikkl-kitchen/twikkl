import { View, Image, StyleSheet } from "react-native";
import { Text } from "react-native-paper";
import { useThemeMode } from "@twikkl/entities/theme.entity";

interface VideoCardProps {
  item: {
    id: string;
    title: string;
    creator: string;
    views: string;
    time: string;
    thumbnail: { uri: string };
    duration?: string;
    isLive?: boolean;
    creatorAvatar?: { uri: string };
  };
}

export default function VideoCard({ item }: VideoCardProps) {
  const { isDarkMode } = useThemeMode();
  
  const textColor = isDarkMode ? "#FFF" : "#000";
  const backgroundColor = isDarkMode ? "rgba(255, 255, 255, 0.05)" : "rgba(0, 0, 0, 0.05)";
  
  return (
    <View style={[styles.videoCard, { backgroundColor }]}>
      <View style={styles.videoThumbnailContainer}>
        <Image source={item.thumbnail} style={styles.videoThumbnail} />
        {item.isLive && (
          <View style={styles.liveBadge}>
            <Text style={styles.liveText}>Live</Text>
          </View>
        )}
        {item.duration && (
          <View style={styles.durationBadge}>
            <Text style={styles.durationText}>{item.duration}</Text>
          </View>
        )}
      </View>
      <View style={styles.videoInfo}>
        {item.creatorAvatar && (
          <Image source={item.creatorAvatar} style={styles.creatorAvatar} />
        )}
        <View style={styles.videoDetails}>
          <Text style={[styles.videoTitle, { color: textColor }]} numberOfLines={2}>
            {item.title}
          </Text>
          <Text style={[styles.videoMeta, { color: isDarkMode ? "#808080" : "#666" }]}>
            {item.creator}
          </Text>
          <Text style={[styles.videoMeta, { color: isDarkMode ? "#808080" : "#666" }]}>
            {item.views} • {item.time}
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  videoCard: {
    marginBottom: 16,
    borderRadius: 12,
    overflow: "hidden",
  },
  videoThumbnailContainer: {
    width: "100%",
    aspectRatio: 16 / 9,
    position: "relative",
  },
  videoThumbnail: {
    width: "100%",
    height: "100%",
    borderRadius: 12,
  },
  liveBadge: {
    position: "absolute",
    top: 8,
    left: 8,
    backgroundColor: "#FF0000",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  liveText: {
    color: "#FFF",
    fontSize: 12,
    fontWeight: "bold",
  },
  durationBadge: {
    position: "absolute",
    bottom: 8,
    right: 8,
    backgroundColor: "rgba(0, 0, 0, 0.8)",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  durationText: {
    color: "#FFF",
    fontSize: 12,
    fontWeight: "500",
  },
  videoInfo: {
    flexDirection: "row",
    padding: 12,
    gap: 12,
  },
  creatorAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
  },
  videoDetails: {
    flex: 1,
  },
  videoTitle: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 4,
  },
  videoMeta: {
    fontSize: 12,
  },
});
