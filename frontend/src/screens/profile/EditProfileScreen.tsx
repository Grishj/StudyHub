// src/screens/profile/EditProfileScreen.tsx
import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
  ActivityIndicator,
} from "react-native";
import { ProfileStackScreenProps } from "../../types/navigation.types";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTheme } from "@hooks/useTheme";
import { Ionicons } from "@expo/vector-icons";
import { TextInput } from "../../components/common/Input/TextInput";

import * as ImagePicker from "expo-image-picker";

type Props = ProfileStackScreenProps<"EditProfile">;

const EditProfileScreen: React.FC<Props> = ({ navigation }) => {
  const theme = useTheme();
  const [loading, setLoading] = useState(false);

  // Form state
  const [avatar, setAvatar] = useState<string | null>(null);
  const [fullName, setFullName] = useState("John Doe");
  const [email, setEmail] = useState("john.doe@example.com");
  const [phone, setPhone] = useState("+91 9876543210");
  const [bio, setBio] = useState(
    "Aspiring PSC officer preparing for upcoming exams."
  );
  const [location, setLocation] = useState("Kerala, India");
  const [targetExam, setTargetExam] = useState("Kerala PSC - Group B");
  const [studyGoal, setStudyGoal] = useState("2 hours daily");

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (status !== "granted") {
      Alert.alert(
        "Permission Required",
        "Please grant photo library permissions to change your profile picture."
      );
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      setAvatar(result.assets[0].uri);
    }
  };

  const takePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();

    if (status !== "granted") {
      Alert.alert(
        "Permission Required",
        "Please grant camera permissions to take a photo."
      );
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      setAvatar(result.assets[0].uri);
    }
  };

  const showImageOptions = () => {
    Alert.alert("Change Profile Picture", "Choose an option", [
      { text: "Take Photo", onPress: takePhoto },
      { text: "Choose from Library", onPress: pickImage },
      { text: "Cancel", style: "cancel" },
    ]);
  };

  const handleSave = async () => {
    // Validation
    if (!fullName.trim()) {
      Alert.alert("Validation Error", "Full name is required");
      return;
    }

    if (!email.trim()) {
      Alert.alert("Validation Error", "Email is required");
      return;
    }

    setLoading(true);

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1500));

      Alert.alert("Success", "Profile updated successfully!", [
        { text: "OK", onPress: () => navigation.goBack() },
      ]);
    } catch (error) {
      Alert.alert("Error", "Failed to update profile. Please try again.");
    } finally {
      setLoading(false);
    }
  };

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
          Edit Profile
        </Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Avatar Section */}
        <View style={styles.avatarSection}>
          <View style={styles.avatarContainer}>
            {avatar ? (
              <Image source={{ uri: avatar }} style={styles.avatar} />
            ) : (
              <View
                style={[
                  styles.avatarPlaceholder,
                  { backgroundColor: theme.colors.primaryLight },
                ]}
              >
                <Ionicons
                  name="person"
                  size={48}
                  color={theme.colors.primary}
                />
              </View>
            )}
          </View>
          <TouchableOpacity
            style={[
              styles.changePhotoButton,
              { backgroundColor: theme.colors.primary },
            ]}
            onPress={showImageOptions}
          >
            <Ionicons name="camera" size={20} color="#FFFFFF" />
            <Text style={styles.changePhotoText}>Change Photo</Text>
          </TouchableOpacity>
        </View>

        {/* Basic Information */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
            Basic Information
          </Text>

          <TextInput
            label="Full Name"
            value={fullName}
            onChangeText={setFullName}
            placeholder="Enter your full name"
            icon="person-outline"
          />

          <TextInput
            label="Email"
            value={email}
            onChangeText={setEmail}
            placeholder="Enter your email"
            icon="mail-outline"
            keyboardType="email-address"
            autoCapitalize="none"
          />

          <TextInput
            label="Phone Number"
            value={phone}
            onChangeText={setPhone}
            placeholder="Enter your phone number"
            icon="call-outline"
            keyboardType="phone-pad"
          />

          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: theme.colors.text }]}>
              Bio
            </Text>
            <TextInput
              value={bio}
              onChangeText={setBio}
              placeholder="Tell us about yourself..."
              multiline
              numberOfLines={4}
              style={styles.textArea}
            />
          </View>
        </View>

        {/* Study Information */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
            Study Information
          </Text>

          <TextInput
            label="Location"
            value={location}
            onChangeText={setLocation}
            placeholder="Your location"
            icon="location-outline"
          />

          <TextInput
            label="Target Exam"
            value={targetExam}
            onChangeText={setTargetExam}
            placeholder="Which exam are you preparing for?"
            icon="school-outline"
          />

          <TextInput
            label="Daily Study Goal"
            value={studyGoal}
            onChangeText={setStudyGoal}
            placeholder="e.g., 2 hours daily"
            icon="time-outline"
          />
        </View>

        {/* Account Actions */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
            Account
          </Text>

          <TouchableOpacity
            style={[
              styles.actionButton,
              {
                backgroundColor: theme.colors.surface,
                borderColor: theme.colors.border,
              },
            ]}
            onPress={() =>
              Alert.alert(
                "Change Password",
                "Password change feature coming soon!"
              )
            }
          >
            <View
              style={[
                styles.actionIconContainer,
                { backgroundColor: theme.colors.warning + "15" },
              ]}
            >
              <Ionicons
                name="lock-closed"
                size={20}
                color={theme.colors.warning}
              />
            </View>
            <View style={styles.actionContent}>
              <Text style={[styles.actionTitle, { color: theme.colors.text }]}>
                Change Password
              </Text>
              <Text
                style={[
                  styles.actionSubtitle,
                  { color: theme.colors.textSecondary },
                ]}
              >
                Update your account password
              </Text>
            </View>
            <Ionicons
              name="chevron-forward"
              size={20}
              color={theme.colors.textTertiary}
            />
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.actionButton,
              {
                backgroundColor: theme.colors.surface,
                borderColor: theme.colors.border,
              },
            ]}
            onPress={() =>
              Alert.alert(
                "Delete Account",
                "Are you sure you want to delete your account? This action cannot be undone.",
                [
                  { text: "Cancel", style: "cancel" },
                  { text: "Delete", style: "destructive", onPress: () => {} },
                ]
              )
            }
          >
            <View
              style={[
                styles.actionIconContainer,
                { backgroundColor: theme.colors.error + "15" },
              ]}
            >
              <Ionicons name="trash" size={20} color={theme.colors.error} />
            </View>
            <View style={styles.actionContent}>
              <Text style={[styles.actionTitle, { color: theme.colors.error }]}>
                Delete Account
              </Text>
              <Text
                style={[
                  styles.actionSubtitle,
                  { color: theme.colors.textSecondary },
                ]}
              >
                Permanently remove your account
              </Text>
            </View>
            <Ionicons
              name="chevron-forward"
              size={20}
              color={theme.colors.textTertiary}
            />
          </TouchableOpacity>
        </View>

        {/* Save Button */}
        <TouchableOpacity
          style={[
            styles.saveButton,
            { backgroundColor: theme.colors.primary },
            loading && styles.disabledButton,
          ]}
          onPress={handleSave}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <>
              <Ionicons name="checkmark-circle" size={24} color="#FFFFFF" />
              <Text style={styles.saveButtonText}>Save Changes</Text>
            </>
          )}
        </TouchableOpacity>
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
  scrollContent: { padding: 20 },
  avatarSection: { alignItems: "center", marginBottom: 32 },
  avatarContainer: { marginBottom: 16 },
  avatar: { width: 120, height: 120, borderRadius: 60 },
  avatarPlaceholder: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: "center",
    alignItems: "center",
  },
  changePhotoButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
  },
  changePhotoText: { color: "#FFFFFF", fontSize: 14, fontWeight: "600" },
  section: { marginBottom: 32 },
  sectionTitle: { fontSize: 20, fontWeight: "700", marginBottom: 16 },
  inputGroup: { marginBottom: 16 },
  label: { fontSize: 14, fontWeight: "600", marginBottom: 8 },
  textArea: { minHeight: 100, textAlignVertical: "top" },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 12,
  },
  actionIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  actionContent: { flex: 1 },
  actionTitle: { fontSize: 16, fontWeight: "600", marginBottom: 2 },
  actionSubtitle: { fontSize: 13 },
  saveButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    borderRadius: 12,
    gap: 10,
    marginBottom: 40,
  },
  saveButtonText: { color: "#FFFFFF", fontSize: 18, fontWeight: "700" },
  disabledButton: { opacity: 0.6 },
});

export default EditProfileScreen;
