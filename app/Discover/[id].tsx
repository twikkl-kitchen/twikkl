import { View, FlatList, StyleSheet } from "react-native";
import { useLocalSearchParams } from "expo-router";
import Header from "@twikkl/components/Group/Header";
import VideoCard from "@twikkl/components/VideoCard";
import { cardDataGroup, cardDataYou } from "@twikkl/data/discover/cardData";
import { useState } from "react";
import { useThemeMode } from "@twikkl/entities/theme.entity";

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

const Group = (): JSX.Element => {
  const { id } = useLocalSearchParams();
  const { isDarkMode } = useThemeMode();
  const groups = [...cardDataYou, ...cardDataGroup];
  const groupData = groups.find((item) => item.id === id);
  const [select, setSelect] = useState(0);

  const backgroundColor = isDarkMode ? "#000" : "#fff";

  // Convert existing video images to VideoCard format
  const serverVideos = groupData?.videos?.map((videoImg: any, index: number) => ({
    id: index.toString(),
    title: `${groupData?.title} - Tutorial ${index + 1}`,
    creator: groupData?.title || "Server",
    views: `${Math.floor(Math.random() * 20 + 5)}K views`,
    time: index === 0 ? "2 days ago" : index === 1 ? "1 week ago" : "2 weeks ago",
    thumbnail: videoImg,
    duration: `${Math.floor(Math.random() * 10 + 5)}:${Math.floor(Math.random() * 60).toString().padStart(2, '0')}`,
    isLive: index === 0,
    creatorAvatar: groupData?.smallImg,
  })) || [];

  // Only show as list view (no grid options for video cards)
  const numColumns = 1;

  return (
    <View style={{ flex: 1, backgroundColor }}>
      <Header select={select} setSelect={setSelect} {...groupData} />
      <View style={{ zIndex: -2, flex: 1 }}>
        <FlatList
          key={numColumns}
          numColumns={numColumns}
          data={serverVideos}
          renderItem={({ item }) => {
            return <VideoCard item={item} />;
          }}
          showsVerticalScrollIndicator={false}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  listContent: {
    padding: 16,
  },
});

export default Group;
