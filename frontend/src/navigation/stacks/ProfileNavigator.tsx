// src/navigation/stacks/ProfileNavigator.tsx
import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { ProfileStackParamList } from "../../types/navigation.types";

import {ProfileScreen} from "@/screens/profile/ProfileScreen";
import EditProfileScreen from "@screens/profile/EditProfileScreen";
import SettingsScreen from "@screens/profile/SettingsScreen";
import AchievementsScreen from "@screens/profile/AchievementsScreen";

const Stack = createNativeStackNavigator<ProfileStackParamList>();

export const ProfileNavigator: React.FC = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        animation: "slide_from_right",
      }}
    >
      <Stack.Screen name="Profile" component={ProfileScreen} />
      <Stack.Screen
        name="EditProfile"
        component={EditProfileScreen}
        options={{
          presentation: "modal",
          animation: "slide_from_bottom",
        }}
      />
      <Stack.Screen name="Settings" component={SettingsScreen} />
      <Stack.Screen name="Achievements" component={AchievementsScreen} />
      {/* <Stack.Screen name="MyResources" component={MyResourcesScreen} />
      <Stack.Screen name="MyQuizzes" component={MyQuizzesScreen} />
      <Stack.Screen name="MyGroups" component={MyGroupsScreen} />
      <Stack.Screen 
        name="Subscription" 
        component={SubscriptionScreen}
        options={{
          presentation: 'modal',
        }}
      />
      <Stack.Screen name="Help" component={HelpScreen} />
      <Stack.Screen name="About" component={AboutScreen} />
      <Stack.Screen name="PrivacyPolicy" component={PrivacyPolicyScreen} />
      <Stack.Screen name="TermsOfService" component={TermsOfServiceScreen} /> */}
    </Stack.Navigator>
  );
};
