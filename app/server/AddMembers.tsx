import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  FlatList,
  Image,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";

interface Member {
  id: string;
  name: string;
  username: string;
  avatar: any;
}

const mockMembers: Member[] = [
  { id: "1", name: "John Doe", username: "@johndoe", avatar: require("../../assets/imgs/smallImg1.png") },
  { id: "2", name: "Jane Smith", username: "@janesmith", avatar: require("../../assets/imgs/smallImg2.png") },
  { id: "3", name: "Mike Johnson", username: "@mikej", avatar: require("../../assets/imgs/smallImg3.png") },
  { id: "4", name: "Sarah Williams", username: "@sarahw", avatar: require("../../assets/imgs/smallImg4.png") },
  { id: "5", name: "David Brown", username: "@davidb", avatar: require("../../assets/imgs/smallAvatar1.png") },
  { id: "6", name: "Emma Davis", username: "@emmad", avatar: require("../../assets/imgs/smallAvatar2.png") },
];

const AddMembers = () => {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedMembers, setSelectedMembers] = useState<string[]>([]);

  const toggleMember = (memberId: string) => {
    setSelectedMembers((prev) =>
      prev.includes(memberId)
        ? prev.filter((id) => id !== memberId)
        : [...prev, memberId]
    );
  };

  const handleCreate = () => {
    alert(`Server created with ${selectedMembers.length} members invited!`);
    router.push("/Server");
  };

  const filteredMembers = mockMembers.filter(
    (member) =>
      member.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      member.username.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const renderMember = ({ item }: { item: Member }) => {
    const isSelected = selectedMembers.includes(item.id);

    return (
      <TouchableOpacity
        style={styles.memberItem}
        onPress={() => toggleMember(item.id)}
      >
        <Image source={item.avatar} style={styles.avatar} />
        <View style={styles.memberInfo}>
          <Text style={styles.memberName}>{item.name}</Text>
          <Text style={styles.memberUsername}>{item.username}</Text>
        </View>
        <View
          style={[
            styles.checkbox,
            isSelected && styles.checkboxSelected,
          ]}
        >
          {isSelected && <Ionicons name="checkmark" size={16} color="#fff" />}
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="chevron-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Add Members</Text>
        <TouchableOpacity onPress={handleCreate}>
          <Text style={styles.skipText}>Skip</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={20} color="#666" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search members..."
            placeholderTextColor="#666"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        <Text style={styles.selectedCount}>
          {selectedMembers.length} member{selectedMembers.length !== 1 ? "s" : ""} selected
        </Text>

        <FlatList
          data={filteredMembers}
          renderItem={renderMember}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContent}
        />
      </View>

      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.createButton}
          onPress={handleCreate}
        >
          <Text style={styles.createButtonText}>
            Create Server{selectedMembers.length > 0 ? ` & Invite ${selectedMembers.length}` : ""}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default AddMembers;

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
  skipText: {
    fontSize: 16,
    color: "#50a040",
    fontWeight: "600",
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#1a1a1a",
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#2a2a2a",
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: "#fff",
    marginLeft: 8,
  },
  selectedCount: {
    fontSize: 14,
    color: "#999",
    marginBottom: 16,
  },
  listContent: {
    paddingBottom: 16,
  },
  memberItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#1a1a1a",
    padding: 12,
    borderRadius: 12,
    marginBottom: 12,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
  },
  memberInfo: {
    flex: 1,
    marginLeft: 12,
  },
  memberName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#fff",
    marginBottom: 2,
  },
  memberUsername: {
    fontSize: 14,
    color: "#999",
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: "#666",
    alignItems: "center",
    justifyContent: "center",
  },
  checkboxSelected: {
    backgroundColor: "#50a040",
    borderColor: "#50a040",
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
  createButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#fff",
  },
});
