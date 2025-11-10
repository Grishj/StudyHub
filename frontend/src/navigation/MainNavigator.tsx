// src/navigation/MainNavigator.tsx
import React, { useEffect, useState } from "react";
import { View, ActivityIndicator } from "react-native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { useAppSelector, useAppDispatch } from "@store/hooks";
import AsyncStorage from "@react-native-async-storage/async-storage";

// Import Navigators
import { AuthNavigator } from "./AuthNavigator";
import { AppTabNavigator } from "./AppTabNavigator";

// Types
import { RootStackParamList } from "../types/navigation.types";

const Stack = createNativeStackNavigator<RootStackParamList>();

export const MainNavigator: React.FC = () => {
  const dispatch = useAppDispatch();
  const { isAuthenticated } = useAppSelector((state) => state.auth);
  const [isLoading, setIsLoading] = useState(true);
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState(false);

  useEffect(() => {
    checkInitialState();
  }, []);

  const checkInitialState = async () => {
    try {
      // Check if user has completed onboarding
      const onboardingCompleted = await AsyncStorage.getItem(
        "onboardingCompleted"
      );
      setHasCompletedOnboarding(onboardingCompleted === "true");

      // Check auth state (handled by authSlice initialization)
      // This is where you'd restore auth from AsyncStorage if needed
    } catch (error) {
      console.error("Error checking initial state:", error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {!isAuthenticated ? (
        <Stack.Screen name="Auth" component={AuthNavigator} />
      ) : (
        <Stack.Screen name="Main" component={AppTabNavigator} />
      )}
    </Stack.Navigator>
  );
};
