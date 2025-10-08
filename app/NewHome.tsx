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

const DEFAULT_HEADER_COLOR = "#FFF";
const BACKGROUND_COLOR = "#041105";

const mockPosts = [
  {
    id: "1",
    username: "jerry.jgy",
    avatar: require("@assets/imgs/profile.png"),
    content: "Just dropped a new Twikk! Check it out 🔥",
    likes: 234,
    comments: 45,
    timestamp: "2h ago",
  },
  {
    id: "2",
    username: "sarah_tech",
    avatar: require("@assets/imgs/profile.png"),
    content: "Building something amazing with the community! 🚀",
    likes: 567,
    comments: 89,
    timestamp: "4h ago",
  },
  {
    id: "3",
    username: "crypto_king",
    avatar: require("@assets/imgs/profile.png"),
    content: "New features coming soon to Twikkl! Stay tuned 👀",
    likes: 892,
    comments: 156,
    timestamp: "6h ago",
  },
];

export default function NewHome() {
  const router = useRouter();
  const { primary: colorPrimary } = useColors();
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<"feed" | "discover">("feed");

  const PostCard = ({ item }: { item: typeof mockPosts[0] }) => (
    <View style={styles.postCard}>
      <View style={styles.postHeader}>
        <Image source={item.avatar} style={styles.avatar} />
        <View style={styles.postInfo}>
          <Text style={styles.username}>{item.username}</Text>
          <Text style={styles.timestamp}>{item.timestamp}</Text>
        </View>
      </View>
      <Text style={styles.postContent}>{item.content}</Text>
      <View style={styles.postActions}>
        <Pressable style={styles.actionButton}>
          <TwikklIcon name={EIcon.HEART} size={20} color="#50A040" />
          <Text style={styles.actionText}>{item.likes}</Text>
        </Pressable>
        <Pressable style={styles.actionButton}>
          <TwikklIcon name={EIcon.HEART} size={20} color="#50A040" />
          <Text style={styles.actionText}>{item.comments}</Text>
        </Pressable>
        <Pressable style={styles.actionButton}>
          <TwikklIcon name={EIcon.SHARE_NETWORK} size={20} color="#50A040" />
        </Pressable>
      </View>
    </View>
  );

  return (
    <>
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TwikklIcon name={EIcon.TIMER_24} size={24} color={DEFAULT_HEADER_COLOR} />
          <View style={styles.tabsContainer}>
            <Pressable onPress={() => setActiveTab("feed")}>
              <Text
                variant="titleMedium"
                style={[styles.tabText, activeTab === "feed" && styles.activeTabText]}
              >
                {t("home.myFeed")}
              </Text>
              {activeTab === "feed" && (
                <Badge size={10} style={{ ...styles.tabIndicator, backgroundColor: colorPrimary }} />
              )}
            </Pressable>
            <Pressable onPress={() => router.push("Server")}>
              <Text variant="titleMedium" style={styles.tabText}>
                Server
              </Text>
              <Badge
                size={10}
                style={{ ...styles.tabIndicator, backgroundColor: DEFAULT_HEADER_COLOR }}
              />
            </Pressable>
          </View>
          <Pressable onPress={() => router.push("Notification")}>
            <TwikklIcon name={EIcon.BELL} size={24} color={DEFAULT_HEADER_COLOR} />
            <Badge size={10} style={{ backgroundColor: colorPrimary, position: "absolute" }} />
          </Pressable>
          <Pressable onPress={() => router.push("Profile")}>
            <Image
              source={require("@assets/imgs/profile.png")}
              style={styles.profileIcon}
            />
          </Pressable>
        </View>

        <FlatList
          data={mockPosts}
          renderItem={({ item }) => <PostCard item={item} />}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.feedContainer}
        />
      </SafeAreaView>

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
    paddingTop: 10,
    paddingHorizontal: 14,
    paddingBottom: 10,
  },
  tabsContainer: {
    flexDirection: "row",
    gap: 20,
    flex: 1,
    justifyContent: "center",
  },
  tabText: {
    color: DEFAULT_HEADER_COLOR,
    fontWeight: "600",
  },
  activeTabText: {
    color: DEFAULT_HEADER_COLOR,
  },
  tabIndicator: {
    alignSelf: "center",
    marginTop: 0,
    paddingHorizontal: 10,
    paddingVertical: 3,
    height: 5,
  },
  profileIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: "#50A040",
  },
  feedContainer: {
    paddingBottom: 100,
  },
  postCard: {
    backgroundColor: "#143615",
    marginHorizontal: 14,
    marginVertical: 8,
    borderRadius: 12,
    padding: 16,
  },
  postHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  postInfo: {
    flex: 1,
  },
  username: {
    color: "#F1FCF2",
    fontSize: 16,
    fontWeight: "600",
  },
  timestamp: {
    color: "#A0A0A0",
    fontSize: 12,
    marginTop: 2,
  },
  postContent: {
    color: "#F1FCF2",
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 12,
  },
  postActions: {
    flexDirection: "row",
    gap: 24,
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  actionText: {
    color: "#F1FCF2",
    fontSize: 14,
  },
});
