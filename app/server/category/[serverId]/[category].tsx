import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Octicons } from "@expo/vector-icons";
import VideoCard from "@twikkl/components/VideoCard";
import { useThemeMode } from "@twikkl/entities/theme.entity";

const ViewAllCategory = (): JSX.Element => {
  const { serverId, category } = useLocalSearchParams();
  const router = useRouter();
  const { isDarkMode } = useThemeMode();
  const [videos, setVideos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const backgroundColor = isDarkMode ? "#000" : "#fff";
  const textColor = isDarkMode ? "#fff" : "#000";
  const headerBg = isDarkMode ? "#041105" : "#fff";

  useEffect(() => {
    const fetchVideos = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/servers/${serverId}/videos`, {
          credentials: 'include',
        });
        
        if (response.ok) {
          const data = await response.json();
          console.log('Category videos loaded:', data.videos?.length || 0);
          setVideos(data.videos || []);
        } else {
          console.error('Failed to fetch videos, status:', response.status);
        }
      } catch (error) {
        console.error('Failed to fetch server videos:', error);
      } finally {
        setLoading(false);
      }
    };

    if (serverId) {
      fetchVideos();
    }
  }, [serverId]);

  const categoryVideos = videos.filter(video => video.category === category);

  if (loading) {
    return (
      <View style={{ flex: 1, backgroundColor, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#50A040" />
      </View>
    );
  }

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

      {categoryVideos.length === 0 ? (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <Text style={{ color: isDarkMode ? "#888" : "#666", fontSize: 16 }}>
            No videos in this category yet
          </Text>
        </View>
      ) : (
        <FlatList
          data={categoryVideos}
          renderItem={({ item }) => <VideoCard item={item} />}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContent}
        />
      )}
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
