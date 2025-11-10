// src/navigation/stacks/ResourcesNavigator.tsx
import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { ResourcesStackParamList } from "../../types/navigation.types";

// Import Screens
import ResourcesScreen from "../../screens/resources/ResourcesScreen";
import ResourceDetailScreen from "../../screens/resources/ResourceDetailScreen";
import UploadResourceScreen from "../../screens/resources/UploadResourceScreen";
import EditResourceScreen from "../../screens/resources/EditResourceScreen";
import ResourceViewerScreen from "../../screens/resources/ResourceViewerScreen";
import ResourceCommentsScreen from "../../screens/resources/ResourceCommentsScreen ";

const Stack = createNativeStackNavigator<ResourcesStackParamList>();

export const ResourcesNavigator: React.FC = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        animation: "slide_from_right",
      }}
    >
      <Stack.Screen name="ResourcesList" component={ResourcesScreen} />
      <Stack.Screen
        name="ResourceDetail"
        component={ResourceDetailScreen}
        options={{
          animation: "slide_from_bottom",
        }}
      />
      <Stack.Screen
        name="UploadResource"
        component={UploadResourceScreen}
        options={{
          presentation: "modal",
          animation: "slide_from_bottom",
        }}
      />
      <Stack.Screen name="EditResource" component={EditResourceScreen} />
      <Stack.Screen
        name="ResourceViewer"
        component={ResourceViewerScreen}
        options={{
          presentation: "fullScreenModal",
        }}
      />
      <Stack.Screen
        name="ResourceComments"
        component={ResourceCommentsScreen}
        options={{
          presentation: "modal",
        }}
      />
    </Stack.Navigator>
  );
};
