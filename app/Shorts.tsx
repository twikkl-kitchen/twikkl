import {
  StyleSheet,
  View,
  FlatList,
  Dimensions,
  NativeScrollEvent,
  NativeSyntheticEvent,
  Pressable,
  Image,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Text, Badge } from "react-native-paper";
import { ViewVariant, TwikklIcon, EIcon } from "@twikkl/configs";
import { useColors } from "@twikkl/hooks";
import VideoFeedItem from "@twikkl/components/VideoFeedItem";
import { useRef, useState } from "react";
import videos from "@twikkl/staticFiles/videos";
import BottomNav from "@twikkl/components/BottomNav";
import { useTranslation } from "react-i18next";
import { useRouter } from "expo-router";
import AppBottomSheet from "@twikkl/components/BottomSheet";
import Share from "@twikkl/components/Share";
import { useAuth } from "@twikkl/entities/auth.entity";
import { useThemeMode } from "@twikkl/entities/theme.entity";

const DEFAULT_CAMERA_ACTION_COLOR = "#FFF";
const BACKGROUND_COLOR = "#041105";

//get device width and height
const { height } = Dimensions.get("window");

/**
 * TODO - Horizontal pager
 *
 * @constructor
 */

export default function Shorts() {
  const router = useRouter();
  const { primary: colorPrimary } = useColors();
  const { isLoggedIn } = useAuth();
  const { isDarkMode } = useThemeMode();
  const [shareVisible, setShareVisible] = useState(false)

  // get static videos
  const items = videos;

  const { t } = useTranslation();
  const [visibleIndex, setVisibleIndex] = useState<number>(0);

  const handleProfileClick = () => {
    if (isLoggedIn) {
      router.push("Profile");
    } else {
      router.push("auth/Register");
    }
  };

  const onScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const contentOffset = event.nativeEvent.contentOffset.y;
    const index = Math.floor(contentOffset / height);

    setVisibleIndex(index);
  };

  return (
    <>
      <FlatList
        style={[StyleSheet.absoluteFill]}
        data={items}
        renderItem={({ item, index }) => <VideoFeedItem item={item} index={index} visibleIndex={visibleIndex} onShareClick={() => setShareVisible(true)} />}
        keyExtractor={(item, index) => index.toString()}
        pagingEnabled
        showsVerticalScrollIndicator={false}
        showsHorizontalScrollIndicator={false}
        onScroll={onScroll}
      />
      <SafeAreaView style={styles.innerContainer}>
        <View style={ViewVariant.rowSpaceBetween}>
          <TwikklIcon name={EIcon.TIMER_24} size={24} color={DEFAULT_CAMERA_ACTION_COLOR} />
          <View style={ViewVariant.centered}>
            <Text variant="titleMedium" style={styles.headActionText}>
              Shorts
            </Text>
            <Badge size={10} style={{ ...styles.headActionIndicator, backgroundColor: colorPrimary }} />
          </View>
          <Pressable onPress={() => router.push("Server")}>
            <Text variant="titleMedium" style={styles.headActionText}>
              Following
            </Text>
            <Badge size={10} style={{ ...styles.headActionIndicator, backgroundColor: DEFAULT_CAMERA_ACTION_COLOR }} />
          </Pressable>
          <Pressable onPress={() => router.push("Notification")}>
            <TwikklIcon name={EIcon.BELL} size={24} color={DEFAULT_CAMERA_ACTION_COLOR} />
            <Badge size={10} style={{ backgroundColor: colorPrimary, position: "absolute" }} />
          </Pressable>
          <Pressable onPress={handleProfileClick}>
            <Image
              source={require("@assets/imgs/profile.png")}
              style={styles.profileIcon}
            />
          </Pressable>
        </View>
      </SafeAreaView>

      <BottomNav commentCount={0} />
      {
        shareVisible &&
        <AppBottomSheet 
        backgroundColor={isDarkMode ? BACKGROUND_COLOR : "#fff"}
        height="50%"
        closeModal={() => setShareVisible(false)}>
          <Share />
        </AppBottomSheet>
      }
    </>
  );
}

const styles = StyleSheet.create({
  innerContainer: {
    paddingTop: 10,
    marginHorizontal: 14,
  },
  headActionText: {
    color: DEFAULT_CAMERA_ACTION_COLOR,
    fontWeight: "600",
  },
  headActionIndicator: {
    alignSelf: "center",
    marginTop: 0,
    paddingHorizontal: 10,
    paddingVertical: 3,
    height: 5,
  },
  rightActionsContainer: {
    justifyContent: "space-between",
    alignSelf: "flex-end",
    alignItems: "flex-end",
    marginVertical: 10,
    paddingRight: 5,
  },
  profileImg: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 10,
    borderWidth: 1,
    borderColor: "#FFF",
  },
  profileIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: "#50A040",
  },
  bottomContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    paddingBottom: 10,
    paddingHorizontal: 14,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  tabText: {
    color: "#FFF",
    fontSize: 12,
  },
  tabContainer: {
    alignItems: "center",
  },
});
