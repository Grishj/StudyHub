import prisma from "@/config/database";
import {
  CreateQuizDTO,
  UpdateQuizDTO,
  SubmitQuizDTO,
  QuizFilters,
} from "@/types/quiz.types";
import { PaginatedResponse } from "@/types/common.types";

export class QuizService {
  /**
   * Create a new quiz with questions
   */
  async createQuiz(data: CreateQuizDTO) {
    const quiz = await prisma.quiz.create({
      data: {
        categoryId: data.categoryId,
        title: data.title,
        description: data.description,
        difficulty: data.difficulty || "medium",
        timeLimit: data.timeLimit,
        isDaily: data.isDaily || false,
        questions: {
          create: data.questions.map((q, index) => ({
            question: q.question,
            options: q.options,
            correctAnswer: q.correctAnswer,
            explanation: q.explanation,
            points: q.points || 1,
            order: q.order !== undefined ? q.order : index,
          })),
        },
      },
      include: {
        category: {
          select: {
            id: true,
            name: true,
          },
        },
        questions: {
          orderBy: {
            order: "asc",
          },
        },
        _count: {
          select: {
            attempts: true,
          },
        },
      },
    });

    return quiz;
  }

  /**
   * Get all quizzes with filters and pagination
   */
  async getQuizzes(filters: QuizFilters): Promise<PaginatedResponse<any>> {
    const page = filters.page || 1;
    const limit = filters.limit || 10;
    const skip = (page - 1) * limit;

    const where: any = {
      isPublished: true,
    };

    if (filters.categoryId) {
      where.categoryId = filters.categoryId;
    }

    if (filters.difficulty) {
      where.difficulty = filters.difficulty;
    }

    if (filters.isDaily !== undefined) {
      where.isDaily = filters.isDaily;
    }

    const [quizzes, total] = await Promise.all([
      prisma.quiz.findMany({
        where,
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
              icon: true,
            },
          },
          _count: {
            select: {
              questions: true,
              attempts: true,
            },
          },
        },
      }),
      prisma.quiz.count({ where }),
    ]);

    return {
      data: quizzes,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Get quiz by ID (for starting a quiz)
   */
  async getQuizById(quizId: string, userId?: string) {
    const quiz = await prisma.quiz.findUnique({
      where: { id: quizId },
      include: {
        category: {
          select: {
            id: true,
            name: true,
            description: true,
          },
        },
        questions: {
          select: {
            id: true,
            question: true,
            options: true,
            points: true,
            order: true,
            // Don't include correctAnswer and explanation until quiz is submitted
          },
          orderBy: {
            order: "asc",
          },
        },
        _count: {
          select: {
            attempts: true,
          },
        },
      },
    });

    if (!quiz) {
      throw new Error("Quiz not found");
    }

    if (!quiz.isPublished) {
      throw new Error("Quiz is not available");
    }

    // Get user's previous attempts
    let userAttempts = null;
    if (userId) {
      const attempts = await prisma.quizAttempt.findMany({
        where: {
          userId,
          quizId,
        },
        orderBy: {
          completedAt: "desc",
        },
        take: 5,
        select: {
          id: true,
          score: true,
          correctAnswers: true,
          totalQuestions: true,
          timeTaken: true,
          completedAt: true,
        },
      });

      userAttempts = {
        count: attempts.length,
        bestScore:
          attempts.length > 0 ? Math.max(...attempts.map((a) => a.score)) : 0,
        recentAttempts: attempts,
      };
    }

    return {
      ...quiz,
      userAttempts,
    };
  }

  /**
   * Submit quiz answers and calculate score
   */
  async submitQuiz(quizId: string, userId: string, data: SubmitQuizDTO) {
    const quiz = await prisma.quiz.findUnique({
      where: { id: quizId },
      include: {
        questions: true,
      },
    });

    if (!quiz) {
      throw new Error("Quiz not found");
    }

    // Calculate score
    let correctAnswers = 0;
    let totalPoints = 0;
    let earnedPoints = 0;

    const results = data.answers.map((userAnswer) => {
      const question = quiz.questions.find(
        (q) => q.id === userAnswer.questionId
      );

      if (!question) {
        throw new Error(`Question ${userAnswer.questionId} not found`);
      }

      const isCorrect = question.correctAnswer === userAnswer.answer;
      totalPoints += question.points;

      if (isCorrect) {
        correctAnswers++;
        earnedPoints += question.points;
      }

      return {
        questionId: question.id,
        question: question.question,
        userAnswer: userAnswer.answer,
        correctAnswer: question.correctAnswer,
        isCorrect,
        explanation: question.explanation,
        points: question.points,
        earnedPoints: isCorrect ? question.points : 0,
      };
    });

    const score =
      totalPoints > 0 ? Math.round((earnedPoints / totalPoints) * 100) : 0;

    // Save quiz attempt
    const attempt = await prisma.quizAttempt.create({
      data: {
        userId,
        quizId,
        score,
        totalQuestions: quiz.questions.length,
        correctAnswers,
        timeTaken: data.timeTaken,
        answers: data.answers,
      },
    });

    // Update user points and check for achievements
    await this.updateUserPointsAndProgress(userId, earnedPoints, score);

    return {
      attemptId: attempt.id,
      score,
      correctAnswers,
      totalQuestions: quiz.questions.length,
      earnedPoints,
      totalPoints,
      timeTaken: data.timeTaken,
      results,
      passed: score >= 60, // 60% passing grade
    };
  }

  /**
   * Get quiz result details
   */
  async getQuizResult(attemptId: string, userId: string) {
    const attempt = await prisma.quizAttempt.findUnique({
      where: { id: attemptId },
      include: {
        quiz: {
          include: {
            questions: true,
            category: true,
          },
        },
      },
    });

    if (!attempt) {
      throw new Error("Quiz attempt not found");
    }

    if (attempt.userId !== userId) {
      throw new Error("You are not authorized to view this result");
    }

    // Reconstruct detailed results
    const results = (attempt.answers as any[]).map((userAnswer: any) => {
      const question = attempt.quiz.questions.find(
        (q) => q.id === userAnswer.questionId
      );

      return {
        questionId: question?.id,
        question: question?.question,
        options: question?.options,
        userAnswer: userAnswer.answer,
        correctAnswer: question?.correctAnswer,
        isCorrect: question?.correctAnswer === userAnswer.answer,
        explanation: question?.explanation,
        points: question?.points,
      };
    });

    return {
      id: attempt.id,
      quiz: {
        id: attempt.quiz.id,
        title: attempt.quiz.title,
        description: attempt.quiz.description,
        category: attempt.quiz.category,
      },
      score: attempt.score,
      correctAnswers: attempt.correctAnswers,
      totalQuestions: attempt.totalQuestions,
      timeTaken: attempt.timeTaken,
      completedAt: attempt.completedAt,
      passed: attempt.score >= 60,
      results,
    };
  }

  /**
   * Get user's quiz history
   */
  async getUserQuizHistory(userId: string, page = 1, limit = 10) {
    const skip = (page - 1) * limit;

    const [attempts, total] = await Promise.all([
      prisma.quizAttempt.findMany({
        where: { userId },
        skip,
        take: limit,
        orderBy: {
          completedAt: "desc",
        },
        include: {
          quiz: {
            select: {
              id: true,
              title: true,
              difficulty: true,
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
      prisma.quizAttempt.count({ where: { userId } }),
    ]);

    return {
      data: attempts,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Get daily quiz
   */
  async getDailyQuiz() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const dailyQuiz = await prisma.quiz.findFirst({
      where: {
        isDaily: true,
        isPublished: true,
        date: {
          gte: today,
          lt: tomorrow,
        },
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
            questions: true,
            attempts: true,
          },
        },
      },
    });

    return dailyQuiz;
  }

  /**
   * Get quiz leaderboard
   */
  async getQuizLeaderboard(quizId: string, limit = 10) {
    const topAttempts = await prisma.quizAttempt.findMany({
      where: { quizId },
      orderBy: [{ score: "desc" }, { timeTaken: "asc" }],
      take: limit,
      distinct: ["userId"],
      include: {
        user: {
          select: {
            id: true,
            fullName: true,
            avatar: true,
          },
        },
      },
    });

    return topAttempts.map((attempt, index) => ({
      rank: index + 1,
      user: attempt.user,
      score: attempt.score,
      correctAnswers: attempt.correctAnswers,
      totalQuestions: attempt.totalQuestions,
      timeTaken: attempt.timeTaken,
      completedAt: attempt.completedAt,
    }));
  }

  /**
   * Get global leaderboard (all quizzes)
   */
  async getGlobalLeaderboard(limit = 10) {
    const users = await prisma.user.findMany({
      take: limit,
      orderBy: {
        profile: {
          points: "desc",
        },
      },
      select: {
        id: true,
        fullName: true,
        avatar: true,
        profile: {
          select: {
            points: true,
            streak: true,
          },
        },
        _count: {
          select: {
            quizAttempts: true,
          },
        },
      },
    });

    return users.map((user, index) => ({
      rank: index + 1,
      user: {
        id: user.id,
        fullName: user.fullName,
        avatar: user.avatar,
      },
      points: user.profile?.points || 0,
      streak: user.profile?.streak || 0,
      quizzesTaken: user._count.quizAttempts,
    }));
  }

  /**
   * Update quiz
   */
  async updateQuiz(quizId: string, data: UpdateQuizDTO) {
    const quiz = await prisma.quiz.update({
      where: { id: quizId },
      data: {
        title: data.title,
        description: data.description,
        difficulty: data.difficulty,
        timeLimit: data.timeLimit,
        isPublished: data.isPublished,
      },
      include: {
        category: true,
        _count: {
          select: {
            questions: true,
            attempts: true,
          },
        },
      },
    });

    return quiz;
  }

  /**
   * Delete quiz
   */
  async deleteQuiz(quizId: string) {
    await prisma.quiz.delete({
      where: { id: quizId },
    });
  }

  /**
   * Private: Update user points and progress after quiz completion
   */
  private async updateUserPointsAndProgress(
    userId: string,
    points: number,
    score: number
  ) {
    // Update user points
    await prisma.profile.update({
      where: { userId },
      data: {
        points: {
          increment: points,
        },
        lastActiveDate: new Date(),
      },
    });

    // Check and update streak
    await this.updateUserStreak(userId);

    // Check for achievements
    await this.checkAndUnlockAchievements(userId, points, score);
  }

  /**
   * Private: Update user streak
   */
  private async updateUserStreak(userId: string) {
    const profile = await prisma.profile.findUnique({
      where: { userId },
    });

    if (!profile) return;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const lastActive = new Date(profile.lastActiveDate);
    lastActive.setHours(0, 0, 0, 0);

    const daysDiff = Math.floor(
      (today.getTime() - lastActive.getTime()) / (1000 * 60 * 60 * 24)
    );

    if (daysDiff === 0) {
      // Same day, no change
      return;
    } else if (daysDiff === 1) {
      // Consecutive day, increment streak
      await prisma.profile.update({
        where: { userId },
        data: {
          streak: {
            increment: 1,
          },
        },
      });
    } else {
      // Streak broken, reset to 1
      await prisma.profile.update({
        where: { userId },
        data: {
          streak: 1,
        },
      });
    }
  }

  /**
   * Private: Check and unlock achievements
   */
  private async checkAndUnlockAchievements(
    userId: string,
    points: number,
    score: number
  ) {
    // Get all achievements
    const achievements = await prisma.achievement.findMany();

    // Get user's current achievements
    const userAchievements = await prisma.userAchievement.findMany({
      where: { userId },
      select: { achievementId: true },
    });

    const unlockedIds = new Set(userAchievements.map((ua) => ua.achievementId));

    // Get user stats
    const [quizCount, profile] = await Promise.all([
      prisma.quizAttempt.count({ where: { userId } }),
      prisma.profile.findUnique({ where: { userId } }),
    ]);

    for (const achievement of achievements) {
      if (unlockedIds.has(achievement.id)) continue;

      const criteria = achievement.criteria as any;
      let shouldUnlock = false;

      // Check different achievement criteria
      if (criteria.type === "quiz_count" && quizCount >= criteria.value) {
        shouldUnlock = true;
      } else if (criteria.type === "perfect_score" && score === 100) {
        shouldUnlock = true;
      } else if (
        criteria.type === "points" &&
        (profile?.points || 0) >= criteria.value
      ) {
        shouldUnlock = true;
      } else if (
        criteria.type === "streak" &&
        (profile?.streak || 0) >= criteria.value
      ) {
        shouldUnlock = true;
      }

      if (shouldUnlock) {
        await prisma.userAchievement.create({
          data: {
            userId,
            achievementId: achievement.id,
          },
        });

        // Create notification
        await prisma.notification.create({
          data: {
            userId,
            title: "New Achievement Unlocked! 🎉",
            message: `You've unlocked "${achievement.name}"`,
            type: "success",
            data: {
              achievementId: achievement.id,
              achievementName: achievement.name,
            },
          },
        });
      }
    }
  }

  /**
   * Get quiz statistics
   */
  async getQuizStats(quizId: string) {
    const [attempts, avgScore, completionRate] = await Promise.all([
      prisma.quizAttempt.count({ where: { quizId } }),
      prisma.quizAttempt.aggregate({
        where: { quizId },
        _avg: {
          score: true,
        },
      }),
      prisma.quizAttempt.aggregate({
        where: { quizId },
        _count: true,
      }),
    ]);

    const passedAttempts = await prisma.quizAttempt.count({
      where: {
        quizId,
        score: {
          gte: 60,
        },
      },
    });

    return {
      totalAttempts: attempts,
      averageScore: avgScore._avg.score || 0,
      passRate: attempts > 0 ? (passedAttempts / attempts) * 100 : 0,
    };
  }
}
