// GroupsScreen.tsx - Fixed bottom tab overlap and keyboard dismissal
import React, {
  useState,
  useCallback,
  useRef,
  useEffect,
  useMemo,
} from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  RefreshControl,
  Animated,
  Dimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTheme } from "../../hooks/useTheme";
import { spacing } from "../../styles/spacing";
import { typography } from "../../styles/typography";
import { GroupsStackScreenProps } from "../../types/navigation.types";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const { width } = Dimensions.get("window");

export interface StudyGroup {
  id: string;
  name: string;
  category: string;
  description: string;
  memberCount: number;
  maxMembers: number;
  isPublic: boolean;
  lastActivity: Date;
  unreadCount?: number;
  createdAt: Date;
  admin: {
    id: string;
    name: string;
    avatar: string;
  };
  tags?: string[];
  rules?: string[];
  nextSession?: Date;
  totalSessions?: number;
  completedSessions?: number;
}

const CATEGORY_ICONS: Record<string, string> = {
  NRB: "🏦",
  NTC: "📡",
  NEA: "⚡",
  GENERAL: "📚",
};

// Constants for bottom spacing
const BOTTOM_TAB_HEIGHT = 80;
const FAB_BOTTOM_MARGIN = 10;

// ✅ Extract GroupCard (already fine, but ensure stability)
const GroupCard = React.memo(
  ({
    item,
    index,
    onPress,
  }: {
    item: StudyGroup;
    index: number;
    onPress: () => void;
  }) => {
    const { colors } = useTheme();
    const slideAnim = useRef(new Animated.Value(50)).current;
    const opacityAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 300,
          delay: index * 100,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 300,
          delay: index * 100,
          useNativeDriver: true,
        }),
      ]).start();
    }, [index]);

    const getTimeAgo = (date: Date) => {
      const minutes = Math.floor((Date.now() - date.getTime()) / 60000);
      if (minutes < 60) return `${minutes}m ago`;
      const hours = Math.floor(minutes / 60);
      if (hours < 24) return `${hours}h ago`;
      return `${Math.floor(hours / 24)}d ago`;
    };

    return (
      <Animated.View
        style={[
          {
            transform: [{ translateY: slideAnim }],
            opacity: opacityAnim,
          },
        ]}
      >
        <TouchableOpacity
          style={[styles.groupCard, { backgroundColor: colors.surface }]}
          onPress={onPress}
          activeOpacity={0.7}
        >
          <View style={styles.cardHeader}>
            <View style={styles.categoryContainer}>
              <Text style={styles.categoryIcon}>
                {CATEGORY_ICONS[item.category] || "📚"}
              </Text>
              <View
                style={[
                  styles.categoryBadge,
                  { backgroundColor: colors.primary + "15" },
                ]}
              >
                <Text style={[styles.categoryText, { color: colors.primary }]}>
                  {item.category}
                </Text>
              </View>
            </View>
            {item.unreadCount ? (
              <View
                style={[styles.unreadBadge, { backgroundColor: colors.error }]}
              >
                <Text style={styles.unreadText}>{item.unreadCount}</Text>
              </View>
            ) : null}
          </View>

          <Text
            style={[styles.groupName, { color: colors.text }]}
            numberOfLines={1}
          >
            {item.name}
          </Text>

          <Text
            style={[styles.groupDescription, { color: colors.textSecondary }]}
            numberOfLines={2}
          >
            {item.description}
          </Text>

          <View style={styles.cardFooter}>
            <View style={styles.memberInfo}>
              <Ionicons name="people" size={16} color={colors.textTertiary} />
              <Text
                style={[styles.memberCount, { color: colors.textTertiary }]}
              >
                {item.memberCount}/{item.maxMembers}
              </Text>
            </View>

            <View style={styles.metaInfo}>
              {item.isPublic ? (
                <Ionicons
                  name="globe-outline"
                  size={14}
                  color={colors.textTertiary}
                />
              ) : (
                <Ionicons
                  name="lock-closed-outline"
                  size={14}
                  color={colors.textTertiary}
                />
              )}
              <Text
                style={[styles.lastActivity, { color: colors.textTertiary }]}
              >
                {getTimeAgo(item.lastActivity)}
              </Text>
            </View>
          </View>

          <View
            style={[styles.progressBar, { backgroundColor: colors.border }]}
          >
            <View
              style={[
                styles.progressFill,
                {
                  backgroundColor: colors.primary,
                  width: `${(item.memberCount / item.maxMembers) * 100}%`,
                },
              ]}
            />
          </View>
        </TouchableOpacity>
      </Animated.View>
    );
  }
);

