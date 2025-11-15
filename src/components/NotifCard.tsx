import { View, Text, Image, StyleSheet } from "react-native";
import React from "react";
import { useThemeMode } from "@twikkl/entities/theme.entity";

type IProps = {
  avatar: any;
  text: string;
  desc: string;
  time: string;
  like?: boolean;
  img?: any;
  action?: string;
};

const NotifCard = ({ avatar, text, desc, time, like, img, action }: IProps) => {
  const { isDarkMode } = useThemeMode();
  const textColor = isDarkMode ? "#fff" : "#000";
  
  return (
    <View style={styles.wrapper}>
      <Image source={avatar} />
      <View style={styles.flex}>
        <Text style={[styles.textBold, { color: textColor }]}>{text}</Text>
        <Text style={{ fontSize: 12, color: textColor }}>
          {desc} <Text style={{ color: "#50A040" }}>{time}</Text>
        </Text>
      </View>
      <View style={{ marginLeft: 20 }}>
        {like ? (
          <Image source={img} />
        ) : (
          <View style={styles.bgGreen}>
            <Text style={styles.textWhite}>{action}</Text>
          </View>
        )}
      </View>
    </View>
  );
};

export default NotifCard;

const styles = StyleSheet.create({
  wrapper: {
    flexDirection: "row",
    marginBottom: 10,
    alignItems: "center",
  },
  bgGreen: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: "#50A040",
    borderRadius: 16,
  },
  textWhite: {
    fontWeight: "700",
    fontSize: 14,
    color: "#F1FCF2",
  },
  textBold: {
    fontWeight: "700",
    fontSize: 14,
    marginBottom: 2,
  },
  flex: {
    flex: 1,
    marginLeft: 8,
  },
});
