import React, { useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Pressable } from "react-native";
import { Octicons, AntDesign, Ionicons, FontAwesome5, Feather } from "@expo/vector-icons";
import Highlights from "@twikkl/components/Discover/Highlights";
import Card from "@twikkl/components/Discover/Card";
import { cardDataGroup, cardDataYou } from "@twikkl/data/discover/cardData";
import ModalEl from "@twikkl/components/ModalEl";
import ButtonEl from "@twikkl/components/ButtonEl";
import Scroll from "@twikkl/components/Scrollable";
import { useRouter } from "expo-router";
import { useThemeMode } from "@twikkl/entities/theme.entity";

export const colors = {
  green100: "#041105",
  green200: "#143615",
  green300: "#50a040",
  white100: "#F1FCF2",
  white200: "#ffffff",
};

interface Group {
  id: string;
  title: string;
  img: any;
  smallImg: any;
  desc: string;
  members: string;
  fav?: boolean;
  status: string;
  smallGroup: string[];
  videos: any[];
  followers?: number;
}

type ModalType = "access" | "leave" | null;

const Server = () => {
  const { isDarkMode } = useThemeMode();
  const [activeTabIndex, setActiveTabIndex] = useState<number>(0);
  const [groups, setGroups] = useState<Group[]>(cardDataGroup);
  const [yourGroups, setYourGroups] = useState<Group[]>(cardDataYou);
  const [favoriteGroups, setFavoriteGroups] = useState<Group[]>([]);
  const [selectedGroup, setSelectedGroup] = useState<Group | null>(null);
  const [modalType, setModalType] = useState<ModalType>(null);
  const router = useRouter();
  
  const backgroundColor = isDarkMode ? "#000" : "#F5F5F5";
  const textColor = isDarkMode ? "#fff" : "#000";
  const headerBg = isDarkMode ? "#041105" : "#fff";
  const inactiveIconColor = isDarkMode ? "#888" : "#000";

  const serverTabs = [
    {
      title: "For you",
      activeIcon: <FontAwesome5 name="user-friends" size={22} color={colors.white200} />,
      icon: <Feather name="users" size={22} color={inactiveIconColor} />,
    },
    {
      title: "Your Servers",
      activeIcon: <FontAwesome5 name="user-friends" size={22} color={colors.white200} />,
      icon: <Feather name="users" size={22} color={inactiveIconColor} />,
    },
    {
      title: "Favorites",
      icon: <Feather name="star" size={22} color={inactiveIconColor} />,
      activeIcon: <Ionicons name="star" size={22} color={colors.white100} />,
    },
  ];

  const joinServer = (item: Group) => {
    setModalType(null);
    
    if (item.status === "Closed") {
      alert("Access request sent! The server admin will review your request.");
      return;
    }
    
    const filteredGroups = groups.filter((group) => group.title !== item.title);
    setGroups(filteredGroups);
    setYourGroups((prevGroups) => [item, ...prevGroups]);
  };

  const leaveServer = (item: Group) => {
    setModalType(null);
    const filteredGroups = yourGroups.filter((group) => group.title !== item.title);
    setYourGroups(filteredGroups);
    setGroups((prevGroups) => [item, ...prevGroups]);
  };

  const favPress = (item: Group) => {
    const updated = groups.map((group) => (group.title === item.title ? { ...group, fav: !group.fav } : group));
    setGroups(updated);
    setFavoriteGroups(updated.filter((item) => item.fav === true));
  };

  const renderModalContent = () => (
    <ModalEl transparent animate visible={modalType === "access" || modalType === "leave"}>
      <View style={styles.modalWrapper}>
        <View style={styles.modal}>
          {modalType === "access" ? (
            <>
              <Ionicons 
                name={selectedGroup?.status === "Closed" ? "lock-closed" : "checkmark-circle"} 
                color={selectedGroup?.status === "Closed" ? "#000" : "#50a040"} 
                size={35} 
              />
              <Text style={{ fontWeight: "700", fontSize: 16, marginTop: 12 }}>{selectedGroup?.title}</Text>
              <Text style={{ fontSize: 14, color: "#666", marginTop: 8, marginBottom: 20, textAlign: "center" }}>
                {selectedGroup?.status === "Closed" 
                  ? "This is a private server. Your request will be sent to the server admin." 
                  : "Join this public server to access exclusive content and connect with the community."}
              </Text>
              <View style={{ width: 200 }}>
                <ButtonEl onPress={() => selectedGroup && joinServer(selectedGroup)} height={45}>
                  <Text style={{ color: "#fff" }}>
                    {selectedGroup?.status === "Closed" ? "Request Access" : "Join Server"}
                  </Text>
                </ButtonEl>
              </View>
            </>
          ) : (
            <>
              <Text style={{ fontSize: 15 }}>Are you sure you want to leave</Text>
              <Text style={{ fontSize: 16, fontWeight: "600", marginTop: 6, marginBottom: 22 }}>
                {selectedGroup?.title}?
              </Text>
              <View style={styles.btnContainer}>
                <View style={{ width: 100 }}>
                  <ButtonEl onPress={() => setModalType(null)} outline height={45}>
                    <Text>Cancel</Text>
                  </ButtonEl>
                </View>
                <View style={{ width: 100 }}>
                  <ButtonEl onPress={() => selectedGroup && leaveServer(selectedGroup)} height={45}>
                    <Text style={{ color: "#fff" }}>Leave</Text>
                  </ButtonEl>
                </View>
              </View>
            </>
          )}
        </View>
      </View>
    </ModalEl>
  );

  const renderDisplay = () => {
    if (activeTabIndex === 0) return yourGroups;
    if (activeTabIndex === 1) return groups;
    if (activeTabIndex === 2) return favoriteGroups;
    return [];
  };

  const titleText = activeTabIndex === 0 ? "For You" : activeTabIndex === 1 ? "Your Servers" : "Favorite Servers";

  return (
    <View style={{ flex: 1, backgroundColor }}>
      <View style={[styles.header, { backgroundColor: headerBg }]}>
        <View style={styles.top}>
          <TouchableOpacity onPressOut={() => router.back()} style={[styles.iconContainer, { backgroundColor: isDarkMode ? "#000" : "#E0E0E0" }]}>
            <Octicons name="chevron-left" size={24} color={textColor} />
          </TouchableOpacity>
          <Text style={[styles.text, { color: textColor }]}>Servers</Text>
          <AntDesign name="search1" size={24} color={textColor} />
        </View>
        <View style={{ flexDirection: "row" }}>
          <ScrollView
            contentContainerStyle={{ alignItems: "center" }}
            showsHorizontalScrollIndicator={false}
            horizontal
          >
            <TouchableOpacity 
              style={styles.addButton}
              onPress={() => router.push("/server/CreateServer")}
            >
              <Ionicons name="add-outline" size={30} color="#fff" />
            </TouchableOpacity>
            {serverTabs.map(({ icon, title, activeIcon }, index) => (
              <TouchableOpacity
                key={index}
                onPress={() => setActiveTabIndex(index)}
                style={[styles.tab, activeTabIndex === index && styles.activeTab]}
              >
                {activeTabIndex === index ? activeIcon : icon}
                <Text style={[styles.navText, activeTabIndex === index && styles.activeNavText]}>{title}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </View>
      <Highlights />
      <View style={styles.groupContainer}>
        <Text style={[styles.text, { color: textColor }]}>{titleText}</Text>
        <Scroll>
          {renderDisplay().map((item) => (
            <Pressable key={item.id} onPress={() => router.push(`/Discover/${item.id}`)}>
              <Card
                onPress={() => {
                  setModalType("access");
                  setSelectedGroup(item);
                }}
                leaveGroup={() => {
                  setModalType("leave");
                  setSelectedGroup(item);
                }}
                favPress={() => favPress(item)}
                forYou={activeTabIndex === 0}
                {...item}
              />
            </Pressable>
          ))}
        </Scroll>
      </View>
      {renderModalContent()}
    </View>
  );
};

export default Server;

const styles = StyleSheet.create({
  header: {
    paddingTop: 55,
    paddingHorizontal: 16,
  },
  top: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  iconContainer: {
    backgroundColor: "#000",
    height: 30,
    width: 30,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 100,
  },
  text: {
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 12,
  },
  addButton: {
    backgroundColor: colors.green300,
    height: 34,
    width: 36,
    borderRadius: 50,
    marginRight: 13,
    alignItems: "center",
  },
  navText: {
    fontFamily: "axiforma",
    fontWeight: "300",
    fontSize: 14,
    color: "#888",
  },
  activeNavText: {
    color: "#fff",
  },
  tab: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 15,
    paddingVertical: 10,
    gap: 8,
    marginRight: 5,
  },
  activeTab: {
    borderRadius: 100,
    backgroundColor: "#50A040",
  },
  title: {
    fontSize: 16,
    fontWeight: "500",
    marginBottom: 15,
  },
  modalWrapper: {
    backgroundColor: "rgba(20, 54, 21, 0.5)",
    justifyContent: "flex-end",
    alignItems: "center",
    flex: 1,
    paddingBottom: 100,
  },
  modal: {
    backgroundColor: "#fff",
    width: "80%",
    padding: 32,
    alignItems: "center",
    borderRadius: 8,
  },
  btnContainer: {
    flexDirection: "row",
    gap: 24,
    justifyContent: "space-between",
  },
  groupContainer: {
    flex: 1,
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
});
