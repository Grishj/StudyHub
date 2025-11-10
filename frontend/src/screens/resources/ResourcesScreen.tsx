// src/screens/resources/ResourcesScreen.tsx
import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "@hooks/useTheme";
import { ResourcesStackScreenProps } from "@/types/navigation.types";
import AsyncStorage from "@react-native-async-storage/async-storage";

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

const STORAGE_KEY = "@resources_data";

export default function ResourcesScreen({
  navigation,
}: ResourcesStackScreenProps<"ResourcesList">) {
  const theme = useTheme();
  const [resources, setResources] = useState<Resource[]>([]);
  const [filteredResources, setFilteredResources] = useState<Resource[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All Categories");
  const [selectedType, setSelectedType] = useState("All Types");
  const [sortBy, setSortBy] = useState("Latest");
  const [loading, setLoading] = useState(true);

  const categories = ["All Categories", "NTC", "NEA", "NRB"];
  const types = [
    "All Types",
    "Syllabus",
    "Notes",
    "Past Questions",
    "External Links",
  ];
  const sortOptions = ["Latest", "Most Viewed", "Most Liked"];

  useEffect(() => {
    loadResources();
  }, []);

  useEffect(() => {
    filterAndSortResources();
  }, [resources, searchQuery, selectedCategory, selectedType, sortBy]);

  const loadResources = async () => {
    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEY);
      if (stored) {
        setResources(JSON.parse(stored));
      }
    } catch (error) {
      console.error("Error loading resources:", error);
    } finally {
      setLoading(false);
    }
  };

  const filterAndSortResources = () => {
    let filtered = [...resources];

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(
        (r) =>
          r.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          r.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
          r.tags.some((tag) =>
            tag.toLowerCase().includes(searchQuery.toLowerCase())
          )
      );
    }

    // Category filter
    if (selectedCategory !== "All Categories") {
      filtered = filtered.filter((r) => r.category === selectedCategory);
    }

    // Type filter
    if (selectedType !== "All Types") {
      filtered = filtered.filter((r) => r.resourceType === selectedType);
    }

    // Sort
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "Most Viewed":
          return b.views - a.views;
        case "Most Liked":
          return b.upvotes - a.upvotes;
        case "Latest":
        default:
          return (
            new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime()
          );
      }
    });

    setFilteredResources(filtered);
  };

  const handleVote = async (resourceId: string, voteType: "up" | "down") => {
    const updated = resources.map((r) => {
      if (r.id === resourceId) {
        const currentVote = r.userVote;
        let newUpvotes = r.upvotes;
        let newDownvotes = r.downvotes;
        let newVote: "up" | "down" | null = voteType;

        // Remove previous vote
        if (currentVote === "up") newUpvotes--;
        if (currentVote === "down") newDownvotes--;

        // Add new vote or remove if same
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

    setResources(updated);
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  };

  const handleDownload = async (resourceId: string) => {
    const updated = resources.map((r) =>
      r.id === resourceId ? { ...r, downloads: r.downloads + 1 } : r
    );
    setResources(updated);
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  };

  const incrementViews = async (resourceId: string) => {
    const updated = resources.map((r) =>
      r.id === resourceId ? { ...r, views: r.views + 1 } : r
    );
    setResources(updated);
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "Nepal Rastra Bank":
        return "🏦";
      case "Nepal Electricity Authority":
        return "⚡";
      case "Nepal Telecom":
        return "📡";
      case "Federal Government":
        return "🏛️";
      default:
        return "📚";
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "Syllabus":
        return "document-text";
      case "Notes":
        return "document";
      case "Past Questions":
        return "help-circle";
      case "External Links":
        return "link";
      default:
        return "document";
    }
  };

  const renderResourceCard = ({ item }: { item: Resource }) => (
    <TouchableOpacity
      style={[
        styles.card,
        {
          backgroundColor: theme.colors.surface,
          borderColor: theme.colors.border,
        },
      ]}
      onPress={() => {
        incrementViews(item.id);
        navigation.navigate("ResourceDetail", { resourceId: item.id });
      }}
      activeOpacity={0.7}
    >
      <View style={styles.cardHeader}>
        <View style={styles.categoryBadge}>
          <Text style={styles.categoryIcon}>
            {getCategoryIcon(item.category)}
          </Text>
          <Text style={[styles.categoryText, { color: theme.colors.primary }]}>
            {item.category}
          </Text>
        </View>
        <View
          style={[
            styles.typeBadge,
            { backgroundColor: theme.colors.primaryLight + "20" },
          ]}
        >
          <Ionicons
            name={getTypeIcon(item.resourceType) as any}
            size={14}
            color={theme.colors.primary}
          />
          <Text style={[styles.typeText, { color: theme.colors.primary }]}>
            {item.resourceType}
          </Text>
        </View>
      </View>

      <Text
        style={[styles.title, { color: theme.colors.text }]}
        numberOfLines={2}
      >
        {item.title}
      </Text>

      <Text
        style={[styles.description, { color: theme.colors.textSecondary }]}
        numberOfLines={2}
      >
        {item.description}
      </Text>

      <View style={styles.metaContainer}>
        <View style={styles.metaItem}>
          <Ionicons
            name="eye-outline"
            size={16}
            color={theme.colors.textTertiary}
          />
          <Text
            style={[styles.metaText, { color: theme.colors.textSecondary }]}
          >
            {item.views}
          </Text>
        </View>
        <View style={styles.metaItem}>
          <Ionicons
            name="download-outline"
            size={16}
            color={theme.colors.textTertiary}
          />
          <Text
            style={[styles.metaText, { color: theme.colors.textSecondary }]}
          >
            {item.downloads}
          </Text>
        </View>
        <View style={styles.metaItem}>
          <Ionicons
            name="calendar-outline"
            size={16}
            color={theme.colors.textTertiary}
          />
          <Text
            style={[styles.metaText, { color: theme.colors.textSecondary }]}
          >
            {item.year}
          </Text>
        </View>
      </View>

      <View style={styles.tagsContainer}>
        {item.tags.slice(0, 3).map((tag, index) => (
          <View
            key={index}
            style={[
              styles.tag,
              { backgroundColor: theme.colors.backgroundSecondary },
            ]}
          >
            <Text
              style={[styles.tagText, { color: theme.colors.textSecondary }]}
            >
              #{tag}
            </Text>
          </View>
        ))}
      </View>

      <View style={styles.footer}>
        <View style={styles.voteContainer}>
          <TouchableOpacity
            style={[
              styles.voteButton,
              item.userVote === "up" && {
                backgroundColor: theme.colors.success + "20",
              },
            ]}
            onPress={() => handleVote(item.id, "up")}
          >
            <Ionicons
              name={item.userVote === "up" ? "thumbs-up" : "thumbs-up-outline"}
              size={18}
              color={
                item.userVote === "up"
                  ? theme.colors.success
                  : theme.colors.textTertiary
              }
            />
            <Text
              style={[
                styles.voteText,
                {
                  color:
                    item.userVote === "up"
                      ? theme.colors.success
                      : theme.colors.textSecondary,
                },
              ]}
            >
              {item.upvotes}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.voteButton,
              item.userVote === "down" && {
                backgroundColor: theme.colors.error + "20",
              },
            ]}
            onPress={() => handleVote(item.id, "down")}
          >
            <Ionicons
              name={
                item.userVote === "down" ? "thumbs-down" : "thumbs-down-outline"
              }
              size={18}
              color={
                item.userVote === "down"
                  ? theme.colors.error
                  : theme.colors.textTertiary
              }
            />
            <Text
              style={[
                styles.voteText,
                {
                  color:
                    item.userVote === "down"
                      ? theme.colors.error
                      : theme.colors.textSecondary,
                },
              ]}
            >
              {item.downvotes}
            </Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={[
            styles.downloadButton,
            { backgroundColor: theme.colors.primary },
          ]}
          onPress={() => handleDownload(item.id)}
        >
          <Ionicons name="download" size={18} color="#FFFFFF" />
          <Text style={styles.downloadText}>Download</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  return (
    <View
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      {/* Header */}
      <View style={[styles.header, { backgroundColor: theme.colors.surface }]}>
        <View style={styles.headerContent}>
          <Text style={[styles.headerTitle, { color: theme.colors.text }]}>
            Resource Library
          </Text>
          <Text
            style={[
              styles.headerSubtitle,
              { color: theme.colors.textSecondary },
            ]}
          >
            Comprehensive collection of PSC preparation materials
          </Text>
        </View>
        <TouchableOpacity
          style={[
            styles.uploadButton,
            { backgroundColor: theme.colors.primary },
          ]}
          onPress={() => navigation.navigate("UploadResource")}
        >
          <Ionicons name="cloud-upload" size={20} color="#FFFFFF" />
          <Text style={styles.uploadButtonText}>Upload Resource</Text>
        </TouchableOpacity>
      </View>

      {/* Search Bar */}
      <View style={styles.searchSection}>
        <View
          style={[
            styles.searchBar,
            {
              backgroundColor: theme.colors.surface,
              borderColor: theme.colors.border,
            },
          ]}
        >
          <Ionicons name="search" size={20} color={theme.colors.textTertiary} />
          <TextInput
            style={[styles.searchInput, { color: theme.colors.text }]}
            placeholder="Search resources, subjects, or keywords..."
            placeholderTextColor={theme.colors.textTertiary}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
      </View>

      {/* Filters */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.filtersContainer}
      >
        <FilterDropdown
          label={selectedCategory}
          options={categories}
          onSelect={setSelectedCategory}
          theme={theme}
        />
        <FilterDropdown
          label={selectedType}
          options={types}
          onSelect={setSelectedType}
          theme={theme}
        />
        <FilterDropdown
          label={sortBy}
          options={sortOptions}
          onSelect={setSortBy}
          theme={theme}
        />
      </ScrollView>

      {/* Results Count */}
      <Text style={[styles.resultsText, { color: theme.colors.textSecondary }]}>
        Found {filteredResources.length} resource
        {filteredResources.length !== 1 ? "s" : ""}
      </Text>

      {/* Resources List */}
      {loading ? (
        <ActivityIndicator
          size="large"
          color={theme.colors.primary}
          style={styles.loader}
        />
      ) : (
        <FlatList
          data={filteredResources}
          renderItem={renderResourceCard}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons
                name="folder-open-outline"
                size={64}
                color={theme.colors.textTertiary}
              />
              <Text
                style={[
                  styles.emptyText,
                  { color: theme.colors.textSecondary },
                ]}
              >
                No resources found
              </Text>
              <Text
                style={[
                  styles.emptySubtext,
                  { color: theme.colors.textTertiary },
                ]}
              >
                Try adjusting your filters or search query
              </Text>
            </View>
          }
        />
      )}
    </View>
  );
}

