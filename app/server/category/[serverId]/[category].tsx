import React from "react";
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Octicons } from "@expo/vector-icons";
import VideoCard from "@twikkl/components/VideoCard";
import { cardDataGroup, cardDataYou } from "@twikkl/data/discover/cardData";
import { useThemeMode } from "@twikkl/entities/theme.entity";

const categories = ["Tutorial", "Trading", "Development", "General", "News"];

const ViewAllCategory = (): JSX.Element => {
  const { serverId, category } = useLocalSearchParams();
  const router = useRouter();
  const { isDarkMode } = useThemeMode();

  const backgroundColor = isDarkMode ? "#000" : "#fff";
  const textColor = isDarkMode ? "#fff" : "#000";
  const headerBg = isDarkMode ? "#041105" : "#fff";

  const groups = [...cardDataYou, ...cardDataGroup];
  const groupData = groups.find((item) => item.id === serverId);

  const allServerVideos = groupData?.videos?.map((videoImg: any, index: number) => ({
    id: index.toString(),
    title: `${groupData?.title} - ${category} ${index + 1}`,
    creator: groupData?.title || "Server",
    views: `${Math.floor(Math.random() * 20 + 5)}K views`,
    time: index === 0 ? "2 days ago" : index === 1 ? "1 week ago" : "2 weeks ago",
    thumbnail: videoImg,
    duration: `${Math.floor(Math.random() * 10 + 5)}:${Math.floor(Math.random() * 60).toString().padStart(2, '0')}`,
    isLive: index === 0,
    creatorAvatar: groupData?.smallImg,
    category: categories[index % categories.length],
  })) || [];

  const categoryVideos = allServerVideos.filter(video => video.category === category);

  return (
    <View style={{ flex: 1, backgroundColor }}>
      <View style={[styles.header, { backgroundColor: headerBg }]}>
        <View style={styles.top}>
          <TouchableOpacity 
            onPressOut={() => router.back()} 
            style={[styles.iconContainer, { backgroundColor: isDarkMode ? "#000" : "#E0E0E0" }]}
          >
            <Octicons name="chevron-left" size={24} color={textColor} />
          </TouchableOpacity>
          <Text style={[styles.title, { color: textColor }]}>{category}</Text>
          <View style={{ width: 24 }} />
        </View>
        <Text style={[styles.subtitle, { color: isDarkMode ? "#888" : "#666" }]}>
          {categoryVideos.length} {categoryVideos.length === 1 ? 'video' : 'videos'}
        </Text>
      </View>

      <FlatList
        data={categoryVideos}
        renderItem={({ item }) => <VideoCard item={item} />}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    paddingTop: 55,
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  top: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  iconContainer: {
    height: 30,
    width: 30,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 100,
  },
  title: {
    fontSize: 20,
    fontWeight: "700",
  },
  subtitle: {
    fontSize: 14,
    marginTop: 4,
  },
  listContent: {
    padding: 16,
  },
});

export default ViewAllCategory;
