export const colors = {
  light: {
    primary: "#6366F1", // Indigo
    primaryDark: "#4F46E5",
    primaryLight: "#818CF8",
    secondary: "#10B981", // Green
    secondaryDark: "#059669",
    secondaryLight: "#34D399",

    background: "#FFFFFF",
    backgroundSecondary: "#F9FAFB",
    surface: "#FFFFFF",

    text: "#111827",
    textSecondary: "#6B7280",
    textTertiary: "#9CA3AF",

    border: "#E5E7EB",
    borderLight: "#F3F4F6",

    error: "#EF4444",
    success: "#10B981",
    warning: "#F59E0B",
    info: "#3B82F6",

    shadow: "rgba(0, 0, 0, 0.1)",
    overlay: "rgba(0, 0, 0, 0.5)",
  },
  dark: {
    primary: "#818CF8",
    primaryDark: "#6366F1",
    primaryLight: "#A5B4FC",
    secondary: "#34D399",
    secondaryDark: "#10B981",
    secondaryLight: "#6EE7B7",

    background: "#111827",
    backgroundSecondary: "#1F2937",
    surface: "#1F2937",

    text: "#F9FAFB",
    textSecondary: "#D1D5DB",
    textTertiary: "#9CA3AF",

    border: "#374151",
    borderLight: "#2D3748",

    error: "#F87171",
    success: "#34D399",
    warning: "#FBBF24",
    info: "#60A5FA",

    shadow: "rgba(0, 0, 0, 0.3)",
    overlay: "rgba(0, 0, 0, 0.7)",
  },
};

export type ColorScheme = typeof colors.light;
