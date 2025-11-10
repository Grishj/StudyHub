// @components/profile/UserProfileInfo.tsx
import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Linking,
  Share,
} from "react-native";
import { useTheme } from "@hooks/useTheme";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { useAppSelector } from "@store/hooks";

interface UserProfileInfoProps {
  onEditPress?: () => void;
}

export const UserProfileInfo: React.FC<UserProfileInfoProps> = ({
  onEditPress,
}) => {
  const theme = useTheme();
  const user = useAppSelector((state) => state.auth.user);

  const handleShare = async () => {
    try {
      await Share.share({
        message: "Join me on PSC Study! The best app for Kerala PSC exam prep.",
        url: "", // Add deep link if available
      });
    } catch (error) {
      console.error("Error sharing:", error);
    }
  };

  const handleReportIssue = () => {
    Linking.openURL("mailto:support@pscstudy.com?subject=Report%20an%20Issue");
  };

  const openLanguageSettings = () => {
    // TODO: Implement language picker
    console.log("Open language settings");
  };

  return (
    <View>
      {/* Profile Header */}
      <View style={styles.profileHeader}>
        <View style={styles.avatarContainer}>
          {user?.avatar ? (
            <Image source={{ uri: user.avatar }} style={styles.avatar} />
          ) : (
            <View
              style={[
                styles.avatarPlaceholder,
                { backgroundColor: theme.colors.primaryLight },
              ]}
            >
              <Ionicons name="person" size={32} color={theme.colors.primary} />
            </View>
          )}
          {onEditPress && (
            <TouchableOpacity
              onPress={onEditPress}
              style={[
                styles.editButton,
                {
                  backgroundColor: theme.colors.background,
                  borderColor: theme.colors.border,
                },
              ]}
            >
              <Ionicons name="pencil" size={14} color={theme.colors.text} />
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.userInfo}>
          <Text
            style={[
              styles.userName,
              { color: theme.colors.text, fontWeight: "700" },
            ]}
            numberOfLines={1}
          >
            {user?.fullName || "Student"}
          </Text>
          <Text
            style={[styles.userEmail, { color: theme.colors.textSecondary }]}
            numberOfLines={1}
          >
            {user?.email || "user@example.com"}
          </Text>
        </View>
      </View>

      {/* Preference Sections */}
      <View style={styles.sections}>
        {/* Language */}
        <TouchableOpacity
          style={[
            styles.sectionItem,
            {
              backgroundColor: theme.colors.backgroundSecondary,
              borderBottomColor: theme.colors.border,
            },
          ]}
          onPress={openLanguageSettings}
        >
          <View style={styles.sectionIcon}>
            <MaterialIcons
              name="language"
              size={20}
              color={theme.colors.primary}
            />
          </View>
          <View style={styles.sectionTextContainer}>
            <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
              Language Preference
            </Text>
            <Text
              style={[
                styles.sectionSubtitle,
                { color: theme.colors.textSecondary },
              ]}
            >
              English (India)
            </Text>
          </View>
          <Ionicons
            name="chevron-forward"
            size={20}
            color={theme.colors.textSecondary}
          />
        </TouchableOpacity>

        {/* Share */}
        <TouchableOpacity
          style={[
            styles.sectionItem,
            {
              backgroundColor: theme.colors.backgroundSecondary,
              borderBottomColor: theme.colors.border,
            },
          ]}
          onPress={handleShare}
        >
          <View style={styles.sectionIcon}>
            <Ionicons
              name="share-social"
              size={20}
              color={theme.colors.primary}
            />
          </View>
          <View style={styles.sectionTextContainer}>
            <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
              Share with Friends
            </Text>
            <Text
              style={[
                styles.sectionSubtitle,
                { color: theme.colors.textSecondary },
              ]}
            >
              Invite others to join PSC Study
            </Text>
          </View>
          <Ionicons
            name="chevron-forward"
            size={20}
            color={theme.colors.textSecondary}
          />
        </TouchableOpacity>

        {/* Report */}
        <TouchableOpacity
          style={[
            styles.sectionItem,
            {
              backgroundColor: theme.colors.backgroundSecondary,
              borderBottomColor: theme.colors.border,
            },
          ]}
          onPress={handleReportIssue}
        >
          <View style={styles.sectionIcon}>
            <Ionicons name="bug" size={20} color={theme.colors.error} />
          </View>
          <View style={styles.sectionTextContainer}>
            <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
              Report an Issue
            </Text>
            <Text
              style={[
                styles.sectionSubtitle,
                { color: theme.colors.textSecondary },
              ]}
            >
              Help us improve the app
            </Text>
          </View>
          <Ionicons
            name="chevron-forward"
            size={20}
            color={theme.colors.textSecondary}
          />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  profileHeader: {
    flexDirection: "row",
    alignItems: "center",
    padding: 20,
    paddingBottom: 30,
  },
  avatarContainer: {
    position: "relative",
  },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
  },
  avatarPlaceholder: {
    width: 72,
    height: 72,
    borderRadius: 36,
    justifyContent: "center",
    alignItems: "center",
  },
  editButton: {
    position: "absolute",
    bottom: 0,
    right: 0,
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    justifyContent: "center",
    alignItems: "center",
  },
  userInfo: {
    marginLeft: 16,
    flex: 1,
  },
  userName: {
    fontSize: 20,
  },
  userEmail: {
    fontSize: 14,
    marginTop: 4,
  },
  sections: {
    borderTopWidth: 1,
  },
  sectionItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
  },
  sectionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(10, 132, 255, 0.1)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  sectionTextContainer: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
  },
  sectionSubtitle: {
    fontSize: 13,
    marginTop: 2,
  },
});
