import prisma from "@/config/database";
import { UpdateProfileDTO } from "@/types/profile.types";
import { hashPassword, comparePassword } from "@/utils/hash.util";
import { PaginatedResponse } from "@/types/common.types";

export class ProfileService {
  /**
   * Get full user profile (private - own profile)
   */
  async getProfile(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        fullName: true,
        email: true,
        avatar: true,
        bio: true,
        isEmailVerified: true,
        createdAt: true,
        updatedAt: true,
        lastLogin: true,
        profile: {
          select: {
            phone: true,
            dateOfBirth: true,
            address: true,
            targetExam: true,
            points: true,
            streak: true,
            lastActiveDate: true,
          },
        },
      },
    });

    if (!user) {
      throw new Error("User not found");
    }

    return user;
  }

  /**
   * Get public profile (for viewing other users)
   */
  async getPublicProfile(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        fullName: true,
        avatar: true,
        bio: true,
        createdAt: true,
        profile: {
          select: {
            targetExam: true,
            points: true,
            streak: true,
          },
        },
        _count: {
          select: {
            notes: true,
            questions: true,
            quizAttempts: true,
          },
        },
      },
    });

    if (!user) {
      throw new Error("User not found");
    }

    return user;
  }

  /**
   * Update user profile
   */
  async updateProfile(userId: string, data: UpdateProfileDTO) {
    const { fullName, bio, phone, dateOfBirth, address, targetExam } = data;

    const updateData: any = {};
    if (fullName !== undefined) updateData.fullName = fullName;
    if (bio !== undefined) updateData.bio = bio;

    const user = await prisma.user.update({
      where: { id: userId },
      data: {
        ...updateData,
        profile: {
          update: {
            phone: phone || undefined,
            dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : undefined,
            address: address || undefined,
            targetExam: targetExam || undefined,
          },
        },
      },
      select: {
        id: true,
        fullName: true,
        email: true,
        avatar: true,
        bio: true,
        profile: {
          select: {
            phone: true,
            dateOfBirth: true,
            address: true,
            targetExam: true,
            points: true,
            streak: true,
          },
        },
      },
    });

    return user;
  }

  /**
   * Update avatar
   */
  async updateAvatar(userId: string, avatarUrl: string) {
    const user = await prisma.user.update({
      where: { id: userId },
      data: { avatar: avatarUrl },
      select: {
        id: true,
        fullName: true,
        email: true,
        avatar: true,
      },
    });

    return user;
  }

  /**
   * Get user statistics
   */
  async getUserStats(userId: string) {
    const [
      notesCount,
      questionsCount,
      quizAttempts,
      bookmarksCount,
      achievements,
      groupsCount,
      totalUpvotes,
    ] = await Promise.all([
      prisma.note.count({ where: { userId } }),
      prisma.question.count({ where: { userId } }),
      prisma.quizAttempt.count({ where: { userId } }),
      prisma.bookmark.count({ where: { userId } }),
      prisma.userAchievement.count({ where: { userId } }),
      prisma.groupMember.count({ where: { userId } }),
      this.getTotalUpvotes(userId),
    ]);

    const profile = await prisma.profile.findUnique({
      where: { userId },
      select: {
        points: true,
        streak: true,
      },
    });

    // Get quiz statistics
    const quizStats = await prisma.quizAttempt.aggregate({
      where: { userId },
      _avg: {
        score: true,
      },
      _max: {
        score: true,
      },
    });

    return {
      content: {
        notes: notesCount,
        questions: questionsCount,
        totalUpvotes,
      },
      activity: {
        quizAttempts,
        averageQuizScore: Math.round(quizStats._avg.score || 0),
        bestQuizScore: quizStats._max.score || 0,
        bookmarks: bookmarksCount,
        groups: groupsCount,
      },
      achievements: {
        unlocked: achievements,
        points: profile?.points || 0,
        streak: profile?.streak || 0,
      },
    };
  }

  /**
   * Get total upvotes for user's content
   */
  private async getTotalUpvotes(userId: string) {
    const [notesUpvotes, questionsUpvotes] = await Promise.all([
      prisma.note.aggregate({
        where: { userId },
        _sum: {
          upvotes: true,
        },
      }),
      prisma.question.aggregate({
        where: { userId },
        _sum: {
          upvotes: true,
        },
      }),
    ]);

    return (
      (notesUpvotes._sum.upvotes || 0) + (questionsUpvotes._sum.upvotes || 0)
    );
  }

  /**
   * Get user achievements
   */
  async getAchievements(userId: string) {
    const userAchievements = await prisma.userAchievement.findMany({
      where: { userId },
      include: {
        achievement: true,
      },
      orderBy: {
        unlockedAt: "desc",
      },
    });

    // Get all achievements to show locked ones too
    const allAchievements = await prisma.achievement.findMany({
      orderBy: {
        points: "asc",
      },
    });

    const unlockedIds = new Set(userAchievements.map((ua) => ua.achievementId));

    return {
      unlocked: userAchievements.map((ua) => ({
        ...ua.achievement,
        unlockedAt: ua.unlockedAt,
      })),
      locked: allAchievements
        .filter((a) => !unlockedIds.has(a.id))
        .map((a) => ({
          id: a.id,
          name: a.name,
          description: a.description,
          icon: a.icon,
          points: a.points,
          criteria: a.criteria,
        })),
      total: allAchievements.length,
      unlockedCount: userAchievements.length,
    };
  }

  /**
   * Get user progress
   */
  async getUserProgress(userId: string) {
    const progress = await prisma.userProgress.findMany({
      where: { userId },
      orderBy: {
        lastStudied: "desc",
      },
    });

    return progress;
  }

  /**
   * Update progress for a topic
   */
  async updateProgress(userId: string, topic: string, progressValue: number) {
    if (progressValue < 0 || progressValue > 100) {
      throw new Error("Progress must be between 0 and 100");
    }

    const progress = await prisma.userProgress.upsert({
      where: {
        userId_topic: {
          userId,
          topic,
        },
      },
      update: {
        progress: progressValue,
        lastStudied: new Date(),
      },
      create: {
        userId,
        topic,
        progress: progressValue,
      },
    });

    return progress;
  }

  /**
   * Get user's content (notes, questions)
   */
  async getUserContent(
    userId: string,
    type: string,
    page = 1,
    limit = 10
  ): Promise<PaginatedResponse<any>> {
    const skip = (page - 1) * limit;

    if (type === "notes") {
      const [notes, total] = await Promise.all([
        prisma.note.findMany({
          where: { userId },
          skip,
          take: limit,
          orderBy: {
            createdAt: "desc",
          },
          include: {
            category: {
              select: {
                id: true,
                name: true,
              },
            },
            _count: {
              select: {
                comments: true,
                bookmarks: true,
              },
            },
          },
        }),
        prisma.note.count({ where: { userId } }),
      ]);

      return {
        data: notes,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      };
    } else if (type === "questions") {
      const [questions, total] = await Promise.all([
        prisma.question.findMany({
          where: { userId },
          skip,
          take: limit,
          orderBy: {
            createdAt: "desc",
          },
          include: {
            category: {
              select: {
                id: true,
                name: true,
              },
            },
            _count: {
              select: {
                comments: true,
                bookmarks: true,
              },
            },
          },
        }),
        prisma.question.count({ where: { userId } }),
      ]);

      return {
        data: questions,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      };
    }

    throw new Error('Invalid content type. Use "notes" or "questions"');
  }

  /**
   * Get user's bookmarks
   */
  async getBookmarks(
    userId: string,
    type: string,
    page = 1,
    limit = 10
  ): Promise<PaginatedResponse<any>> {
    const skip = (page - 1) * limit;

    const where: any = { userId };

    if (type === "notes") {
      where.noteId = { not: null };
    } else if (type === "questions") {
      where.questionId = { not: null };
    }

    const [bookmarks, total] = await Promise.all([
      prisma.bookmark.findMany({
        where,
        skip,
        take: limit,
        orderBy: {
          createdAt: "desc",
        },
        include: {
          note: {
            include: {
              user: {
                select: {
                  id: true,
                  fullName: true,
                  avatar: true,
                },
              },
              category: {
                select: {
                  id: true,
                  name: true,
                },
              },
            },
          },
          question: {
            include: {
              user: {
                select: {
                  id: true,
                  fullName: true,
                  avatar: true,
                },
              },
              category: {
                select: {
                  id: true,
                  name: true,
                },
              },
            },
          },
        },
      }),
      prisma.bookmark.count({ where }),
    ]);

    return {
      data: bookmarks,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Change password
   */
  async changePassword(
    userId: string,
    currentPassword: string,
    newPassword: string
  ) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        password: true,
      },
    });

    if (!user) {
      throw new Error("User not found");
    }

    // Verify current password
    const isPasswordValid = await comparePassword(
      currentPassword,
      user.password
    );

    if (!isPasswordValid) {
      throw new Error("Current password is incorrect");
    }

    // Hash new password
    const hashedPassword = await hashPassword(newPassword);

    // Update password
    await prisma.user.update({
      where: { id: userId },
      data: {
        password: hashedPassword,
      },
    });
  }

  /**
   * Update user settings/preferences
   */
  async updateSettings(userId: string, settings: any) {
    // You can extend the User or Profile model to include settings
    // For now, we'll store in profile or create a separate Settings model

    // This is a placeholder - extend based on your needs
    const user = await prisma.user.update({
      where: { id: userId },
      data: {
        // Add settings fields as needed
        updatedAt: new Date(),
      },
      select: {
        id: true,
        fullName: true,
        email: true,
      },
    });

    return user;
  }

  /**
   * Delete user account
   */
  async deleteAccount(userId: string, password: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        password: true,
      },
    });

    if (!user) {
      throw new Error("User not found");
    }

    // Verify password
    const isPasswordValid = await comparePassword(password, user.password);

    if (!isPasswordValid) {
      throw new Error("Password is incorrect");
    }

    // Delete user (cascade will delete related data)
    await prisma.user.delete({
      where: { id: userId },
    });
  }
}
