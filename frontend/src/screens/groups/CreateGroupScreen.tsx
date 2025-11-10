// CreateGroupScreen.tsx
import React, { useState, useRef, useEffect, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Switch,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Animated,
  Dimensions,
  ActivityIndicator,
  TextInput as RNTextInput,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTheme } from "../../hooks/useTheme";
import { spacing } from "../../styles/spacing";
import { typography } from "../../styles/typography";
import { GroupsStackScreenProps } from "../../types/navigation.types";
import { CategoryPicker } from "../../components/common/Picker/CategoryPicker";
import { TextInput } from "../../components/common/Input/TextInput";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const { width } = Dimensions.get("window");

const CATEGORIES = [
  { id: "1", name: "Nepal Rastra Bank", icon: "🏦" },
  { id: "2", name: "Nepal Telecom", icon: "📡" },
  { id: "3", name: "Nepal Electricity Authority", icon: "⚡" },
  { id: "4", name: "Federal Government", icon: "🏛️" },
  { id: "5", name: "General Discussion", icon: "💬" },
];

// ✅ Move FormSection OUTSIDE the main component
const FormSection = ({
  title,
  icon,
  children,
  step,
  colors,
}: {
  title: string;
  icon: string;
  children: React.ReactNode;
  step: number;
  colors: any;
}) => {
  const sectionAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(sectionAnim, {
      toValue: 1,
      duration: 300,
      delay: step * 100,
      useNativeDriver: true,
    }).start();
  }, [step]);

  return (
    <Animated.View
      style={[
        styles.section,
        {
          backgroundColor: colors.surface,
          opacity: sectionAnim,
          transform: [
            {
              scale: sectionAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [0.95, 1],
              }),
            },
          ],
        },
      ]}
    >
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionIcon}>{icon}</Text>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>
          {title}
        </Text>
      </View>
      {children}
    </Animated.View>
  );
};

