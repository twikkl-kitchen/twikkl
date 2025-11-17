import { View, Text, StyleSheet, Image, Pressable, ScrollView, Dimensions, ActivityIndicator, Alert } from "react-native";
import React, { useState, useEffect, useCallback } from "react";
import { useRouter, useLocalSearchParams, useFocusEffect } from "expo-router";
import axios from "axios";
import Back from "@assets/svg/Back";
import MoreIcon from "@assets/svg/More";
import GroupSettings from "@assets/svg/GroupSettings";
import Play from "@assets/svg/Play";
import PinIcon from "@assets/svg/PinIcon";
import { useThemeMode } from "@twikkl/entities/theme.entity";
import { useAuth } from "@twikkl/entities/auth.entity";
import { API_ENDPOINTS } from "@twikkl/config/api";

const { width } = Dimensions.get('window');

const tabs = [
  { id: 'videos', label: 'Your Videos', Icon: Play },
  { id: 'saved', label: 'Saved', Icon: PinIcon },
  { id: 'history', label: 'History', Icon: Play },
];

interface UserProfile {
  id: string;
  username: string;
  displayName?: string;
  bio?: string;
  profileImageUrl?: string;
  bannerImageUrl?: string;
  email?: string;
}

interface FollowStats {
  followers: number;
  following: number;
}

