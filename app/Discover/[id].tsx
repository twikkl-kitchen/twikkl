import { View, ScrollView, StyleSheet, ActivityIndicator, Text } from "react-native";
import { useLocalSearchParams } from "expo-router";
import Header from "@twikkl/components/Group/Header";
import CategoryVideoRow from "@twikkl/components/Group/CategoryVideoRow";
import { useState, useEffect } from "react";
import { useThemeMode } from "@twikkl/entities/theme.entity";
import axios from "axios";

export interface IGroup {
  desc: string;
  followers?: number;
  img: any;
  title: string;
  members: string;
  fav?: boolean;
  id: string;
  smallImg: any;
  status: string;
  smallGroup: string[];
  videos: any;
}

interface ServerData {
  id: string;
  name: string;
  description: string | null;
  privacy: string;
  profileImageUrl: string | null;
  bannerImageUrl: string | null;
  categories: string | null;
  memberCount?: number;
}

const defaultCategories = ["Tutorial", "Trading", "Development", "General", "News"];

const Group = (): JSX.Element => {
  const { id } = useLocalSearchParams();
  const { isDarkMode } = useThemeMode();
  const [select, setSelect] = useState(0);
  const [serverData, setServerData] = useState<ServerData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [categories, setCategories] = useState<string[]>(defaultCategories);
  const [serverVideos, setServerVideos] = useState<any[]>([]);

  const backgroundColor = isDarkMode ? "#000" : "#fff";
  const textColor = isDarkMode ? "#fff" : "#000";
  const mutedTextColor = isDarkMode ? "#888" : "#666";

  useEffect(() => {
    loadServerData();
  }, [id]);

  const loadServerData = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Fetch server details
      const serverResponse = await axios.get(`/api/servers/${id}`);
      const server = serverResponse.data;

      // Parse categories if available
      const parsedCategories = server.categories 
        ? JSON.parse(server.categories) 
        : defaultCategories;
      
      setCategories(parsedCategories);
      setServerData(server);

      // Fetch server videos
      try {
        const videosResponse = await axios.get(`/api/servers/${id}/videos`, {
          withCredentials: true,
        });
        console.log('Server videos loaded:', videosResponse.data.videos?.length || 0);
        setServerVideos(videosResponse.data.videos || []);
      } catch (videoErr) {
        console.error('Error loading videos:', videoErr);
        setServerVideos([]);
      }
    } catch (err: any) {
      console.error('Error loading server:', err);
      setError(err.response?.data?.error || 'Failed to load server');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <View style={[styles.centerContainer, { backgroundColor }]}>
        <ActivityIndicator size="large" color="#50a040" />
        <Text style={[styles.loadingText, { color: mutedTextColor }]}>
          Loading server...
        </Text>
      </View>
    );
  }

  if (error || !serverData) {
    return (
      <View style={[styles.centerContainer, { backgroundColor }]}>
        <Text style={[styles.errorText, { color: textColor }]}>
          {error || 'Server not found'}
        </Text>
      </View>
    );
  }

  // Transform server data to match IGroup interface for Header component
  const groupData: IGroup = {
    id: serverData.id,
    title: serverData.name,
    desc: serverData.description || 'No description',
    status: serverData.privacy === 'private' ? 'Private' : 'Public',
    members: serverData.memberCount?.toString() || '1',
    // Use actual images if available, otherwise use placeholder
    img: serverData.bannerImageUrl ? { uri: serverData.bannerImageUrl } : { uri: 'https://via.placeholder.com/1600x900/50a040/ffffff?text=Server+Banner' },
    smallImg: serverData.profileImageUrl ? { uri: serverData.profileImageUrl } : { uri: 'https://via.placeholder.com/500x500/50a040/ffffff?text=Server' },
    smallGroup: [],
    videos: [],
  };

  // Transform and group videos by category
  const videosByCategory = categories.map(category => {
    const categoryVideos = serverVideos
      .filter(video => video.category === category)
      .map(video => ({
        id: video.id,
        title: video.caption || 'Untitled Video',
        thumbnail: video.thumbnailUrl 
          ? { uri: video.thumbnailUrl } 
          : { uri: 'https://via.placeholder.com/640x360/50a040/ffffff?text=Video' },
        duration: '0:00',
        views: `${video.viewCount || 0} views`,
        time: new Date(video.createdAt).toLocaleDateString(),
        creator: serverData?.name || 'Server',
        videoUrl: video.videoUrl,
      }));
    
    return {
      category,
      videos: categoryVideos
    };
  });

  return (
    <View style={{ flex: 1, backgroundColor }}>
      <Header select={select} setSelect={setSelect} {...groupData} />
      <ScrollView 
        style={{ flex: 1, backgroundColor }}
        contentContainerStyle={{ paddingBottom: 20 }}
        showsVerticalScrollIndicator={false}
      >
        {videosByCategory.map(({ category, videos }) => (
          <CategoryVideoRow
            key={category}
            category={category}
            videos={videos}
            serverId={id as string}
          />
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  listContent: {
    padding: 16,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
  },
  errorText: {
    fontSize: 16,
    textAlign: 'center',
  },
});

export default Group;
