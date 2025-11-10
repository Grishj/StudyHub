// src/utils/navigation.helpers.ts

import { NavigationProp } from '@react-navigation/native';

export const navigateToTab = (
  navigation: NavigationProp<any>,
  tabName: string,
  screenName?: string,
  params?: any
) => {
  if (screenName) {
    navigation.navigate(tabName, { screen: screenName, params });
  } else {
    navigation.navigate(tabName);
  }
};

export const resetToScreen = (
  navigation: NavigationProp<any>,
  screenName: string,
  params?: any
) => {
  navigation.reset({
    index: 0,
    routes: [{ name: screenName, params }],
  });
};
