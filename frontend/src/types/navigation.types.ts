// src/types/navigation.types.ts
import { NavigatorScreenParams } from "@react-navigation/native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { BottomTabScreenProps } from "@react-navigation/bottom-tabs";
import { CompositeScreenProps } from "@react-navigation/native";
import { StudyGroup } from "@/screens/groups/GroupsScreen";

// ============================================
// ROOT NAVIGATION
// ============================================
export type RootStackParamList = {
  Auth: NavigatorScreenParams<AuthStackParamList>;
  Main: NavigatorScreenParams<AppTabParamList>;
};

// ============================================
// AUTH NAVIGATION
// ============================================
export type AuthStackParamList = {
  Onboarding: undefined;
  Login: undefined;
  Register: undefined;
  ForgotPassword: undefined;
  VerifyOTP?: { email: string };
  ResetPassword?: { email: string; otp: string };
};

// ============================================
// BOTTOM TAB NAVIGATION
// ============================================
export type AppTabParamList = {
  HomeTab: NavigatorScreenParams<HomeStackParamList>;
  ResourcesTab: NavigatorScreenParams<ResourcesStackParamList>;
  QuizTab: NavigatorScreenParams<QuizStackParamList>;
  GroupsTab: NavigatorScreenParams<GroupsStackParamList>;
  ProfileTab: NavigatorScreenParams<ProfileStackParamList>;
};

// ============================================
// HOME STACK
// ============================================
export type HomeStackParamList = {
  Home: undefined;
  Notifications: undefined;
  Search: { initialQuery?: string };
};

// ============================================
// RESOURCES STACK
// ============================================
export type ResourcesStackParamList = {
  ResourcesList: undefined;
  ResourceDetail: { resourceId: string };
  UploadResource: undefined;
  EditResource?: { resourceId: string };
  ResourceViewer?: { resourceId: string; resourceUrl: string };
  ResourceComments?: { resourceId: string };
};

// ============================================
// QUIZ STACK
// ============================================
export type QuizStackParamList = {
  QuizList: undefined;
  QuizDetail: { quizId: string };
  QuizPlay: { quizId: string };
  QuizResult: { quizId: string; score: number; totalQuestions: number };
  CreateQuiz?: undefined;
};

// ============================================
// GROUPS STACK
// ============================================
export type GroupsStackParamList = {
  GroupsList: undefined;
    GroupDetail: {
    groupId: string;
    groupData?: StudyGroup; // Add this optional parameter
  };
  CreateGroup: undefined;
  GroupChat: { groupId: string; groupName: string };
  EditGroup?: { groupId: string };
};

// ============================================
// PROFILE STACK
// ============================================
export type ProfileStackParamList = {
  Profile: undefined;
  EditProfile: undefined;
  Settings: undefined;
  Achievements: undefined;
  MyResources?: undefined;
  MyQuizzes?: undefined;
  MyGroups?: undefined;
  HelpSupport?: undefined;
  About?: undefined;
};

// ============================================
// SCREEN PROPS TYPES
// ============================================

// Root Stack Screen Props
export type RootStackScreenProps<T extends keyof RootStackParamList> =
  NativeStackScreenProps<RootStackParamList, T>;

// Auth Stack Screen Props
export type AuthStackScreenProps<T extends keyof AuthStackParamList> =
  NativeStackScreenProps<AuthStackParamList, T>;

// Tab Screen Props
export type AppTabScreenProps<T extends keyof AppTabParamList> =
  BottomTabScreenProps<AppTabParamList, T>;

// Home Stack Screen Props
export type HomeStackScreenProps<T extends keyof HomeStackParamList> =
  CompositeScreenProps<
    NativeStackScreenProps<HomeStackParamList, T>,
    CompositeScreenProps<
      BottomTabScreenProps<AppTabParamList>,
      NativeStackScreenProps<RootStackParamList>
    >
  >;

// Resources Stack Screen Props
export type ResourcesStackScreenProps<T extends keyof ResourcesStackParamList> =
  CompositeScreenProps<
    NativeStackScreenProps<ResourcesStackParamList, T>,
    CompositeScreenProps<
      BottomTabScreenProps<AppTabParamList>,
      NativeStackScreenProps<RootStackParamList>
    >
  >;

// Quiz Stack Screen Props
export type QuizStackScreenProps<T extends keyof QuizStackParamList> =
  CompositeScreenProps<
    NativeStackScreenProps<QuizStackParamList, T>,
    CompositeScreenProps<
      BottomTabScreenProps<AppTabParamList>,
      NativeStackScreenProps<RootStackParamList>
    >
  >;

// Groups Stack Screen Props
export type GroupsStackScreenProps<T extends keyof GroupsStackParamList> =
  CompositeScreenProps<
    NativeStackScreenProps<GroupsStackParamList, T>,
    CompositeScreenProps<
      BottomTabScreenProps<AppTabParamList>,
      NativeStackScreenProps<RootStackParamList>
    >
  >;

// Profile Stack Screen Props
export type ProfileStackScreenProps<T extends keyof ProfileStackParamList> =
  CompositeScreenProps<
    NativeStackScreenProps<ProfileStackParamList, T>,
    CompositeScreenProps<
      BottomTabScreenProps<AppTabParamList>,
      NativeStackScreenProps<RootStackParamList>
    >
  >;

// ============================================
// NAVIGATION PROP TYPES (for useNavigation hook)
// ============================================
declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}
