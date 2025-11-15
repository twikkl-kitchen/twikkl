import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  View,
  FlatList,
  TextInput,
  Pressable,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Image,
} from "react-native";
import { Text } from "react-native-paper";
import { useThemeMode } from "@twikkl/entities/theme.entity";
import { useAuth } from "@twikkl/entities/auth.entity";
import { API_ENDPOINTS } from "@twikkl/config/api";
import axios from "axios";
import { MaterialCommunityIcons } from "@expo/vector-icons";

interface Comment {
  id: string;
  content: string;
  userId: string;
  videoId: string;
  createdAt: string;
  user?: {
    username: string;
    email: string;
  };
}

interface CommentSheetProps {
  videoId: string;
  onClose: () => void;
}

export default function CommentSheet({ videoId, onClose }: CommentSheetProps) {
  const { isDarkMode } = useThemeMode();
  const { isLoggedIn, token, user } = useAuth();
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [loading, setLoading] = useState(true);
  const [posting, setPosting] = useState(false);

  const backgroundColor = isDarkMode ? "#1C1C1E" : "#FFFFFF";
  const textColor = isDarkMode ? "#FFFFFF" : "#000000";
  const borderColor = isDarkMode ? "#38383A" : "#E5E5E5";
  const placeholderColor = isDarkMode ? "#8E8E93" : "#999999";

  useEffect(() => {
    fetchComments();
  }, [videoId]);

  const fetchComments = async () => {
    try {
      setLoading(true);
      const response = await axios.get(API_ENDPOINTS.COMMENTS.GET_VIDEO_COMMENTS(videoId));
      setComments(response.data.comments || []);
    } catch (error) {
      console.error("Error fetching comments:", error);
    } finally {
      setLoading(false);
    }
  };

  const handlePostComment = async () => {
    if (!isLoggedIn) {
      alert("Please log in to comment");
      return;
    }

    if (!newComment.trim()) return;

    try {
      setPosting(true);
      const response = await axios.post(
        API_ENDPOINTS.COMMENTS.CREATE,
        {
          videoId,
          content: newComment.trim(),
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const comment = response.data.comment;
      setComments([{ ...comment, user: { username: user?.name || user?.email || "You", email: user?.email || "" } }, ...comments]);
      setNewComment("");
    } catch (error) {
      console.error("Error posting comment:", error);
      alert("Failed to post comment");
    } finally {
      setPosting(false);
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    try {
      await axios.delete(API_ENDPOINTS.COMMENTS.DELETE(commentId), {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setComments(comments.filter((c) => c.id !== commentId));
    } catch (error) {
      console.error("Error deleting comment:", error);
      alert("Failed to delete comment");
    }
  };

  const renderComment = ({ item }: { item: Comment }) => {
    const isOwn = item.userId === user?.id;
    const timeAgo = getTimeAgo(item.createdAt);

    return (
      <View style={styles.commentItem}>
        <View style={styles.commentAvatar}>
          <MaterialCommunityIcons name="account-circle" size={32} color={placeholderColor} />
        </View>
        <View style={styles.commentContent}>
          <View style={styles.commentHeader}>
            <Text style={[styles.commentUsername, { color: textColor }]}>
              @{item.user?.username || "User"}
            </Text>
            <Text style={[styles.commentTime, { color: placeholderColor }]}>{timeAgo}</Text>
          </View>
          <Text style={[styles.commentText, { color: textColor }]}>{item.content}</Text>
          {isOwn && (
            <Pressable onPress={() => handleDeleteComment(item.id)} style={styles.deleteButton}>
              <Text style={styles.deleteButtonText}>Delete</Text>
            </Pressable>
          )}
        </View>
      </View>
    );
  };

  const getTimeAgo = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (seconds < 60) return "Just now";
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
    return `${Math.floor(seconds / 604800)}w ago`;
  };

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor }]}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <View style={[styles.header, { borderBottomColor: borderColor }]}>
        <Text style={[styles.headerTitle, { color: textColor }]}>
          Comments {comments.length > 0 && `(${comments.length})`}
        </Text>
        <Pressable onPress={onClose} style={styles.closeButton}>
          <MaterialCommunityIcons name="close" size={24} color={textColor} />
        </Pressable>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#50A040" />
        </View>
      ) : comments.length === 0 ? (
        <View style={styles.emptyContainer}>
          <MaterialCommunityIcons name="comment-outline" size={64} color={placeholderColor} />
          <Text style={[styles.emptyText, { color: placeholderColor }]}>
            No comments yet. Be the first to comment!
          </Text>
        </View>
      ) : (
        <FlatList
          data={comments}
          renderItem={renderComment}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.commentsList}
        />
      )}

      <View style={[styles.inputContainer, { borderTopColor: borderColor }]}>
        <View style={styles.inputAvatar}>
          <MaterialCommunityIcons name="account-circle" size={32} color={placeholderColor} />
        </View>
        <TextInput
          style={[styles.input, { color: textColor, backgroundColor: isDarkMode ? "#2C2C2E" : "#F2F2F7" }]}
          placeholder={isLoggedIn ? "Add a comment..." : "Log in to comment"}
          placeholderTextColor={placeholderColor}
          value={newComment}
          onChangeText={setNewComment}
          multiline
          editable={isLoggedIn}
        />
        <Pressable
          onPress={handlePostComment}
          disabled={!newComment.trim() || posting || !isLoggedIn}
          style={[
            styles.sendButton,
            {
              opacity: newComment.trim() && !posting && isLoggedIn ? 1 : 0.4,
            },
          ]}
        >
          {posting ? (
            <ActivityIndicator size="small" color="#50A040" />
          ) : (
            <MaterialCommunityIcons name="send" size={24} color="#50A040" />
          )}
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
  },
  closeButton: {
    padding: 4,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 32,
  },
  emptyText: {
    fontSize: 16,
    textAlign: "center",
    marginTop: 16,
  },
  commentsList: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  commentItem: {
    flexDirection: "row",
    marginBottom: 16,
  },
  commentAvatar: {
    marginRight: 12,
  },
  commentContent: {
    flex: 1,
  },
  commentHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },
  commentUsername: {
    fontSize: 14,
    fontWeight: "600",
    marginRight: 8,
  },
  commentTime: {
    fontSize: 12,
  },
  commentText: {
    fontSize: 14,
    lineHeight: 20,
  },
  deleteButton: {
    marginTop: 4,
  },
  deleteButtonText: {
    color: "#FF3B30",
    fontSize: 12,
    fontWeight: "500",
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "flex-end",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
  },
  inputAvatar: {
    marginRight: 12,
    marginBottom: 4,
  },
  input: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    maxHeight: 100,
    fontSize: 14,
  },
  sendButton: {
    marginLeft: 8,
    marginBottom: 4,
    padding: 4,
  },
});
