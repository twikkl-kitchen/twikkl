import { View, Text, StyleSheet, Pressable, ScrollView, Alert } from "react-native";
import React from "react";
import { useRouter } from "expo-router";
import { useThemeMode } from "@twikkl/entities/theme.entity";
import { useAuth, setUser } from "@twikkl/entities/auth.entity";
import axios from "axios";
import { API_ENDPOINTS } from "@twikkl/config/api";
import Back from "@assets/svg/Back";
import { Ionicons } from "@expo/vector-icons";

const Settings = () => {
  const router = useRouter();
  const { isDarkMode } = useThemeMode();
  const { user } = useAuth();

  const backgroundColor = isDarkMode ? "#000" : "#fff";
  const textColor = isDarkMode ? "#FFF" : "#000";
  const cardBg = isDarkMode ? "#1A1A1A" : "#FFF";
  const borderColor = isDarkMode ? "#333" : "#E0E0E0";

  const handleLogout = async () => {
    Alert.alert(
      "Logout",
      "Are you sure you want to logout?",
      [
        {
          text: "Cancel",
          style: "cancel"
        },
        {
          text: "Logout",
          style: "destructive",
          onPress: async () => {
            try {
              await axios.post(API_ENDPOINTS.AUTH.LOGOUT, {}, { withCredentials: true });
              setUser(null as any);
              router.replace('/');
            } catch (error) {
              console.error('Logout error:', error);
              setUser(null as any);
              router.replace('/');
            }
          }
        }
      ]
    );
  };

  const settingsOptions = [
    {
      id: 'edit-profile',
      title: 'Edit Profile',
      icon: 'person-outline',
      onPress: () => router.push('/ProfileSettings')
    },
    {
      id: 'referrals',
      title: 'Referrals',
      icon: 'gift-outline',
      onPress: () => router.push('/Referrals')
    },
    {
      id: 'logout',
      title: 'Logout',
      icon: 'log-out-outline',
      onPress: handleLogout,
      isDestructive: true
    }
  ];

  return (
    <View style={[styles.container, { backgroundColor }]}>
      <View style={[styles.header, { backgroundColor: cardBg, borderBottomColor: borderColor }]}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <Back dark={textColor} />
        </Pressable>
        <Text style={[styles.headerTitle, { color: textColor }]}>Settings</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={styles.content}>
        {/* User Info Section */}
        <View style={[styles.userSection, { backgroundColor: cardBg, borderColor }]}>
          <View style={[styles.avatar, { backgroundColor: '#50A040' }]}>
            <Text style={styles.avatarText}>
              {user?.username?.charAt(0).toUpperCase() || user?.email?.charAt(0).toUpperCase() || 'U'}
            </Text>
          </View>
          <View style={styles.userInfo}>
            <Text style={[styles.username, { color: textColor }]}>
              {user?.displayName || user?.username || 'User'}
            </Text>
            <Text style={[styles.email, { color: isDarkMode ? '#888' : '#666' }]}>
              {user?.email || ''}
            </Text>
          </View>
        </View>

        {/* Settings Options */}
        <View style={[styles.optionsContainer, { backgroundColor: cardBg, borderColor }]}>
          {settingsOptions.map((option, index) => (
            <Pressable
              key={option.id}
              style={[
                styles.optionItem,
                { borderBottomColor: borderColor },
                index === settingsOptions.length - 1 && styles.lastOption
              ]}
              onPress={option.onPress}
            >
              <View style={styles.optionLeft}>
                <Ionicons 
                  name={option.icon as any} 
                  size={24} 
                  color={option.isDestructive ? '#FF3B30' : '#50A040'} 
                />
                <Text 
                  style={[
                    styles.optionTitle, 
                    { color: option.isDestructive ? '#FF3B30' : textColor }
                  ]}
                >
                  {option.title}
                </Text>
              </View>
              <Ionicons 
                name="chevron-forward" 
                size={20} 
                color={isDarkMode ? '#888' : '#666'} 
              />
            </Pressable>
          ))}
        </View>

        {/* App Version */}
        <Text style={[styles.version, { color: isDarkMode ? '#666' : '#999' }]}>
          Twikkl v1.0.0
        </Text>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  content: {
    flex: 1,
  },
  userSection: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    margin: 16,
    marginBottom: 8,
    borderRadius: 12,
    borderWidth: 1,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: '#FFF',
    fontSize: 24,
    fontWeight: '700',
  },
  userInfo: {
    marginLeft: 16,
    flex: 1,
  },
  username: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 4,
  },
  email: {
    fontSize: 14,
  },
  optionsContainer: {
    margin: 16,
    marginTop: 8,
    borderRadius: 12,
    borderWidth: 1,
    overflow: 'hidden',
  },
  optionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
  },
  lastOption: {
    borderBottomWidth: 0,
  },
  optionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  optionTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  version: {
    textAlign: 'center',
    fontSize: 12,
    marginTop: 24,
    marginBottom: 40,
  },
});

export default Settings;