const CreateGroupScreen = ({
  navigation,
}: GroupsStackScreenProps<"CreateGroup">) => {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const scrollViewRef = useRef<ScrollView>(null);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const fabScaleAnim = useRef(new Animated.Value(0)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;

  const [groupName, setGroupName] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [maxMembers, setMaxMembers] = useState("50");
  const [tags, setTags] = useState("");
  const [isPrivate, setIsPrivate] = useState(false);
  const [showCategoryPicker, setShowCategoryPicker] = useState(false);
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.spring(fabScaleAnim, {
        toValue: 1,
        delay: 600,
        useNativeDriver: true,
      }),
      Animated.timing(progressAnim, {
        toValue: 33,
        duration: 800,
        useNativeDriver: false,
      }),
    ]).start();
  }, []);

  const handleAIWriteDescription = useCallback(async () => {
    if (!groupName.trim()) {
      Alert.alert("Error", "Please enter a group name first");
      return;
    }

    setIsGeneratingAI(true);

    setTimeout(() => {
      const aiDescription = `Welcome to ${groupName}! This study group is dedicated to collaborative learning and peer support. We focus on sharing resources, discussing challenging topics, and preparing together for upcoming exams. 

Our community values:
• Active participation and knowledge sharing
• Respectful and constructive discussions
• Regular study sessions and mock tests
• Mutual support and encouragement

Join us to enhance your preparation journey!`;

      setDescription(aiDescription);
      setIsGeneratingAI(false);
      Alert.alert("Success", "AI has generated a description for your group!");
    }, 2000);
  }, [groupName]);

  const validateForm = useCallback(() => {
    const newErrors: Record<string, string> = {};

    if (!groupName.trim()) {
      newErrors.groupName = "Group name is required";
    }
    if (!description.trim()) {
      newErrors.description = "Description is required";
    }
    if (!category) {
      newErrors.category = "Please select a category";
    }
    if (
      maxMembers &&
      (parseInt(maxMembers) < 2 || parseInt(maxMembers) > 200)
    ) {
      newErrors.maxMembers = "Max members must be between 2 and 200";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [groupName, description, category, maxMembers]);

  const handleCreateGroup = useCallback(() => {
    if (!validateForm()) {
      Alert.alert(
        "Validation Error",
        "Please fill in all required fields correctly"
      );
      return;
    }

    Alert.alert(
      "Create Group",
      `Are you sure you want to create "${groupName}"?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Create",
          onPress: () => {
            Alert.alert("Success", "Group created successfully!", [
              { text: "OK", onPress: () => navigation.goBack() },
            ]);
          },
        },
      ]
    );
  }, [groupName, validateForm, navigation]);

  const handleGroupNameChange = useCallback((text: string) => {
    setGroupName(text);
    setErrors((prev) => ({ ...prev, groupName: "" }));
  }, []);

  const handleDescriptionChange = useCallback((text: string) => {
    setDescription(text);
    setErrors((prev) => ({ ...prev, description: "" }));
  }, []);

  const handleMaxMembersChange = useCallback((text: string) => {
    setMaxMembers(text);
    setErrors((prev) => ({ ...prev, maxMembers: "" }));
  }, []);

  const handleTagsChange = useCallback((text: string) => {
    setTags(text);
  }, []);

  const progressWidth = progressAnim.interpolate({
    inputRange: [0, 100],
    outputRange: ["0%", "100%"],
  });

  const BOTTOM_TAB_HEIGHT = 80;
  const FAB_BOTTOM_MARGIN = 10;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <SafeAreaView style={styles.safeArea} edges={["top"]}>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={{ flex: 1 }}
        >
          {/* Header */}
          <View style={[styles.header, { backgroundColor: colors.surface }]}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => navigation.goBack()}
            >
              <Ionicons name="arrow-back" size={24} color={colors.text} />
            </TouchableOpacity>
            <Text style={[styles.headerTitle, { color: colors.text }]}>
              Create Study Group
            </Text>
            <View style={styles.headerRight}>
              <View style={[styles.aiBadge, { backgroundColor: "#8B5CF6" }]}>
                <Ionicons name="sparkles" size={14} color="#FFFFFF" />
                <Text style={styles.aiBadgeText}>AI</Text>
              </View>
            </View>
          </View>

          {/* Progress Bar */}
          <View style={styles.progressContainer}>
            <View
              style={[styles.progressBar, { backgroundColor: colors.border }]}
            >
              <Animated.View
                style={[
                  styles.progressFill,
                  {
                    backgroundColor: colors.primary,
                    width: progressWidth,
                  },
                ]}
              />
            </View>
          </View>

          <ScrollView
            ref={scrollViewRef}
            style={styles.content}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={[
              styles.scrollContent,
              { paddingBottom: BOTTOM_TAB_HEIGHT + spacing.xl * 2 },
            ]}
          >
            <Animated.View
              style={{
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }],
              }}
            >
              {/* Basic Information */}
              <FormSection title="Basic Information" icon="📝" step={0} colors={colors}>
                <TextInput
                  label="Group Name *"
                  placeholder="e.g., NRB IT Officers 2024"
                  value={groupName}
                  onChangeText={handleGroupNameChange}
                  maxLength={50}
                  error={errors.groupName}
                  icon="people"
                  autoCapitalize="words"
                  autoCorrect={false}
                />
                <Text
                  style={[styles.charCount, { color: colors.textTertiary }]}
                >
                  {groupName.length}/50
                </Text>

                <View style={styles.inputContainer}>
                  <View style={styles.labelRow}>
                    <Text style={[styles.label, { color: colors.text }]}>
                      Description <Text style={styles.required}>*</Text>
                    </Text>
                    <TouchableOpacity
                      style={[
                        styles.aiButton,
                        { opacity: isGeneratingAI ? 0.5 : 1 },
                      ]}
                      onPress={handleAIWriteDescription}
                      disabled={isGeneratingAI}
                    >
                      {isGeneratingAI ? (
                        <ActivityIndicator size="small" color="#FFFFFF" />
                      ) : (
                        <>
                          <Ionicons name="sparkles" size={14} color="#FFFFFF" />
                          <Text style={styles.aiButtonText}>AI Generate</Text>
                        </>
                      )}
                    </TouchableOpacity>
                  </View>

                  <RNTextInput
                    style={[
                      styles.textArea,
                      {
                        backgroundColor: colors.surface,
                        color: colors.text,
                        borderColor: errors.description
                          ? colors.error
                          : colors.border,
                      },
                    ]}
                    placeholder="Describe your group's purpose and goals..."
                    placeholderTextColor={colors.textTertiary}
                    value={description}
                    onChangeText={handleDescriptionChange}
                    multiline
                    numberOfLines={6}
                    textAlignVertical="top"
                    maxLength={500}
                  />

                  <Text
                    style={[styles.charCount, { color: colors.textTertiary }]}
                  >
                    {description.length}/500 characters
                  </Text>
                  {errors.description && (
                    <Text style={styles.errorText}>{errors.description}</Text>
                  )}
                </View>
              </FormSection>

              {/* Category & Settings */}
              <FormSection title="Category & Settings" icon="⚙️" step={1} colors={colors}>
                <View style={styles.inputContainer}>
                  <Text style={[styles.label, { color: colors.text }]}>
                    Category <Text style={styles.required}>*</Text>
                  </Text>
                  <TouchableOpacity
                    style={[
                      styles.picker,
                      {
                        backgroundColor: colors.surface,
                        borderColor: errors.category
                          ? colors.error
                          : colors.border,
                      },
                    ]}
                    onPress={() => setShowCategoryPicker(true)}
                  >
                    <Text
                      style={[
                        styles.pickerText,
                        { color: category ? colors.text : colors.textTertiary },
                      ]}
                    >
                      {category || "Select a category..."}
                    </Text>
                    <Ionicons
                      name="chevron-down"
                      size={20}
                      color={colors.textSecondary}
                    />
                  </TouchableOpacity>
                  {errors.category && (
                    <Text style={styles.errorText}>{errors.category}</Text>
                  )}
                </View>

                <TextInput
                  label="Maximum Members"
                  value={maxMembers}
                  onChangeText={handleMaxMembersChange}
                  keyboardType="numeric"
                  maxLength={3}
                  error={errors.maxMembers}
                  icon="people-outline"
                />

                <TextInput
                  label="Tags (Optional)"
                  placeholder="e.g., programming, database, networking"
                  value={tags}
                  onChangeText={handleTagsChange}
                  icon="pricetags-outline"
                />
                <Text style={[styles.hint, { color: colors.textTertiary }]}>
                  Separate tags with commas to help others find your group
                </Text>
              </FormSection>

              {/* Privacy Settings */}
              <FormSection title="Privacy Settings" icon="🔒" step={2} colors={colors}>
                <TouchableOpacity
                  style={styles.switchContainer}
                  onPress={() => setIsPrivate(!isPrivate)}
                  activeOpacity={0.7}
                >
                  <View style={styles.switchContent}>
                    <View
                      style={[
                        styles.privacyIcon,
                        {
                          backgroundColor: isPrivate
                            ? colors.error + "20"
                            : colors.primary + "20",
                        },
                      ]}
                    >
                      <Ionicons
                        name={isPrivate ? "lock-closed" : "globe"}
                        size={20}
                        color={isPrivate ? colors.error : colors.primary}
                      />
                    </View>
                    <View style={styles.switchTextContainer}>
                      <Text
                        style={[styles.switchLabel, { color: colors.text }]}
                      >
                        {isPrivate ? "Private Group" : "Public Group"}
                      </Text>
                      <Text
                        style={[
                          styles.switchDescription,
                          { color: colors.textSecondary },
                        ]}
                      >
                        {isPrivate
                          ? "Only invited members can join"
                          : "Anyone can discover and join this group"}
                      </Text>
                    </View>
                  </View>
                  <Switch
                    value={isPrivate}
                    onValueChange={setIsPrivate}
                    trackColor={{
                      false: colors.borderLight,
                      true: colors.error + "40",
                    }}
                    thumbColor={isPrivate ? colors.error : colors.textTertiary}
                  />
                </TouchableOpacity>

                {isPrivate && (
                  <View
                    style={[
                      styles.infoBox,
                      { backgroundColor: colors.warning + "10" },
                    ]}
                  >
                    <Ionicons
                      name="information-circle"
                      size={20}
                      color={colors.warning}
                    />
                    <Text style={[styles.infoText, { color: colors.text }]}>
                      Private groups require admin approval for new members
                    </Text>
                  </View>
                )}
              </FormSection>
            </Animated.View>
          </ScrollView>

          {/* Floating Action Button */}
          <Animated.View
            style={[
              styles.fab,
              {
                bottom: FAB_BOTTOM_MARGIN,
                transform: [{ scale: fabScaleAnim }],
              },
            ]}
          >
            <TouchableOpacity
              style={[styles.fabButton, { backgroundColor: colors.primary }]}
              onPress={handleCreateGroup}
              activeOpacity={0.8}
            >
              <Ionicons name="checkmark" size={28} color="#FFFFFF" />
            </TouchableOpacity>
          </Animated.View>
        </KeyboardAvoidingView>
      </SafeAreaView>

      {/* Category Picker Modal */}
      <CategoryPicker
        visible={showCategoryPicker}
        categories={CATEGORIES.map((c) => c.name)}
        selectedCategory={category}
        onSelect={(cat) => {
          setCategory(cat);
          setErrors((prev) => ({ ...prev, category: "" }));
        }}
        onClose={() => setShowCategoryPicker(false)}
        title="Select Category"
        placeholder="Choose a category for your group"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  backButton: {
    padding: spacing.xs,
  },
  headerTitle: {
    flex: 1,
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semibold as any,
    marginLeft: spacing.sm,
  },
  headerRight: {
    flexDirection: "row",
    alignItems: "center",
  },
  aiBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs / 2,
    borderRadius: 12,
    gap: spacing.xs / 2,
  },
  aiBadgeText: {
    color: "#FFFFFF",
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.semibold as any,
  },
  progressContainer: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
  },
  progressBar: {
    height: 4,
    borderRadius: 2,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    borderRadius: 2,
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing.lg,
  },
  section: {
    borderRadius: 16,
    padding: spacing.lg,
    marginBottom: spacing.lg,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  sectionIcon: {
    fontSize: typography.fontSize.xl,
  },
  sectionTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semibold as any,
  },
  inputContainer: {
    marginBottom: spacing.lg,
  },
  label: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium as any,
    marginBottom: spacing.sm,
  },
  required: {
    color: "#EF4444",
  },
  labelRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.sm,
  },
  aiButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#8B5CF6",
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: 16,
    gap: spacing.xs,
  },
  aiButtonText: {
    color: "#FFFFFF",
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.medium as any,
  },
  textArea: {
    borderRadius: 12,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    fontSize: typography.fontSize.base,
    minHeight: 120,
    maxHeight: 200,
    borderWidth: 1.5,
  },
  charCount: {
    fontSize: typography.fontSize.xs,
    marginTop: spacing.xs,
    textAlign: "right",
  },
  errorText: {
    color: "#EF4444",
    fontSize: typography.fontSize.xs,
    marginTop: spacing.xs,
  },
  hint: {
    fontSize: typography.fontSize.xs,
    marginTop: spacing.xs,
  },
  picker: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderRadius: 12,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    borderWidth: 1.5,
    height: 50,
  },
  pickerText: {
    fontSize: typography.fontSize.base,
    flex: 1,
  },
  switchContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: spacing.sm,
  },
  switchContent: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
  },
  privacyIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  switchTextContainer: {
    flex: 1,
  },
  switchLabel: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.medium as any,
  },
  switchDescription: {
    fontSize: typography.fontSize.xs,
    marginTop: spacing.xs / 2,
  },
  infoBox: {
    flexDirection: "row",
    alignItems: "center",
    padding: spacing.md,
    borderRadius: 12,
    marginTop: spacing.md,
    gap: spacing.sm,
  },
  infoText: {
    flex: 1,
    fontSize: typography.fontSize.sm,
  },
  fab: {
    position: "absolute",
    right: spacing.lg,
  },
  fabButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: "center",
    alignItems: "center",
    elevation: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
});

export default CreateGroupScreen;