import prisma from "@/config/database";

export class SearchService {
  /**
   * Global search across all content
   */
  async globalSearch(query: string, limit = 5) {
    const [notes, questions, quizzes, groups, users] = await Promise.all([
      this.searchNotes(query, limit),
      this.searchQuestions(query, limit),
      this.searchQuizzes(query, limit),
      this.searchGroups(query, limit),
      this.searchUsers(query, limit),
    ]);

    return {
      notes,
      questions,
      quizzes,
      groups,
      users,
    };
  }

  /**
   * Search notes
   */
  async searchNotes(query: string, limit = 10) {
    return await prisma.note.findMany({
      where: {
        isApproved: true,
        OR: [
          { title: { contains: query, mode: "insensitive" } },
          { content: { contains: query, mode: "insensitive" } },
          { tags: { has: query } },
        ],
      },
      take: limit,
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
      orderBy: {
        viewCount: "desc",
      },
    });
  }

  /**
   * Search questions
   */
  async searchQuestions(query: string, limit = 10) {
    return await prisma.question.findMany({
      where: {
        isApproved: true,
        OR: [
          { title: { contains: query, mode: "insensitive" } },
          { content: { contains: query, mode: "insensitive" } },
          { tags: { has: query } },
        ],
      },
      take: limit,
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
      orderBy: {
        viewCount: "desc",
      },
    });
  }

  /**
   * Search quizzes
   */
  async searchQuizzes(query: string, limit = 10) {
    return await prisma.quiz.findMany({
      where: {
        isPublished: true,
        OR: [
          { title: { contains: query, mode: "insensitive" } },
          { description: { contains: query, mode: "insensitive" } },
        ],
      },
      take: limit,
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
  }

  /**
   * Search groups
   */
  async searchGroups(query: string, limit = 10) {
    return await prisma.group.findMany({
      where: {
        type: "public",
        OR: [
          { name: { contains: query, mode: "insensitive" } },
          { description: { contains: query, mode: "insensitive" } },
        ],
      },
      take: limit,
      include: {
        _count: {
          select: {
            members: true,
          },
        },
      },
    });
  }

  /**
   * Search users
   */
  async searchUsers(query: string, limit = 10) {
    return await prisma.user.findMany({
      where: {
        OR: [
          { fullName: { contains: query, mode: "insensitive" } },
          { email: { contains: query, mode: "insensitive" } },
        ],
      },
      take: limit,
      select: {
        id: true,
        fullName: true,
        email: true,
        avatar: true,
        bio: true,
        profile: {
          select: {
            points: true,
            targetExam: true,
          },
        },
      },
    });
  }
}
