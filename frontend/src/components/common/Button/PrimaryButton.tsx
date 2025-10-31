import React from "react";
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacityProps,
  ViewStyle,
  TextStyle,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useTheme } from "@hooks/useTheme";

interface PrimaryButtonProps extends TouchableOpacityProps {
  title: string;
  onPress: () => void;
  loading?: boolean;
  disabled?: boolean;
  variant?: "primary" | "secondary" | "outline";
  size?: "small" | "medium" | "large";
  fullWidth?: boolean;
  icon?: React.ReactNode;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

export const PrimaryButton: React.FC<PrimaryButtonProps> = ({
  title,
  onPress,
  loading = false,
  disabled = false,
  variant = "primary",
  size = "medium",
  fullWidth = false,
  icon,
  style,
  textStyle,
  ...props
}) => {
  const theme = useTheme();

  const getHeight = () => {
    switch (size) {
      case "small":
        return 40;
      case "large":
        return 56;
      default:
        return 48;
    }
  };

  const getFontSize = () => {
    switch (size) {
      case "small":
        return theme.typography.fontSize.sm;
      case "large":
        return theme.typography.fontSize.lg;
      default:
        return theme.typography.fontSize.base;
    }
  };

  const isDisabled = disabled || loading;

  const renderContent = () => (
    <>
      {loading && (
        <ActivityIndicator
          color={variant === "outline" ? theme.colors.primary : "#FFFFFF"}
          style={styles.loader}
        />
      )}
      {!loading && icon && <>{icon}</>}
      <Text
        style={[
          styles.text,
          {
            fontSize: getFontSize(),
            fontWeight: theme.typography.fontWeight.semibold,
            color: variant === "outline" ? theme.colors.primary : "#FFFFFF",
            marginLeft: icon ? theme.spacing.sm : 0,
          },
          textStyle,
        ]}
      >
        {title}
      </Text>
    </>
  );

  if (variant === "primary") {
    return (
      <TouchableOpacity
        onPress={onPress}
        disabled={isDisabled}
        activeOpacity={0.8}
        style={[
          styles.container,
          {
            width: fullWidth ? "100%" : "auto",
            height: getHeight(),
            opacity: isDisabled ? 0.6 : 1,
          },
          style,
        ]}
        {...props}
      >
        <LinearGradient
          colors={[theme.colors.primary, theme.colors.primaryDark]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[styles.gradient, { borderRadius: theme.borderRadius.md }]}
        >
          {renderContent()}
        </LinearGradient>
      </TouchableOpacity>
    );
  }

  if (variant === "outline") {
    return (
      <TouchableOpacity
        onPress={onPress}
        disabled={isDisabled}
        activeOpacity={0.8}
        style={[
          styles.container,
          styles.outlineContainer,
          {
            width: fullWidth ? "100%" : "auto",
            height: getHeight(),
            borderColor: theme.colors.primary,
            borderRadius: theme.borderRadius.md,
            opacity: isDisabled ? 0.6 : 1,
          },
          style,
        ]}
        {...props}
      >
        {renderContent()}
      </TouchableOpacity>
    );
  }

  // Secondary variant
  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={isDisabled}
      activeOpacity={0.8}
      style={[
        styles.container,
        {
          width: fullWidth ? "100%" : "auto",
          height: getHeight(),
          backgroundColor: theme.colors.backgroundSecondary,
          borderRadius: theme.borderRadius.md,
          opacity: isDisabled ? 0.6 : 1,
        },
        style,
      ]}
      {...props}
    >
      <Text
        style={[
          styles.text,
          {
            fontSize: getFontSize(),
            fontWeight: theme.typography.fontWeight.semibold,
            color: theme.colors.text,
            marginLeft: icon ? theme.spacing.sm : 0,
          },
          textStyle,
        ]}
      >
        {title}
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    overflow: "hidden",
  },
  gradient: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
  },
  outlineContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
    borderWidth: 1.5,
  },
  text: {
    textAlign: "center",
  },
  loader: {
    marginRight: 8,
  },
});
