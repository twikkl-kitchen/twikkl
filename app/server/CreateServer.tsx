import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Switch,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";

const CreateServer = () => {
  const router = useRouter();
  const [serverName, setServerName] = useState("");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");
  const [hashtag, setHashtag] = useState("");
  const [isPrivate, setIsPrivate] = useState(false);

  const handleCreate = () => {
    if (!serverName.trim()) {
      alert("Please enter a server name");
      return;
    }
    
    // Pass server data to AddMembers page
    router.push({
      pathname: "/server/AddMembers",
      params: {
        serverName,
        description,
        location,
        hashtag,
        privacy: isPrivate ? 'private' : 'public'
      }
    });
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="chevron-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Create Server</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.subtitle}>
          Create and manage a group to discover and contribute your resource videos
        </Text>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Server Name *</Text>
          <TextInput
            style={styles.input}
            placeholder="Walking Dollars in Nigeria"
            placeholderTextColor="#666"
            value={serverName}
            onChangeText={setServerName}
          />
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Add Description</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Describe your server..."
            placeholderTextColor="#666"
            value={description}
            onChangeText={setDescription}
            multiline
            numberOfLines={4}
          />
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Add Location (Optional)</Text>
          <TextInput
            style={styles.input}
            placeholder="Lagos, Nigeria"
            placeholderTextColor="#666"
            value={location}
            onChangeText={setLocation}
          />
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Add Hashtag</Text>
          <TextInput
            style={styles.input}
            placeholder="#crypto #trading"
            placeholderTextColor="#666"
            value={hashtag}
            onChangeText={setHashtag}
          />
        </View>

        <View style={styles.privacyContainer}>
          <View style={styles.privacyRow}>
            <View>
              <Text style={styles.privacyLabel}>Private Server</Text>
              <Text style={styles.privacySubtext}>
                {isPrivate ? "Only invited members can join" : "Anyone can discover and join"}
              </Text>
            </View>
            <Switch
              value={isPrivate}
              onValueChange={setIsPrivate}
              trackColor={{ false: "#3e3e3e", true: "#50a040" }}
              thumbColor={isPrivate ? "#fff" : "#f4f3f4"}
            />
          </View>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.createButton, !serverName.trim() && styles.createButtonDisabled]}
          onPress={handleCreate}
          disabled={!serverName.trim()}
        >
          <Text style={styles.createButtonText}>Next: Add Members</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default CreateServer;

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
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
  },
  subtitle: {
    fontSize: 14,
    color: "#999",
    marginBottom: 24,
    lineHeight: 20,
  },
  inputContainer: {
    marginBottom: 24,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: "#fff",
    marginBottom: 8,
  },
  input: {
    backgroundColor: "#1a1a1a",
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: "#fff",
    borderWidth: 1,
    borderColor: "#2a2a2a",
  },
  textArea: {
    height: 100,
    textAlignVertical: "top",
  },
  privacyContainer: {
    backgroundColor: "#1a1a1a",
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
  },
  privacyRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  privacyLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: "#fff",
    marginBottom: 4,
  },
  privacySubtext: {
    fontSize: 12,
    color: "#999",
  },
  footer: {
    padding: 16,
    paddingBottom: 32,
    backgroundColor: "#000",
  },
  createButton: {
    backgroundColor: "#50a040",
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
  },
  createButtonDisabled: {
    backgroundColor: "#2a2a2a",
    opacity: 0.5,
  },
  createButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#fff",
  },
});
