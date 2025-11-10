// src/screens/resources/UploadResourceScreen.tsx
import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput as RNTextInput,
  Alert,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "@hooks/useTheme";
import { ResourcesStackScreenProps } from "@/types/navigation.types";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as DocumentPicker from "expo-document-picker";

const STORAGE_KEY = "@resources_data";

export default function UploadResourceScreen({
  navigation,
}: ResourcesStackScreenProps<"UploadResource">) {
  const theme = useTheme();
  const [loading, setLoading] = useState(false);

  // Form state
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [resourceType, setResourceType] = useState("");
  const [subject, setSubject] = useState("");
  const [year, setYear] = useState("");
  const [tags, setTags] = useState("");
  const [file, setFile] = useState<any>(null);

  // Dropdown visibility
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
  const [showTypeDropdown, setShowTypeDropdown] = useState(false);

  const categories = ["NTC", "NEA", "NRB"];
  const resourceTypes = [
    "Syllabus",
    "Notes",
    "Past Questions",
    "External Links",
  ];

  const pickDocument = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: "*/*",
        copyToCacheDirectory: true,
      });

      if (
        result.canceled === false &&
        result.assets &&
        result.assets.length > 0
      ) {
        setFile(result.assets[0]);
      }
    } catch (error) {
      Alert.alert("Error", "Failed to pick document");
    }
  };

  const generateNotes = () => {
    const suggestions = [
      "Key points and definitions",
      "Important formulas and concepts",
      "Practice problems and solutions",
      "Summary of main topics",
      "Exam preparation tips",
    ];
    setDescription(suggestions.join("\n• "));
  };

  const suggestTags = () => {
    const categoryTags = {
      NTC: ["telecommunications", "networking", "mobile"],
      NEA: ["electricity", "power", "energy"],
      NRB: ["banking", "finance", "monetary"],
    };

    const typeTags = {
      Syllabus: ["curriculum", "course-outline"],
      Notes: ["study-material", "summary"],
      "Past Questions": ["exam", "practice", "questions"],
      "External Links": ["resources", "reference"],
    };

    const suggested = [
      ...(category
        ? categoryTags[category as keyof typeof categoryTags] || []
        : []),
      ...(resourceType
        ? typeTags[resourceType as keyof typeof typeTags] || []
        : []),
      subject.toLowerCase().replace(/\s+/g, "-"),
      year,
    ].filter(Boolean);

    setTags(suggested.join(", "));
  };

  const summarizeDocument = () => {
    Alert.alert(
      "AI Summarize",
      "This feature would use AI to generate a summary of your uploaded document. Coming soon!",
      [{ text: "OK" }]
    );
  };

  const validateForm = () => {
    if (!title.trim()) return "Title is required";
    if (!description.trim()) return "Description is required";
    if (!category) return "Please select a category";
    if (!resourceType) return "Please select a resource type";
    if (!subject.trim()) return "Subject is required";
    if (!year.trim()) return "Year is required";
    return null;
  };

  const handleSubmit = async () => {
    const error = validateForm();
    if (error) {
      Alert.alert("Validation Error", error);
      return;
    }

    setLoading(true);

    try {
      // Create new resource
      const newResource = {
        id: Date.now().toString(),
        title: title.trim(),
        description: description.trim(),
        category: category,
        resourceType: resourceType,
        subject: subject.trim(),
        year: year.trim(),
        tags: tags
          .split(",")
          .map((t) => t.trim())
          .filter(Boolean),
        views: 0,
        upvotes: 0,
        downvotes: 0,
        downloads: 0,
        fileUrl: file?.uri || "",
        uploadedBy: "Current User",
        uploadedAt: new Date().toISOString(),
        userVote: null,
      };

      // Load existing resources
      const stored = await AsyncStorage.getItem(STORAGE_KEY);
      const existing = stored ? JSON.parse(stored) : [];

      // Add new resource to the beginning
      const updated = [newResource, ...existing];

      // Save to storage
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));

      Alert.alert("Success", "Resource uploaded successfully!", [
        {
          text: "OK",
          onPress: () => navigation.goBack(),
        },
      ]);
    } catch (error) {
      Alert.alert("Error", "Failed to upload resource. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      {/* Header */}
      <View style={[styles.header, { backgroundColor: theme.colors.surface }]}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Ionicons name="arrow-back" size={24} color={theme.colors.text} />
          <Text style={[styles.backText, { color: theme.colors.text }]}>
            Back to Resources
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.titleSection}>
          <Text style={[styles.screenTitle, { color: theme.colors.text }]}>
            Upload New Resource
          </Text>
          <View style={styles.aiPoweredBadge}>
            <Ionicons name="sparkles" size={16} color={theme.colors.primary} />
            <Text
              style={[styles.aiPoweredText, { color: theme.colors.primary }]}
            >
              AI-Powered
            </Text>
          </View>
          <Text
            style={[styles.subtitle, { color: theme.colors.textSecondary }]}
          >
            Share your knowledge with the community.
          </Text>
        </View>

        <View style={styles.formSection}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
            Resource Details
          </Text>

          {/* Title */}
          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: theme.colors.text }]}>
              Title <Text style={{ color: theme.colors.error }}>*</Text>
            </Text>
            <RNTextInput
              style={[
                styles.input,
                {
                  backgroundColor: theme.colors.surface,
                  color: theme.colors.text,
                  borderColor: theme.colors.border,
                },
              ]}
              placeholder="Enter resource title"
              placeholderTextColor={theme.colors.textTertiary}
              value={title}
              onChangeText={setTitle}
            />
          </View>

          {/* Description */}
          <View style={styles.inputGroup}>
            <View style={styles.labelRow}>
              <Text style={[styles.label, { color: theme.colors.text }]}>
                Description <Text style={{ color: theme.colors.error }}>*</Text>
              </Text>
              <TouchableOpacity style={styles.aiButton} onPress={generateNotes}>
                <Ionicons
                  name="sparkles"
                  size={16}
                  color={theme.colors.primary}
                />
                <Text
                  style={[styles.aiButtonText, { color: theme.colors.primary }]}
                >
                  AI Generate Notes
                </Text>
              </TouchableOpacity>
            </View>
            <RNTextInput
              style={[
                styles.textArea,
                {
                  backgroundColor: theme.colors.surface,
                  color: theme.colors.text,
                  borderColor: theme.colors.border,
                },
              ]}
              placeholder="Describe the resource..."
              placeholderTextColor={theme.colors.textTertiary}
              value={description}
              onChangeText={setDescription}
              multiline
              numberOfLines={6}
            />
          </View>

          {/* Category and Type Row */}
          <View style={styles.row}>
            <View style={[styles.inputGroup, styles.halfWidth]}>
              <Text style={[styles.label, { color: theme.colors.text }]}>
                Category <Text style={{ color: theme.colors.error }}>*</Text>
              </Text>
              <TouchableOpacity
                style={[
                  styles.dropdown,
                  {
                    backgroundColor: theme.colors.surface,
                    borderColor: theme.colors.border,
                  },
                ]}
                onPress={() => setShowCategoryDropdown(!showCategoryDropdown)}
              >
                <Text
                  style={[
                    styles.dropdownText,
                    {
                      color: category
                        ? theme.colors.text
                        : theme.colors.textTertiary,
                    },
                  ]}
                >
                  {category || "Select a category..."}
                </Text>
                <Ionicons
                  name="chevron-down"
                  size={20}
                  color={theme.colors.textSecondary}
                />
              </TouchableOpacity>
              {showCategoryDropdown && (
                <View
                  style={[
                    styles.dropdownMenu,
                    {
                      backgroundColor: theme.colors.surface,
                      borderColor: theme.colors.border,
                    },
                  ]}
                >
                  {categories.map((cat) => (
                    <TouchableOpacity
                      key={cat}
                      style={styles.dropdownItem}
                      onPress={() => {
                        setCategory(cat);
                        setShowCategoryDropdown(false);
                      }}
                    >
                      <Text
                        style={[
                          styles.dropdownItemText,
                          { color: theme.colors.text },
                        ]}
                      >
                        {cat}
                      </Text>
                      {category === cat && (
                        <Ionicons
                          name="checkmark"
                          size={20}
                          color={theme.colors.primary}
                        />
                      )}
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </View>

            <View style={[styles.inputGroup, styles.halfWidth]}>
              <Text style={[styles.label, { color: theme.colors.text }]}>
                Resource Type{" "}
                <Text style={{ color: theme.colors.error }}>*</Text>
              </Text>
              <TouchableOpacity
                style={[
                  styles.dropdown,
                  {
                    backgroundColor: theme.colors.surface,
                    borderColor: theme.colors.border,
                  },
                ]}
                onPress={() => setShowTypeDropdown(!showTypeDropdown)}
              >
                <Text
                  style={[
                    styles.dropdownText,
                    {
                      color: resourceType
                        ? theme.colors.text
                        : theme.colors.textTertiary,
                    },
                  ]}
                >
                  {resourceType || "Select a type..."}
                </Text>
                <Ionicons
                  name="chevron-down"
                  size={20}
                  color={theme.colors.textSecondary}
                />
              </TouchableOpacity>
              {showTypeDropdown && (
                <View
                  style={[
                    styles.dropdownMenu,
                    {
                      backgroundColor: theme.colors.surface,
                      borderColor: theme.colors.border,
                    },
                  ]}
                >
                  {resourceTypes.map((type) => (
                    <TouchableOpacity
                      key={type}
                      style={styles.dropdownItem}
                      onPress={() => {
                        setResourceType(type);
                        setShowTypeDropdown(false);
                      }}
                    >
                      <Text
                        style={[
                          styles.dropdownItemText,
                          { color: theme.colors.text },
                        ]}
                      >
                        {type}
                      </Text>
                      {resourceType === type && (
                        <Ionicons
                          name="checkmark"
                          size={20}
                          color={theme.colors.primary}
                        />
                      )}
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </View>
          </View>

          {/* File Upload */}
          <View style={styles.inputGroup}>
            <View style={styles.labelRow}>
              <Text style={[styles.label, { color: theme.colors.text }]}>
                File
              </Text>
              <TouchableOpacity
                style={styles.aiButton}
                onPress={summarizeDocument}
              >
                <Ionicons
                  name="document-text"
                  size={16}
                  color={theme.colors.primary}
                />
                <Text
                  style={[styles.aiButtonText, { color: theme.colors.primary }]}
                >
                  AI Summarize Document
                </Text>
              </TouchableOpacity>
            </View>
            <TouchableOpacity
              style={[
                styles.fileButton,
                {
                  backgroundColor: theme.colors.surface,
                  borderColor: theme.colors.border,
                },
              ]}
              onPress={pickDocument}
            >
              <Ionicons
                name="cloud-upload"
                size={24}
                color={theme.colors.primary}
              />
              <Text
                style={[styles.fileButtonText, { color: theme.colors.text }]}
              >
                {file ? file.name : "Choose File"}
              </Text>
              <Text
                style={[
                  styles.fileButtonSubtext,
                  { color: theme.colors.textTertiary },
                ]}
              >
                {file ? "File selected" : "No file chosen"}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Subject and Year */}
          <View style={styles.row}>
            <View style={[styles.inputGroup, styles.halfWidth]}>
              <Text style={[styles.label, { color: theme.colors.text }]}>
                Subject
              </Text>
              <RNTextInput
                style={[
                  styles.input,
                  {
                    backgroundColor: theme.colors.surface,
                    color: theme.colors.text,
                    borderColor: theme.colors.border,
                  },
                ]}
                placeholder="e.g. Computer Networks"
                placeholderTextColor={theme.colors.textTertiary}
                value={subject}
                onChangeText={setSubject}
              />
            </View>

            <View style={[styles.inputGroup, styles.halfWidth]}>
              <Text style={[styles.label, { color: theme.colors.text }]}>
                Year (for past questions)
              </Text>
              <RNTextInput
                style={[
                  styles.input,
                  {
                    backgroundColor: theme.colors.surface,
                    color: theme.colors.text,
                    borderColor: theme.colors.border,
                  },
                ]}
                placeholder="e.g. 2023"
                placeholderTextColor={theme.colors.textTertiary}
                value={year}
                onChangeText={setYear}
                keyboardType="numeric"
              />
            </View>
          </View>

          {/* Tags */}
          <View style={styles.inputGroup}>
            <View style={styles.labelRow}>
              <Text style={[styles.label, { color: theme.colors.text }]}>
                Tags (comma-separated)
              </Text>
              <TouchableOpacity style={styles.aiButton} onPress={suggestTags}>
                <Ionicons
                  name="sparkles"
                  size={16}
                  color={theme.colors.primary}
                />
                <Text
                  style={[styles.aiButtonText, { color: theme.colors.primary }]}
                >
                  AI Suggest Tags
                </Text>
              </TouchableOpacity>
            </View>
            <RNTextInput
              style={[
                styles.input,
                {
                  backgroundColor: theme.colors.surface,
                  color: theme.colors.text,
                  borderColor: theme.colors.border,
                },
              ]}
              placeholder="e.g. oop, java, polymorphism"
              placeholderTextColor={theme.colors.textTertiary}
              value={tags}
              onChangeText={setTags}
            />
            <Text style={[styles.hint, { color: theme.colors.textTertiary }]}>
              Use AI to auto-generate tags based on your content
            </Text>
          </View>
        </View>

        {/* Submit Button */}
        <TouchableOpacity
          style={[
            styles.submitButton,
            { backgroundColor: theme.colors.primary },
            loading && styles.disabledButton,
          ]}
          onPress={handleSubmit}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <>
              <Ionicons name="checkmark-circle" size={24} color="#FFFFFF" />
              <Text style={styles.submitButtonText}>Submit Resource</Text>
            </>
          )}
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  backButton: { flexDirection: "row", alignItems: "center", gap: 8 },
  backText: { fontSize: 16, fontWeight: "500" },
  scrollContent: { padding: 20 },
  titleSection: { marginBottom: 24 },
  screenTitle: { fontSize: 28, fontWeight: "bold", marginBottom: 8 },
  aiPoweredBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    alignSelf: "flex-start",
    marginBottom: 8,
  },
  aiPoweredText: { fontSize: 14, fontWeight: "600" },
  subtitle: { fontSize: 14 },
  formSection: { marginBottom: 24 },
  sectionTitle: { fontSize: 20, fontWeight: "700", marginBottom: 16 },
  inputGroup: { marginBottom: 20 },
  label: { fontSize: 14, fontWeight: "600", marginBottom: 8 },
  labelRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  aiButton: { flexDirection: "row", alignItems: "center", gap: 4 },
  aiButtonText: { fontSize: 13, fontWeight: "600" },
  input: {
    height: 50,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
    fontSize: 16,
  },
  textArea: {
    minHeight: 120,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    fontSize: 16,
    textAlignVertical: "top",
  },
  row: { flexDirection: "row", gap: 12 },
  halfWidth: { flex: 1 },
  dropdown: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    height: 50,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
  },
  dropdownText: { fontSize: 16 },
  dropdownMenu: {
    position: "absolute",
    top: 80,
    left: 0,
    right: 0,
    borderRadius: 12,
    borderWidth: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
    zIndex: 1000,
  },
  dropdownItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 0.5,
    borderBottomColor: "rgba(0,0,0,0.1)",
  },
  dropdownItemText: { fontSize: 16 },
  fileButton: {
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    height: 120,
    borderRadius: 12,
    borderWidth: 2,
    borderStyle: "dashed",
    gap: 8,
  },
  fileButtonText: { fontSize: 16, fontWeight: "600" },
  fileButtonSubtext: { fontSize: 13 },
  hint: { fontSize: 12, marginTop: 4 },
  submitButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    height: 56,
    borderRadius: 16,
    gap: 12,
    marginBottom: 40,
  },
  submitButtonText: { color: "#FFFFFF", fontSize: 18, fontWeight: "700" },
  disabledButton: { opacity: 0.6 },
});
