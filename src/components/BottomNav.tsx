import {
  StyleSheet,
  TouchableOpacity,
  View,
  ImagePropsBase,
  Image,
  FlatList,
  Dimensions,
  NativeScrollEvent,
  NativeSyntheticEvent,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Text, Badge } from "react-native-paper";
import { useRouter } from "expo-router";
import { useColors } from "@twikkl/hooks";
import { TwikklIcon, EIcon } from "@twikkl/configs";
import { useTranslation } from "react-i18next";
import Play from "@assets/svg/Play";
import People from "@assets/svg/People";
import Grid1 from "@assets/svg/Grid1";

type BottomNavProps = {
  commentCount?: number | string;
};

function BottomNav({ commentCount = 0 }: BottomNavProps, {}) {
  const { t } = useTranslation();
  const router = useRouter();

  return (
    <SafeAreaView style={styles.bottomContainer}>
      <TouchableOpacity onPress={() => router.push("NewHome")} style={styles.tabContainer}>
        <Grid1 />
        <Text variant="titleMedium" style={styles.tabText}>
          Home
        </Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => router.push("Shorts")} style={styles.tabContainer}>
        <Play />
        <Text variant="titleMedium" style={styles.tabText}>
          Shorts
        </Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => router.push("video/CreateUploadVideo")} style={styles.tabContainer}>
        <View style={styles.createButton}>
          <TwikklIcon name={EIcon.PLUS} size={28} color="#FFF" />
        </View>
        <Text variant="titleMedium" style={styles.tabText}>
          Create
        </Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => router.push("Server")} style={styles.tabContainer}>
        <People />
        <Text variant="titleMedium" style={styles.tabText}>
          Server
        </Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

export default BottomNav;

const styles = StyleSheet.create({
  bottomContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    paddingBottom: 10,
    paddingHorizontal: 14,
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    backgroundColor: "rgba(4, 17, 5, 0.95)",
  },
  tabText: {
    color: "#FFF",
    fontSize: 12,
    marginTop: 4,
  },
  tabContainer: {
    alignItems: "center",
  },
  createButton: {
    backgroundColor: "#50A040",
    borderRadius: 20,
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },
});
