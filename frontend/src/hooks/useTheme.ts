import { useColorScheme } from "react-native";
import { lightTheme, darkTheme, Theme } from "@styles/theme";

export const useTheme = (): Theme => {
  const colorScheme = useColorScheme();
  return colorScheme === "dark" ? darkTheme : lightTheme;
};
