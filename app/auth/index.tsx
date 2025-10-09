import { View, Text, StyleSheet, Image } from "react-native";
import React from "react";
import ButtonEl from "@twikkl/components/ButtonEl";
import { ViewVariant } from "@twikkl/configs";
import { useRouter } from "expo-router";
import { useThemeMode } from "@twikkl/entities/theme.entity";
import Logo from "@twikkl/components/Logo";

const Index = () => {
  const router = useRouter();
  const { isDarkMode } = useThemeMode();
  
  const backgroundColor = isDarkMode ? "#000" : "#F1FCF2";
  const textColor = isDarkMode ? "#FFF" : "#000";
  
  return (
    <View style={[styles.wrapper, { backgroundColor }]}>
      <View style={styles.top}>
        <Logo width={120} height={120} />
        <Text style={[styles.bigText, { color: textColor }]}>
          A blockchain-based distributed system for video sharing and social networking.
        </Text>
        <Text style={[styles.text, { color: textColor }]}>Giving you power to recreate your thoughts in a decentralized system</Text>
      </View>
      <View style={styles.btnWrapper}>
        <ButtonEl onPress={() => router.push("auth/Register")}>
          <Text style={ViewVariant.buttonText}>Create Account</Text>
        </ButtonEl>
      </View>
      <ButtonEl bg={isDarkMode ? "#1A1A1A" : "#C0CCC1"} onPress={() => router.push("auth/Login")}>
        <Text style={ViewVariant.buttonText}>Sign In</Text>
      </ButtonEl>
    </View>
  );
};

export default Index;

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 150,
  },
  bigText: {
    fontSize: 24,
    textAlign: "center",
    marginBottom: 24,
  },
  text: {
    fontSize: 12,
    textAlign: "center",
  },
  top: {
    alignItems: "center",
  },
  btnWrapper: {
    marginBottom: 32,
    marginTop: 112,
  },
});
