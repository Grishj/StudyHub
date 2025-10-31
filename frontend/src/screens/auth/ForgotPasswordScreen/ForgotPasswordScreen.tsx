import React, { useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Alert } from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { Ionicons } from "@expo/vector-icons";
import { AuthStackParamList } from "../../../types/navigation.types";
import { ForgotPasswordData } from "../../../types/auth.types";
import { SafeAreaWrapper } from "@components/layout/SafeArea/SafeAreaWrapper";
import { Container } from "@components/layout/Container";
import { TextInput } from "@components/common/Input/TextInput";
import { PrimaryButton } from "@components/common/Button/PrimaryButton";
import { Card } from "@components/common/Card/Card";
import { useTheme } from "@hooks/useTheme";
import { authService } from "@api/services/auth.service";
import { forgotPasswordSchema } from "@utils/validation/authSchema";

type Props = NativeStackScreenProps<AuthStackParamList, "ForgotPassword">;

export const ForgotPasswordScreen: React.FC<Props> = ({ navigation }) => {
  const theme = useTheme();
  const [loading, setLoading] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordData>({
    resolver: yupResolver(forgotPasswordSchema),
    defaultValues: {
      email: "",
    },
  });

  const onSubmit = async (data: ForgotPasswordData) => {
    setLoading(true);
    try {
      const response = await authService.forgotPassword(data);
      Alert.alert(
        "Success",
        response.message || "Password reset link sent to your email",
        [
          {
            text: "OK",
            onPress: () => navigation.navigate("Login"),
          },
        ]
      );
    } catch (error: any) {
      Alert.alert(
        "Error",
        error.response?.data?.message || "Failed to send reset link"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaWrapper>
      <Container scrollable keyboardAware>
        <View style={styles.container}>
          {/* Back Button */}
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backButton}
          >
            <Ionicons name="arrow-back" size={24} color={theme.colors.text} />
          </TouchableOpacity>

          {/* Header */}
          <View style={styles.header}>
            <View
              style={[
                styles.iconContainer,
                {
                  backgroundColor: theme.colors.primaryLight + "20",
                  marginBottom: theme.spacing.md,
                },
              ]}
            >
              <Ionicons
                name="lock-closed-outline"
                size={48}
                color={theme.colors.primary}
              />
            </View>
            <Text
              style={[
                styles.title,
                {
                  color: theme.colors.text,
                  fontSize: theme.typography.fontSize["3xl"],
                  fontWeight: theme.typography.fontWeight.bold,
                },
              ]}
            >
              Forgot Password?
            </Text>
            <Text
              style={[
                styles.subtitle,
                {
                  color: theme.colors.textSecondary,
                  fontSize: theme.typography.fontSize.base,
                  marginTop: theme.spacing.xs,
                },
              ]}
            >
              Don't worry! Enter your email and we'll send you a reset link
            </Text>
          </View>

          {/* Form */}
          <Card style={{ marginTop: theme.spacing.xl }}>
            <Controller
              control={control}
              name="email"
              render={({ field: { onChange, onBlur, value } }) => (
                <TextInput
                  label="Email"
                  placeholder="Enter your email"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  error={errors.email?.message}
                  icon="mail-outline"
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              )}
            />

            <PrimaryButton
              title="Send Reset Link"
              onPress={handleSubmit(onSubmit)}
              loading={loading}
              fullWidth
              style={{ marginTop: theme.spacing.md }}
            />
          </Card>

          {/* Back to Login */}
          <View style={styles.footer}>
            <Text
              style={[
                styles.footerText,
                {
                  color: theme.colors.textSecondary,
                  fontSize: theme.typography.fontSize.sm,
                },
              ]}
            >
              Remember your password?{" "}
            </Text>
            <TouchableOpacity onPress={() => navigation.navigate("Login")}>
              <Text
                style={[
                  styles.loginText,
                  {
                    color: theme.colors.primary,
                    fontSize: theme.typography.fontSize.sm,
                    fontWeight: theme.typography.fontWeight.semibold,
                  },
                ]}
              >
                Sign In
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Container>
    </SafeAreaWrapper>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  backButton: {
    marginTop: 20,
    marginBottom: 20,
  },
  header: {
    marginTop: 20,
    alignItems: "center",
  },
  iconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    textAlign: "center",
  },
  subtitle: {
    textAlign: "center",
    paddingHorizontal: 32,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 32,
  },
  footerText: {},
  loginText: {},
});
