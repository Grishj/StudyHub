// src/navigation/stacks/HomeNavigator.tsx
import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { HomeStackParamList } from "../../types/navigation.types";

// Placeholder imports - replace with actual screens
import { HomeScreen } from "../../screens/home/HomeScreen";
import NotificationsScreen from "../../screens/home/NotificationsScreen";
import SearchScreen from "../../screens/home/SearchScreen";

const Stack = createNativeStackNavigator<HomeStackParamList>();

export const HomeNavigator: React.FC = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        animation: "slide_from_right",
      }}
    >
      <Stack.Screen name="Home" component={HomeScreen} />
      <Stack.Screen
        name="Notifications"
        component={NotificationsScreen}
        options={{ animation: "slide_from_bottom" }}
      />
      <Stack.Screen
        name="Search"
        component={SearchScreen}
        options={{ animation: "fade" }}
      />
    </Stack.Navigator>
  );
};
