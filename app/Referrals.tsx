import { View, Text, StyleSheet, Pressable, ScrollView, Share, Alert, ActivityIndicator } from "react-native";
import React, { useState, useEffect } from "react";
import { useRouter } from "expo-router";
import { useThemeMode } from "@twikkl/entities/theme.entity";
import { useAuth } from "@twikkl/entities/auth.entity";
import axios from "axios";
import { API_ENDPOINTS } from "@twikkl/config/api";
import Back from "@assets/svg/Back";
import { Ionicons } from "@expo/vector-icons";
import * as Clipboard from 'expo-clipboard';

interface ReferralStats {
  referralCode: string;
  totalReferrals: number;
  referrals: Array<{
    id: string;
    referredUsername: string;
    createdAt: string;
  }>;
}

const Referrals = () => {
  const router = useRouter();
  const { isDarkMode } = useThemeMode();
  const { user } = useAuth();

  const [stats, setStats] = useState<ReferralStats | null>(null);
  const [loading, setLoading] = useState(true);

  const backgroundColor = isDarkMode ? "#000" : "#fff";
  const textColor = isDarkMode ? "#FFF" : "#000";
  const cardBg = isDarkMode ? "#1A1A1A" : "#FFF";
  const borderColor = isDarkMode ? "#333" : "#E0E0E0";

  useEffect(() => {
    fetchReferralStats();
  }, [user?.id]);

  const fetchReferralStats = async () => {
    if (!user?.id) return;

    try {
      setLoading(true);
      const response = await axios.get(API_ENDPOINTS.REFERRALS.GET_USER_REFERRALS(user.id), {
        withCredentials: true,
      });
      setStats(response.data);
    } catch (error) {
      console.error('Error fetching referral stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCopyCode = async () => {
    if (stats?.referralCode) {
      await Clipboard.setStringAsync(stats.referralCode);
      Alert.alert("Copied!", "Referral code copied to clipboard");
    }
  };

  const handleShare = async () => {
    if (!stats?.referralCode) return;

    const message = `Join me on Twikkl! Use my referral code: ${stats.referralCode}\n\nTwikkl is a decentralized video sharing platform where you can create, share, and monetize your content.`;

    try {
      await Share.share({
        message,
      });
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor }]}>
        <View style={[styles.header, { backgroundColor: cardBg, borderBottomColor: borderColor }]}>
          <Pressable onPress={() => router.back()} style={styles.backButton}>
            <Back dark={textColor} />
          </Pressable>
          <Text style={[styles.headerTitle, { color: textColor }]}>Referrals</Text>
          <View style={{ width: 40 }} />
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#50A040" />
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor }]}>
      <View style={[styles.header, { backgroundColor: cardBg, borderBottomColor: borderColor }]}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <Back dark={textColor} />
        </Pressable>
        <Text style={[styles.headerTitle, { color: textColor }]}>Referrals</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={styles.content}>
        {/* Referral Code Card */}
        <View style={[styles.codeCard, { backgroundColor: cardBg, borderColor }]}>
          <Text style={[styles.codeLabel, { color: isDarkMode ? '#888' : '#666' }]}>
            Your Referral Code
          </Text>
          <View style={[styles.codeContainer, { backgroundColor: isDarkMode ? '#000' : '#F5F5F5' }]}>
            <Text style={[styles.code, { color: '#50A040' }]}>{stats?.referralCode || 'Loading...'}</Text>
          </View>
          <View style={styles.actionButtons}>
            <Pressable 
              style={[styles.actionButton, { backgroundColor: '#50A040' }]}
              onPress={handleCopyCode}
            >
              <Ionicons name="copy-outline" size={20} color="#FFF" />
              <Text style={styles.actionButtonText}>Copy Code</Text>
            </Pressable>
            <Pressable 
              style={[styles.actionButton, { backgroundColor: '#007AFF' }]}
              onPress={handleShare}
            >
              <Ionicons name="share-social-outline" size={20} color="#FFF" />
              <Text style={styles.actionButtonText}>Share</Text>
            </Pressable>
          </View>
        </View>

        {/* Stats Card */}
        <View style={[styles.statsCard, { backgroundColor: cardBg, borderColor }]}>
          <Text style={[styles.sectionTitle, { color: textColor }]}>Referral Stats</Text>
          <View style={styles.statRow}>
            <View style={styles.statItem}>
              <Text style={[styles.statValue, { color: '#50A040' }]}>{stats?.totalReferrals || 0}</Text>
              <Text style={[styles.statLabel, { color: isDarkMode ? '#888' : '#666' }]}>Total Referrals</Text>
            </View>
          </View>
        </View>

        {/* Referral List */}
        {stats && stats.referrals.length > 0 && (
          <View style={[styles.listCard, { backgroundColor: cardBg, borderColor }]}>
            <Text style={[styles.sectionTitle, { color: textColor }]}>Referred Users</Text>
            {stats.referrals.map((referral) => (
              <View 
                key={referral.id} 
                style={[styles.referralItem, { borderBottomColor: borderColor }]}
              >
                <View style={[styles.referralAvatar, { backgroundColor: '#50A040' }]}>
                  <Text style={styles.avatarText}>
                    {referral.referredUsername.charAt(0).toUpperCase()}
                  </Text>
                </View>
                <View style={styles.referralInfo}>
                  <Text style={[styles.referralUsername, { color: textColor }]}>
                    @{referral.referredUsername}
                  </Text>
                  <Text style={[styles.referralDate, { color: isDarkMode ? '#888' : '#666' }]}>
                    {new Date(referral.createdAt).toLocaleDateString()}
                  </Text>
                </View>
                <Ionicons name="checkmark-circle" size={24} color="#50A040" />
              </View>
            ))}
          </View>
        )}

        {/* Empty State */}
        {stats && stats.referrals.length === 0 && (
          <View style={[styles.emptyState, { backgroundColor: cardBg, borderColor }]}>
            <Ionicons name="people-outline" size={64} color={isDarkMode ? '#333' : '#DDD'} />
            <Text style={[styles.emptyTitle, { color: textColor }]}>No referrals yet</Text>
            <Text style={[styles.emptyText, { color: isDarkMode ? '#888' : '#666' }]}>
              Share your referral code with friends to get started!
            </Text>
          </View>
        )}
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
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  codeCard: {
    margin: 16,
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
  },
  codeLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 12,
    textAlign: 'center',
  },
  codeContainer: {
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 16,
  },
  code: {
    fontSize: 24,
    fontWeight: '700',
    letterSpacing: 2,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 10,
    gap: 8,
  },
  actionButtonText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '600',
  },
  statsCard: {
    margin: 16,
    marginTop: 0,
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 16,
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 32,
    fontWeight: '700',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 14,
  },
  listCard: {
    margin: 16,
    marginTop: 0,
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
  },
  referralItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  referralAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '700',
  },
  referralInfo: {
    flex: 1,
    marginLeft: 12,
  },
  referralUsername: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  referralDate: {
    fontSize: 12,
  },
  emptyState: {
    margin: 16,
    marginTop: 0,
    padding: 40,
    borderRadius: 16,
    borderWidth: 1,
    alignItems: 'center',
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    textAlign: 'center',
  },
});

export default Referrals;
