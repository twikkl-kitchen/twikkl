import { Text, Image, Pressable, StyleSheet } from "react-native";

interface OAuthButtonProps {
  text: string;
  icon?: "google" | "telegram";
  onPress?: () => void;
  backgroundColor?: string;
  textColor?: string;
}

const OAuthButton = ({ 
  text, 
  icon = "google", 
  onPress, 
  backgroundColor = "#E8E8E8",
  textColor = "#000"
}: OAuthButtonProps) => {
  const iconSource = icon === "google" 
    ? require("@assets/imgs/logos/google.png")
    : require("@assets/imgs/logos/google.png"); // Fallback to google for now
    
  return (
    <Pressable 
      style={[styles.wrapper, { backgroundColor }]} 
      onPress={onPress}
    >
      <Image source={iconSource} style={styles.icon} />
      <Text style={[styles.text, { color: textColor }]}>{text}</Text>
    </Pressable>
  );
};

export default OAuthButton;

const styles = StyleSheet.create({
  wrapper: {
    height: 56,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    borderRadius: 12,
    gap: 12,
  },
  icon: {
    width: 24,
    height: 24,
  },
  text: {
    fontWeight: "600",
    fontSize: 16,
  },
});
