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

const CaptionVideo = () => {
  const router = useRouter();
  const { videoUri, serverId } = useLocalSearchParams();
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
    
    try {
      const uploads = await AsyncStorage.getItem(storageKey);
      allUploads = uploads ? JSON.parse(uploads) : [];
      
      // Filter uploads from last 24 hours
      const now = new Date().getTime();
      const last24Hours = 24 * 60 * 60 * 1000;
      recentUploads = allUploads.filter((timestamp: string) => {
        const uploadTime = new Date(timestamp).getTime();
        return (now - uploadTime) < last24Hours;
      });

      if (recentUploads.length >= 2) {
        Alert.alert(
          "Upload Limit Reached",
          "You can only upload 2 videos within 24 hours in this server. Please try again later.",
          [{ text: "OK" }]
        );
        return;
      }

      console.log('Upload limit check passed');
    } catch (storageError) {
      console.warn('AsyncStorage error:', storageError);
      // Continue without upload limit check if storage fails
    }

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
      // Upload to server
      const uploadResponse = await fetch(`/api/servers/${serverId}/videos`, {
        method: 'POST',
        body: formData,
        credentials: 'include',
      });

      console.log('Upload response status:', uploadResponse.status);

      if (!uploadResponse.ok) {
        const errorData = await uploadResponse.json();
        console.error('Upload failed:', errorData);
        throw new Error(errorData.error || 'Failed to upload video');
      }

      // Add current upload to storage
      const newUpload = new Date().toISOString();
      const updatedUploads = [...allUploads, newUpload];
      await AsyncStorage.setItem(storageKey, JSON.stringify(updatedUploads));
      
      // Update local state immediately with recent uploads only
      const newRecentUploads = [...recentUploads, newUpload];
      setUploadsToday(newRecentUploads);
      setUploadCount(newRecentUploads.length);

      console.log('Upload successful!');
      Alert.alert("Success", "Your video has been posted to the server!", [
        { text: "OK", onPress: () => router.back() },
      ]);
    } catch (error) {
      console.error('Upload error:', error);
      Alert.alert("Error", `Failed to post video: ${error instanceof Error ? error.message : 'Unknown error'}`, [
        { text: "OK" }
      ]);
    }
  };

  const tagArr = ["# Hashtags", "@ Tag Friends"];
  return (
    <View style={{ paddingHorizontal: 16, backgroundColor: "#000", flex: 1 }}>
      <View style={styles.topHeader}>
        <Pressable onPress={() => router.back()}>
          <Back dark="#041105" />
        </Pressable>
        <Text style={styles.boldText}>Post to Server</Text>
        <View style={{ width: 20 }} />
      </View>
      <View style={styles.post}>
        <View style={styles.nameAvatar}>
          <Avatar.Image size={34} source={require("../../assets/imgs/avatar1.png")} />
          <View>
            <Text style={{ fontWeight: "600", fontSize: 15, color: "#fff" }}>@glorypraise.eth</Text>
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
        placeholderTextColor="#666"
        style={{ maxHeight: 100, fontSize: 15, marginTop: 10, color: "#fff" }}
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
        <Text style={{ fontWeight: "600", marginBottom: 8, color: "#fff" }}>Category</Text>
        <Pressable style={styles.categorySelect} onPress={() => setCategoryDropdown(!categoryDropdown)}>
          <Text style={{ color: "#fff" }}>{selectedCategory}</Text>
          <ArrowDown color="#fff" />
        </Pressable>
        {categoryDropdown && (
          <View style={styles.categoryDropdown}>
            {categories.map((cat) => (
              <Pressable
                key={cat}
                style={styles.categoryOption}
                onPress={() => {
                  setSelectedCategory(cat);
                  setCategoryDropdown(false);
                }}
              >
                <Text style={{ color: selectedCategory === cat ? "#50A040" : "#fff" }}>{cat}</Text>
              </Pressable>
            ))}
          </View>
        )}
      </View>

      <View style={styles.tags}>
        {tagArr.map((tag) => (
          <View key={tag} style={styles.tagItem}>
            <Text style={{ color: "#fff" }}>{tag}</Text>
          </View>
        ))}
      </View>
      
      {uploadCount > 0 && (
        <Text style={styles.uploadInfo}>
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
    backgroundColor: "#1a1a1a",
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
    borderBottomColor: "#333",
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
    borderBottomColor: "#E0E0E0",
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
    color: "#fff",
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
    color: "#666",
    marginBottom: 10,
    textAlign: "center",
  },
});
