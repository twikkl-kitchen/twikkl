import { View, StyleSheet } from "react-native";
import { useEffect } from "react";
import { useRouter } from "expo-router";
import Logo from "@twikkl/components/Logo";

export default function Splash() {
  const router = useRouter();

  useEffect(() => {
    const timer = setTimeout(() => {
      router.replace("/onboarding/VideoAnimation");
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <View style={styles.container}>
      <Logo width={200} height={200} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F1FCF2",
    justifyContent: "center",
    alignItems: "center",
  },
  logo: {
    width: 200,
    height: 200,
  },
});
