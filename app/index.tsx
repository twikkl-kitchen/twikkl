import React, { useEffect, useState } from "react";
import { View } from "react-native";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";

const ONBOARDING_KEY = "@twikkl_onboarding_complete";

export default function Index() {
  const router = useRouter();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    checkOnboarding();
  }, []);

  const checkOnboarding = async () => {
    try {
      const hasSeenOnboarding = await AsyncStorage.getItem(ONBOARDING_KEY);
      
      if (hasSeenOnboarding === "true") {
        router.replace("/NewHome");
      } else {
        router.replace("/onboarding/Splash");
      }
    } catch (error) {
      console.error("Error checking onboarding status:", error);
      router.replace("/onboarding/Splash");
    } finally {
      setIsChecking(false);
    }
  };

  if (isChecking) {
    return <View style={{ flex: 1, backgroundColor: "#F1FCF2" }} />;
  }

  return null;
}
