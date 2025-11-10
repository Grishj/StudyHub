// src/screens/profile/SettingsScreen.tsx
import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
} from "react-native";
import { ProfileStackScreenProps } from "../../types/navigation.types";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTheme } from "@hooks/useTheme";
import { Ionicons } from "@expo/vector-icons";

type Props = ProfileStackScreenProps<"Settings">;

const SettingsScreen: React.FC<Props> = ({ navigation }) => {
  const theme = useTheme();

  // Notification Settings
  const [pushNotifications, setPushNotifications] = useState(true);
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [quizReminders, setQuizReminders] = useState(true);
  const [groupUpdates, setGroupUpdates] = useState(true);
  const [resourceUpdates, setResourceUpdates] = useState(false);

  // Privacy Settings
  const [profileVisibility, setProfileVisibility] = useState(true);
  const [showActivity, setShowActivity] = useState(true);
  const [allowMessages, setAllowMessages] = useState(true);

  // App Settings
  const [darkMode, setDarkMode] = useState(false);
  const [autoDownload, setAutoDownload] = useState(false);
  const [dataSync, setDataSync] = useState(true);

  const handleClearCache = () => {
    Alert.alert(
      "Clear Cache",
      "This will remove temporary files and may improve app performance. Continue?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Clear",
          onPress: () => {
            Alert.alert("Success", "Cache cleared successfully!");
          },
        },
      ]
    );
  };

  const handleResetSettings = () => {
    Alert.alert(
      "Reset Settings",
      "This will reset all settings to their default values. Continue?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Reset",
          style: "destructive",
          onPress: () => {
            // Reset all settings
            setPushNotifications(true);
            setEmailNotifications(true);
            setQuizReminders(true);
            setGroupUpdates(true);
            setResourceUpdates(false);
            setProfileVisibility(true);
            setShowActivity(true);
            setAllowMessages(true);
            setDarkMode(false);
            setAutoDownload(false);
            setDataSync(true);
            Alert.alert("Success", "Settings reset to defaults");
          },
        },
      ]
    );
  };

  const SettingItem = ({
    icon,
    iconColor,
    title,
    subtitle,
    value,
    onValueChange,
  }: {
    icon: keyof typeof Ionicons.glyphMap;
    iconColor: string;
    title: string;
    subtitle?: string;
    value: boolean;
    onValueChange: (value: boolean) => void;
  }) => (
    <View
      style={[
        styles.settingItem,
        {
          backgroundColor: theme.colors.surface,
          borderColor: theme.colors.border,
        },
      ]}
    >
      <View
        style={[
          styles.settingIconContainer,
          { backgroundColor: iconColor + "15" },
        ]}
      >
        <Ionicons name={icon} size={20} color={iconColor} />
      </View>
      <View style={styles.settingContent}>
        <Text style={[styles.settingTitle, { color: theme.colors.text }]}>
          {title}
        </Text>
        {subtitle && (
          <Text
            style={[
              styles.settingSubtitle,
              { color: theme.colors.textSecondary },
            ]}
          >
            {subtitle}
          </Text>
        )}
      </View>
      <Switch
        value={value}
        onValueChange={onValueChange}
        trackColor={{
          false: theme.colors.border,
          true: theme.colors.primary + "60",
        }}
        thumbColor={value ? theme.colors.primary : theme.colors.textTertiary}
      />
    </View>
  );

  const ActionItem = ({
    icon,
    iconColor,
    title,
    subtitle,
    onPress,
    showChevron = true,
  }: {
    icon: keyof typeof Ionicons.glyphMap;
    iconColor: string;
    title: string;
    subtitle?: string;
    onPress: () => void;
    showChevron?: boolean;
  }) => (
    <TouchableOpacity
      style={[
        styles.settingItem,
        {
          backgroundColor: theme.colors.surface,
          borderColor: theme.colors.border,
        },
      ]}
      onPress={onPress}
    >
      <View
        style={[
          styles.settingIconContainer,
          { backgroundColor: iconColor + "15" },
        ]}
      >
        <Ionicons name={icon} size={20} color={iconColor} />
      </View>
      <View style={styles.settingContent}>
        <Text style={[styles.settingTitle, { color: theme.colors.text }]}>
          {title}
        </Text>
        {subtitle && (
          <Text
            style={[
              styles.settingSubtitle,
              { color: theme.colors.textSecondary },
            ]}
          >
            {subtitle}
          </Text>
        )}
      </View>
      {showChevron && (
        <Ionicons
          name="chevron-forward"
          size={20}
          color={theme.colors.textTertiary}
        />
      )}
    </TouchableOpacity>
  );

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      edges={["top"]}
    >
      {/* Header */}
      <View
        style={[
          styles.header,
          {
            backgroundColor: theme.colors.surface,
            borderBottomColor: theme.colors.border,
          },
        ]}
      >
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Ionicons name="arrow-back" size={24} color={theme.colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.colors.text }]}>
          Settings
        </Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Notifications */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
            Notifications
          </Text>

          <SettingItem
            icon="notifications"
            iconColor="#6366F1"
            title="Push Notifications"
            subtitle="Receive notifications on your device"
            value={pushNotifications}
            onValueChange={setPushNotifications}
          />

          <SettingItem
            icon="mail"
            iconColor="#10B981"
            title="Email Notifications"
            subtitle="Get updates via email"
            value={emailNotifications}
            onValueChange={setEmailNotifications}
          />

          <SettingItem
            icon="time"
            iconColor="#F59E0B"
            title="Quiz Reminders"
            subtitle="Daily reminders to practice quizzes"
            value={quizReminders}
            onValueChange={setQuizReminders}
          />

          <SettingItem
            icon="people"
            iconColor="#8B5CF6"
            title="Group Updates"
            subtitle="Notifications from your study groups"
            value={groupUpdates}
            onValueChange={setGroupUpdates}
          />

          <SettingItem
            icon="document-text"
            iconColor="#EC4899"
            title="Resource Updates"
            subtitle="New resources in your categories"
            value={resourceUpdates}
            onValueChange={setResourceUpdates}
          />
        </View>

        {/* Privacy */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
            Privacy
          </Text>

          <SettingItem
            icon="eye"
            iconColor="#06B6D4"
            title="Profile Visibility"
            subtitle="Allow others to view your profile"
            value={profileVisibility}
            onValueChange={setProfileVisibility}
          />

          <SettingItem
            icon="pulse"
            iconColor="#84CC16"
            title="Show Activity"
            subtitle="Display your study activity"
            value={showActivity}
            onValueChange={setShowActivity}
          />

          <SettingItem
            icon="chatbubbles"
            iconColor="#F97316"
            title="Allow Messages"
            subtitle="Receive messages from other users"
            value={allowMessages}
            onValueChange={setAllowMessages}
          />
        </View>

        {/* App Preferences */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
            App Preferences
          </Text>

          <SettingItem
            icon="moon"
            iconColor="#6366F1"
            title="Dark Mode"
            subtitle="Use dark theme"
            value={darkMode}
            onValueChange={setDarkMode}
          />

          <SettingItem
            icon="download"
            iconColor="#10B981"
            title="Auto Download"
            subtitle="Automatically download resources"
            value={autoDownload}
            onValueChange={setAutoDownload}
          />

          <SettingItem
            icon="cloud-upload"
            iconColor="#3B82F6"
            title="Data Sync"
            subtitle="Sync data across devices"
            value={dataSync}
            onValueChange={setDataSync}
          />

          <ActionItem
            icon="language"
            iconColor="#F59E0B"
            title="Language"
            subtitle="English (India)"
            onPress={() =>
              Alert.alert("Language", "Language selection coming soon!")
            }
          />
        </View>

        {/* Storage & Cache */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
            Storage
          </Text>

          <ActionItem
            icon="trash"
            iconColor="#EF4444"
            title="Clear Cache"
            subtitle="Free up storage space"
            onPress={handleClearCache}
            showChevron={false}
          />

          <ActionItem
            icon="download-outline"
            iconColor="#8B5CF6"
            title="Downloaded Resources"
            subtitle="Manage offline content"
            onPress={() =>
              Alert.alert("Downloads", "Download manager coming soon!")
            }
          />
        </View>

        {/* Legal */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
            Legal
          </Text>

          <ActionItem
            icon="document-text"
            iconColor="#64748B"
            title="Terms of Service"
            onPress={() =>
              Alert.alert("Terms", "Terms of service coming soon!")
            }
          />

          <ActionItem
            icon="shield-checkmark"
            iconColor="#64748B"
            title="Privacy Policy"
            onPress={() =>
              Alert.alert("Privacy", "Privacy policy coming soon!")
            }
          />

          <ActionItem
            icon="document"
            iconColor="#64748B"
            title="Licenses"
            onPress={() =>
              Alert.alert("Licenses", "Open source licenses coming soon!")
            }
          />
        </View>

        {/* Danger Zone */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.colors.error }]}>
            Danger Zone
          </Text>

          <ActionItem
            icon="refresh"
            iconColor="#F59E0B"
            title="Reset Settings"
            subtitle="Restore all settings to defaults"
            onPress={handleResetSettings}
            showChevron={false}
          />

          <ActionItem
            icon="log-out"
            iconColor="#EF4444"
            title="Logout"
            subtitle="Sign out of your account"
            onPress={() =>
              Alert.alert("Logout", "Are you sure you want to logout?", [
                { text: "Cancel", style: "cancel" },
                { text: "Logout", style: "destructive", onPress: () => {} },
              ])
            }
            showChevron={false}
          />
        </View>

        {/* App Info */}
        <View style={styles.appInfo}>
          <Text
            style={[styles.appVersion, { color: theme.colors.textTertiary }]}
          >
            PSC Study App
          </Text>
          <Text
            style={[styles.appVersion, { color: theme.colors.textTertiary }]}
          >
            Version 1.0.0 (Build 1)
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  backButton: { padding: 4 },
  headerTitle: { fontSize: 18, fontWeight: "600" },
  placeholder: { width: 32 },
  section: { paddingHorizontal: 20, paddingTop: 24, paddingBottom: 8 },
  sectionTitle: { fontSize: 20, fontWeight: "700", marginBottom: 12 },
  settingItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 8,
  },
  settingIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  settingContent: { flex: 1 },
  settingTitle: { fontSize: 16, fontWeight: "600", marginBottom: 2 },
  settingSubtitle: { fontSize: 13 },
  appInfo: { alignItems: "center", paddingVertical: 30, gap: 4 },
  appVersion: { fontSize: 12 },
});

export default SettingsScreen;
