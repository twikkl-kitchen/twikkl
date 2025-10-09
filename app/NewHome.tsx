import {
  StyleSheet,
  View,
  ScrollView,
  Pressable,
  Image,
  FlatList,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Text, Badge } from "react-native-paper";
import { TwikklIcon, EIcon } from "@twikkl/configs";
import { useColors } from "@twikkl/hooks";
import { useState } from "react";
import BottomNav from "@twikkl/components/BottomNav";
import { useTranslation } from "react-i18next";
import { useRouter } from "expo-router";
import { useAuth } from "@twikkl/entities/auth.entity";
import WalletIcon from "@assets/svg/WalletIcon";
import SunIcon from "@assets/svg/SunIcon";
import MoonIcon from "@assets/svg/MoonIcon";
import SearchIcon from "@assets/svg/SearchIcon";

const DEFAULT_HEADER_COLOR = "#FFF";
const BACKGROUND_COLOR = "#041105";
const LIGHT_BACKGROUND_COLOR = "#F5F5F5";

const profiles = [
  {
    name: "Beauty",
    image: { uri: "https://images.unsplash.com/photo-1557053910-d9eadeed1c58?w=200&h=200&fit=crop" },
  },
  {
    name: "EMEN",
    image: { uri: "https://images.unsplash.com/photo-1683998215234-02fca98a3b54?w=200&h=200&fit=crop" },
  },
  {
    name: "Rockwel",
    image: { uri: "https://images.unsplash.com/photo-1722322426803-101270837197?w=200&h=200&fit=crop" },
  },
  {
    name: "Animal",
    image: { uri: "https://images.unsplash.com/photo-1683998215234-02fca98a3b54?w=200&h=200&fit=crop" },
  },
];

const videos = [
  {
    id: "1",
    title: "Adele - Easy On Me (Live at the NRJ Awards 2021)",
    creator: "Adele",
    views: "5.8M views",
    time: "3 months ago",
    thumbnail: { uri: "https://images.unsplash.com/photo-1759503407457-3683579f080b?w=800&h=450&fit=crop" },
    duration: "3:47",
    isLive: true,
  },
  {
    id: "2",
    title: "Lord of Rings: The Rings of Power Official Trailer",
    creator: "Prime Video",
    views: "12M views",
    time: "1 week ago",
    thumbnail: { uri: "https://images.unsplash.com/photo-1576497587501-f71f94bef499?w=800&h=450&fit=crop" },
    duration: "2:30",
  },
];

const shorts = [
  {
    id: "1",
    title: "Amazing Dance Moves",
    creator: "DanceQueen",
    views: "2.3M",
    thumbnail: { uri: "https://images.unsplash.com/photo-1560088186-8811763e95d2?w=300&h=500&fit=crop" },
  },
  {
    id: "2",
    title: "Quick Recipe Tips",
    creator: "FoodieLife",
    views: "1.8M",
    thumbnail: { uri: "https://images.unsplash.com/photo-1718324864477-0a7811b309b6?w=300&h=500&fit=crop" },
  },
  {
    id: "3",
    title: "Workout Challenge",
    creator: "FitGuru",
    views: "3.1M",
    thumbnail: { uri: "https://images.unsplash.com/photo-1718975102800-fb102d865db5?w=300&h=500&fit=crop" },
  },
  {
    id: "4",
    title: "Gaming Setup Tour",
    creator: "GameZone",
    views: "950K",
    thumbnail: { uri: "https://images.unsplash.com/photo-1756575802484-7aab6829d600?w=300&h=500&fit=crop" },
  },
];

const categories = ["All", "Gaming", "Figma", "UI Design", "Coding"];

