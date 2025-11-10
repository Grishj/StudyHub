export interface UpdateProfileDTO {
  fullName?: string;
  bio?: string;
  phone?: string;
  dateOfBirth?: string;
  address?: string;
  targetExam?: string;
}

export interface UpdateAvatarDTO {
  avatar: string;
}

export interface UserStatsResponse {
  content: {
    notes: number;
    questions: number;
    totalUpvotes: number;
  };
  activity: {
    quizAttempts: number;
    averageQuizScore: number;
    bestQuizScore: number;
    bookmarks: number;
    groups: number;
  };
  achievements: {
    unlocked: number;
    points: number;
    streak: number;
  };
}

export interface ChangePasswordDTO {
  currentPassword: string;
  newPassword: string;
}

export interface DeleteAccountDTO {
  password: string;
}
