// src/screens/profile/AchievementsScreen.tsx
import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
} from "react-native";
import { ProfileStackScreenProps } from "../../types/navigation.types";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTheme } from "@hooks/useTheme";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";

type Props = ProfileStackScreenProps<"Achievements">;

type Achievement = {
  id: string;
  title: string;
  description: string;
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
  earned: boolean;
  progress: number;
  maxProgress: number;
  earnedDate?: string;
  category: "resources" | "quizzes" | "groups" | "study" | "special";
};

const { width } = Dimensions.get("window");

const AchievementsScreen: React.FC<Props> = ({ navigation }) => {
  const theme = useTheme();
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  const achievements: Achievement[] = [
    {
      id: "1",
      title: "First Steps",
      description: "Upload your first resource",
      icon: "rocket",
      color: "#6366F1",
      earned: true,
      progress: 1,
      maxProgress: 1,
      earnedDate: "2025-01-15",
      category: "resources",
    },
    {
      id: "2",
      title: "Knowledge Sharer",
      description: "Upload 10 resources",
      icon: "library",
      color: "#10B981",
      earned: true,
      progress: 10,
      maxProgress: 10,
      earnedDate: "2025-02-20",
      category: "resources",
    },
    {
      id: "3",
      title: "Resource Master",
      description: "Upload 50 resources",
      icon: "trophy",
      color: "#F59E0B",
      earned: false,
      progress: 24,
      maxProgress: 50,
      category: "resources",
    },
    {
      id: "4",
      title: "Quiz Beginner",
      description: "Complete your first quiz",
      icon: "bulb",
      color: "#8B5CF6",
      earned: true,
      progress: 1,
      maxProgress: 1,
      earnedDate: "2025-01-10",
      category: "quizzes",
    },
    {
      id: "5",
      title: "Perfect Score",
      description: "Score 100% on any quiz",
      icon: "star",
      color: "#EF4444",
      earned: true,
      progress: 1,
      maxProgress: 1,
      earnedDate: "2025-02-05",
      category: "quizzes",
    },
    {
      id: "6",
      title: "Quiz Master",
      description: "Complete 50 quizzes",
      icon: "medal",
      color: "#EC4899",
      earned: false,
      progress: 12,
      maxProgress: 50,
      category: "quizzes",
    },
    {
      id: "7",
      title: "Social Butterfly",
      description: "Join 5 study groups",
      icon: "people",
      color: "#06B6D4",
      earned: true,
      progress: 5,
      maxProgress: 5,
      earnedDate: "2025-03-01",
      category: "groups",
    },
    {
      id: "8",
      title: "Team Leader",
      description: "Create and manage a study group",
      icon: "shield-checkmark",
      color: "#84CC16",
      earned: false,
      progress: 0,
      maxProgress: 1,
      category: "groups",
    },
    {
      id: "9",
      title: "Streak Starter",
      description: "Maintain a 7-day study streak",
      icon: "flame",
      color: "#F97316",
      earned: true,
      progress: 7,
      maxProgress: 7,
      earnedDate: "2025-02-28",
      category: "study",
    },
    {
      id: "10",
      title: "Dedication",
      description: "Maintain a 30-day study streak",
      icon: "calendar",
      color: "#DC2626",
      earned: false,
      progress: 7,
      maxProgress: 30,
      category: "study",
    },
  ];

  const categories = [
    { id: "all", label: "All", icon: "apps" as const },
    { id: "resources", label: "Resources", icon: "document-text" as const },
    { id: "quizzes", label: "Quizzes", icon: "school" as const },
    { id: "groups", label: "Groups", icon: "people" as const },
    { id: "study", label: "Study", icon: "book" as const },
  ];

  const filteredAchievements =
    selectedCategory === "all"
      ? achievements
      : achievements.filter((a) => a.category === selectedCategory);

  const earnedCount = achievements.filter((a) => a.earned).length;
  const totalCount = achievements.length;
  const progressPercentage = (earnedCount / totalCount) * 100;

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
          Achievements
        </Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Progress Card */}
        <LinearGradient
          colors={[theme.colors.primary, theme.colors.primaryDark]}
          style={styles.progressCard}
        >
          <View style={styles.progressHeader}>
            <View>
              <Text style={styles.progressTitle}>Your Progress</Text>
              <Text style={styles.progressSubtitle}>
                {earnedCount} of {totalCount} achievements unlocked
              </Text>
            </View>
            <View style={styles.badgeContainer}>
              <Ionicons name="trophy" size={32} color="#FFD700" />
            </View>
          </View>

          <View style={styles.progressBarContainer}>
            <View
              style={[
                styles.progressBar,
                { backgroundColor: "rgba(255,255,255,0.3)" },
              ]}
            >
              <View
                style={[
                  styles.progressBarFill,
                  {
                    width: `${progressPercentage}%`,
                    backgroundColor: "#FFD700",
                  },
                ]}
              />
            </View>
            <Text style={styles.progressPercentage}>
              {Math.round(progressPercentage)}%
            </Text>
          </View>
        </LinearGradient>

        {/* Category Filter */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.categoryContainer}
          contentContainerStyle={styles.categoryContent}
        >
          {categories.map((cat) => (
            <TouchableOpacity
              key={cat.id}
              style={[
                styles.categoryButton,
                {
                  backgroundColor:
                    selectedCategory === cat.id
                      ? theme.colors.primary
                      : theme.colors.surface,
                  borderColor:
                    selectedCategory === cat.id
                      ? theme.colors.primary
                      : theme.colors.border,
                },
              ]}
              onPress={() => setSelectedCategory(cat.id)}
            >
              <Ionicons
                name={cat.icon}
                size={18}
                color={
                  selectedCategory === cat.id
                    ? "#FFFFFF"
                    : theme.colors.textSecondary
                }
              />
              <Text
                style={[
                  styles.categoryText,
                  {
                    color:
                      selectedCategory === cat.id
                        ? "#FFFFFF"
                        : theme.colors.textSecondary,
                  },
                ]}
              >
                {cat.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Achievements Grid */}
        <View style={styles.achievementsContainer}>
          {filteredAchievements.map((achievement) => (
            <View
              key={achievement.id}
              style={[
                styles.achievementCard,
                {
                  backgroundColor: theme.colors.surface,
                  borderColor: achievement.earned
                    ? achievement.color
                    : theme.colors.border,
                  opacity: achievement.earned ? 1 : 0.6,
                },
              ]}
            >
              <View
                style={[
                  styles.iconContainer,
                  {
                    backgroundColor: achievement.earned
                      ? achievement.color
                      : theme.colors.backgroundSecondary,
                  },
                ]}
              >
                <Ionicons
                  name={achievement.icon}
                  size={32}
                  color={
                    achievement.earned ? "#FFFFFF" : theme.colors.textTertiary
                  }
                />
              </View>

              <Text
                style={[
                  styles.achievementTitle,
                  {
                    color: achievement.earned
                      ? theme.colors.text
                      : theme.colors.textSecondary,
                  },
                ]}
                numberOfLines={2}
              >
                {achievement.title}
              </Text>

              <Text
                style={[
                  styles.achievementDescription,
                  { color: theme.colors.textSecondary },
                ]}
                numberOfLines={2}
              >
                {achievement.description}
              </Text>

              {achievement.earned ? (
                <View style={styles.earnedBadge}>
                  <Ionicons
                    name="checkmark-circle"
                    size={16}
                    color={achievement.color}
                  />
                  <Text
                    style={[styles.earnedText, { color: achievement.color }]}
                  >
                    Earned
                  </Text>
                </View>
              ) : (
                <View style={styles.progressContainer}>
                  <View
                    style={[
                      styles.miniProgressBar,
                      { backgroundColor: theme.colors.border },
                    ]}
                  >
                    <View
                      style={[
                        styles.miniProgressFill,
                        {
                          width: `${
                            (achievement.progress / achievement.maxProgress) *
                            100
                          }%`,
                          backgroundColor: achievement.color,
                        },
                      ]}
                    />
                  </View>
                  <Text
                    style={[
                      styles.progressText,
                      { color: theme.colors.textTertiary },
                    ]}
                  >
                    {achievement.progress}/{achievement.maxProgress}
                  </Text>
                </View>
              )}
            </View>
          ))}
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
  progressCard: { margin: 20, padding: 20, borderRadius: 20 },
  progressHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  progressTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#FFFFFF",
    marginBottom: 4,
  },
  progressSubtitle: { fontSize: 14, color: "rgba(255,255,255,0.8)" },
  badgeContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "rgba(255,255,255,0.2)",
    justifyContent: "center",
    alignItems: "center",
  },
  progressBarContainer: { flexDirection: "row", alignItems: "center", gap: 12 },
  progressBar: { flex: 1, height: 8, borderRadius: 4, overflow: "hidden" },
  progressBarFill: { height: "100%", borderRadius: 4 },
  progressPercentage: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#FFFFFF",
    minWidth: 45,
  },
  categoryContainer: { marginBottom: 20 },
  categoryContent: { paddingHorizontal: 20, gap: 10 },
  categoryButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
  },
  categoryText: { fontSize: 14, fontWeight: "600" },
  achievementsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    paddingHorizontal: 12,
    paddingBottom: 20,
    gap: 12,
  },
  achievementCard: {
    width: (width - 48) / 2,
    padding: 16,
    borderRadius: 16,
    borderWidth: 2,
    alignItems: "center",
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  achievementTitle: {
    fontSize: 16,
    fontWeight: "700",
    textAlign: "center",
    marginBottom: 4,
  },
  achievementDescription: {
    fontSize: 12,
    textAlign: "center",
    marginBottom: 12,
    minHeight: 32,
  },
  earnedBadge: { flexDirection: "row", alignItems: "center", gap: 4 },
  earnedText: { fontSize: 12, fontWeight: "600" },
  progressContainer: { width: "100%", gap: 4 },
  miniProgressBar: {
    width: "100%",
    height: 4,
    borderRadius: 2,
    overflow: "hidden",
  },
  miniProgressFill: { height: "100%", borderRadius: 2 },
  progressText: { fontSize: 11, fontWeight: "600", textAlign: "center" },
});

export default AchievementsScreen;
