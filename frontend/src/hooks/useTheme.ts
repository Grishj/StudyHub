import { useColorScheme } from "react-native";
import { useAppSelector } from "@store/hooks";
import { lightTheme, darkTheme, Theme } from "@styles/theme";

export const useTheme = (): Theme => {
  const systemColorScheme = useColorScheme(); // 'light' | 'dark' | null
  const userPreference = useAppSelector((state) => state.theme.mode);

  if (userPreference === "light") return lightTheme;
  if (userPreference === "dark") return darkTheme;

  // 'system' mode
  return systemColorScheme === "dark" ? darkTheme : lightTheme;
};
