// src/screens/resources/ResourceDetailScreen.tsx
import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "@hooks/useTheme";
import { ResourcesStackScreenProps } from "@/types/navigation.types";
import AsyncStorage from "@react-native-async-storage/async-storage";

const STORAGE_KEY = "@resources_data";

type Resource = {
  id: string;
  title: string;
  description: string;
  category: string;
  resourceType: string;
  subject: string;
  year: string;
  tags: string[];
  views: number;
  upvotes: number;
  downvotes: number;
  downloads: number;
  fileUrl?: string;
  uploadedBy: string;
  uploadedAt: string;
  userVote?: "up" | "down" | null;
};

export default function ResourceDetailScreen({
  route,
  navigation,
}: ResourcesStackScreenProps<"ResourceDetail">) {
  const theme = useTheme();
  const { resourceId } = route.params;
  const [resource, setResource] = useState<Resource | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadResource();
  }, [resourceId]);

  const loadResource = async () => {
    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEY);
      if (stored) {
        const resources = JSON.parse(stored);
        const found = resources.find((r: Resource) => r.id === resourceId);
        setResource(found || null);
      }
    } catch (error) {
      console.error("Error loading resource:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleVote = async (voteType: "up" | "down") => {
    if (!resource) return;

    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEY);
      if (stored) {
        const resources = JSON.parse(stored);
        const updated = resources.map((r: Resource) => {
          if (r.id === resourceId) {
            const currentVote = r.userVote;
            let newUpvotes = r.upvotes;
            let newDownvotes = r.downvotes;
            let newVote: "up" | "down" | null = voteType;

            if (currentVote === "up") newUpvotes--;
            if (currentVote === "down") newDownvotes--;

            if (currentVote === voteType) {
              newVote = null;
            } else {
              if (voteType === "up") newUpvotes++;
              else newDownvotes++;
            }

            return {
              ...r,
              upvotes: newUpvotes,
              downvotes: newDownvotes,
              userVote: newVote,
            };
          }
          return r;
        });

        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
        const updatedResource = updated.find(
          (r: Resource) => r.id === resourceId
        );
        setResource(updatedResource);
      }
    } catch (error) {
      Alert.alert("Error", "Failed to update vote");
    }
  };

  const handleDownload = async () => {
    if (!resource) return;

    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEY);
      if (stored) {
        const resources = JSON.parse(stored);
        const updated = resources.map((r: Resource) =>
          r.id === resourceId ? { ...r, downloads: r.downloads + 1 } : r
        );

        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
        const updatedResource = updated.find(
          (r: Resource) => r.id === resourceId
        );
        setResource(updatedResource);

        Alert.alert("Success", "Resource downloaded successfully!");
      }
    } catch (error) {
      Alert.alert("Error", "Failed to download resource");
    }
  };

  if (loading) {
    return (
      <View
        style={[
          styles.container,
          styles.centered,
          { backgroundColor: theme.colors.background },
        ]}
      >
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  if (!resource) {
    return (
      <View
        style={[
          styles.container,
          styles.centered,
          { backgroundColor: theme.colors.background },
        ]}
      >
        <Ionicons
          name="alert-circle-outline"
          size={64}
          color={theme.colors.textTertiary}
        />
        <Text style={[styles.errorText, { color: theme.colors.textSecondary }]}>
          Resource not found
        </Text>
        <TouchableOpacity
          style={[styles.backButton, { backgroundColor: theme.colors.primary }]}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      {/* Header */}
      <View style={[styles.header, { backgroundColor: theme.colors.surface }]}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.headerButton}
        >
          <Ionicons name="arrow-back" size={24} color={theme.colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.colors.text }]}>
          Resource Details
        </Text>
        <TouchableOpacity style={styles.headerButton}>
          <Ionicons name="share-social" size={24} color={theme.colors.text} />
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Category Badge */}
        <View
          style={[
            styles.categoryContainer,
            { backgroundColor: theme.colors.primaryLight + "20" },
          ]}
        >
          <Text style={[styles.categoryText, { color: theme.colors.primary }]}>
            {resource.category}
          </Text>
          <View style={styles.dot} />
          <Text style={[styles.typeText, { color: theme.colors.primary }]}>
            {resource.resourceType}
          </Text>
        </View>

        {/* Title */}
        <Text style={[styles.title, { color: theme.colors.text }]}>
          {resource.title}
        </Text>

        {/* Meta Info */}
        <View style={styles.metaRow}>
          <View style={styles.metaItem}>
            <Ionicons
              name="person-outline"
              size={16}
              color={theme.colors.textSecondary}
            />
            <Text
              style={[styles.metaText, { color: theme.colors.textSecondary }]}
            >
              {resource.uploadedBy}
            </Text>
          </View>
          <View style={styles.metaItem}>
            <Ionicons
              name="calendar-outline"
              size={16}
              color={theme.colors.textSecondary}
            />
            <Text
              style={[styles.metaText, { color: theme.colors.textSecondary }]}
            >
              {new Date(resource.uploadedAt).toLocaleDateString()}
            </Text>
          </View>
        </View>

        {/* Stats */}
        <View
          style={[
            styles.statsContainer,
            { backgroundColor: theme.colors.surface },
          ]}
        >
          <View style={styles.statItem}>
            <Ionicons name="eye" size={24} color={theme.colors.primary} />
            <Text style={[styles.statNumber, { color: theme.colors.text }]}>
              {resource.views}
            </Text>
            <Text
              style={[styles.statLabel, { color: theme.colors.textSecondary }]}
            >
              Views
            </Text>
          </View>
          <View
            style={[
              styles.statDivider,
              { backgroundColor: theme.colors.border },
            ]}
          />
          <View style={styles.statItem}>
            <Ionicons name="download" size={24} color={theme.colors.success} />
            <Text style={[styles.statNumber, { color: theme.colors.text }]}>
              {resource.downloads}
            </Text>
            <Text
              style={[styles.statLabel, { color: theme.colors.textSecondary }]}
            >
              Downloads
            </Text>
          </View>
          <View
            style={[
              styles.statDivider,
              { backgroundColor: theme.colors.border },
            ]}
          />
          <View style={styles.statItem}>
            <Ionicons name="thumbs-up" size={24} color={theme.colors.warning} />
            <Text style={[styles.statNumber, { color: theme.colors.text }]}>
              {resource.upvotes}
            </Text>
            <Text
              style={[styles.statLabel, { color: theme.colors.textSecondary }]}
            >
              Upvotes
            </Text>
          </View>
        </View>

        {/* Description */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
            Description
          </Text>
          <Text
            style={[styles.description, { color: theme.colors.textSecondary }]}
          >
            {resource.description}
          </Text>
        </View>

        {/* Details */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
            Details
          </Text>
          <View
            style={[
              styles.detailCard,
              { backgroundColor: theme.colors.surface },
            ]}
          >
            <View style={styles.detailRow}>
              <Text
                style={[
                  styles.detailLabel,
                  { color: theme.colors.textSecondary },
                ]}
              >
                Subject:
              </Text>
              <Text style={[styles.detailValue, { color: theme.colors.text }]}>
                {resource.subject}
              </Text>
            </View>
            <View
              style={[
                styles.detailDivider,
                { backgroundColor: theme.colors.border },
              ]}
            />
            <View style={styles.detailRow}>
              <Text
                style={[
                  styles.detailLabel,
                  { color: theme.colors.textSecondary },
                ]}
              >
                Year:
              </Text>
              <Text style={[styles.detailValue, { color: theme.colors.text }]}>
                {resource.year}
              </Text>
            </View>
          </View>
        </View>

        {/* Tags */}
        {resource.tags.length > 0 && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
              Tags
            </Text>
            <View style={styles.tagsContainer}>
              {resource.tags.map((tag, index) => (
                <View
                  key={index}
                  style={[
                    styles.tag,
                    { backgroundColor: theme.colors.backgroundSecondary },
                  ]}
                >
                  <Text
                    style={[
                      styles.tagText,
                      { color: theme.colors.textSecondary },
                    ]}
                  >
                    #{tag}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Action Buttons */}
        <View style={styles.actionSection}>
          <TouchableOpacity
            style={[
              styles.downloadButton,
              { backgroundColor: theme.colors.primary },
            ]}
            onPress={handleDownload}
          >
            <Ionicons name="download" size={24} color="#FFFFFF" />
            <Text style={styles.downloadButtonText}>Download Resource</Text>
          </TouchableOpacity>

          <View style={styles.voteContainer}>
            <TouchableOpacity
              style={[
                styles.voteButton,
                {
                  backgroundColor: theme.colors.surface,
                  borderColor: theme.colors.border,
                },
                resource.userVote === "up" && {
                  backgroundColor: theme.colors.success + "20",
                  borderColor: theme.colors.success,
                },
              ]}
              onPress={() => handleVote("up")}
            >
              <Ionicons
                name={
                  resource.userVote === "up" ? "thumbs-up" : "thumbs-up-outline"
                }
                size={24}
                color={
                  resource.userVote === "up"
                    ? theme.colors.success
                    : theme.colors.textSecondary
                }
              />
              <Text
                style={[
                  styles.voteText,
                  {
                    color:
                      resource.userVote === "up"
                        ? theme.colors.success
                        : theme.colors.textSecondary,
                  },
                ]}
              >
                {resource.upvotes}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.voteButton,
                {
                  backgroundColor: theme.colors.surface,
                  borderColor: theme.colors.border,
                },
                resource.userVote === "down" && {
                  backgroundColor: theme.colors.error + "20",
                  borderColor: theme.colors.error,
                },
              ]}
              onPress={() => handleVote("down")}
            >
              <Ionicons
                name={
                  resource.userVote === "down"
                    ? "thumbs-down"
                    : "thumbs-down-outline"
                }
                size={24}
                color={
                  resource.userVote === "down"
                    ? theme.colors.error
                    : theme.colors.textSecondary
                }
              />
              <Text
                style={[
                  styles.voteText,
                  {
                    color:
                      resource.userVote === "down"
                        ? theme.colors.error
                        : theme.colors.textSecondary,
                  },
                ]}
              >
                {resource.downvotes}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  centered: { justifyContent: "center", alignItems: "center" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  headerButton: { padding: 4 },
  headerTitle: { fontSize: 18, fontWeight: "600" },
  scrollContent: { padding: 20 },
  categoryContainer: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginBottom: 16,
  },
  categoryText: { fontSize: 14, fontWeight: "600" },
  dot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: "rgba(99, 102, 241, 0.5)",
    marginHorizontal: 8,
  },
  typeText: { fontSize: 14, fontWeight: "600" },
  title: { fontSize: 28, fontWeight: "bold", lineHeight: 36, marginBottom: 16 },
  metaRow: { flexDirection: "row", gap: 20, marginBottom: 20 },
  metaItem: { flexDirection: "row", alignItems: "center", gap: 6 },
  metaText: { fontSize: 14 },
  statsContainer: {
    flexDirection: "row",
    padding: 20,
    borderRadius: 16,
    marginBottom: 24,
  },
  statItem: { flex: 1, alignItems: "center", gap: 8 },
  statNumber: { fontSize: 24, fontWeight: "bold" },
  statLabel: { fontSize: 12 },
  statDivider: { width: 1, marginHorizontal: 8 },
  section: { marginBottom: 24 },
  sectionTitle: { fontSize: 20, fontWeight: "700", marginBottom: 12 },
  description: { fontSize: 16, lineHeight: 24 },
  detailCard: { padding: 16, borderRadius: 12 },
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 12,
  },
  detailLabel: { fontSize: 14, fontWeight: "500" },
  detailValue: { fontSize: 14, fontWeight: "600" },
  detailDivider: { height: 1 },
  tagsContainer: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  tag: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8 },
  tagText: { fontSize: 13, fontWeight: "500" },
  actionSection: { marginBottom: 40 },
  downloadButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    borderRadius: 12,
    gap: 10,
    marginBottom: 16,
  },
  downloadButtonText: { color: "#FFFFFF", fontSize: 18, fontWeight: "700" },
  voteContainer: { flexDirection: "row", gap: 12 },
  voteButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    borderRadius: 12,
    gap: 10,
    borderWidth: 2,
  },
  voteText: { fontSize: 18, fontWeight: "700" },
  errorText: {
    fontSize: 18,
    fontWeight: "600",
    marginTop: 16,
    marginBottom: 24,
  },
  backButton: { paddingHorizontal: 24, paddingVertical: 12, borderRadius: 12 },
  backButtonText: { color: "#FFFFFF", fontSize: 16, fontWeight: "600" },
});
