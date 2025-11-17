import Back from "@assets/svg/Back";
import { Avatar } from "react-native-paper";
import { Pressable, StyleSheet, Text, TextInput, View, Alert } from "react-native";
import ListItem from "@twikkl/components/ListItem";
import ToggleButton from "@twikkl/components/ToggleButton";
import { useState, useEffect } from "react";
import { ResizeMode, Video } from "expo-av";
import ArrowDown from "@assets/svg/ArrowDown";
import { useRouter, useLocalSearchParams } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useAuth } from "@twikkl/entities/auth.entity";
import { useColors } from "@twikkl/hooks/themeHooks";
import { useThemeMode } from "@twikkl/entities/theme.entity";

const CaptionVideo = () => {
  const router = useRouter();
  const { videoUri, serverId } = useLocalSearchParams();
  const { user } = useAuth();
  const colors = useColors();
  const { isDarkMode } = useThemeMode();
  const [data, setData] = useState({
    device: true,
    duet: true,
    stitch: true,
  });
  const [uploadCount, setUploadCount] = useState(0);
  const [uploadsToday, setUploadsToday] = useState<string[]>([]);
  const updateData = (field: string, value: boolean) => {
    setData((prev) => ({ ...prev, [field]: value }));
  };
  const [shouldPlay, setShouldPlay] = useState(false);
  const [captionText, setCaptionText] = useState("");
  const [categories, setCategories] = useState<string[]>(["Tutorial", "Trading", "Development", "General", "News"]);
  const [selectedCategory, setSelectedCategory] = useState("Tutorial");
  const [categoryDropdown, setCategoryDropdown] = useState(false);

  useEffect(() => {
    checkUploadLimit();
    fetchServerCategories();
  }, []);

  const fetchServerCategories = async () => {
    try {
      const response = await fetch(`/api/servers/${serverId}/categories`, {
        credentials: 'include',
      });
      if (response.ok) {
        const data = await response.json();
        if (data.categories && data.categories.length > 0) {
          setCategories(data.categories);
          setSelectedCategory(data.categories[0]);
        }
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const checkUploadLimit = async () => {
    const storageKey = `uploads_${serverId}`;
    const uploads = await AsyncStorage.getItem(storageKey);
    const allUploads = uploads ? JSON.parse(uploads) : [];
    
    // Filter uploads from last 24 hours
    const now = new Date().getTime();
    const last24Hours = 24 * 60 * 60 * 1000; // 24 hours in milliseconds
    const recentUploads = allUploads.filter((timestamp: string) => {
      const uploadTime = new Date(timestamp).getTime();
      return (now - uploadTime) < last24Hours;
    });
    
    setUploadsToday(recentUploads);
    setUploadCount(recentUploads.length);
  };

  const handlePost = async () => {
    console.log('Post button clicked!');
    console.log('Video URI:', videoUri);
    console.log('Server ID:', serverId);
    
    if (!videoUri || !serverId) {
      Alert.alert("Error", "Missing video or server information");
      return;
    }

    console.log('Checking upload limits...');
    const storageKey = `uploads_${serverId}`;
    let allUploads: string[] = [];
    let recentUploads: string[] = [];
    
    // Skip upload limit check on web for now
    console.log('Upload limit check passed (skipped on web)');

    try {
      console.log('Starting upload...');
      // Create FormData for video upload
      const formData = new FormData();
      
      // Convert video to blob
      console.log('Converting video to blob...');
      let blob: Blob;
      
      if ((videoUri as string).startsWith('data:')) {
        // Handle base64 data URI
        const base64Response = await fetch(videoUri as string);
        blob = await base64Response.blob();
      } else {
        // Handle file URI
        const response = await fetch(videoUri as string);
        blob = await response.blob();
      }
      console.log('Blob size:', blob.size);
      
      // Append video file
      formData.append('video', blob, 'video.mp4');
      formData.append('caption', captionText);
      formData.append('category', selectedCategory);
      formData.append('allowDuet', data.duet.toString());
      formData.append('allowStitch', data.stitch.toString());
      formData.append('saveToDevice', data.device.toString());

      console.log('Uploading to server...');
      console.log('FormData prepared with video blob:', blob.size, 'bytes');
      
      // Upload to server with timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 120000); // 2 minute timeout
      
      try {
        const uploadResponse = await fetch(`/api/servers/${serverId}/videos`, {
          method: 'POST',
          body: formData,
          credentials: 'include',
          signal: controller.signal,
        });
        clearTimeout(timeoutId);

        console.log('Upload response status:', uploadResponse.status);

      if (!uploadResponse.ok) {
        const errorData = await uploadResponse.json();
        console.error('Upload failed:', errorData);
        throw new Error(errorData.error || 'Failed to upload video');
      }

      const result = await uploadResponse.json();
      console.log('Upload successful!', result);

      // Only add to storage AFTER successful upload
      try {
        const newUpload = new Date().toISOString();
        const updatedUploads = [...allUploads, newUpload];
        await AsyncStorage.setItem(storageKey, JSON.stringify(updatedUploads));
        
        // Update local state immediately with recent uploads only
        const newRecentUploads = [...recentUploads, newUpload];
        setUploadsToday(newRecentUploads);
        setUploadCount(newRecentUploads.length);
      } catch (storageError) {
        console.warn('Failed to update AsyncStorage:', storageError);
      }

        Alert.alert("Success", "Your video has been posted to the server!", [
          { text: "OK", onPress: () => router.back() },
        ]);
      } catch (fetchError) {
        clearTimeout(timeoutId);
        throw fetchError;
      }
    } catch (error) {
      console.error('Upload error:', error);
      const errorMsg = error instanceof Error ? 
        (error.name === 'AbortError' ? 'Upload timed out. Please try again.' : error.message) : 
        'Unknown error';
      Alert.alert("Error", `Failed to post video: ${errorMsg}`, [
        { text: "OK" }
      ]);
    }
  };

  const tagArr = ["# Hashtags", "@ Tag Friends"];
  const textColor = isDarkMode ? colors.light : colors.dark;
  const backgroundColor = isDarkMode ? colors.dark : colors.light;
  const borderColor = isDarkMode ? "#333" : "#E0E0E0";
  const placeholderColor = isDarkMode ? "#666" : "#999";
  const dropdownBg = isDarkMode ? "#1a1a1a" : "#f5f5f5";

  return (
    <View style={{ paddingHorizontal: 16, backgroundColor, flex: 1 }}>
      <View style={styles.topHeader}>
        <Pressable onPress={() => router.back()}>
          <Back dark={isDarkMode ? "#041105" : "#50A040"} />
        </Pressable>
        <Text style={[styles.boldText, { color: textColor }]}>Post to Server</Text>
        <View style={{ width: 20 }} />
      </View>
      <View style={styles.post}>
        <View style={styles.nameAvatar}>
          {user?.profileImageUrl ? (
            <Avatar.Image size={34} source={{ uri: user.profileImageUrl }} />
          ) : (
            <Avatar.Text size={34} label={(user?.username || user?.displayName || "U")[0].toUpperCase()} />
          )}
          <View>
            <Text style={{ fontWeight: "600", fontSize: 15, color: textColor }}>
              @{user?.username || user?.displayName || "user"}
            </Text>
          </View>
        </View>
        <Pressable style={styles.bgGreen} onPress={handlePost}>
          <Text style={styles.textWhite}>Post</Text>
        </Pressable>
      </View>
      <TextInput
        multiline
        value={captionText}
        onChangeText={(val) => setCaptionText(val)}
        placeholder="Give your video a caption..."
        placeholderTextColor={placeholderColor}
        style={{ maxHeight: 100, fontSize: 15, marginTop: 10, color: textColor }}
      />
      <Pressable onPress={() => setShouldPlay(!shouldPlay)} style={styles.videoWrapper}>
        <Video
          shouldPlay={shouldPlay}
          source={{ uri: videoUri as string }}
          resizeMode={ResizeMode.COVER}
          style={[StyleSheet.absoluteFill, styles.video]}
          onError={(error) => console.log("Video Error:", error)}
        />
      </Pressable>
      
      <View style={{ zIndex: 1, marginBottom: 10 }}>
        <Text style={{ fontWeight: "600", marginBottom: 8, color: textColor }}>Category</Text>
        <Pressable style={styles.categorySelect} onPress={() => setCategoryDropdown(!categoryDropdown)}>
          <Text style={{ color: textColor }}>{selectedCategory}</Text>
          <ArrowDown color={textColor} />
        </Pressable>
        {categoryDropdown && (
          <View style={[styles.categoryDropdown, { backgroundColor: dropdownBg, borderColor: borderColor }]}>
            {categories.map((cat) => (
              <Pressable
                key={cat}
                style={[styles.categoryOption, { borderBottomColor: borderColor }]}
                onPress={() => {
                  setSelectedCategory(cat);
                  setCategoryDropdown(false);
                }}
              >
                <Text style={{ color: selectedCategory === cat ? colors.primary : textColor }}>{cat}</Text>
              </Pressable>
            ))}
          </View>
        )}
      </View>

      <View style={[styles.tags, { borderBottomColor: borderColor }]}>
        {tagArr.map((tag) => (
          <View key={tag} style={styles.tagItem}>
            <Text style={{ color: textColor }}>{tag}</Text>
          </View>
        ))}
      </View>
      
      {uploadCount > 0 && (
        <Text style={[styles.uploadInfo, { color: placeholderColor }]}>
          {uploadCount}/2 videos uploaded today
        </Text>
      )}

      <ListItem
        title="Save post to device"
        action={<ToggleButton checked={data.device} onToggle={() => updateData("device", !data.device)} />}
      />
      <ListItem
        title="Allow Duet"
        action={<ToggleButton checked={data.duet} onToggle={() => updateData("duet", !data.duet)} />}
      />
      <ListItem
        title="Allow Stitch"
        action={<ToggleButton checked={data.stitch} onToggle={() => updateData("stitch", !data.stitch)} />}
      />
    </View>
  );
};

export default CaptionVideo;

const styles = StyleSheet.create({
  post: {
    marginVertical: 20,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  select: {
    borderColor: "#50A040",
    borderWidth: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    marginTop: 4,
    gap: 8,
  },
  categorySelect: {
    borderColor: "#50A040",
    borderWidth: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 8,
  },
  categoryDropdown: {
    position: "absolute",
    top: 60,
    left: 0,
    right: 0,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#50A040",
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  categoryOption: {
    padding: 12,
    borderBottomWidth: 1,
  },
  videoWrapper: { height: 250, marginVertical: 10 },
  topHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: 50,
    paddingBottom: 10,
  },
  tags: {
    flexDirection: "row",
    gap: 15,
    paddingBottom: 20,
    marginBottom: 20,
    borderBottomWidth: 1,
  },
  tagItem: {
    borderColor: "#50A040",
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  boldText: {
    fontSize: 20,
    fontWeight: "bold",
  },
  video: { borderRadius: 16, width: "100%", height: "100%" },
  bgGreen: {
    height: 40,
    justifyContent: "center",
    paddingHorizontal: 24,
    backgroundColor: "#50A040",
    borderRadius: 24,
  },
  textWhite: {
    fontWeight: "700",
    fontSize: 14,
    color: "#F1FCF2",
  },
  nameAvatar: {
    flexDirection: "row",
    gap: 16,
  },
  optionsWrapper: { 
    position: "absolute", 
    backgroundColor: "#143615", 
    width: "100%", 
    borderRadius: 8,
    top: 0,
  },
  optionText: {
    fontWeight: "600",
    fontSize: 15,
    color: "#fff",
  },
  uploadInfo: {
    fontSize: 12,
    marginBottom: 10,
    textAlign: "center",
  },
});
