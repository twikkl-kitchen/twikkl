import {
  View,
  TouchableOpacity,
  Image,
  StyleSheet,
  ScrollView,
  Text,
  ImageBackground,
  Pressable,
  PixelRatio,
  Dimensions,
} from "react-native";
import { MaterialCommunityIcons, FontAwesome5, Octicons, AntDesign, Ionicons } from "@expo/vector-icons";
import { colors } from "../../../app/Discover/index";
import { IGroup } from "../../../app/Discover/[id]";
import PlayUpload from "@assets/svg/PlayUpload";
import { imgArr } from "../Discover/Card";
import GroupSettings from "@assets/svg/GroupSettings";
import Grid1 from "@assets/svg/Grid1";
import { useRouter } from "expo-router";
import MenuIcon from "@assets/svg/Menu";
import ArrowDown from "@assets/svg/ArrowDown";
import { useState, useEffect } from "react";
import Grid3 from "@assets/svg/Grid3";
import Grid2 from "@assets/svg/Grid2";
import { useThemeMode } from "@twikkl/entities/theme.entity";

interface Header extends IGroup {
  select: number;
  setSelect: Function;
}

const Header = ({
  title,
  desc,
  members,
  img,
  smallImg,
  status,
  smallGroup,
  select,
  setSelect,
  id,
}: Header): JSX.Element => {
  const { height } = Dimensions.get("window");
  const { isDarkMode } = useThemeMode();
  const [dropDown, setDropDown] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const router = useRouter();
  
  const backgroundColor = isDarkMode ? "#000" : "#fff";
  const textColor = isDarkMode ? "#fff" : "#000";
  const mutedTextColor = isDarkMode ? "#888" : "#666";

  useEffect(() => {
    checkAdminStatus();
  }, [id]);

  const checkAdminStatus = async () => {
    try {
      const response = await fetch(`/api/servers/${id}/is-admin`, {
        credentials: 'include',
      });
      if (response.ok) {
        const data = await response.json();
        setIsAdmin(data.isAdmin);
      }
    } catch (error) {
      console.error('Error checking admin status:', error);
    }
  };
  
  const headerIconColor = isDarkMode ? "#fff" : "#000";

  return (
    <View>
      <ImageBackground 
        style={[styles.compactBannerImage]} 
        source={img}
        resizeMode="cover"
        imageStyle={styles.bannerImageStyle}
      >
        <TouchableOpacity onPressOut={() => router.back()} style={[styles.iconContainer, { backgroundColor: isDarkMode ? "#000" : "rgba(255,255,255,0.9)" }]}>
          <Octicons name="chevron-left" size={24} color={headerIconColor} />
        </TouchableOpacity>
        <View style={{ flexDirection: "row", gap: 20 }}>
          <TouchableOpacity style={[styles.iconContainer, { backgroundColor: isDarkMode ? "#000" : "rgba(255,255,255,0.9)" }]}>
            <AntDesign name="search1" size={22} color={headerIconColor} />
          </TouchableOpacity>
          {isAdmin && (
            <TouchableOpacity 
              style={[styles.iconContainer, { backgroundColor: isDarkMode ? "#000" : "rgba(255,255,255,0.9)" }]}
              onPress={() => router.push(`/server/Settings?serverId=${id}`)}
            >
              <Ionicons name="settings-outline" size={22} color={headerIconColor} />
            </TouchableOpacity>
          )}
        </View>
      </ImageBackground>
      
      <View style={[styles.compactContainer, { backgroundColor }]}>
        <View style={styles.compactHeader}>
          <Image style={styles.compactProfilePicture} source={smallImg} />
          <View style={styles.compactInfo}>
            <View style={styles.compactTitleRow}>
              <Text style={[styles.compactTitle, { color: textColor }]} numberOfLines={1}>
                {title}
              </Text>
              <View style={styles.compactStatusBadge}>
                <MaterialCommunityIcons name="lock" size={14} color={mutedTextColor} />
                <Text style={[styles.compactStatusText, { color: mutedTextColor }]}>{status}</Text>
              </View>
            </View>
            <Text style={[styles.compactDescription, { color: mutedTextColor }]} numberOfLines={1}>
              {desc}
            </Text>
            <View style={styles.compactMetaRow}>
              <View style={styles.horizontal}>
                <FontAwesome5 name="user-friends" size={12} color={mutedTextColor} />
                <Text style={[styles.compactMeta, { color: mutedTextColor }]}>{members} members</Text>
              </View>
            </View>
          </View>
        </View>
        
        <View style={styles.compactActions}>
          <Pressable 
            style={styles.compactActionButton}
            onPress={() => router.push(`/server/CreateVideo?serverId=${id}`)}
          >
            <Ionicons name="add-circle" size={20} color="#50A040" />
            <Text style={[styles.compactActionText, { color: textColor }]}>Create</Text>
          </Pressable>
          <TouchableOpacity 
            style={styles.compactActionButton}
            onPress={() => {
              // TODO: Implement proper invite flow
              alert('Invite functionality coming soon! Share your server with friends.');
            }}
          >
            <Ionicons name="person-add-outline" size={18} color={mutedTextColor} />
            <Text style={[styles.compactActionText, { color: textColor }]}>Invite</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  add: {
    backgroundColor: "#fff",
    height: 30,
    width: 30,
    borderRadius: 20,
    alignItems: "center",
  },
  gridWrapper: {
    borderRadius: 4,
    borderWidth: 1,
    borderColor: "#50A040",
    padding: 3,
  },
  actionAvatar: {
    height: 36,
    width: 36,
    marginRight: 16,
  },
  dropdown: {
    backgroundColor: "lightgrey",
    padding: 10,
    borderRadius: 10,
    gap: 13,
    position: "absolute",
    bottom: -80,
    width: 50,
    right: 50,
  },
  actionContainer: {
    backgroundColor: "#fff",
    marginVertical: 4,
    paddingVertical: 8,
    flexDirection: "row",
    paddingHorizontal: 16,
    justifyContent: "space-between",
  },
  avatar: {
    borderRadius: 17.5,
    height: 35,
    width: 35,
    marginLeft: -15,
  },
  bannerImage: {
    paddingTop: 60,
    paddingHorizontal: 17,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  container: {
    backgroundColor: "#50A040",
    paddingHorizontal: 16,
  },
  description: {
    fontSize: 13,
    color: "#fff",
  },
  details: {
    marginLeft: 5,
    color: "#fff",
  },
  detailsContainer: {
    marginTop: 8,
    marginBottom: 16,
    justifyContent: "space-between",
  },
  horizontal: {
    flexDirection: "row",
    alignItems: "center",
  },
  profilePicture: {
    borderRadius: 35,
    height: 100,
    width: 100,
    marginTop: -50,
  },
  title: {
    fontSize: 20,
    fontWeight: "700",
    lineHeight: 33,
    marginBottom: 4,
    color: "#fff",
  },
  topicsButton: {
    paddingVertical: 6,
    marginVertical: 8,
    paddingHorizontal: 15,
    marginLeft: 16,
    borderColor: colors.green300,
    borderWidth: 1,
    borderRadius: 100,
  },
  iconContainer: {
    backgroundColor: "#000",
    height: 30,
    width: 30,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 100,
  },
  compactBannerImage: {
    height: 140,
    paddingTop: 50,
    paddingHorizontal: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
  },
  bannerImageStyle: {
    width: "100%",
    height: "100%",
  },
  compactContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  compactHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  compactProfilePicture: {
    borderRadius: 40,
    height: 80,
    width: 80,
    marginRight: 12,
  },
  compactInfo: {
    flex: 1,
  },
  compactTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 2,
  },
  compactTitle: {
    fontSize: 16,
    fontWeight: "700",
    marginRight: 8,
    flex: 1,
  },
  compactStatusBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  compactStatusText: {
    fontSize: 12,
  },
  compactDescription: {
    fontSize: 13,
    marginBottom: 4,
  },
  compactMetaRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  compactMeta: {
    fontSize: 12,
    marginLeft: 6,
  },
  compactActions: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: "#E0E0E0",
  },
  compactActionButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  compactActionText: {
    fontSize: 13,
    fontWeight: "500",
  },
});
export default Header;
