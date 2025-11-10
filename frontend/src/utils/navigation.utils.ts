// src/utils/navigation.utils.ts
import { CommonActions, StackActions } from '@react-navigation/native';
import { NavigationContainerRef } from '@react-navigation/native';
import { RootStackParamList } from '../types/navigation.types';
import React from 'react';

// Navigation ref for navigating without navigation prop
export const navigationRef = React.createRef<NavigationContainerRef<RootStackParamList>>();

export const NavigationService = {
  navigate: (name: string, params?: any) => {
    navigationRef.current?.navigate(name, params);
  },

  goBack: () => {
    navigationRef.current?.goBack();
  },

  reset: (routeName: string) => {
    navigationRef.current?.dispatch(
      CommonActions.reset({
        index: 0,
        routes: [{ name: routeName }],
      })
    );
  },

  replace: (routeName: string, params?: any) => {
    navigationRef.current?.dispatch(StackActions.replace(routeName, params));
  },

  push: (routeName: string, params?: any) => {
    navigationRef.current?.dispatch(StackActions.push(routeName, params));
  },

  pop: (count: number = 1) => {
    navigationRef.current?.dispatch(StackActions.pop(count));
  },

  popToTop: () => {
    navigationRef.current?.dispatch(StackActions.popToTop());
  },
};