// ✅ Extract ListHeaderComponent as a stable component
const ListHeaderComponent = React.memo(
  ({
    searchQuery,
    onSearchChange,
    onClear,
    activeFilter,
    onFilterChange,
    colors,
  }: {
    searchQuery: string;
    onSearchChange: (text: string) => void;
    onClear: () => void;
    activeFilter: string;
    onFilterChange: (filter: string) => void;
    colors: any;
  }) => {
    const searchInputRef = useRef<TextInput>(null);

    return (
      <View>
        <View
          style={[styles.searchContainer, { backgroundColor: colors.surface }]}
        >
          <Ionicons name="search" size={20} color={colors.textTertiary} />
          <TextInput
            ref={searchInputRef}
            style={[styles.searchInput, { color: colors.text }]}
            placeholder="Search groups..."
            placeholderTextColor={colors.textTertiary}
            value={searchQuery}
            onChangeText={onSearchChange}
            returnKeyType="search"
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={onClear}>
              <Ionicons
                name="close-circle"
                size={20}
                color={colors.textTertiary}
              />
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.filterContainer}>
          {["all", "joined", "public", "private"].map((filter) => (
            <TouchableOpacity
              key={filter}
              style={[
                styles.filterChip,
                {
                  backgroundColor:
                    activeFilter === filter ? colors.primary : colors.surface,
                  borderColor:
                    activeFilter === filter ? colors.primary : colors.border,
                },
              ]}
              onPress={() => onFilterChange(filter)}
            >
              <Text
                style={[
                  styles.filterText,
                  {
                    color: activeFilter === filter ? "#FFFFFF" : colors.text,
                  },
                ]}
              >
                {filter.charAt(0).toUpperCase() + filter.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    );
  }
);

const ListEmptyComponent = React.memo(({ colors }: { colors: any }) => (
  <View style={styles.emptyContainer}>
    <Ionicons name="people-outline" size={64} color={colors.textTertiary} />
    <Text style={[styles.emptyTitle, { color: colors.text }]}>
      No groups found
    </Text>
    <Text style={[styles.emptySubtitle, { color: colors.textSecondary }]}>
      Try adjusting your filters or create a new group
    </Text>
  </View>
));

const GroupsScreen = ({ navigation }: GroupsStackScreenProps<"GroupsList">) => {
  const { colors } = useTheme();
  const [searchQuery, setSearchQuery] = useState("");
  const [refreshing, setRefreshing] = useState(false);
  const [activeFilter, setActiveFilter] = useState("all");
  const fadeAnim = useRef(new Animated.Value(0)).current;

  const groups = useMemo<StudyGroup[]>(
    () => [
      {
        id: "1",
        name: "NRB IT Officers 2024",
        category: "NRB",
        description:
          "Specialized preparation group for Nepal Rastra Bank IT Officer positions. Focus on banking systems, cybersecurity, and database management.",
        memberCount: 45,
        maxMembers: 50,
        isPublic: true,
        lastActivity: new Date(),
        unreadCount: 3,
        createdAt: new Date("2024-01-15"),
        admin: { id: "1", name: "Rajesh Sharma", avatar: "👨‍💼" },
        tags: ["banking", "IT", "database", "security"],
        rules: [
          "Share only relevant NRB study materials",
          "Participate in weekly mock tests",
          "Help others with technical queries",
          "No spam or promotional content",
        ],
        nextSession: new Date(Date.now() + 86400000),
        totalSessions: 30,
        completedSessions: 22,
      },
      {
        id: "2",
        name: "NTC Technical Team",
        category: "NTC",
        description:
          "Comprehensive study group for Nepal Telecom technical positions. Covering telecommunications, networking, fiber optics, and wireless technologies.",
        memberCount: 32,
        maxMembers: 40,
        isPublic: true,
        lastActivity: new Date(Date.now() - 3600000),
        unreadCount: 0,
        createdAt: new Date("2024-01-20"),
        admin: { id: "2", name: "Priya Adhikari", avatar: "👩‍💻" },
        tags: ["telecom", "networking", "5G", "fiber-optics"],
        rules: [
          "Focus on NTC syllabus topics only",
          "Share past question papers",
          "Respect all members",
          "Attend online sessions regularly",
        ],
        nextSession: new Date(Date.now() + 172800000),
        totalSessions: 25,
        completedSessions: 18,
      },
      {
        id: "3",
        name: "NEA Engineering Prep",
        category: "NEA",
        description:
          "Dedicated group for Nepal Electricity Authority engineering positions. Focus on power systems, electrical engineering, and renewable energy.",
        memberCount: 28,
        maxMembers: 35,
        isPublic: false,
        lastActivity: new Date(Date.now() - 7200000),
        createdAt: new Date("2024-02-01"),
        admin: { id: "3", name: "Sunil Bhattarai", avatar: "👨‍🔧" },
        tags: ["electrical", "power-systems", "renewable", "engineering"],
        rules: [
          "Only NEA related content allowed",
          "Complete weekly assignments",
          "Share interview experiences",
          "Maintain professional conduct",
        ],
        nextSession: new Date(Date.now() + 259200000),
        totalSessions: 20,
        completedSessions: 12,
      },
      {
        id: "4",
        name: "Programming Fundamentals Study Group",
        category: "GENERAL",
        description:
          "Learn programming concepts together! Perfect for beginners and those looking to strengthen their coding foundation.",
        memberCount: 15,
        maxMembers: 50,
        isPublic: true,
        lastActivity: new Date(Date.now() - 1800000),
        unreadCount: 1,
        createdAt: new Date("2024-02-10"),
        admin: { id: "4", name: "John Doe", avatar: "👤" },
        tags: ["programming", "python", "javascript", "beginners"],
        rules: [
          "Be respectful and supportive to all members",
          "Share resources and knowledge freely",
          "Attend scheduled study sessions regularly",
          "Complete assigned tasks on time",
        ],
        nextSession: new Date(Date.now() + 86400000),
        totalSessions: 24,
        completedSessions: 18,
      },
    ],
    []
  );

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
  }, []);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1500);
  }, []);

  const filteredGroups = useMemo(() => {
    return groups.filter((group) => {
      const matchesSearch = group.name
        .toLowerCase()
        .includes(searchQuery.toLowerCase());
      const matchesFilter =
        activeFilter === "all"
          ? true
          : activeFilter === "joined"
          ? group.memberCount > 30 // arbitrary logic for "joined"
          : activeFilter === "public"
          ? group.isPublic
          : !group.isPublic;
      return matchesSearch && matchesFilter;
    });
  }, [groups, searchQuery, activeFilter]);

  const renderItem = useCallback(
    ({ item, index }: { item: StudyGroup; index: number }) => (
      <GroupCard
        item={item}
        index={index}
        onPress={() =>
          navigation.navigate("GroupDetail", {
            groupId: item.id,
            groupData: item,
          })
        }
      />
    ),
    [navigation]
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <SafeAreaView style={styles.safeArea} edges={["top"]}>
        <View style={styles.header}>
          <View>
            <Text style={[styles.title, { color: colors.text }]}>
              Study Groups
            </Text>
            <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
              Join communities and learn together
            </Text>
          </View>
          <TouchableOpacity
            style={styles.notificationButton}
            onPress={() => {}}
          >
            <Ionicons
              name="notifications-outline"
              size={24}
              color={colors.text}
            />
            <View
              style={[
                styles.notificationDot,
                { backgroundColor: colors.error },
              ]}
            />
          </TouchableOpacity>
        </View>

        <FlatList
          data={filteredGroups}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={[
            styles.listContainer,
            { paddingBottom: BOTTOM_TAB_HEIGHT + spacing.xl },
          ]}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[colors.primary]}
            />
          }
          ListHeaderComponent={
            <ListHeaderComponent
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              onClear={() => setSearchQuery("")}
              activeFilter={activeFilter}
              onFilterChange={setActiveFilter}
              colors={colors}
            />
          }
          ListEmptyComponent={<ListEmptyComponent colors={colors} />}
        />

        <TouchableOpacity
          style={[
            styles.fab,
            {
              backgroundColor: colors.primary,
              bottom: FAB_BOTTOM_MARGIN,
              right: spacing.lg,
              position: "absolute",
            },
          ]}
          onPress={() => navigation.navigate("CreateGroup")}
          activeOpacity={0.8}
        >
          <Ionicons name="add" size={28} color="#FFFFFF" />
        </TouchableOpacity>
      </SafeAreaView>
    </View>
  );
};