const Profile = () => {
  const router = useRouter();
  const { userId } = useLocalSearchParams();
  const { isDarkMode } = useThemeMode();
  const { user: currentUser } = useAuth();
  
  const [activeTab, setActiveTab] = useState('videos');
  const [showFullBio, setShowFullBio] = useState(false);
  const [profileUser, setProfileUser] = useState<UserProfile | null>(null);
  const [followStats, setFollowStats] = useState<FollowStats>({ followers: 0, following: 0 });
  const [isFollowing, setIsFollowing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [followLoading, setFollowLoading] = useState(false);
  const [videos, setVideos] = useState<any[]>([]);
  const [authChecked, setAuthChecked] = useState(false);
  
  const backgroundColor = isDarkMode ? "#000" : "#F1FCF2";
  const textColor = isDarkMode ? "#FFF" : "#000";
  const cardBg = isDarkMode ? "#1A1A1A" : "#FFF";
  const borderColor = isDarkMode ? "#333" : "#E0E0E0";
  
  // Determine which user's profile to view
  const targetUserId = userId || currentUser?.id;
  const isOwnProfile = targetUserId === currentUser?.id;

  // Fetch user profile data
  const fetchUserProfile = useCallback(async () => {
    if (!targetUserId) {
      setError("User ID not found");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const response = await axios.get(API_ENDPOINTS.USERS.GET_PROFILE(targetUserId as string), {
        withCredentials: true,
      });

      if (response.data) {
        setProfileUser(response.data);
      }
    } catch (err: any) {
      console.error('Failed to fetch user profile:', err);
      setError(err.response?.data?.error || 'Failed to load profile');
    } finally {
      setLoading(false);
    }
  }, [targetUserId]);

  // Fetch follower/following counts
  const fetchFollowStats = useCallback(async () => {
    if (!targetUserId) return;

    try {
      const [followersResponse, followingResponse] = await Promise.all([
        axios.get(API_ENDPOINTS.FOLLOWS.GET_FOLLOWERS(targetUserId as string), {
          withCredentials: true,
        }),
        axios.get(API_ENDPOINTS.FOLLOWS.GET_FOLLOWING(targetUserId as string), {
          withCredentials: true,
        }),
      ]);

      setFollowStats({
        followers: followersResponse.data.followers?.length || 0,
        following: followingResponse.data.following?.length || 0,
      });
    } catch (err) {
      console.error('Failed to fetch follow stats:', err);
    }
  }, [targetUserId]);

  // Check if current user is following this profile
  const checkFollowStatus = useCallback(async () => {
    if (!targetUserId || isOwnProfile) return;

    try {
      const response = await axios.get(API_ENDPOINTS.FOLLOWS.IS_FOLLOWING(targetUserId as string), {
        withCredentials: true,
      });

      setIsFollowing(response.data.isFollowing || false);
    } catch (err) {
      console.error('Failed to check follow status:', err);
    }
  }, [targetUserId, isOwnProfile]);

  // Handle follow/unfollow
  const handleFollowToggle = async () => {
    if (!targetUserId || isOwnProfile) return;

    try {
      setFollowLoading(true);

      if (isFollowing) {
        // Unfollow
        await axios.delete(API_ENDPOINTS.FOLLOWS.UNFOLLOW_USER(targetUserId as string), {
          withCredentials: true,
        });
        setIsFollowing(false);
        setFollowStats(prev => ({ ...prev, followers: prev.followers - 1 }));
      } else {
        // Follow
        await axios.post(API_ENDPOINTS.FOLLOWS.FOLLOW_USER(targetUserId as string), {}, {
          withCredentials: true,
        });
        setIsFollowing(true);
        setFollowStats(prev => ({ ...prev, followers: prev.followers + 1 }));
      }
    } catch (err: any) {
      console.error('Failed to toggle follow:', err);
      Alert.alert("Error", err.response?.data?.error || "Failed to update follow status");
    } finally {
      setFollowLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      const checkAuthAndFetch = async () => {
        try {
          // Check backend session first to ensure we're authenticated
          const authResponse = await axios.get(API_ENDPOINTS.AUTH.ME, {
            withCredentials: true,
          });
          
          if (authResponse.data.authenticated && authResponse.data.user) {
            // Update local auth state if needed
            const sessionUser = authResponse.data.user;
            const currentUserId = userId || sessionUser.id;
            
            if (currentUserId) {
              fetchUserProfile();
              fetchFollowStats();
              if (userId && userId !== sessionUser.id) {
                checkFollowStatus();
              }
            }
          } else {
            // Not authenticated on backend
            setError("Please login to view your profile");
            setLoading(false);
          }
        } catch (err) {
          console.error('Auth check failed:', err);
          // If auth check fails, fall back to local storage
          const currentUserId = userId || currentUser?.id;
          
          if (currentUserId) {
            fetchUserProfile();
            fetchFollowStats();
            if (!isOwnProfile) {
              checkFollowStatus();
            }
          } else {
            setError("Please login to view your profile");
            setLoading(false);
          }
        }
      };
      
      checkAuthAndFetch();
    }, [userId, currentUser?.id, isOwnProfile, fetchUserProfile, fetchFollowStats, checkFollowStatus])
  );

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor, justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color="#50A040" />
      </View>
    );
  }

  if (error || !profileUser) {
    return (
      <View style={[styles.container, { backgroundColor }]}>
        <View style={[styles.header, { backgroundColor: cardBg, borderBottomColor: borderColor }]}>
          <Pressable onPress={() => router.back()} style={styles.headerButton}>
            <Back dark={textColor} />
          </Pressable>
        </View>
        <View style={styles.errorContainer}>
          <Text style={[styles.errorText, { color: textColor }]}>{error || 'User not found'}</Text>
          {error !== "Please login to view your profile" && (
            <Pressable style={styles.retryButton} onPress={fetchUserProfile}>
              <Text style={styles.retryButtonText}>Retry</Text>
            </Pressable>
          )}
          {error === "Please login to view your profile" && (
            <Pressable style={styles.retryButton} onPress={() => router.push('/auth')}>
              <Text style={styles.retryButtonText}>Login</Text>
            </Pressable>
          )}
        </View>
      </View>
    );
  }

  const displayName = profileUser.displayName || profileUser.username;
  const username = profileUser.username;
  const bio = profileUser.bio || '';

  return (
    <View style={[styles.container, { backgroundColor }]}>
      <ScrollView>
        {/* Banner Section */}
        <View style={styles.bannerContainer}>
          {profileUser.bannerImageUrl ? (
            <Image 
              source={{ uri: profileUser.bannerImageUrl }} 
              style={styles.bannerImage}
              resizeMode="cover"
            />
          ) : (
            <View style={[styles.bannerPlaceholder, { backgroundColor: borderColor }]} />
          )}
          
          {/* Header Buttons */}
          <Pressable 
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Back dark="#FFF" />
          </Pressable>
          
          {isOwnProfile && (
            <Pressable 
              style={styles.settingsButton}
              onPress={() => router.push('/Settings')}
            >
              <GroupSettings fill="#FFF" />
            </Pressable>
          )}
        </View>

        {/* Profile Info Section */}
        <View style={[styles.profileInfo, { backgroundColor }]}>
          <View style={styles.profileImageContainer}>
            {profileUser.profileImageUrl ? (
              <Image 
                source={{ uri: profileUser.profileImageUrl }} 
                style={styles.profileImage}
              />
            ) : (
              <View style={[styles.profileImagePlaceholder, { backgroundColor: borderColor }]}>
                <Text style={[styles.profileImagePlaceholderText, { color: textColor }]}>
                  {username ? username[0].toUpperCase() : '?'}
                </Text>
              </View>
            )}
          </View>
          
          <View style={styles.profileDetails}>
            <Text style={[styles.channelName, { color: textColor }]}>{displayName}</Text>
            <View style={styles.statsRow}>
              <Text style={[styles.statsText, { color: textColor }]}>@{username}</Text>
              <Text style={[styles.statsText, { color: textColor }]}> • </Text>
              <Text style={[styles.statsText, { color: textColor }]}>
                {followStats.followers} {followStats.followers === 1 ? 'follower' : 'followers'}
              </Text>
              <Text style={[styles.statsText, { color: textColor }]}> • </Text>
              <Text style={[styles.statsText, { color: textColor }]}>
                {followStats.following} following
              </Text>
            </View>
            
            {bio ? (
              <>
                <Text style={[styles.bioText, { color: textColor }]} numberOfLines={showFullBio ? undefined : 2}>
                  {bio}
                </Text>
                {bio.length > 100 && (
                  <Pressable onPress={() => setShowFullBio(!showFullBio)}>
                    <Text style={styles.moreText}>{showFullBio ? 'Show less' : 'More'}</Text>
                  </Pressable>
                )}
              </>
            ) : (
              <Text style={[styles.bioText, { color: textColor, opacity: 0.5 }]}>
                No bio yet
              </Text>
            )}
            
            {/* Action Buttons */}
            <View style={styles.actionButtons}>
              {!isOwnProfile ? (
                <Pressable 
                  style={[
                    styles.followButton,
                    { backgroundColor: isFollowing ? cardBg : '#50A040', borderColor, borderWidth: isFollowing ? 1 : 0 }
                  ]}
                  onPress={handleFollowToggle}
                  disabled={followLoading}
                >
                  {followLoading ? (
                    <ActivityIndicator size="small" color={isFollowing ? textColor : "#FFF"} />
                  ) : (
                    <Text style={[styles.followButtonText, { color: isFollowing ? textColor : '#FFF' }]}>
                      {isFollowing ? 'Following' : 'Follow'}
                    </Text>
                  )}
                </Pressable>
              ) : null}
              <Pressable style={[styles.iconButton, { backgroundColor: cardBg, borderColor }]}>
                <MoreIcon />
              </Pressable>
            </View>
          </View>
        </View>

        {/* Tabs Section */}
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

        {/* Content Section - YouTube Style Video Grid */}
        <View style={styles.videosContainer}>
          {videos.length > 0 ? (
            videos.map((video, index) => (
              <View key={index} style={[styles.videoItem, { borderBottomColor: borderColor }]}>
                <View style={styles.thumbnailContainer}>
                  <Image 
                    source={{ uri: video.thumbnailUrl }} 
                    style={styles.thumbnail}
                    resizeMode="cover"
                  />
                  <View style={styles.videoDuration}>
                    <Text style={styles.videoDurationText}>{video.duration || '0:00'}</Text>
                  </View>
                </View>
                <View style={styles.videoDetails}>
                  <Text style={[styles.videoTitle, { color: textColor }]} numberOfLines={2}>
                    {video.title || 'Untitled Video'}
                  </Text>
                  <Text style={[styles.videoStats, { color: textColor }]}>
                    {video.views || 0} views • {video.createdAt || 'Recently'}
                  </Text>
                </View>
              </View>
            ))
          ) : (
            <View style={styles.emptyContainer}>
              <Play dark={isDarkMode ? "#333" : "#CCC"} />
              <Text style={[styles.emptyText, { color: textColor, opacity: 0.5 }]}>
                {activeTab === 'videos' ? 'No videos yet' : 
                 activeTab === 'saved' ? 'No saved videos' : 
                 'No watch history'}
              </Text>
            </View>
          )}
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    paddingTop: 50,
    borderBottomWidth: 1,
  },
  headerButton: {
    padding: 8,
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
  bannerPlaceholder: {
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
  settingsButton: {
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
  profileImagePlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 4,
    borderColor: '#FFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileImagePlaceholderText: {
    fontSize: 36,
    fontWeight: 'bold',
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
    marginTop: 12,
  },
  followButton: {
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 20,
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 40,
  },
  followButtonText: {
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
  videosContainer: {
    padding: 16,
  },
  videoItem: {
    flexDirection: 'row',
    marginBottom: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
  },
  thumbnailContainer: {
    width: width * 0.4,
    aspectRatio: 16 / 9,
    borderRadius: 8,
    overflow: 'hidden',
    position: 'relative',
    marginRight: 12,
  },
  thumbnail: {
    width: '100%',
    height: '100%',
  },
  videoDuration: {
    position: 'absolute',
    bottom: 4,
    right: 4,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    paddingHorizontal: 4,
    paddingVertical: 2,
    borderRadius: 2,
  },
  videoDurationText: {
    color: '#FFF',
    fontSize: 10,
    fontWeight: '600',
  },
  videoDetails: {
    flex: 1,
    justifyContent: 'flex-start',
  },
  videoTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
    lineHeight: 18,
  },
  videoStats: {
    fontSize: 12,
    opacity: 0.7,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 16,
    marginTop: 12,
  },
  errorContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    marginBottom: 20,
    textAlign: 'center',
  },
  retryButton: {
    backgroundColor: '#50A040',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 20,
  },
  retryButtonText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '600',
  },
});
