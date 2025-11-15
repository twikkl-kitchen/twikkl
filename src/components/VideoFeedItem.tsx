import {
  StyleSheet,
  TouchableOpacity,
  View,
  ImagePropsBase,
  Image,
  Dimensions,
  TouchableWithoutFeedback,
} from "react-native";
import { useRouter } from "expo-router";
import { Text } from "react-native-paper";
import { Video, ResizeMode } from "expo-av";
import { TwikklIcon, EIcon } from "@twikkl/configs";
import { ButtonAddSimple } from "@twikkl/components";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useAuth } from "@twikkl/entities/auth.entity";
import { API_ENDPOINTS } from "@twikkl/config/api";
import axios from "axios";
import AppBottomSheet from "@twikkl/components/BottomSheet";
import CommentSheet from "@twikkl/components/CommentSheet";
import { useThemeMode } from "@twikkl/entities/theme.entity";

const DEFAULT_CAMERA_ACTION_COLOR = "#FFF";

const { width, height } = Dimensions.get("window");

const profileImg = require("@assets/imgs/logos/profile.png") as ImagePropsBase["source"];

type Props = {
  item: {
    id?: string;
    video: any;
    title?: string;
    creator?: string;
  };
  index: number;
  visibleIndex: number;
  onShareClick: any;
};