// ... styles remain unchanged ...
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  title: {
    fontSize: typography.fontSize["2xl"],
    fontWeight: typography.fontWeight.bold as any,
  },
  subtitle: {
    fontSize: typography.fontSize.sm,
    marginTop: spacing.xs / 2,
  },
  notificationButton: {
    position: "relative",
    padding: spacing.sm,
  },
  notificationDot: {
    position: "absolute",
    top: spacing.sm,
    right: spacing.sm,
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: spacing.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 12,
    borderColor: "gray",
    borderWidth: 1,
    gap: spacing.sm,
  },
  searchInput: {
    flex: 1,
    fontSize: typography.fontSize.base,
    paddingVertical: spacing.xs,
  },
  filterContainer: {
    flexDirection: "row",
    marginBottom: spacing.md,
    gap: spacing.sm,
  },
  filterChip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs + 2,
    borderRadius: 20,
    borderWidth: 1,
  },
  filterText: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium as any,
  },
  listContainer: {
    paddingHorizontal: spacing.lg,
  },
  groupCard: {
    borderRadius: 16,
    padding: spacing.md,
    marginBottom: spacing.md,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.sm,
  },
  categoryContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  categoryIcon: {
    fontSize: typography.fontSize.xl,
  },
  categoryBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs / 2,
    borderRadius: 6,
  },
  categoryText: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.semibold as any,
  },
  unreadBadge: {
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: spacing.xs,
  },
  unreadText: {
    color: "#FFFFFF",
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.bold as any,
  },
  groupName: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semibold as any,
    marginBottom: spacing.xs,
  },
  groupDescription: {
    fontSize: typography.fontSize.sm,
    lineHeight: typography.fontSize.sm * 1.4,
    marginBottom: spacing.md,
  },
  cardFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.sm,
  },
  memberInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
  },
  memberCount: {
    fontSize: typography.fontSize.xs,
  },
  metaInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
  },
  lastActivity: {
    fontSize: typography.fontSize.xs,
  },
  progressBar: {
    height: 3,
    borderRadius: 1.5,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    borderRadius: 1.5,
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: spacing.xl * 3,
  },
  emptyTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semibold as any,
    marginTop: spacing.md,
  },
  emptySubtitle: {
    fontSize: typography.fontSize.sm,
    marginTop: spacing.xs,
    textAlign: "center",
  },
  fab: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
});

export default GroupsScreen;
