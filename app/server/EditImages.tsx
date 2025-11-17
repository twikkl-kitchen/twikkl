import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Alert,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter, useLocalSearchParams } from "expo-router";
import * as ImagePicker from "expo-image-picker";
import axios from "axios";

const EditServerImages = () => {
  const router = useRouter();
  const { serverId } = useLocalSearchParams();
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [bannerImage, setBannerImage] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const pickProfileImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Permission needed", "Please grant camera roll permissions");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    if (!result.canceled && result.assets[0]) {
      setProfileImage(result.assets[0].uri);
    }
  };

  const pickBannerImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Permission needed", "Please grant camera roll permissions");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [16, 9],
      quality: 1,
    });

    if (!result.canceled && result.assets[0]) {
      setBannerImage(result.assets[0].uri);
    }
  };

  const uploadImage = async (uri: string, type: 'profile' | 'banner') => {
    try {
      // Convert image URI to blob
      const response = await fetch(uri);
      const blob = await response.blob();
      
      const formData = new FormData();
      formData.append('image', blob as any, 'image.jpg');

      const endpoint = type === 'profile' 
        ? `/api/servers/${serverId}/upload-profile-image`
        : `/api/servers/${serverId}/upload-banner`;

      const uploadResponse = await axios.post(endpoint, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        withCredentials: true,
      });

      return uploadResponse.data;
    } catch (error: any) {
      console.error(`${type} upload error:`, error);
      throw new Error(error.response?.data?.error || `Failed to upload ${type} image`);
    }
  };

  const handleSave = async () => {
    if (!profileImage && !bannerImage) {
      Alert.alert("No Changes", "Please select at least one image to upload");
      return;
    }

    try {
      setIsSaving(true);
      const promises = [];

      if (profileImage) {
        promises.push(uploadImage(profileImage, 'profile'));
      }
      if (bannerImage) {
        promises.push(uploadImage(bannerImage, 'banner'));
      }

      await Promise.all(promises);

      Alert.alert("Success", "Server images updated successfully!", [
        { text: "OK", onPress: () => router.back() },
      ]);
    } catch (error: any) {
      Alert.alert("Error", error.message || "Failed to upload images");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="chevron-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Edit Server Images</Text>
        <TouchableOpacity onPress={handleSave} disabled={isSaving}>
          {isSaving ? (
            <ActivityIndicator color="#50a040" />
          ) : (
            <Text style={styles.saveButton}>Save</Text>
          )}
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Banner Image</Text>
          <Text style={styles.sectionDesc}>
            This image appears at the top of your server. Recommended size: 1600x900px
          </Text>
          <TouchableOpacity style={styles.imageContainer} onPress={pickBannerImage}>
            {bannerImage ? (
              <Image source={{ uri: bannerImage }} style={styles.bannerPreview} />
            ) : (
              <View style={styles.placeholderBanner}>
                <Ionicons name="image-outline" size={48} color="#50a040" />
                <Text style={styles.placeholderText}>Tap to upload banner</Text>
              </View>
            )}
            <View style={styles.editOverlay}>
              <Ionicons name="camera" size={24} color="#fff" />
            </View>
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Profile Image</Text>
          <Text style={styles.sectionDesc}>
            This image represents your server. Recommended size: 500x500px
          </Text>
          <TouchableOpacity style={styles.profileContainer} onPress={pickProfileImage}>
            {profileImage ? (
              <Image source={{ uri: profileImage }} style={styles.profilePreview} />
            ) : (
              <View style={styles.placeholderProfile}>
                <Ionicons name="image-outline" size={48} color="#50a040" />
                <Text style={styles.placeholderText}>Tap to upload profile</Text>
              </View>
            )}
            <View style={styles.editOverlayProfile}>
              <Ionicons name="camera" size={20} color="#fff" />
            </View>
          </TouchableOpacity>
        </View>

        <View style={styles.infoBox}>
          <Ionicons name="information-circle" size={20} color="#50a040" />
          <Text style={styles.infoText}>
            Only server owners and admins can change server images
          </Text>
        </View>
      </View>
    </View>
  );
};

export default EditServerImages;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: 50,
    paddingBottom: 16,
    paddingHorizontal: 16,
    backgroundColor: "#000",
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#fff",
    flex: 1,
    textAlign: "center",
  },
  saveButton: {
    fontSize: 16,
    fontWeight: "600",
    color: "#50a040",
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#fff",
    marginBottom: 8,
  },
  sectionDesc: {
    fontSize: 14,
    color: "#999",
    marginBottom: 16,
  },
  imageContainer: {
    width: "100%",
    height: 200,
    borderRadius: 12,
    overflow: "hidden",
    position: "relative",
  },
  bannerPreview: {
    width: "100%",
    height: "100%",
  },
  placeholderBanner: {
    width: "100%",
    height: "100%",
    backgroundColor: "#1a1a1a",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "#50a040",
    borderStyle: "dashed",
    borderRadius: 12,
  },
  editOverlay: {
    position: "absolute",
    bottom: 12,
    right: 12,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
  },
  profileContainer: {
    width: 150,
    height: 150,
    borderRadius: 75,
    overflow: "hidden",
    position: "relative",
    alignSelf: "center",
  },
  profilePreview: {
    width: "100%",
    height: "100%",
  },
  placeholderProfile: {
    width: "100%",
    height: "100%",
    backgroundColor: "#1a1a1a",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "#50a040",
    borderStyle: "dashed",
    borderRadius: 75,
  },
  editOverlayProfile: {
    position: "absolute",
    bottom: 8,
    right: 8,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  placeholderText: {
    color: "#666",
    marginTop: 8,
    fontSize: 14,
  },
  infoBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(80, 160, 64, 0.1)",
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#50a040",
    marginTop: 16,
  },
  infoText: {
    color: "#fff",
    fontSize: 14,
    marginLeft: 12,
    flex: 1,
  },
});
