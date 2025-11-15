import Back from "@assets/svg/Back";
import ButtonEl from "@twikkl/components/ButtonEl";
import { ViewVariant } from "@twikkl/configs";
import { ReactElement } from "react";
import { View, Text, StyleSheet, Pressable } from "react-native";
import Logo from "@twikkl/components/Logo";
import { useThemeMode } from "@twikkl/entities/theme.entity";

type IProps = {
  title: string;
  desc: string;
  children: ReactElement;
  btnText: string;
  onPress: Function;
  disabled?: boolean;
  handleBack: Function;
  loading?: boolean;
  verify?: string;
};

const AuthLayout = ({ title, desc, children, btnText, onPress, disabled, handleBack, loading, verify }: IProps) => {
  const { isDarkMode } = useThemeMode();
  const textColor = isDarkMode ? "#FFF" : "#000";
  
  return (
    <View>
      <Pressable style={styles.backButton} onPress={() => handleBack()}>
        <Back dark={isDarkMode ? "#FFF" : "#041105"} />
      </Pressable>
      <View style={styles.image}>
        <Logo width={80} height={80} />
      </View>
      <View style={{ marginBottom: 24 }}>
        <Text style={[styles.title, { color: textColor }]}>{title}</Text>
        <Text style={[styles.desc, { color: textColor }]}>{desc}</Text>
        {verify && <Text style={[styles.email, { color: textColor }]}>{verify}</Text>}
        <View style={styles.children}>{children}</View>
        <ButtonEl loading={loading} disabled={disabled} onPress={() => onPress()}>
          <Text style={[ViewVariant.buttonText, disabled && { color: "#000" }]}>{btnText}</Text>
        </ButtonEl>
      </View>
    </View>
  );
};

export default AuthLayout;

const styles = StyleSheet.create({
  children: {
    marginTop: 24,
    marginBottom: 50,
    zIndex: 10,
  },
  title: {
    fontWeight: "700",
    fontSize: 20,
    lineHeight: 33,
    textAlign: "center",
  },
  desc: {
    fontWeight: "500",
    textAlign: "center",
  },
  image: {
    alignSelf: "center",
    marginBottom: 16,
  },
  email: {
    textAlign: "center",
    fontWeight: "600",
    fontSize: 16,
    marginTop: 4,
  },
  backButton: { padding: 13 },
});
