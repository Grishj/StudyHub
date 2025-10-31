import React from "react";
import { View, ActivityIndicator, StyleSheet } from "react-native";
import { useTheme } from "@hooks/useTheme";

interface SpinnerProps {
  size?: "small" | "large";
  color?: string;
  fullScreen?: boolean;
}

export const Spinner: React.FC<SpinnerProps> = ({
  size = "large",
  color,
  fullScreen = false,
}) => {
  const theme = useTheme();

  if (fullScreen) {
    return (
      <View
        style={[
          styles.fullScreen,
          { backgroundColor: theme.colors.background },
        ]}
      >
        <ActivityIndicator size={size} color={color || theme.colors.primary} />
      </View>
    );
  }

  return (
    <ActivityIndicator size={size} color={color || theme.colors.primary} />
  );
};

const styles = StyleSheet.create({
  fullScreen: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});
