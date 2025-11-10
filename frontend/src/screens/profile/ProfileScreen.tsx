// src/screens/profile/ProfileScreen.tsx
import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
} from "react-native";
import { ProfileStackScreenProps } from "../../types/navigation.types";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTheme } from "@hooks/useTheme";
import { Ionicons } from "@expo/vector-icons";
import { useAppSelector } from "@store/hooks";
import { LinearGradient } from "expo-linear-gradient";

type Props = ProfileStackScreenProps<"Profile">;

export const ProfileScreen: React.FC<Props> = ({ navigation }) => {
  const theme = useTheme();
  const user = useAppSelector((state) => state.auth.user);

  const stats = [
    {
      label: "Resources",
      value: "24",
      icon: "document-text" as const,
      color: "#6366F1",
    },
    {
      label: "Quizzes",
      value: "12",
      icon: "trophy" as const,
      color: "#10B981",
    },
    { label: "Groups", value: "5", icon: "people" as const, color: "#F59E0B" },
    {
      label: "Streak",
      value: "7 days",
      icon: "flame" as const,
      color: "#EF4444",
    },
  ];

  const menuItems = [
    {
      id: "edit",
      title: "Edit Profile",
      subtitle: "Update your personal information",
      icon: "person-circle" as const,
      color: "#6366F1",
      screen: "EditProfile" as const,
    },
    {
      id: "achievements",
      title: "Achievements",
      subtitle: "View your badges and milestones",
      icon: "medal" as const,
      color: "#F59E0B",
      screen: "Achievements" as const,
    },
    {
      id: "resources",
      title: "My Resources",
      subtitle: "Resources you've uploaded",
      icon: "folder-open" as const,
      color: "#10B981",
      screen: "MyResources" as const,
    },
    {
      id: "quizzes",
      title: "My Quizzes",
      subtitle: "Quizzes you've created",
      icon: "clipboard" as const,
      color: "#8B5CF6",
      screen: "MyQuizzes" as const,
    },
    {
      id: "groups",
      title: "My Groups",
      subtitle: "Groups you're part of",
      icon: "people-circle" as const,
      color: "#EC4899",
      screen: "MyGroups" as const,
    },
    {
      id: "settings",
      title: "Settings",
      subtitle: "Preferences and configurations",
      icon: "settings" as const,
      color: "#64748B",
      screen: "Settings" as const,
    },
    {
      id: "help",
      title: "Help & Support",
      subtitle: "Get help or contact support",
      icon: "help-circle" as const,
      color: "#06B6D4",
      screen: "HelpSupport" as const,
    },
    {
      id: "about",
      title: "About",
      subtitle: "App info and version details",
      icon: "information-circle" as const,
      color: "#84CC16",
      screen: "About" as const,
    },
  ];

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      edges={["top"]}
    >
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header with Gradient */}
        <LinearGradient
          colors={[theme.colors.primary, theme.colors.primaryDark]}
          style={styles.headerGradient}
        >
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Profile</Text>
            <TouchableOpacity
              style={styles.notificationButton}
              onPress={() => navigation.navigate("Settings")}
            >
              <Ionicons
                name="notifications-outline"
                size={24}
                color="#FFFFFF"
              />
            </TouchableOpacity>
          </View>

          {/* Profile Info */}
          <View style={styles.profileSection}>
            <View style={styles.avatarContainer}>
              {user?.avatar ? (
                <Image source={{ uri: user.avatar }} style={styles.avatar} />
              ) : (
                <View style={styles.avatarPlaceholder}>
                  <Ionicons name="person" size={40} color="#FFFFFF" />
                </View>
              )}
              <TouchableOpacity
                style={styles.editAvatarButton}
                onPress={() => navigation.navigate("EditProfile")}
              >
                <Ionicons name="camera" size={16} color="#FFFFFF" />
              </TouchableOpacity>
            </View>

            <Text style={styles.userName}>{user?.fullName || "Student"}</Text>
            <Text style={styles.userEmail}>
              {user?.email || "user@example.com"}
            </Text>

            <TouchableOpacity
              style={styles.editProfileButton}
              onPress={() => navigation.navigate("EditProfile")}
            >
              <Ionicons name="pencil" size={16} color={theme.colors.primary} />
              <Text
                style={[
                  styles.editProfileText,
                  { color: theme.colors.primary },
                ]}
              >
                Edit Profile
              </Text>
            </TouchableOpacity>
          </View>
        </LinearGradient>

        {/* Stats Cards */}
        <View style={styles.statsContainer}>
          {stats.map((stat, index) => (
            <View
              key={index}
              style={[
                styles.statCard,
                {
                  backgroundColor: theme.colors.surface,
                  borderColor: theme.colors.border,
                },
              ]}
            >
              <View
                style={[
                  styles.statIconContainer,
                  { backgroundColor: stat.color + "20" },
                ]}
              >
                <Ionicons name={stat.icon} size={20} color={stat.color} />
              </View>
              <Text style={[styles.statValue, { color: theme.colors.text }]}>
                {stat.value}
              </Text>
              <Text
                style={[
                  styles.statLabel,
                  { color: theme.colors.textSecondary },
                ]}
              >
                {stat.label}
              </Text>
            </View>
          ))}
        </View>

        {/* Menu Items */}
        <View style={styles.menuSection}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
            Account
          </Text>
          {menuItems.map((item, index) => (
            <TouchableOpacity
              key={item.id}
              style={[
                styles.menuItem,
                {
                  backgroundColor: theme.colors.surface,
                  borderColor: theme.colors.border,
                },
                index === 0 && styles.menuItemFirst,
                index === menuItems.length - 1 && styles.menuItemLast,
              ]}
              onPress={() => navigation.navigate(item.screen)}
              activeOpacity={0.7}
            >
              <View
                style={[
                  styles.menuIconContainer,
                  { backgroundColor: item.color + "15" },
                ]}
              >
                <Ionicons name={item.icon} size={22} color={item.color} />
              </View>
              <View style={styles.menuContent}>
                <Text style={[styles.menuTitle, { color: theme.colors.text }]}>
                  {item.title}
                </Text>
                <Text
                  style={[
                    styles.menuSubtitle,
                    { color: theme.colors.textSecondary },
                  ]}
                >
                  {item.subtitle}
                </Text>
              </View>
              <Ionicons
                name="chevron-forward"
                size={20}
                color={theme.colors.textTertiary}
              />
            </TouchableOpacity>
          ))}
        </View>

        {/* Logout Button */}
        <TouchableOpacity
          style={[
            styles.logoutButton,
            { backgroundColor: theme.colors.error + "15" },
          ]}
          onPress={() => {
            // Handle logout
          }}
        >
          <Ionicons
            name="log-out-outline"
            size={22}
            color={theme.colors.error}
          />
          <Text style={[styles.logoutText, { color: theme.colors.error }]}>
            Logout
          </Text>
        </TouchableOpacity>

        {/* App Version */}
        <Text
          style={[styles.versionText, { color: theme.colors.textTertiary }]}
        >
          Version 1.0.0
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  headerGradient: { paddingBottom: 30 },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 20,
  },
  headerTitle: { fontSize: 28, fontWeight: "bold", color: "#FFFFFF" },
  notificationButton: { padding: 4 },
  profileSection: { alignItems: "center", paddingHorizontal: 20 },
  avatarContainer: { position: "relative", marginBottom: 16 },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 4,
    borderColor: "#FFFFFF",
  },
  avatarPlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "rgba(255, 255, 255, 0.3)",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 4,
    borderColor: "#FFFFFF",
  },
  editAvatarButton: {
    position: "absolute",
    bottom: 0,
    right: 0,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#6366F1",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 3,
    borderColor: "#FFFFFF",
  },
  userName: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#FFFFFF",
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
    color: "rgba(255, 255, 255, 0.8)",
    marginBottom: 16,
  },
  editProfileButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
  },
  editProfileText: { fontSize: 14, fontWeight: "600" },
  statsContainer: {
    flexDirection: "row",
    paddingHorizontal: 16,
    marginTop: -20,
    gap: 12,
    marginBottom: 24,
  },
  statCard: {
    flex: 1,
    padding: 16,
    borderRadius: 16,
    alignItems: "center",
    borderWidth: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  statIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },
  statValue: { fontSize: 18, fontWeight: "bold", marginBottom: 2 },
  statLabel: { fontSize: 11, textAlign: "center" },
  menuSection: { paddingHorizontal: 20, marginBottom: 24 },
  sectionTitle: { fontSize: 20, fontWeight: "700", marginBottom: 12 },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderWidth: 1,
    marginBottom: -1,
  },
  menuItemFirst: { borderTopLeftRadius: 16, borderTopRightRadius: 16 },
  menuItemLast: { borderBottomLeftRadius: 16, borderBottomRightRadius: 16 },
  menuIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  menuContent: { flex: 1 },
  menuTitle: { fontSize: 16, fontWeight: "600", marginBottom: 2 },
  menuSubtitle: { fontSize: 13 },
  logoutButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    marginHorizontal: 20,
    paddingVertical: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  logoutText: { fontSize: 16, fontWeight: "700" },
  versionText: { textAlign: "center", fontSize: 12, marginBottom: 30 },
});


