// src/screens/home/HomeScreen.tsx
import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Dimensions,
  Platform,
} from "react-native";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons, MaterialIcons, FontAwesome5 } from "@expo/vector-icons";
import { useTheme } from "@hooks/useTheme";
import { useAppSelector, useAppDispatch } from "@store/hooks";
import { HomeStackScreenProps } from "../../types/navigation.types";
import { setThemeMode } from "@store/slices/themeSlice";
import { darkTheme } from "@styles/theme";
import { Card } from "@components/common/Card/Card";

const { width } = Dimensions.get("window");

type Props = HomeStackScreenProps<"Home">;

export const HomeScreen: React.FC<Props> = ({ navigation }) => {
  const theme = useTheme();
  const dispatch = useAppDispatch();
  const insets = useSafeAreaInsets();
  const user = useAppSelector((state) => state.auth.user);
  const currentThemeMode = useAppSelector((state) => state.theme.mode);
  const [refreshing, setRefreshing] = useState(false);
  const [studyStreak, setStudyStreak] = useState(15);
  const [dailyProgress, setDailyProgress] = useState(65);

  // Calculate tab bar height same as AppTabNavigator
  const TAB_BAR_HEIGHT = Platform.OS === "ios" ? 49 : 56;
  const bottomPadding = TAB_BAR_HEIGHT + insets.bottom + 40; // Increased from 20 to 40 for more space

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
    }, 2000);
  }, []);

  const toggleTheme = () => {
    if (currentThemeMode === "light") {
      dispatch(setThemeMode("dark"));
    } else if (currentThemeMode === "dark") {
      dispatch(setThemeMode("light"));
    } else {
      const system = theme === darkTheme ? "dark" : "light";
      const next = system === "dark" ? "light" : "dark";
      dispatch(setThemeMode(next));
    }
  };

  const quickActions = [
    {
      id: "1",
      title: "Mock Test",
      icon: "clipboard-list" as const,
      color: theme.colors.primary,
      gradientColors: [theme.colors.primary, theme.colors.primaryDark],
      count: "5 New",
      onPress: () => navigation.navigate("QuizTab", { screen: "QuizList" }),
    },
    {
      id: "2",
      title: "Study Materials",
      icon: "book" as const,
      color: "#FF6B6B",
      gradientColors: ["#FF6B6B", "#FF5252"],
      count: "12 Topics",
      onPress: () =>
        navigation.navigate("ResourcesTab", { screen: "ResourcesList" }),
    },
    {
      id: "3",
      title: "Study Groups",
      icon: "users" as const,
      color: "#4ECDC4",
      gradientColors: ["#4ECDC4", "#3DBDB4"],
      count: "3 Active",
      onPress: () => navigation.navigate("GroupsTab", { screen: "GroupsList" }),
    },
    {
      id: "4",
      title: "Previous Papers",
      icon: "file-alt" as const,
      color: "#FFD93D",
      gradientColors: ["#FFD93D", "#FFCD1D"],
      count: "2023-2024",
      onPress: () =>
        navigation.navigate("ResourcesTab", { screen: "ResourcesList" }),
    },

    {
      id: "5",
      title: "Previous Papers",
      icon: "file-alt" as const,
      color: "#FFD93D",
      gradientColors: ["#FFD93D", "#FFCD1D"],
      count: "2023-2024",
      onPress: () =>
        navigation.navigate("ResourcesTab", { screen: "ResourcesList" }),
    },
  ];

  const recentActivities = [
    {
      id: "1",
      title: "Nepal History Quiz",
      subtitle: "Scored 85%",
      time: "2 hours ago",
      icon: "trophy" as const,
      iconColor: "#FFD700",
    },
    {
      id: "2",
      title: "New Study Material",
      subtitle: "Indian Constitution Chapter 5",
      time: "5 hours ago",
      icon: "book-open" as const,
      iconColor: theme.colors.primary,
    },
    {
      id: "3",
      title: "Group Discussion",
      subtitle: "Current Affairs 2024",
      time: "Yesterday",
      icon: "comments" as const,
      iconColor: "#4ECDC4",
    },
  ];

  const upcomingExams = [
    {
      id: "1",
      title: "Nepal PSC - LDC",
      date: "March 15, 2024",
      daysLeft: 45,
    },
    {
      id: "2",
      title: "Nepal PSC - Village Officer",
      date: "April 20, 2024",
      daysLeft: 81,
    },
  ];

  const renderHeader = () => (
    <View style={styles.header}>
      <View style={styles.headerContent}>
        <View style={styles.headerLeft}>
          <Text
            style={[styles.greeting, { color: theme.colors.textSecondary }]}
          >
            Good Morning,
          </Text>
          <Text style={[styles.userName, { color: theme.colors.text }]}>
            {user?.fullName || "Student"} 👋
          </Text>
        </View>
        <View style={styles.headerIcons}>
          <TouchableOpacity onPress={toggleTheme} style={styles.iconButton}>
            {theme === darkTheme ? (
              <Ionicons
                name="sunny-outline"
                size={24}
                color={theme.colors.text}
              />
            ) : (
              <Ionicons
                name="moon-outline"
                size={24}
                color={theme.colors.text}
              />
            )}
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => navigation.navigate("Notifications")}
            style={styles.iconButton}
          >
            <Ionicons
              name="notifications-outline"
              size={24}
              color={theme.colors.text}
            />
            <View
              style={[
                styles.notificationBadge,
                { backgroundColor: theme.colors.error },
              ]}
            />
          </TouchableOpacity>
        </View>
      </View>

      <LinearGradient
        colors={[theme.colors.primary, theme.colors.primaryDark]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.progressCard, { borderRadius: theme.borderRadius.lg }]}
      >
        <View style={styles.progressContent}>
          <View style={styles.progressLeft}>
            <Text style={styles.progressTitle}>Daily Goal</Text>
            <Text style={styles.progressPercentage}>{dailyProgress}%</Text>
            <Text style={styles.progressSubtitle}>Keep it up! 🎯</Text>
          </View>
          <View style={styles.progressRight}>
            <View style={styles.progressCircle}>
              <FontAwesome5 name="fire" size={24} color="#FFD700" />
              <Text style={styles.streakText}>{studyStreak}</Text>
            </View>
            <Text style={styles.streakLabel}>Day Streak</Text>
          </View>
        </View>
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: `${dailyProgress}%` }]} />
        </View>
      </LinearGradient>
    </View>
  );

  const renderQuickActions = () => (
    <View style={styles.section}>
      <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
        Quick Actions
      </Text>
      <View style={styles.quickActionsGrid}>
        {quickActions.map((action) => (
          <TouchableOpacity
            key={action.id}
            style={styles.quickActionCard}
            onPress={action.onPress}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={action.gradientColors}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={[
                styles.quickActionGradient,
                { borderRadius: theme.borderRadius.md },
              ]}
            >
              <FontAwesome5 name={action.icon} size={24} color="#FFFFFF" />
              <Text style={styles.quickActionTitle}>{action.title}</Text>
              <Text style={styles.quickActionCount}>{action.count}</Text>
            </LinearGradient>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  const renderUpcomingExams = () => (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
          Upcoming Exams
        </Text>
        <TouchableOpacity>
          <Text style={[styles.seeAll, { color: theme.colors.primary }]}>
            See All
          </Text>
        </TouchableOpacity>
      </View>
      {upcomingExams.map((exam) => (
        <Card key={exam.id} style={styles.examCard} padding={16} elevation="sm">
          <View style={styles.examIcon}>
            <MaterialIcons
              name="event"
              size={24}
              color={theme.colors.primary}
            />
          </View>
          <View style={styles.examDetails}>
            <Text style={[styles.examTitle, { color: theme.colors.text }]}>
              {exam.title}
            </Text>
            <Text
              style={[styles.examDate, { color: theme.colors.textSecondary }]}
            >
              {exam.date}
            </Text>
          </View>
          <View
            style={[
              styles.examDaysLeft,
              { backgroundColor: theme.colors.primaryLight },
            ]}
          >
            <Text
              style={[styles.examDaysLeftText, { color: theme.colors.primary }]}
            >
              {exam.daysLeft} days
            </Text>
          </View>
        </Card>
      ))}
    </View>
  );

  const renderRecentActivity = () => (
    <View style={[styles.section, styles.lastSection]}>
      <View style={styles.sectionHeader}>
        <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
          Recent Activity
        </Text>
        <TouchableOpacity>
          <Text style={[styles.seeAll, { color: theme.colors.primary }]}>
            View All
          </Text>
        </TouchableOpacity>
      </View>
      {recentActivities.map((activity) => (
        <TouchableOpacity key={activity.id} activeOpacity={0.7}>
          <Card style={styles.activityCard} padding={16} elevation="sm">
            <View
              style={[
                styles.activityIcon,
                { backgroundColor: `${activity.iconColor}20` },
              ]}
            >
              <FontAwesome5
                name={activity.icon}
                size={18}
                color={activity.iconColor}
              />
            </View>
            <View style={styles.activityContent}>
              <Text
                style={[styles.activityTitle, { color: theme.colors.text }]}
              >
                {activity.title}
              </Text>
              <Text
                style={[
                  styles.activitySubtitle,
                  { color: theme.colors.textSecondary },
                ]}
              >
                {activity.subtitle}
              </Text>
            </View>
            <Text
              style={[
                styles.activityTime,
                { color: theme.colors.textSecondary },
              ]}
            >
              {activity.time}
            </Text>
          </Card>
        </TouchableOpacity>
      ))}
    </View>
  );

  const renderDailyTip = () => (
    <Card
      style={[styles.tipCard, { backgroundColor: theme.colors.primaryLight }]}
      padding={16}
    >
      <View style={styles.tipHeader}>
        <Ionicons name="bulb" size={24} color={theme.colors.primary} />
        <Text style={[styles.tipTitle, { color: theme.colors.primary }]}>
          Tip of the Day
        </Text>
      </View>
      <Text style={[styles.tipText, { color: theme.colors.text }]}>
        "Focus on understanding concepts rather than memorization. Active recall
        and spaced repetition are your best friends!"
      </Text>
    </Card>
  );

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      edges={["top"]}
    >
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: bottomPadding },
        ]}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={theme.colors.primary}
          />
        }
      >
        {renderHeader()}
        {renderQuickActions()}
        {renderUpcomingExams()}
        {renderDailyTip()}
        {renderRecentActivity()}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  header: {
    padding: 20,
  },
  headerContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  headerLeft: {
    flex: 1,
  },
  headerIcons: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  iconButton: {
    position: "relative",
    padding: 8,
  },
  greeting: {
    fontSize: 14,
    marginBottom: 4,
  },
  userName: {
    fontSize: 24,
    fontWeight: "700",
  },
  notificationBadge: {
    position: "absolute",
    top: 8,
    right: 8,
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  progressCard: {
    padding: 20,
  },
  progressContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
  },
  progressLeft: {
    flex: 1,
  },
  progressTitle: {
    color: "#FFFFFF",
    fontSize: 14,
    opacity: 0.9,
  },
  progressPercentage: {
    color: "#FFFFFF",
    fontSize: 32,
    fontWeight: "700",
    marginVertical: 4,
  },
  progressSubtitle: {
    color: "#FFFFFF",
    fontSize: 12,
    opacity: 0.9,
  },
  progressRight: {
    alignItems: "center",
  },
  progressCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    justifyContent: "center",
    alignItems: "center",
  },
  streakText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "700",
    marginTop: 2,
  },
  streakLabel: {
    color: "#FFFFFF",
    fontSize: 10,
    marginTop: 4,
    opacity: 0.9,
  },
  progressBar: {
    height: 8,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    borderRadius: 4,
  },
  progressFill: {
    height: 8,
    backgroundColor: "#FFFFFF",
    borderRadius: 4,
  },
  section: {
    paddingHorizontal: 20,
    marginTop: 24,
  },
  lastSection: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
  },
  seeAll: {
    fontSize: 14,
    fontWeight: "500",
  },
  quickActionsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginHorizontal: -6,
  },
  quickActionCard: {
    width: (width - 52) / 2,
    margin: 6,
  },
  quickActionGradient: {
    padding: 16,
    alignItems: "center",
    height: 100,
    justifyContent: "center",
  },
  quickActionTitle: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "600",
    marginTop: 8,
  },
  quickActionCount: {
    color: "#FFFFFF",
    fontSize: 11,
    opacity: 0.9,
    marginTop: 4,
  },
  examCard: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  examIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(111, 66, 193, 0.1)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  examDetails: {
    flex: 1,
  },
  examTitle: {
    fontSize: 15,
    fontWeight: "600",
    marginBottom: 4,
  },
  examDate: {
    fontSize: 13,
  },
  examDaysLeft: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  examDaysLeftText: {
    fontSize: 12,
    fontWeight: "600",
  },
  activityCard: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  activityIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  activityContent: {
    flex: 1,
  },
  activityTitle: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 2,
  },
  activitySubtitle: {
    fontSize: 12,
  },
  activityTime: {
    fontSize: 11,
  },
  tipCard: {
    margin: 20,
  },
  tipHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  tipTitle: {
    fontSize: 14,
    fontWeight: "600",
    marginLeft: 8,
  },
  tipText: {
    fontSize: 13,
    lineHeight: 20,
  },
});
