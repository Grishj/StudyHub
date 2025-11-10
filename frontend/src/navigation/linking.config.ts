// src/navigation/linking.config.ts

import { LinkingOptions } from "@react-navigation/native";
import { RootStackParamList } from "../types/navigation.types";

export const linking: LinkingOptions<RootStackParamList> = {
  prefixes: ["myapp://", "https://myapp.com"],
  config: {
    screens: {
      Auth: {
        screens: {
          Login: "login",
          Register: "register",
          ForgotPassword: "forgot-password",
        },
      },
      Main: {
        screens: {
          HomeTab: {
            screens: {
              Home: "home",
              Notifications: "notifications",
              Search: "search",
            },
          },
          ResourcesTab: {
            screens: {
              ResourcesList: "resources",
              ResourceDetail: "resources/:resourceId",
              UploadResource: "resources/upload",
            },
          },
          QuizTab: {
            screens: {
              QuizList: "quiz",
              QuizDetail: "quiz/:quizId",
              QuizPlay: "quiz/:quizId/play",
              QuizResult: "quiz/:quizId/result",
            },
          },
          GroupsTab: {
            screens: {
              GroupsList: "groups",
              GroupDetail: "groups/:groupId",
              GroupChat: "groups/:groupId/chat",
              CreateGroup: "groups/create",
            },
          },
          ProfileTab: {
            screens: {
              Profile: "profile",
              EditProfile: "profile/edit",
              Settings: "settings",
              Achievements: "achievements",
            },
          },
        },
      },
    },
  },
};
