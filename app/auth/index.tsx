import { View, Text, StyleSheet, Pressable, Platform, TouchableOpacity, Alert } from "react-native";
import React from "react";
import { useRouter } from "expo-router";
import { useThemeMode } from "@twikkl/entities/theme.entity";
import { Octicons } from "@expo/vector-icons";
import { Svg, Path, Circle } from "react-native-svg";
import Logo from "@twikkl/components/Logo";

const GoogleIcon = () => (
  <Svg width="20" height="20" viewBox="0 0 24 24" style={{ marginRight: 12 }}>
    <Path
      fill="#4285F4"
      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
    />
    <Path
      fill="#34A853"
      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
    />
    <Path
      fill="#FBBC05"
      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
    />
    <Path
      fill="#EA4335"
      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
    />
  </Svg>
);

const TelegramIcon = () => (
  <Svg width="20" height="20" viewBox="0 0 24 24" fill="none" style={{ marginRight: 12 }}>
    <Circle cx="12" cy="12" r="10" fill="#2AABEE"/>
    <Path
      d="M8.5 11.5L17.5 7.5L14 16.5L11.5 14L8.5 11.5Z"
      fill="white"
      stroke="white"
      strokeWidth="0.5"
    />
    <Path
      d="M11.5 14L10.5 16.5L11.5 14Z"
      fill="#C8DAEA"
    />
    <Path
      d="M8.5 11.5L11.5 14L17.5 7.5L8.5 11.5Z"
      fill="#A9C9DD"
      fillOpacity="0.6"
    />
  </Svg>
);

const EmailIcon = () => (
  <Svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" style={{ marginRight: 12 }}>
    <Path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" strokeLinecap="round" strokeLinejoin="round"/>
    <Path d="M22 6l-10 7L2 6" strokeLinecap="round" strokeLinejoin="round"/>
  </Svg>
);

const Index = () => {
  const router = useRouter();
  const { isDarkMode } = useThemeMode();
  
  const backgroundColor = isDarkMode ? "#041104" : "#FFF";
  const textColor = isDarkMode ? "#FFF" : "#000";
  const buttonBg = "#1a1a1a";
  const buttonHoverBg = "#2a2a2a";
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
        <Octicons name="chevron-left" size={24} color={textColor} />
      </TouchableOpacity>
      
      <View style={styles.content}>
        {/* twikkl logo */}
        <View style={styles.logoContainer}>
          <Logo width={80} height={80} />
        </View>
        
        <Text style={[styles.title, { color: textColor }]}>
          Create a twikkl account
        </Text>
        
        {/* Google OAuth Button */}
        <Pressable 
          style={[styles.authButton, { backgroundColor: buttonBg }]}
          onPress={() => router.push('/auth/GoogleAuth')}
        >
          <GoogleIcon />
          <Text style={styles.buttonText}>Continue with Google</Text>
        </Pressable>
        
        {/* Telegram OAuth Button */}
        <Pressable 
          style={[styles.authButton, { backgroundColor: buttonBg }]}
          onPress={() => {
            if (Platform.OS === 'web') {
              alert('Telegram authentication is coming soon!');
            } else {
              Alert.alert('Coming Soon', 'Telegram authentication will be available soon.');
            }
          }}
        >
          <TelegramIcon />
          <Text style={styles.buttonText}>Continue with Telegram</Text>
        </Pressable>
        
        {/* Divider */}
        <View style={styles.dividerContainer}>
          <View style={[styles.dividerLine, { backgroundColor: dividerColor }]} />
          <Text style={[styles.dividerText, { color: isDarkMode ? "#888" : "#666" }]}>Or</Text>
          <View style={[styles.dividerLine, { backgroundColor: dividerColor }]} />
        </View>
        
        {/* Email & Password Option */}
        <Pressable 
          style={[styles.authButton, { backgroundColor: buttonBg }]}
          onPress={() => router.push("auth/Register")}
        >
          <EmailIcon />
          <Text style={styles.buttonText}>Email & password</Text>
        </Pressable>
        
        {/* Sign In Link */}
        <View style={styles.signInContainer}>
          <Text style={[styles.signInText, { color: isDarkMode ? "#888" : "#666" }]}>
            Already have an account? 
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
    paddingHorizontal: 16,
    justifyContent: "center",
  },
  backButton: {
    position: "absolute",
    top: 50,
    left: 16,
    zIndex: 10,
    padding: 8,
  },
  content: {
    maxWidth: 448,
    width: "100%",
    alignSelf: "center",
  },
  logoContainer: {
    alignItems: "center",
    marginBottom: 40,
  },
  title: {
    fontSize: 24,
    fontWeight: "400",
    textAlign: "center",
    marginBottom: 48,
  },
  authButton: {
    height: 48,
    borderRadius: 6,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    marginBottom: 12,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: "400",
    color: "#FFFFFF",
  },
  dividerContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 16,
  },
  dividerLine: {
    flex: 1,
    height: 1,
  },
  dividerText: {
    marginHorizontal: 16,
    fontSize: 14,
    fontWeight: "400",
  },
  signInContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 32,
  },
  signInText: {
    fontSize: 14,
  },
  signInLink: {
    fontSize: 14,
    color: "#50A040",
    fontWeight: "400",
  },
});
