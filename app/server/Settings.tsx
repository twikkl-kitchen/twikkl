import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Switch,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";

const ServerSettings = () => {
  const router = useRouter();
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [autoApprove, setAutoApprove] = useState(false);
  const [allowInvites, setAllowInvites] = useState(true);

  const handleDeleteServer = () => {
    alert("Delete Server functionality coming soon");
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="chevron-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Server Settings</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>General</Text>

          <TouchableOpacity style={styles.settingItem}>
            <View style={styles.settingLeft}>
              <Ionicons name="pencil" size={20} color="#50a040" />
              <Text style={styles.settingText}>Edit Server Info</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#666" />
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.settingItem}
            onPress={() => router.push("/server/EditImages")}
          >
            <View style={styles.settingLeft}>
              <Ionicons name="image" size={20} color="#50a040" />
              <Text style={styles.settingText}>Change Server Images</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#666" />
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Privacy & Members</Text>

          <View style={styles.settingItem}>
            <View style={styles.settingLeft}>
              <Ionicons name="notifications" size={20} color="#50a040" />
              <Text style={styles.settingText}>Notifications</Text>
            </View>
            <Switch
              value={notificationsEnabled}
              onValueChange={setNotificationsEnabled}
              trackColor={{ false: "#3e3e3e", true: "#50a040" }}
              thumbColor={notificationsEnabled ? "#fff" : "#f4f3f4"}
            />
          </View>

          <View style={styles.settingItem}>
            <View style={styles.settingLeft}>
              <Ionicons name="checkmark-circle" size={20} color="#50a040" />
              <Text style={styles.settingText}>Auto-approve join requests</Text>
            </View>
            <Switch
              value={autoApprove}
              onValueChange={setAutoApprove}
              trackColor={{ false: "#3e3e3e", true: "#50a040" }}
              thumbColor={autoApprove ? "#fff" : "#f4f3f4"}
            />
          </View>

          <View style={styles.settingItem}>
            <View style={styles.settingLeft}>
              <Ionicons name="person-add" size={20} color="#50a040" />
              <Text style={styles.settingText}>Allow members to invite</Text>
            </View>
            <Switch
              value={allowInvites}
              onValueChange={setAllowInvites}
              trackColor={{ false: "#3e3e3e", true: "#50a040" }}
              thumbColor={allowInvites ? "#fff" : "#f4f3f4"}
            />
          </View>

          <TouchableOpacity style={styles.settingItem}>
            <View style={styles.settingLeft}>
              <Ionicons name="people" size={20} color="#50a040" />
              <Text style={styles.settingText}>Manage Members</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#666" />
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Content</Text>

          <TouchableOpacity style={styles.settingItem}>
            <View style={styles.settingLeft}>
              <Ionicons name="shield-checkmark" size={20} color="#50a040" />
              <Text style={styles.settingText}>Content Moderation</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#666" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.settingItem}>
            <View style={styles.settingLeft}>
              <Ionicons name="ban" size={20} color="#50a040" />
              <Text style={styles.settingText}>Blocked Users</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#666" />
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Danger Zone</Text>

          <TouchableOpacity 
            style={[styles.settingItem, styles.dangerItem]}
            onPress={handleDeleteServer}
          >
            <View style={styles.settingLeft}>
              <Ionicons name="trash" size={20} color="#ff4444" />
              <Text style={[styles.settingText, styles.dangerText]}>Delete Server</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#ff4444" />
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
};

export default ServerSettings;

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
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#fff",
    marginBottom: 16,
  },
  settingItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#1a1a1a",
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  settingLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  settingText: {
    fontSize: 16,
    color: "#fff",
    marginLeft: 12,
  },
  dangerItem: {
    backgroundColor: "rgba(255, 68, 68, 0.1)",
    borderWidth: 1,
    borderColor: "#ff4444",
  },
  dangerText: {
    color: "#ff4444",
  },
});
