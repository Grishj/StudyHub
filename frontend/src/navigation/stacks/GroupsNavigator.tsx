// src/navigation/stacks/GroupsNavigator.tsx
import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { GroupsStackParamList } from "../../types/navigation.types";

import GroupsScreen from "../../screens/groups/GroupsScreen";
import GroupDetailScreen from "../../screens/groups/GroupDetailScreen";
import CreateGroupScreen from "../../screens/groups/CreateGroupScreen";
import GroupChatScreen from "../../screens/groups/GroupChatScreen";

const Stack = createNativeStackNavigator<GroupsStackParamList>();

export const GroupsNavigator: React.FC = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        animation: "slide_from_right",
      }}
    >
      <Stack.Screen name="GroupsList" component={GroupsScreen} />
      <Stack.Screen name="GroupDetail" component={GroupDetailScreen} />
      <Stack.Screen
        name="CreateGroup"
        component={CreateGroupScreen}
        options={{
          presentation: "modal",
          animation: "slide_from_bottom",
        }}
      />
      <Stack.Screen name="GroupChat" component={GroupChatScreen} />
      {/* <Stack.Screen name="EditGroup" component={EditGroupScreen} />
      
      <Stack.Screen 
        name="StudySession" 
        component={StudySessionScreen}
        options={{
          presentation: 'fullScreenModal',
          gestureEnabled: false,
        }}
      />
      <Stack.Screen 
        name="GroupMembers" 
        component={GroupMembersScreen}
        options={{
          presentation: 'modal',
        }}
      />
      <Stack.Screen name="GroupSettings" component={GroupSettingsScreen} /> */}
    </Stack.Navigator>
  );
};
