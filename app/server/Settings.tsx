import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  ActivityIndicator,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useThemeMode } from "@twikkl/entities/theme.entity";
import { API_ENDPOINTS } from "@twikkl/config/api";
import axios from "axios";

type Tab = "categories" | "admins" | "images";

interface Admin {
  userId: string;
  username?: string;
  email?: string;
  role: string;
}

const ServerSettings = () => {
  const router = useRouter();
  const { serverId } = useLocalSearchParams();
  const { isDarkMode } = useThemeMode();
  
  const [activeTab, setActiveTab] = useState<Tab>("categories");
  const [isLoading, setIsLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [categories, setCategories] = useState<string[]>([]);
  const [newCategory, setNewCategory] = useState("");
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editingValue, setEditingValue] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  
  const [admins, setAdmins] = useState<Admin[]>([]);
  const [newAdminUserId, setNewAdminUserId] = useState("");
  const [isAddingAdmin, setIsAddingAdmin] = useState(false);
  
  const backgroundColor = isDarkMode ? "#000" : "#fff";
  const textColor = isDarkMode ? "#fff" : "#000";
  const mutedTextColor = isDarkMode ? "#888" : "#666";
  const cardBgColor = isDarkMode ? "#1a1a1a" : "#f5f5f5";
  const borderColor = isDarkMode ? "#333" : "#e0e0e0";

  useEffect(() => {
    checkAdminStatus();
  }, [serverId]);

  useEffect(() => {
    if (isAdmin) {
      if (activeTab === "categories") {
        loadCategories();
      } else {
        loadAdmins();
      }
    }
  }, [isAdmin, activeTab]);

  const checkAdminStatus = async () => {
    if (!serverId) {
      setError("Server ID not found");
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      const response = await axios.get(
        API_ENDPOINTS.SERVERS.IS_ADMIN(serverId as string),
        { withCredentials: true }
      );
      setIsAdmin(response.data.isAdmin);
      setError(null);
    } catch (err: any) {
      console.error("Error checking admin status:", err);
      setError(err.response?.data?.error || "Failed to check admin status");
      setIsAdmin(false);
    } finally {
      setIsLoading(false);
    }
  };

  const loadCategories = async () => {
    try {
      const response = await axios.get(
        API_ENDPOINTS.SERVERS.CATEGORIES(serverId as string)
      );
      setCategories(response.data.categories || []);
    } catch (err: any) {
      console.error("Error loading categories:", err);
      Alert.alert("Error", "Failed to load categories");
    }
  };

  const loadAdmins = async () => {
    try {
      const response = await axios.get(
        API_ENDPOINTS.SERVERS.ADMINS(serverId as string)
      );
      setAdmins(response.data.admins || []);
    } catch (err: any) {
      console.error("Error loading admins:", err);
      Alert.alert("Error", "Failed to load admins");
    }
  };

  const validateCategories = (cats: string[]): string | null => {
    if (cats.length === 0) {
      return "Categories cannot be empty";
    }
    
    const uniqueCategories = new Set(cats.map(c => c.toLowerCase().trim()));
    if (uniqueCategories.size !== cats.length) {
      return "Categories cannot have duplicate names";
    }
    
    return null;
  };

  const saveCategories = async () => {
    const validationError = validateCategories(categories);
    if (validationError) {
      Alert.alert("Validation Error", validationError);
      return;
    }

    try {
      setIsSaving(true);
      await axios.put(
        API_ENDPOINTS.SERVERS.CATEGORIES(serverId as string),
        { categories },
        { withCredentials: true }
      );
      Alert.alert("Success", "Categories updated successfully");
    } catch (err: any) {
      console.error("Error saving categories:", err);
      Alert.alert("Error", err.response?.data?.error || "Failed to save categories");
    } finally {
      setIsSaving(false);
    }
  };

  const addCategory = () => {
    const trimmed = newCategory.trim();
    if (!trimmed) {
      Alert.alert("Error", "Category name cannot be empty");
      return;
    }
    
    if (categories.some(c => c.toLowerCase() === trimmed.toLowerCase())) {
      Alert.alert("Error", "Category already exists");
      return;
    }
    
    setCategories([...categories, trimmed]);
    setNewCategory("");
  };

  const startEdit = (index: number) => {
    setEditingIndex(index);
    setEditingValue(categories[index]);
  };

  const saveEdit = () => {
    if (editingIndex === null) return;
    
    const trimmed = editingValue.trim();
    if (!trimmed) {
      Alert.alert("Error", "Category name cannot be empty");
      return;
    }
    
    const isDuplicate = categories.some(
      (c, idx) => idx !== editingIndex && c.toLowerCase() === trimmed.toLowerCase()
    );
    
    if (isDuplicate) {
      Alert.alert("Error", "Category already exists");
      return;
    }
    
    const updated = [...categories];
    updated[editingIndex] = trimmed;
    setCategories(updated);
    setEditingIndex(null);
    setEditingValue("");
  };

  const cancelEdit = () => {
    setEditingIndex(null);
    setEditingValue("");
  };

  const deleteCategory = (index: number) => {
    Alert.alert(
      "Delete Category",
      `Are you sure you want to delete "${categories[index]}"?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => {
            const updated = categories.filter((_, idx) => idx !== index);
            setCategories(updated);
          },
        },
      ]
    );
  };

  const addAdmin = async () => {
    const trimmed = newAdminUserId.trim();
    if (!trimmed) {
      Alert.alert("Error", "User ID cannot be empty");
      return;
    }

    try {
      setIsAddingAdmin(true);
      await axios.post(
        API_ENDPOINTS.SERVERS.ADD_ADMIN(serverId as string),
        { userId: trimmed },
        { withCredentials: true }
      );
      Alert.alert("Success", "Admin added successfully");
      setNewAdminUserId("");
      loadAdmins();
    } catch (err: any) {
      console.error("Error adding admin:", err);
      Alert.alert("Error", err.response?.data?.error || "Failed to add admin");
    } finally {
      setIsAddingAdmin(false);
    }
  };

  const removeAdmin = async (userId: string, role: string) => {
    if (role === "owner") {
      Alert.alert("Error", "Cannot remove the server owner");
      return;
    }

    Alert.alert(
      "Remove Admin",
      "Are you sure you want to remove this admin?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Remove",
          style: "destructive",
          onPress: async () => {
            try {
              await axios.delete(
                API_ENDPOINTS.SERVERS.REMOVE_ADMIN(serverId as string, userId),
                { withCredentials: true }
              );
              Alert.alert("Success", "Admin removed successfully");
              loadAdmins();
            } catch (err: any) {
              console.error("Error removing admin:", err);
              Alert.alert("Error", err.response?.data?.error || "Failed to remove admin");
            }
          },
        },
      ]
    );
  };

  if (isLoading) {
    return (
      <View style={[styles.container, { backgroundColor }]}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="chevron-back" size={24} color={textColor} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: textColor }]}>Server Settings</Text>
          <View style={{ width: 24 }} />
        </View>
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#50a040" />
          <Text style={[styles.loadingText, { color: mutedTextColor }]}>
            Checking permissions...
          </Text>
        </View>
      </View>
    );
  }

  if (!isAdmin) {
    return (
      <View style={[styles.container, { backgroundColor }]}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="chevron-back" size={24} color={textColor} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: textColor }]}>Server Settings</Text>
          <View style={{ width: 24 }} />
        </View>
        <View style={styles.centerContainer}>
          <Ionicons name="lock-closed" size={64} color={mutedTextColor} />
          <Text style={[styles.accessDeniedTitle, { color: textColor }]}>
            Access Denied
          </Text>
          <Text style={[styles.accessDeniedText, { color: mutedTextColor }]}>
            {error || "You don't have permission to access server settings"}
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="chevron-back" size={24} color={textColor} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: textColor }]}>Server Settings</Text>
        <View style={{ width: 24 }} />
      </View>

      <View style={[styles.tabContainer, { borderBottomColor: borderColor }]}>
        <TouchableOpacity
          style={[
            styles.tab,
            activeTab === "categories" && styles.activeTab,
          ]}
          onPress={() => setActiveTab("categories")}
        >
          <Text
            style={[
              styles.tabText,
              { color: activeTab === "categories" ? "#50a040" : mutedTextColor },
            ]}
          >
            Categories
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.tab,
            activeTab === "admins" && styles.activeTab,
          ]}
          onPress={() => setActiveTab("admins")}
        >
          <Text
            style={[
              styles.tabText,
              { color: activeTab === "admins" ? "#50a040" : mutedTextColor },
            ]}
          >
            Admins
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.tab,
            activeTab === "images" && styles.activeTab,
          ]}
          onPress={() => setActiveTab("images")}
        >
          <Text
            style={[
              styles.tabText,
              { color: activeTab === "images" ? "#50a040" : mutedTextColor },
            ]}
          >
            Images
          </Text>
        </TouchableOpacity>
      </View>

      {activeTab === "images" ? (
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: textColor }]}>
              Server Images
            </Text>
            <Text style={[styles.sectionDesc, { color: mutedTextColor }]}>
              Customize your server's profile and banner images to make it stand out
            </Text>
          </View>

          <TouchableOpacity
            style={[styles.imageSettingButton, { backgroundColor: cardBgColor, borderColor }]}
            onPress={() => router.push(`/server/EditImages?serverId=${serverId}`)}
          >
            <View style={styles.imageButtonContent}>
              <Ionicons name="images-outline" size={32} color="#50a040" />
              <View style={styles.imageButtonText}>
                <Text style={[styles.imageButtonTitle, { color: textColor }]}>
                  Edit Server Images
                </Text>
                <Text style={[styles.imageButtonDesc, { color: mutedTextColor }]}>
                  Update profile picture and banner image
                </Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={24} color={mutedTextColor} />
          </TouchableOpacity>

          <View style={[styles.infoBox, { backgroundColor: cardBgColor, borderColor: "#50a040" }]}>
            <Ionicons name="information-circle" size={20} color="#50a040" />
            <Text style={[styles.infoText, { color: textColor }]}>
              Recommended sizes: Profile image 500x500px, Banner image 1600x900px
            </Text>
          </View>
        </ScrollView>
      ) : activeTab === "categories" ? (
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: textColor }]}>
              Add New Category
            </Text>
            <View style={styles.inputRow}>
              <TextInput
                style={[
                  styles.input,
                  { backgroundColor: cardBgColor, color: textColor, borderColor },
                ]}
                placeholder="Enter category name"
                placeholderTextColor={mutedTextColor}
                value={newCategory}
                onChangeText={setNewCategory}
                onSubmitEditing={addCategory}
              />
              <TouchableOpacity
                style={[styles.addButton, !newCategory.trim() && styles.disabledButton]}
                onPress={addCategory}
                disabled={!newCategory.trim()}
              >
                <Ionicons name="add" size={24} color="#fff" />
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: textColor }]}>
              Current Categories ({categories.length})
            </Text>
            {categories.length === 0 ? (
              <View style={[styles.emptyContainer, { backgroundColor: cardBgColor }]}>
                <Ionicons name="folder-open-outline" size={48} color={mutedTextColor} />
                <Text style={[styles.emptyText, { color: mutedTextColor }]}>
                  No categories yet
                </Text>
              </View>
            ) : (
              categories.map((category, index) => (
                <View
                  key={index}
                  style={[styles.categoryItem, { backgroundColor: cardBgColor }]}
                >
                  {editingIndex === index ? (
                    <>
                      <TextInput
                        style={[styles.editInput, { color: textColor, borderColor }]}
                        value={editingValue}
                        onChangeText={setEditingValue}
                        autoFocus
                      />
                      <View style={styles.editActions}>
                        <TouchableOpacity
                          style={styles.iconButton}
                          onPress={saveEdit}
                        >
                          <Ionicons name="checkmark" size={20} color="#50a040" />
                        </TouchableOpacity>
                        <TouchableOpacity
                          style={styles.iconButton}
                          onPress={cancelEdit}
                        >
                          <Ionicons name="close" size={20} color="#ff4444" />
                        </TouchableOpacity>
                      </View>
                    </>
                  ) : (
                    <>
                      <Text style={[styles.categoryText, { color: textColor }]}>
                        {category}
                      </Text>
                      <View style={styles.categoryActions}>
                        <TouchableOpacity
                          style={styles.iconButton}
                          onPress={() => startEdit(index)}
                        >
                          <Ionicons name="pencil" size={18} color="#50a040" />
                        </TouchableOpacity>
                        <TouchableOpacity
                          style={styles.iconButton}
                          onPress={() => deleteCategory(index)}
                        >
                          <Ionicons name="trash-outline" size={18} color="#ff4444" />
                        </TouchableOpacity>
                      </View>
                    </>
                  )}
                </View>
              ))
            )}
          </View>

          <TouchableOpacity
            style={[
              styles.saveButton,
              (isSaving || categories.length === 0) && styles.disabledButton,
            ]}
            onPress={saveCategories}
            disabled={isSaving || categories.length === 0}
          >
            {isSaving ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <>
                <Ionicons name="save-outline" size={20} color="#fff" />
                <Text style={styles.saveButtonText}>Save Categories</Text>
              </>
            )}
          </TouchableOpacity>
        </ScrollView>
      ) : (
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: textColor }]}>
              Add New Admin
            </Text>
            <View style={styles.inputRow}>
              <TextInput
                style={[
                  styles.input,
                  { backgroundColor: cardBgColor, color: textColor, borderColor },
                ]}
                placeholder="Enter user ID"
                placeholderTextColor={mutedTextColor}
                value={newAdminUserId}
                onChangeText={setNewAdminUserId}
                onSubmitEditing={addAdmin}
                autoCapitalize="none"
              />
              <TouchableOpacity
                style={[
                  styles.addButton,
                  (!newAdminUserId.trim() || isAddingAdmin) && styles.disabledButton,
                ]}
                onPress={addAdmin}
                disabled={!newAdminUserId.trim() || isAddingAdmin}
              >
                {isAddingAdmin ? (
                  <ActivityIndicator color="#fff" size="small" />
                ) : (
                  <Ionicons name="person-add" size={24} color="#fff" />
                )}
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: textColor }]}>
              Current Admins ({admins.length})
            </Text>
            {admins.length === 0 ? (
              <View style={[styles.emptyContainer, { backgroundColor: cardBgColor }]}>
                <Ionicons name="people-outline" size={48} color={mutedTextColor} />
                <Text style={[styles.emptyText, { color: mutedTextColor }]}>
                  No admins found
                </Text>
              </View>
            ) : (
              admins.map((admin) => (
                <View
                  key={admin.userId}
                  style={[styles.adminItem, { backgroundColor: cardBgColor }]}
                >
                  <View style={styles.adminInfo}>
                    <Ionicons
                      name={admin.role === "owner" ? "shield-checkmark" : "shield-outline"}
                      size={24}
                      color={admin.role === "owner" ? "#50a040" : mutedTextColor}
                    />
                    <View style={styles.adminDetails}>
                      <Text style={[styles.adminName, { color: textColor }]}>
                        {admin.username || admin.email || admin.userId}
                      </Text>
                      <Text style={[styles.adminRole, { color: mutedTextColor }]}>
                        {admin.role.charAt(0).toUpperCase() + admin.role.slice(1)}
                      </Text>
                    </View>
                  </View>
                  {admin.role !== "owner" && (
                    <TouchableOpacity
                      style={styles.removeButton}
                      onPress={() => removeAdmin(admin.userId, admin.role)}
                    >
                      <Ionicons name="remove-circle-outline" size={24} color="#ff4444" />
                    </TouchableOpacity>
                  )}
                </View>
              ))
            )}
          </View>
        </ScrollView>
      )}
    </View>
  );
};

export default ServerSettings;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: 50,
    paddingBottom: 16,
    paddingHorizontal: 16,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "700",
  },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 32,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
  },
  accessDeniedTitle: {
    fontSize: 24,
    fontWeight: "700",
    marginTop: 16,
    marginBottom: 8,
  },
  accessDeniedText: {
    fontSize: 16,
    textAlign: "center",
  },
  tabContainer: {
    flexDirection: "row",
    borderBottomWidth: 1,
    paddingHorizontal: 16,
  },
  tab: {
    flex: 1,
    paddingVertical: 16,
    alignItems: "center",
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: "#50a040",
  },
  tabText: {
    fontSize: 16,
    fontWeight: "600",
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
  },
  section: {
    marginTop: 24,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 12,
  },
  inputRow: {
    flexDirection: "row",
    gap: 8,
  },
  input: {
    flex: 1,
    borderRadius: 12,
    padding: 12,
    fontSize: 16,
    borderWidth: 1,
  },
  addButton: {
    backgroundColor: "#50a040",
    borderRadius: 12,
    width: 48,
    height: 48,
    justifyContent: "center",
    alignItems: "center",
  },
  disabledButton: {
    backgroundColor: "#666",
    opacity: 0.5,
  },
  emptyContainer: {
    padding: 32,
    borderRadius: 12,
    alignItems: "center",
  },
  emptyText: {
    fontSize: 14,
    marginTop: 8,
  },
  categoryItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
  },
  categoryText: {
    fontSize: 16,
    flex: 1,
  },
  categoryActions: {
    flexDirection: "row",
    gap: 8,
  },
  iconButton: {
    padding: 8,
  },
  editInput: {
    flex: 1,
    fontSize: 16,
    borderBottomWidth: 1,
    paddingVertical: 4,
  },
  editActions: {
    flexDirection: "row",
    gap: 8,
  },
  saveButton: {
    backgroundColor: "#50a040",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
    borderRadius: 12,
    marginVertical: 24,
    gap: 8,
  },
  saveButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  adminItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
  },
  adminInfo: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    gap: 12,
  },
  adminDetails: {
    flex: 1,
  },
  adminName: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 2,
  },
  adminRole: {
    fontSize: 14,
  },
  removeButton: {
    padding: 8,
  },
  sectionDesc: {
    fontSize: 14,
    marginBottom: 16,
  },
  imageSettingButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 16,
  },
  imageButtonContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
    flex: 1,
  },
  imageButtonText: {
    flex: 1,
  },
  imageButtonTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 4,
  },
  imageButtonDesc: {
    fontSize: 14,
  },
  infoBox: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    gap: 12,
  },
  infoText: {
    fontSize: 14,
    flex: 1,
  },
});
