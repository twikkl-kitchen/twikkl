import { View, Text, StyleSheet, Image, Pressable, ScrollView, Dimensions } from "react-native";
import React, { useState } from "react";
import Back from "@assets/svg/Back";
import MoreIcon from "@assets/svg/More";
import Twitter from "@assets/svg/Twitter";
import LiveIcon from "@assets/svg/LiveIcon";
import Play from "@assets/svg/Play";
import PinIcon from "@assets/svg/PinIcon";
import LabelIcon from "@assets/svg/LabelIcon";
import ImgBgRender from "@twikkl/components/ImgBgRender";
import { useRouter } from "expo-router";
import { useThemeMode } from "@twikkl/entities/theme.entity";

const { width } = Dimensions.get('window');

const tabs = [
  { id: 'videos', label: 'Videos', Icon: Play },
  { id: 'shorts', label: 'Shorts', Icon: PinIcon },
  { id: 'live', label: 'Live', Icon: LiveIcon },
  { id: 'playlists', label: 'Playlists', Icon: LabelIcon },
];

const imgArr = [
  require("../assets/imgs/prof1.png"),
  require("../assets/imgs/prof2.png"),
  require("../assets/imgs/prof3.png"),
  require("../assets/imgs/prof4.png"),
  require("../assets/imgs/prof5.png"),
  require("../assets/imgs/prof6.png"),
];

const Profile = () => {
  const router = useRouter();
  const { isDarkMode } = useThemeMode();
  const [activeTab, setActiveTab] = useState('videos');
  const [showFullBio, setShowFullBio] = useState(false);
  
  const backgroundColor = isDarkMode ? "#000" : "#F1FCF2";
  const textColor = isDarkMode ? "#FFF" : "#000";
  const cardBg = isDarkMode ? "#1A1A1A" : "#FFF";
  const borderColor = isDarkMode ? "#333" : "#E0E0E0";
  
  const bio = "UX Design Enthusiast currently working as a chef in Lagos. Passionate about creating amazing digital experiences and sharing cooking tutorials.";
  
  return (
    <View style={[styles.container, { backgroundColor }]}>
      <ScrollView>
        <View style={styles.bannerContainer}>
          <Image 
            source={require("../assets/imgs/prof1.png")} 
            style={styles.bannerImage}
            resizeMode="cover"
          />
          <Pressable 
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Back dark={isDarkMode ? "#FFF" : "#041105"} />
          </Pressable>
          <Pressable style={styles.moreButton}>
            <MoreIcon />
          </Pressable>
        </View>

        <View style={[styles.profileInfo, { backgroundColor }]}>
          <View style={styles.profileImageContainer}>
            <Image 
              source={require("../assets/imgs/profile.png")} 
              style={styles.profileImage}
            />
          </View>
          
          <View style={styles.profileDetails}>
            <Text style={[styles.channelName, { color: textColor }]}>jerry</Text>
            <View style={styles.statsRow}>
              <Text style={[styles.statsText, { color: textColor }]}>@jerry</Text>
              <Text style={[styles.statsText, { color: textColor }]}> • </Text>
              <Text style={[styles.statsText, { color: textColor }]}>4.5K subscribers</Text>
              <Text style={[styles.statsText, { color: textColor }]}> • </Text>
              <Text style={[styles.statsText, { color: textColor }]}>240 videos</Text>
            </View>
            
            <Text style={[styles.bioText, { color: textColor }]} numberOfLines={showFullBio ? undefined : 2}>
              {bio}
            </Text>
            <Pressable onPress={() => setShowFullBio(!showFullBio)}>
              <Text style={styles.moreText}>{showFullBio ? 'Show less' : 'More'}</Text>
            </Pressable>
            
            <View style={styles.actionButtons}>
              <Pressable style={styles.subscribeButton}>
                <Text style={styles.subscribeText}>Subscribe</Text>
              </Pressable>
              <Pressable style={[styles.iconButton, { backgroundColor: cardBg, borderColor }]}>
                <Twitter />
              </Pressable>
              <Pressable style={[styles.iconButton, { backgroundColor: cardBg, borderColor }]}>
                <MoreIcon />
              </Pressable>
            </View>
          </View>
        </View>

        <View style={[styles.tabsContainer, { borderBottomColor: borderColor }]}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {tabs.map((tab) => (
              <Pressable
                key={tab.id}
                style={[
                  styles.tab,
                  activeTab === tab.id && styles.activeTab,
                ]}
                onPress={() => setActiveTab(tab.id)}
              >
                <tab.Icon dark={activeTab === tab.id ? "#50A040" : (isDarkMode ? "#999" : "#666")} />
                <Text 
                  style={[
                    styles.tabText,
                    { color: activeTab === tab.id ? "#50A040" : (isDarkMode ? "#999" : "#666") }
                  ]}
                >
                  {tab.label}
                </Text>
                {activeTab === tab.id && <View style={styles.activeIndicator} />}
              </Pressable>
            ))}
          </ScrollView>
        </View>

        <View style={styles.contentGrid}>
          {imgArr.map((item, index) => (
            <ImgBgRender key={index} img={item} />
          ))}
        </View>
      </ScrollView>
    </View>
  );
};

export default Profile;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  bannerContainer: {
    width: '100%',
    height: 180,
    position: 'relative',
  },
  bannerImage: {
    width: '100%',
    height: '100%',
  },
  backButton: {
    position: 'absolute',
    top: 40,
    left: 16,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 20,
    padding: 8,
  },
  moreButton: {
    position: 'absolute',
    top: 40,
    right: 16,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 20,
    padding: 8,
  },
  profileInfo: {
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  profileImageContainer: {
    marginTop: -50,
    alignSelf: 'flex-start',
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 4,
    borderColor: '#FFF',
  },
  profileDetails: {
    marginTop: 16,
  },
  channelName: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  statsText: {
    fontSize: 13,
    opacity: 0.7,
  },
  bioText: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 4,
  },
  moreText: {
    color: '#50A040',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 16,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 16,
  },
  subscribeButton: {
    backgroundColor: '#50A040',
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 20,
    flex: 1,
    alignItems: 'center',
  },
  subscribeText: {
    color: '#FFF',
    fontWeight: 'bold',
    fontSize: 14,
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabsContainer: {
    borderBottomWidth: 1,
    flexDirection: 'row',
  },
  tab: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
    position: 'relative',
  },
  activeTab: {
    // Active tab styling
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
  },
  activeIndicator: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 2,
    backgroundColor: '#50A040',
  },
  contentGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: 10,
    padding: 16,
  },
});