export default function NewHome() {
  const router = useRouter();
  const { primary: colorPrimary } = useColors();
  const { t } = useTranslation();
  const { isLoggedIn } = useAuth();
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [isDarkMode, setIsDarkMode] = useState(true);

  const handleProfileClick = () => {
    if (isLoggedIn) {
      router.push("Profile");
    } else {
      router.push("auth/Register");
    }
  };

  const handleCreateClick = () => {
    if (isLoggedIn) {
      router.push("video/CreateUploadVideo");
    } else {
      router.push("auth/Register");
    }
  };

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
  };

  const backgroundColor = isDarkMode ? BACKGROUND_COLOR : LIGHT_BACKGROUND_COLOR;
  const textColor = isDarkMode ? DEFAULT_HEADER_COLOR : "#000";
  const headerColor = isDarkMode ? DEFAULT_HEADER_COLOR : "#000";

  const ProfileStory = ({ item }: { item: typeof profiles[0] }) => (
    <View style={styles.storyItem}>
      <View style={styles.storyBorder}>
        <Image source={item.image} style={styles.storyImage} />
      </View>
      <Text style={[styles.storyName, { color: isDarkMode ? "#A0A0A0" : "#666" }]}>{item.name}</Text>
    </View>
  );

  const ShortCard = ({ item }: { item: typeof shorts[0] }) => (
    <View style={styles.shortCard}>
      <View style={styles.shortThumbnail}>
        <Image source={item.thumbnail} style={styles.shortImage} />
        <View style={styles.shortBadge}>
          <TwikklIcon name={EIcon.HEART} size={12} color="#FFF" />
        </View>
      </View>
      <Text style={[styles.shortTitle, { color: textColor }]} numberOfLines={2}>
        {item.title}
      </Text>
      <Text style={[styles.shortViews, { color: isDarkMode ? "#808080" : "#666" }]}>{item.views} views</Text>
    </View>
  );

  const VideoCard = ({ item }: { item: typeof videos[0] }) => (
    <View style={[styles.videoCard, { backgroundColor: isDarkMode ? "rgba(255, 255, 255, 0.05)" : "rgba(0, 0, 0, 0.05)" }]}>
      <View style={styles.videoThumbnailContainer}>
        <Image source={item.thumbnail} style={styles.videoThumbnail} />
        {item.isLive && (
          <View style={styles.liveBadge}>
            <Text style={styles.liveText}>Live</Text>
          </View>
        )}
        <View style={styles.durationBadge}>
          <Text style={styles.durationText}>{item.duration}</Text>
        </View>
      </View>
      <View style={styles.videoInfo}>
        <Image source={profiles[0].image} style={styles.creatorAvatar} />
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

  return (
    <>
      <SafeAreaView style={[styles.container, { backgroundColor }]}>
        <View style={styles.header}>
          <View style={styles.logoContainer}>
            <View style={styles.logoIcon}>
              <TwikklIcon name={EIcon.PLUS} size={16} color="#FFF" />
            </View>
            <Text style={[styles.logoText, { color: textColor }]}>twikkl</Text>
          </View>
          <View style={styles.headerActions}>
            <Pressable onPress={toggleTheme}>
              {isDarkMode ? (
                <SunIcon color={headerColor} />
              ) : (
                <MoonIcon color={headerColor} />
              )}
            </Pressable>
            <Pressable>
              <SearchIcon color={headerColor} />
            </Pressable>
            <Pressable onPress={() => router.push("Notification")}>
              <TwikklIcon name={EIcon.BELL} size={24} color={headerColor} />
            </Pressable>
            <Pressable onPress={handleProfileClick}>
              <Image
                source={{ uri: "https://images.unsplash.com/photo-1683998215234-02fca98a3b54?w=200&h=200&fit=crop" }}
                style={styles.profileIcon}
              />
            </Pressable>
          </View>
        </View>

        <ScrollView showsVerticalScrollIndicator={false}>
          <View style={styles.categoriesContainer}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {categories.map((category) => (
                <Pressable
                  key={category}
                  onPress={() => setSelectedCategory(category)}
                  style={[
                    styles.categoryChip,
                    selectedCategory === category && (isDarkMode ? styles.categoryChipActive : styles.categoryChipActiveLight),
                  ]}
                >
                  <Text
                    style={[
                      styles.categoryText,
                      { color: selectedCategory === category ? (isDarkMode ? "#000" : "#FFF") : (isDarkMode ? "#A0A0A0" : "#666") },
                      selectedCategory === category && styles.categoryTextActive,
                    ]}
                  >
                    {category}
                  </Text>
                </Pressable>
              ))}
            </ScrollView>
          </View>

          <View style={styles.storiesContainer}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {profiles.map((profile, index) => (
                <ProfileStory key={index} item={profile} />
              ))}
            </ScrollView>
          </View>

          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: textColor }]}>Shorts</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {shorts.map((short) => (
                <ShortCard key={short.id} item={short} />
              ))}
            </ScrollView>
          </View>

          <View style={styles.videosContainer}>
            {videos.map((video) => (
              <VideoCard key={video.id} item={video} />
            ))}
          </View>

          <View style={{ height: 100 }} />
        </ScrollView>
      </SafeAreaView>

      <Pressable style={styles.fab} onPress={handleCreateClick}>
        <TwikklIcon name={EIcon.PLUS} size={28} color="#FFF" />
      </Pressable>

      <BottomNav commentCount={0} />
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: BACKGROUND_COLOR,
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
  logoIcon: {
    width: 32,
    height: 32,
    backgroundColor: "#50A040",
    borderRadius: 6,
    alignItems: "center",
    justifyContent: "center",
  },
  logoText: {
    color: DEFAULT_HEADER_COLOR,
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
  categoriesContainer: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  categoryChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginRight: 12,
    backgroundColor: "transparent",
  },
  categoryChipActive: {
    backgroundColor: "#FFF",
  },
  categoryChipActiveLight: {
    backgroundColor: "#000",
  },
  categoryText: {
    fontSize: 14,
  },
  categoryTextActive: {
    fontWeight: "600",
  },
  storiesContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  storyItem: {
    alignItems: "center",
    marginRight: 16,
    width: 60,
  },
  storyBorder: {
    width: 56,
    height: 56,
    borderRadius: 28,
    borderWidth: 2,
    borderColor: "#404040",
    padding: 2,
  },
  storyImage: {
    width: "100%",
    height: "100%",
    borderRadius: 26,
  },
  storyName: {
    fontSize: 12,
    marginTop: 4,
    textAlign: "center",
  },
  section: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 12,
  },
  shortCard: {
    width: 112,
    marginRight: 12,
  },
  shortThumbnail: {
    position: "relative",
    aspectRatio: 9 / 16,
    borderRadius: 8,
    overflow: "hidden",
  },
  shortImage: {
    width: "100%",
    height: "100%",
  },
  shortBadge: {
    position: "absolute",
    bottom: 8,
    right: 8,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    borderRadius: 12,
    padding: 4,
  },
  shortTitle: {
    fontSize: 12,
    marginTop: 8,
    lineHeight: 16,
  },
  shortViews: {
    fontSize: 12,
    marginTop: 4,
  },
  videosContainer: {
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  videoCard: {
    marginBottom: 16,
    borderRadius: 12,
    overflow: "hidden",
  },
  videoThumbnailContainer: {
    position: "relative",
    height: 192,
  },
  videoThumbnail: {
    width: "100%",
    height: "100%",
  },
  liveBadge: {
    position: "absolute",
    top: 8,
    left: 8,
    backgroundColor: "#50A040",
    borderRadius: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  liveText: {
    color: "#FFF",
    fontSize: 12,
    fontWeight: "600",
  },
  durationBadge: {
    position: "absolute",
    bottom: 8,
    right: 8,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  durationText: {
    color: "#FFF",
    fontSize: 12,
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
    lineHeight: 18,
    marginBottom: 4,
  },
  videoMeta: {
    fontSize: 12,
    marginTop: 2,
  },
  fab: {
    position: "absolute",
    bottom: 90,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#50A040",
    alignItems: "center",
    justifyContent: "center",
    elevation: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
});
