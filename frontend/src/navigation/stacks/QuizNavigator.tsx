// src/navigation/stacks/QuizNavigator.tsx
import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { QuizStackParamList } from "../../types/navigation.types";

import QuizListScreen from "@screens/quiz/QuizListScreen";
import QuizDetailScreen from "@screens/quiz/QuizDetailScreen";
import QuizPlayScreen from "@screens/quiz/QuizPlayScreen";
import QuizResultScreen from "@screens/quiz/QuizResultScreen";

const Stack = createNativeStackNavigator<QuizStackParamList>();

export const QuizNavigator: React.FC = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        animation: "slide_from_right",
      }}
    >
      <Stack.Screen name="QuizList" component={QuizListScreen} />
      <Stack.Screen name="QuizDetail" component={QuizDetailScreen} />
      <Stack.Screen
        name="QuizPlay"
        component={QuizPlayScreen}
        options={{
          presentation: "fullScreenModal",
          animation: "slide_from_bottom",

          gestureEnabled: false,
        }}
      />
      <Stack.Screen
        name="QuizResult"
        component={QuizResultScreen}
        options={{
          gestureEnabled: false,
        }}
      />
       {/* <Stack.Screen name="QuizReview" component={QuizReviewScreen} />
      <Stack.Screen 
        name="Leaderboard" 
        component={LeaderboardScreen}
        options={{
          presentation: 'modal',
        }}
      />
      <Stack.Screen name="QuizHistory" component={QuizHistoryScreen} /> */}
    </Stack.Navigator>
  );
};
