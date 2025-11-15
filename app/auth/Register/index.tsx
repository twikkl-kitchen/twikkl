import { View, StyleSheet } from "react-native";
import AuthLayout from "../AuthLayout";
import LabelInput from "@twikkl/components/LabelInput";
import { useSignup } from "@twikkl/hooks/auth.hooks";
import { useLocalSearchParams, useRouter } from "expo-router";
import { signupButtonText, signupDesc, signupHeader } from "../data";
import Signup, { SubSignup } from "./Signup";
import { ViewVariant } from "@twikkl/configs";
import { useState } from "react";
import { useThemeMode } from "@twikkl/entities/theme.entity";

const defaultSignUpData = {
  email: "",
  password: "",
  confirmPassword: "",
  username: "",
  token: "",
};

const Register = () => {
  const router = useRouter();
  const { signupDone = false } = useLocalSearchParams();
  const { isDarkMode } = useThemeMode();
  const [tc, setTc] = useState(false);
  
  const textColor = isDarkMode ? "#FFF" : "#000";
  const backgroundColor = isDarkMode ? "#000" : "#FFF";
  const {
    form,
    updateField,
    _signup,
    currentStage,
    setCurrentStage,
    loading,
    _createUsername,
  } = useSignup(defaultSignUpData, Boolean(signupDone));

  const handleClick = () =>
    currentStage === "signup" ? _signup() : _createUsername();

  const backClick = () =>
    currentStage === "signup" ? router.back() : setCurrentStage("signup");

  const disableButton =
    currentStage === "signup"
      ? !form.email || !form.password || !form.confirmPassword || !tc || loading.signup
      : !form.username || loading.username;

  const loadingButton =
    currentStage === "signup" ? loading.signup : loading.username;

  return (
    <View style={[ViewVariant.wrapper, { backgroundColor }]}>
      <AuthLayout
        handleBack={backClick}
        btnText={signupButtonText[currentStage]}
        desc={signupDesc[currentStage]}
        title={signupHeader[currentStage]}
        onPress={handleClick}
        loading={loadingButton}
        disabled={disableButton}
        verify=""
      >
        {currentStage === "signup" ? (
          <Signup tc={tc} setTc={setTc} form={form} updateField={updateField} />
        ) : (
          <LabelInput
            label="Username"
            placeholder="username"
            value={form.username}
            onChangeText={(val) => updateField("username", val)}
          />
        )}
      </AuthLayout>
      {currentStage === "signup" && <SubSignup />}
    </View>
  );
};

export default Register;

const styles = StyleSheet.create({});
