// Update AppNavigator.tsx to use navigation ref:

import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { MainNavigator } from "./MainNavigator";
import { navigationRef } from "@utils/navigation.utils";

export const AppNavigator: React.FC = () => {
  return (
    <SafeAreaProvider>
      <NavigationContainer ref={navigationRef}>
        <MainNavigator />
      </NavigationContainer>
    </SafeAreaProvider>
  );
};
