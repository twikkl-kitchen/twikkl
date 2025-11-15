import { View, Text, StyleSheet, Pressable, Platform, TouchableOpacity } from "react-native";
import React from "react";
import { useRouter } from "expo-router";
import { useThemeMode } from "@twikkl/entities/theme.entity";
import OAuthButton from "@twikkl/components/OAuthButton";
import TelegramAuthButton from "../../src/components/TelegramAuthButton";
import { Octicons } from "@expo/vector-icons";

const Index = () => {
  const router = useRouter();
  const { isDarkMode } = useThemeMode();
  
  const backgroundColor = isDarkMode ? "#000" : "#FFF";
  const textColor = isDarkMode ? "#FFF" : "#000";
  const buttonBg = isDarkMode ? "#1E1E1E" : "#E8E8E8";
  const dividerColor = isDarkMode ? "#444" : "#CCC";
  
  const handleBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.push('/(tabs)/NewHome');
    }
  };
  
  return (
    <View style={[styles.wrapper, { backgroundColor }]}>
      <TouchableOpacity 
        onPress={handleBack} 
        style={styles.backButton}
      >
        <Octicons name="chevron-left" size={28} color={textColor} />
      </TouchableOpacity>
      
      <View style={styles.content}>
        <Text style={[styles.title, { color: textColor }]}>
          Create a Twikkl account
        </Text>
        
        {/* Google OAuth Button */}
        <OAuthButton 
          text="Continue with Google" 
          icon="google"
          onPress={() => router.push('/auth/GoogleAuth')}
          backgroundColor={buttonBg}
          textColor={textColor}
        />
        
        {/* Telegram OAuth Button - Web only */}
        {Platform.OS === 'web' && (
          <View style={styles.telegramWrapper}>
            <TelegramAuthButton botName={process.env.EXPO_PUBLIC_TELEGRAM_BOT_NAME || 'twikkl_bot'} />
          </View>
        )}
        
        {/* Divider */}
        <View style={styles.dividerContainer}>
          <View style={[styles.dividerLine, { backgroundColor: dividerColor }]} />
          <Text style={[styles.dividerText, { color: textColor }]}>Or</Text>
          <View style={[styles.dividerLine, { backgroundColor: dividerColor }]} />
        </View>
        
        {/* Email & Password Option */}
        <Pressable 
          style={[styles.emailButton, { backgroundColor: buttonBg }]}
          onPress={() => router.push("auth/Register")}
        >
          <Text style={[styles.emailButtonText, { color: textColor }]}>
            📧  Email & password
          </Text>
        </Pressable>
        
        {/* Sign In Link */}
        <View style={styles.signInContainer}>
          <Text style={[styles.signInText, { color: textColor }]}>
            Already have an account?{" "}
          </Text>
          <Pressable onPress={() => router.push("auth/Login")}>
            <Text style={styles.signInLink}>Sign in</Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
};

export default Index;

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: "center",
  },
  backButton: {
    position: "absolute",
    top: 50,
    left: 24,
    zIndex: 10,
    padding: 8,
  },
  content: {
    maxWidth: 400,
    width: "100%",
    alignSelf: "center",
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    textAlign: "center",
    marginBottom: 40,
  },
  telegramWrapper: {
    marginTop: 16,
  },
  dividerContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 24,
  },
  dividerLine: {
    flex: 1,
    height: 1,
  },
  dividerText: {
    marginHorizontal: 16,
    fontSize: 14,
    fontWeight: "500",
  },
  emailButton: {
    height: 56,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
  },
  emailButtonText: {
    fontSize: 16,
    fontWeight: "600",
  },
  signInContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 24,
  },
  signInText: {
    fontSize: 14,
  },
  signInLink: {
    fontSize: 14,
    color: "#50A040",
    fontWeight: "600",
    textDecorationLine: "underline",
  },
});
