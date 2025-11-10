// src/navigation/AppTabNavigator.tsx
import React from "react";
import { Platform } from "react-native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTheme } from "@hooks/useTheme"; // 👈 import your theme hook

// Stacks
import { HomeNavigator } from "./stacks/HomeNavigator";
import { ResourcesNavigator } from "./stacks/ResourcesNavigator";
import { QuizNavigator } from "./stacks/QuizNavigator";
import { GroupsNavigator } from "./stacks/GroupsNavigator";
import { ProfileNavigator } from "./stacks/ProfileNavigator";

// Icons
import Icon from "react-native-vector-icons/Ionicons";

// Types
import { AppTabParamList } from "../types/navigation.types";

const Tab = createBottomTabNavigator<AppTabParamList>();

export const AppTabNavigator: React.FC = () => {
  const insets = useSafeAreaInsets();
  const theme = useTheme(); // 👈 get current theme

  const TAB_BAR_HEIGHT = Platform.OS === "ios" ? 49 : 56;

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          height: TAB_BAR_HEIGHT + insets.bottom,
          paddingBottom: insets.bottom > 0 ? insets.bottom - 5 : 5,

          // 👇 Dynamic theme colors
          backgroundColor: theme.colors.background,
          borderTopWidth: 1,
          borderTopColor: theme.colors.border,
          elevation: 8,
          shadowColor: "#000",
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.1,
          shadowRadius: 3,
        },
        // 👇 Dynamic tint colors
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: theme.colors.textSecondary,
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: "600",
          marginBottom: 2,
          color: theme.colors.text, // optional: ensures label color matches
        },
        tabBarIconStyle: {
          marginTop: 5,
        },
        tabBarHideOnKeyboard: Platform.OS === "android",
      }}
    >
      <Tab.Screen
        name="HomeTab"
        component={HomeNavigator}
        options={{
          tabBarLabel: "Home",
          tabBarIcon: ({ color, size, focused }) => (
            <Icon
              name={focused ? "home" : "home-outline"}
              size={size}
              color={color}
            />
          ),
        }}
      />
      <Tab.Screen
        name="ResourcesTab"
        component={ResourcesNavigator}
        options={{
          tabBarLabel: "Resources",
          tabBarIcon: ({ color, size, focused }) => (
            <Icon
              name={focused ? "book" : "book-outline"}
              size={size}
              color={color}
            />
          ),
        }}
      />
      <Tab.Screen
        name="QuizTab"
        component={QuizNavigator}
        options={{
          tabBarLabel: "Quiz",
          tabBarIcon: ({ color, size, focused }) => (
            <Icon
              name={focused ? "bulb" : "bulb-outline"}
              size={size}
              color={color}
            />
          ),
        }}
      />
      <Tab.Screen
        name="GroupsTab"
        component={GroupsNavigator}
        options={{
          tabBarLabel: "Groups",
          tabBarIcon: ({ color, size, focused }) => (
            <Icon
              name={focused ? "people" : "people-outline"}
              size={size}
              color={color}
            />
          ),
        }}
      />
      <Tab.Screen
        name="ProfileTab"
        component={ProfileNavigator}
        options={{
          tabBarLabel: "Profile",
          tabBarIcon: ({ color, size, focused }) => (
            <Icon
              name={focused ? "person" : "person-outline"}
              size={size}
              color={color}
            />
          ),
        }}
      />
    </Tab.Navigator>
  );
};
