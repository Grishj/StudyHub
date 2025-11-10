// src/screens/quiz/QuizScreen.tsx
import React from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
} from "react-native";
import { QuizStackScreenProps } from "../../types/navigation.types";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTheme } from "@hooks/useTheme";

type Props = QuizStackScreenProps<"QuizList">;

const QuizScreen: React.FC<Props> = ({ navigation }) => {
  const theme = useTheme();

  const mockQuizzes = [
    {
      id: "1",
      title: "Kerala PSC General Knowledge",
      questions: 25,
      time: "20 min",
    },
    {
      id: "2",
      title: "Indian Constitution Quiz",
      questions: 30,
      time: "25 min",
    },
    { id: "3", title: "Current Affairs 2024", questions: 20, time: "15 min" },
  ];

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      edges={["top"]}
    >
      <View style={styles.header}>
        <Text style={[styles.title, { color: theme.colors.text }]}>
          Mock Tests
        </Text>
        <TouchableOpacity
          style={[
            styles.newQuizButton,
            { backgroundColor: theme.colors.primary },
          ]}
          onPress={() => navigation.navigate("CreateQuiz")}
        >
          <Text style={styles.newQuizButtonText}>+ New</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={mockQuizzes}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[
              styles.quizCard,
              { backgroundColor: theme.colors.backgroundSecondary },
            ]}
            onPress={() =>
              navigation.navigate("QuizDetail", { quizId: item.id })
            }
          >
            <Text style={[styles.quizTitle, { color: theme.colors.text }]}>
              {item.title}
            </Text>
            <View style={styles.quizMeta}>
              <Text
                style={[styles.metaText, { color: theme.colors.textSecondary }]}
              >
                {item.questions} Qs
              </Text>
              <Text
                style={[styles.metaText, { color: theme.colors.textSecondary }]}
              >
                {item.time}
              </Text>
            </View>
          </TouchableOpacity>
        )}
      />
    </SafeAreaView>
  );
};

export default QuizScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
  },
  newQuizButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  newQuizButtonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "600",
  },
  list: {
    padding: 16,
  },
  quizCard: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  quizTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 8,
  },
  quizMeta: {
    flexDirection: "row",
    gap: 12,
  },
  metaText: {
    fontSize: 12,
  },
});