const FilterDropdown = ({ label, options, onSelect, theme }: any) => {
  const [visible, setVisible] = useState(false);

  return (
    <View style={styles.filterDropdown}>
      <TouchableOpacity
        style={[
          styles.filterButton,
          {
            backgroundColor: theme.colors.surface,
            borderColor: theme.colors.border,
          },
        ]}
        onPress={() => setVisible(!visible)}
      >
        <Text style={[styles.filterButtonText, { color: theme.colors.text }]}>
          {label}
        </Text>
        <Ionicons
          name="chevron-down"
          size={16}
          color={theme.colors.textSecondary}
        />
      </TouchableOpacity>

      {visible && (
        <>
          <TouchableOpacity
            style={styles.dropdownOverlay}
            activeOpacity={1}
            onPress={() => setVisible(false)}
          />
          <View
            style={[
              styles.dropdownMenu,
              {
                backgroundColor: theme.colors.surface,
                borderColor: theme.colors.border,
              },
            ]}
          >
            <ScrollView
              style={styles.dropdownScroll}
              nestedScrollEnabled={true}
              showsVerticalScrollIndicator={false}
            >
              {options.map((option: string) => (
                <TouchableOpacity
                  key={option}
                  style={styles.dropdownItem}
                  onPress={() => {
                    onSelect(option);
                    setVisible(false);
                  }}
                >
                  <Text
                    style={[styles.dropdownText, { color: theme.colors.text }]}
                  >
                    {option}
                  </Text>
                  {label === option && (
                    <Ionicons
                      name="checkmark"
                      size={20}
                      color={theme.colors.primary}
                    />
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    padding: 20,
    paddingTop: 60,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  headerContent: { marginBottom: 16 },
  headerTitle: { fontSize: 28, fontWeight: "bold" },
  headerSubtitle: { fontSize: 14, marginTop: 4 },
  uploadButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
    gap: 8,
  },
  uploadButtonText: { color: "#FFFFFF", fontSize: 16, fontWeight: "600" },
  searchSection: { padding: 16 },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    height: 50,
    borderRadius: 12,
    borderWidth: 1,
    gap: 12,
  },
  searchInput: { flex: 1, fontSize: 16 },
  filtersContainer: { paddingHorizontal: 16, marginBottom: 8 },
  filterDropdown: { marginRight: 12 },
  filterButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
    gap: 8,
  },
  filterButtonText: { fontSize: 14, fontWeight: "500" },
  dropdownOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 999,
  },
  dropdownMenu: {
    position: "absolute",
    top: 45,
    left: 0,
    minWidth: 200,
    maxHeight: 250,
    borderRadius: 12,
    borderWidth: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
    zIndex: 1000,
    overflow: "hidden",
  },
  dropdownScroll: {
    maxHeight: 250,
  },
  dropdownItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 0.5,
    borderBottomColor: "rgba(0,0,0,0.1)",
  },
  dropdownText: { fontSize: 14, fontWeight: "500" },
  resultsText: { paddingHorizontal: 16, fontSize: 14, marginBottom: 12 },
  listContent: { padding: 16, paddingTop: 0 },
  card: {
    marginBottom: 16,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  categoryBadge: { flexDirection: "row", alignItems: "center", gap: 6 },
  categoryIcon: { fontSize: 16 },
  categoryText: { fontSize: 12, fontWeight: "600" },
  typeBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  typeText: { fontSize: 11, fontWeight: "600" },
  title: { fontSize: 18, fontWeight: "700", marginBottom: 8 },
  description: { fontSize: 14, lineHeight: 20, marginBottom: 12 },
  metaContainer: { flexDirection: "row", gap: 16, marginBottom: 12 },
  metaItem: { flexDirection: "row", alignItems: "center", gap: 6 },
  metaText: { fontSize: 13, fontWeight: "500" },
  tagsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 12,
  },
  tag: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  tagText: { fontSize: 12, fontWeight: "500" },
  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "rgba(0,0,0,0.05)",
  },
  voteContainer: { flexDirection: "row", gap: 8 },
  voteButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  voteText: { fontSize: 14, fontWeight: "600" },
  downloadButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 10,
    gap: 6,
  },
  downloadText: { color: "#FFFFFF", fontSize: 14, fontWeight: "600" },
  loader: { flex: 1, justifyContent: "center", alignItems: "center" },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 60,
  },
  emptyText: { fontSize: 18, fontWeight: "600", marginTop: 16 },
  emptySubtext: { fontSize: 14, marginTop: 8 },
});
