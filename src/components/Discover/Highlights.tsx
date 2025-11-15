import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image } from "react-native";
import { useRouter } from "expo-router";
import { useThemeMode } from "@twikkl/entities/theme.entity";
import { cardDataYou, cardDataGroup } from "@twikkl/data/discover/cardData";

const Highlights = (): JSX.Element => {
  const router = useRouter();
  const { isDarkMode } = useThemeMode();
  
  // Combine all servers for trending
  const allServers = [...cardDataYou, ...cardDataGroup];
  
  const textColor = isDarkMode ? "#fff" : "#000";

  return (
    <View>
      <View style={styles.container}>
        <Text style={[styles.title, { color: textColor }]}>Trending</Text>
      </View>
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContainer}
      >
        {allServers.map((server, index) => (
          <TouchableOpacity
            key={server.id}
            style={styles.serverAvatar}
            onPress={() => router.push(`/Discover/${server.id}`)}
          >
            <View style={styles.avatarBorder}>
              <Image 
                source={server.smallImg} 
                style={styles.avatarImage}
              />
            </View>
            <Text style={[styles.serverName, { color: textColor }]} numberOfLines={1}>
              {server.title}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 15,
    marginTop: 12.5,
  },
  title: {
    fontSize: 16,
    fontWeight: "500",
    marginBottom: 10,
    marginLeft: 16,
  },
  scrollContainer: {
    paddingLeft: 16,
    paddingRight: 16,
    paddingBottom: 15,
  },
  serverAvatar: {
    alignItems: "center",
    marginRight: 12,
    width: 80,
  },
  avatarBorder: {
    width: 76,
    height: 76,
    borderRadius: 38,
    borderWidth: 3,
    borderColor: "#50A040",
    borderStyle: "dashed",
    padding: 3,
    justifyContent: "center",
    alignItems: "center",
  },
  avatarImage: {
    width: 64,
    height: 64,
    borderRadius: 32,
  },
  serverName: {
    fontSize: 12,
    fontWeight: "600",
    marginTop: 6,
    textAlign: "center",
  },
});

export default Highlights;
