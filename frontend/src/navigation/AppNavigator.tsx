import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { useAppSelector } from '@store/hooks';
import { AuthNavigator } from './AuthNavigator';
// Import MainNavigator when ready
// import { MainNavigator } from './MainNavigator';

export const AppNavigator: React.FC = () => {
  const { isAuthenticated } = useAppSelector((state) => state.auth);

  return (
    <NavigationContainer>
      {isAuthenticated ? (
        // <MainNavigator /> // Will be created later
        <AuthNavigator /> // Temporary
      ) : (
        <AuthNavigator />
      )}
    </NavigationContainer>
  );
};