export default function VideoFeedItem({ item, index, visibleIndex, onShareClick }: Props) {
  const router = useRouter();
  const { t } = useTranslation();
  const { isLoggedIn, token } = useAuth();
  const { isDarkMode } = useThemeMode();
  
  const [shouldPlay, setShouldPlay] = useState(false);
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [commentCount, setCommentCount] = useState(0);
  const [viewRecorded, setViewRecorded] = useState(false);
  const [showComments, setShowComments] = useState(false);

  useEffect(() => {
    setShouldPlay(index === visibleIndex);
    
    if (index === visibleIndex && item.id && !viewRecorded) {
      recordView();
      setViewRecorded(true);
    }

    if (item.id) {
      fetchVideoStats();
    }
  }, [visibleIndex, item.id]);

  const recordView = async () => {
    if (!item.id) return;
    
    try {
      await axios.post(API_ENDPOINTS.VIEWS.RECORD(item.id), {
        watchDuration: 0,
        completed: false,
      });
    } catch (error) {
      console.error("Error recording view:", error);
    }
  };

  const fetchVideoStats = async () => {
    if (!item.id) return;

    try {
      const [likesRes, commentsRes, likedRes] = await Promise.all([
        axios.get(API_ENDPOINTS.LIKES.GET_COUNT(item.id)),
        axios.get(API_ENDPOINTS.COMMENTS.GET_VIDEO_COMMENTS(item.id)),
        isLoggedIn
          ? axios.get(API_ENDPOINTS.LIKES.IS_LIKED(item.id), {
              headers: { Authorization: `Bearer ${token}` },
            })
          : Promise.resolve({ data: { liked: false } }),
      ]);

      setLikeCount(likesRes.data.likeCount || 0);
      setCommentCount(commentsRes.data.comments?.length || 0);
      setLiked(likedRes.data.liked || false);
    } catch (error) {
      console.error("Error fetching video stats:", error);
    }
  };

  const handleLikeToggle = async () => {
    if (!isLoggedIn) {
      router.push("auth/Register");
      return;
    }

    if (!item.id) return;

    const previousLiked = liked;
    const previousCount = likeCount;

    setLiked(!liked);
    setLikeCount(liked ? likeCount - 1 : likeCount + 1);

    try {
      const response = await axios.post(
        API_ENDPOINTS.LIKES.TOGGLE(item.id),
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setLiked(response.data.liked);
      setLikeCount(response.data.likeCount || 0);
    } catch (error) {
      console.error("Error toggling like:", error);
      setLiked(previousLiked);
      setLikeCount(previousCount);
    }
  };

  const handleCommentClick = () => {
    if (!isLoggedIn) {
      router.push("auth/Register");
      return;
    }

    if (!item.id) {
      alert("This video doesn't support comments yet");
      return;
    }

    setShowComments(true);
  };

  const togglePlay = () => {
    setShouldPlay(!shouldPlay);
  };

  const formatCount = (count: number): string => {
    if (count >= 1000000) return `${(count / 1000000).toFixed(1)}M`;
    if (count >= 1000) return `${(count / 1000).toFixed(1)}K`;
    return count.toString();
  };

  return (
    <>
      <TouchableWithoutFeedback onPress={togglePlay}>
        <View style={{ height: height, width: width, position: 'relative' }}>
          <Video
            source={item.video}
            shouldPlay={shouldPlay}
            isLooping
            resizeMode={ResizeMode.COVER}
            style={{ width: '100%', height: '100%' }}
          />
          <View style={styles.bottomContainer}>
            <View style={styles.rightActionsContainer}>
              <View style={styles.actionsColumn}>
                <TouchableOpacity onPress={handleLikeToggle} style={styles.actionButton}>
                  <MaterialCommunityIcons
                    name={liked ? "heart" : "heart-outline"}
                    size={32}
                    color={liked ? "#FF3B30" : DEFAULT_CAMERA_ACTION_COLOR}
                  />
                  {likeCount > 0 && (
                    <Text style={styles.actionCount}>{formatCount(likeCount)}</Text>
                  )}
                </TouchableOpacity>

                <TouchableOpacity onPress={handleCommentClick} style={styles.actionButton}>
                  <MaterialCommunityIcons
                    name="comment-outline"
                    size={30}
                    color={DEFAULT_CAMERA_ACTION_COLOR}
                  />
                  {commentCount > 0 && (
                    <Text style={styles.actionCount}>{formatCount(commentCount)}</Text>
                  )}
                </TouchableOpacity>

                <TouchableOpacity onPress={onShareClick} style={styles.actionButton}>
                  <TwikklIcon name={EIcon.SHARE_NETWORK} size={28} color={DEFAULT_CAMERA_ACTION_COLOR} />
                </TouchableOpacity>

                <TouchableOpacity style={styles.actionButton}>
                  <TwikklIcon name={EIcon.PIN} size={28} color={DEFAULT_CAMERA_ACTION_COLOR} />
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.infoContainer}>
              <View style={styles.profileContainer}>
                <Image style={styles.profileImg} source={profileImg} />
                <Text variant="titleMedium" style={[styles.headActionText, { width: "75%" }]}>
                  @{item.creator || "glory.jgy"} {"\n"}
                  <Text variant="bodyLarge" style={{ color: DEFAULT_CAMERA_ACTION_COLOR }}>
                    {item.title || "My very first podcast, it was really fun and I learnt so much just in one day."}
                  </Text>
                </Text>
              </View>
              <TouchableOpacity onPress={() => router.push("video/CreateUploadVideo")}>
                <ButtonAddSimple />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </TouchableWithoutFeedback>

      {showComments && item.id && (
        <AppBottomSheet
          backgroundColor={isDarkMode ? "#1C1C1E" : "#FFFFFF"}
          height="85%"
          closeModal={() => setShowComments(false)}
        >
          <CommentSheet
            videoId={item.id}
            onClose={() => setShowComments(false)}
          />
        </AppBottomSheet>
      )}
    </>
  );
}

const styles = StyleSheet.create({
  headActionText: {
    color: DEFAULT_CAMERA_ACTION_COLOR,
    fontWeight: "600",
  },
  rightActionsContainer: {
    justifyContent: "space-between",
    alignSelf: "flex-end",
    alignItems: "flex-end",
    marginVertical: 10,
    paddingRight: 5,
  },
  actionsColumn: {
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
  },
  actionButton: {
    paddingVertical: 8,
    alignItems: "center",
    minWidth: 50,
  },
  actionCount: {
    color: DEFAULT_CAMERA_ACTION_COLOR,
    fontSize: 12,
    fontWeight: "600",
    marginTop: 2,
  },
  profileImg: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 10,
    borderWidth: 1,
    borderColor: "#FFF",
  },
  bottomContainer: {
    flex: 1,
    marginHorizontal: 10,
    marginBottom: "20%",
    justifyContent: "flex-end",
  },
  infoContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 14,
  },
  profileContainer: {
    flexDirection: "row",
  },
});
