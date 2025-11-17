import { View, Text, StyleSheet, TextInput, Pressable, ScrollView, Image, Alert } from "react-native";
import React, { useState, useEffect } from "react";
import { useRouter } from "expo-router";
import { useThemeMode } from "@twikkl/entities/theme.entity";
import * as ImagePicker from 'expo-image-picker';
import { useAuth, setUser } from "@twikkl/entities/auth.entity";
import { API_ENDPOINTS } from "@twikkl/config/api";
import axios from "axios";
import Back from "@assets/svg/Back";

const ProfileSettings = () => {
  const router = useRouter();
  const { isDarkMode } = useThemeMode();
  const { user } = useAuth();

  const refreshUser = async () => {
    try {
      const response = await axios.get(API_ENDPOINTS.AUTH.ME, { withCredentials: true });
      if (response.data) {
        setUser(response.data as any);
      }
    } catch (error) {
      console.error('Failed to refresh user:', error);
    }
  };
  
  const [displayName, setDisplayName] = useState('');
  const [bio, setBio] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [bannerImage, setBannerImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const backgroundColor = isDarkMode ? "#000" : "#fff";
  const textColor = isDarkMode ? "#FFF" : "#000";
  const cardBg = isDarkMode ? "#1A1A1A" : "#FFF";
  const borderColor = isDarkMode ? "#333" : "#E0E0E0";
  const inputBg = isDarkMode ? "#1A1A1A" : "#FFF";

  useEffect(() => {
    if (user) {
      setDisplayName(user.displayName || '');
      setBio(user.bio || '');
      setFirstName(user.firstName || '');
      setLastName(user.lastName || '');
      setProfileImage(user.profileImageUrl || null);
      setBannerImage(user.bannerImageUrl || null);
    }
  }, [user]);

  const pickImage = async (type: 'profile' | 'banner') => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (permissionResult.granted === false) {
      Alert.alert("Permission required", "You need to grant photo library permission to upload images.");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: type === 'profile' ? [1, 1] : [16, 9],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      const asset = result.assets[0];
      uploadImage(asset.uri, type);
    }
  };

  const uploadImage = async (uri: string, type: 'profile' | 'banner') => {
    try {
      setLoading(true);
      
      const formData = new FormData();
      const filename = uri.split('/').pop() || 'image.jpg';
      const match = /\.(\w+)$/.exec(filename);
      const fileType = match ? `image/${match[1]}` : 'image/jpeg';

      formData.append('image', {
        uri,
        name: filename,
        type: fileType,
      } as any);

      const endpoint = type === 'profile' 
        ? API_ENDPOINTS.USERS.UPLOAD_PROFILE_IMAGE 
        : API_ENDPOINTS.USERS.UPLOAD_BANNER;

      const response = await axios.post(endpoint, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        withCredentials: true,
      });

      if (response.data.success) {
        if (type === 'profile') {
          setProfileImage(response.data.imageUrl);
        } else {
          setBannerImage(response.data.imageUrl);
        }
        Alert.alert("Success", response.data.message);
        refreshUser();
      }
    } catch (error: any) {
      console.error('Image upload error:', error);
      Alert.alert("Error", error.response?.data?.error || "Failed to upload image");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      
      if (!user?.id) {
        Alert.alert("Error", "User not found");
        return;
      }

      const response = await axios.put(
        API_ENDPOINTS.USERS.UPDATE_PROFILE(user.id),
        {
          displayName,
          bio,
          firstName,
          lastName,
        },
        { withCredentials: true }
      );

      if (response.data.success) {
        Alert.alert("Success", "Profile updated successfully");
        refreshUser();
        router.back();
      }
    } catch (error: any) {
      console.error('Update profile error:', error);
      Alert.alert("Error", error.response?.data?.error || "Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor }]}>
      <View style={[styles.header, { backgroundColor: cardBg, borderBottomColor: borderColor }]}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <Back dark={textColor} />
        </Pressable>
        <Text style={[styles.headerTitle, { color: textColor }]}>Edit Profile</Text>
        <Pressable onPress={handleSave} disabled={loading}>
          <Text style={[styles.saveButton, { opacity: loading ? 0.5 : 1 }]}>Save</Text>
        </Pressable>
      </View>

      <ScrollView style={styles.content}>
        {/* Banner Image */}
        <Pressable 
          style={[styles.bannerContainer, { backgroundColor: borderColor }]}
          onPress={() => pickImage('banner')}
        >
          {bannerImage ? (
            <Image source={{ uri: bannerImage }} style={styles.bannerImage} resizeMode="cover" />
          ) : (
            <View style={styles.imagePlaceholder}>
              <Text style={{ color: textColor, opacity: 0.5 }}>Tap to add banner</Text>
            </View>
          )}
        </Pressable>

        {/* Profile Image */}
        <View style={styles.profileImageWrapper}>
          <Pressable 
            style={[styles.profileImageContainer, { backgroundColor: cardBg, borderColor }]}
            onPress={() => pickImage('profile')}
          >
            {profileImage ? (
              <Image source={{ uri: profileImage }} style={styles.profileImage} />
            ) : (
              <View style={[styles.imagePlaceholder, { borderRadius: 50 }]}>
                <Text style={{ color: textColor, opacity: 0.5 }}>Add Photo</Text>
              </View>
            )}
          </Pressable>
        </View>

        <View style={styles.form}>
          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: textColor }]}>Display Name</Text>
            <TextInput
              style={[styles.input, { backgroundColor: inputBg, color: textColor, borderColor }]}
              value={displayName}
              onChangeText={setDisplayName}
              placeholder="Your display name"
              placeholderTextColor={isDarkMode ? "#666" : "#999"}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: textColor }]}>Username</Text>
            <TextInput
              style={[styles.input, { backgroundColor: inputBg, color: textColor, borderColor, opacity: 0.6 }]}
              value={user?.username || ''}
              editable={false}
              placeholderTextColor={isDarkMode ? "#666" : "#999"}
            />
            <Text style={[styles.hint, { color: isDarkMode ? "#666" : "#999" }]}>
              Username cannot be changed
            </Text>
          </View>

          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: textColor }]}>Bio</Text>
            <TextInput
              style={[styles.textArea, { backgroundColor: inputBg, color: textColor, borderColor }]}
              value={bio}
              onChangeText={setBio}
              placeholder="Tell us about yourself..."
              placeholderTextColor={isDarkMode ? "#666" : "#999"}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: textColor }]}>First Name</Text>
            <TextInput
              style={[styles.input, { backgroundColor: inputBg, color: textColor, borderColor }]}
              value={firstName}
              onChangeText={setFirstName}
              placeholder="First name"
              placeholderTextColor={isDarkMode ? "#666" : "#999"}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: textColor }]}>Last Name</Text>
            <TextInput
              style={[styles.input, { backgroundColor: inputBg, color: textColor, borderColor }]}
              value={lastName}
              onChangeText={setLastName}
              placeholder="Last name"
              placeholderTextColor={isDarkMode ? "#666" : "#999"}
            />
          </View>
        </View>
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
    paddingTop: 50,
    borderBottomWidth: 1,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  saveButton: {
    color: '#50A040',
    fontSize: 16,
    fontWeight: '600',
    paddingHorizontal: 8,
  },
  content: {
    flex: 1,
  },
  bannerContainer: {
    height: 150,
    width: '100%',
  },
  bannerImage: {
    width: '100%',
    height: '100%',
  },
  imagePlaceholder: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileImageWrapper: {
    alignItems: 'center',
    marginTop: -50,
    marginBottom: 20,
  },
  profileImageContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 4,
    overflow: 'hidden',
  },
  profileImage: {
    width: '100%',
    height: '100%',
  },
  form: {
    padding: 16,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
  },
  textArea: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
    minHeight: 100,
  },
  hint: {
    fontSize: 12,
    marginTop: 4,
  },
});

export default ProfileSettings;
