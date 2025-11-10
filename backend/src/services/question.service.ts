import prisma from '@/config/database';
import { CreateQuestionDTO, UpdateQuestionDTO, QuestionFilters } from '@/types/question.types';
import { PaginatedResponse } from '@/types/common.types';

export class QuestionService {
  async createQuestion(userId: string, data: CreateQuestionDTO) {
    const question = await prisma.question.create({
      data: {
        userId,
        categoryId: data.categoryId,
        title: data.title,
        content: data.content,
        year: data.year,
        fileUrl: data.fileUrl,
        tags: data.tags || [],
      },
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
    });

    return question;
  }

  async getQuestions(filters: QuestionFilters): Promise<PaginatedResponse<any>> {
    const page = filters.page || 1;
    const limit = filters.limit || 10;
    const skip = (page - 1) * limit;

    const where: any = {};

    if (filters.categoryId) {
      where.categoryId = filters.categoryId;
    }

    if (filters.userId) {
      where.userId = filters.userId;
    }

    if (filters.year) {
      where.year = filters.year;
    }

    if (filters.tags && filters.tags.length > 0) {
      where.tags = {
        hasSome: filters.tags,
      };
    }

    if (filters.search) {
      where.OR = [
        { title: { contains: filters.search, mode: 'insensitive' } },
        { content: { contains: filters.search, mode: 'insensitive' } },
      ];
    }

    if (filters.isApproved !== undefined) {
      where.isApproved = filters.isApproved;
    }

    let orderBy: any = { createdAt: 'desc' };

    if (filters.sortBy === 'popular') {
      orderBy = { upvotes: 'desc' };
    } else if (filters.sortBy === 'trending') {
      orderBy = { viewCount: 'desc' };
    }

    const [questions, total] = await Promise.all([
      prisma.question.findMany({
        where,
        skip,
        take: limit,
        orderBy,
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
          _count: {
            select: {
              comments: true,
              bookmarks: true,
            },
          },
        },
      }),
      prisma.question.count({ where }),
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

  async getQuestionById(questionId: string, userId?: string) {
    const question = await prisma.question.findUnique({
      where: { id: questionId },
      include: {
        user: {
          select: {
            id: true,
            fullName: true,
            avatar: true,
            bio: true,
          },
        },
        category: {
          select: {
            id: true,
            name: true,
            description: true,
          },
        },
        _count: {
          select: {
            comments: true,
            bookmarks: true,
            votes: true,
          },
        },
      },
    });

    if (!question) {
      throw new Error('Question not found');
    }

    // Increment view count
    await prisma.question.update({
      where: { id: questionId },
      data: { viewCount: { increment: 1 } },
    });

    // Check if user has bookmarked or voted
    let userInteraction = null;
    if (userId) {
      const [bookmark, vote] = await Promise.all([
        prisma.bookmark.findFirst({
          where: { userId, questionId },
        }),
        prisma.vote.findFirst({
          where: { userId, questionId },
        }),
      ]);

      userInteraction = {
        isBookmarked: !!bookmark,
        userVote: vote?.voteType || null,
      };
    }

    return {
      ...question,
      userInteraction,
    };
  }

  async updateQuestion(questionId: string, userId: string, data: UpdateQuestionDTO) {
    const existingQuestion = await prisma.question.findUnique({
      where: { id: questionId },
    });

    if (!existingQuestion) {
      throw new Error('Question not found');
    }

    if (existingQuestion.userId !== userId) {
      throw new Error('You are not authorized to update this question');
    }

    const question = await prisma.question.update({
      where: { id: questionId },
      data: {
        title: data.title,
        content: data.content,
        year: data.year,
        fileUrl: data.fileUrl,
        tags: data.tags,
      },
      include: {
        user: {
          select: {
            id: true,
            fullName: true,
            avatar: true,
          },
        },
        category: true,
      },
    });

    return question;
  }

  async deleteQuestion(questionId: string, userId: string) {
    const question = await prisma.question.findUnique({
      where: { id: questionId },
    });

    if (!question) {
      throw new Error('Question not found');
    }

    if (question.userId !== userId) {
      throw new Error('You are not authorized to delete this question');
    }

    await prisma.question.delete({
      where: { id: questionId },
    });
  }

  async voteQuestion(questionId: string, userId: string, voteType: 'upvote' | 'downvote') {
    const question = await prisma.question.findUnique({
      where: { id: questionId },
    });

    if (!question) {
      throw new Error('Question not found');
    }

    const existingVote = await prisma.vote.findFirst({
      where: { userId, questionId },
    });

    if (existingVote) {
      if (existingVote.voteType === voteType) {
        await prisma.$transaction([
          prisma.vote.delete({
            where: { id: existingVote.id },
          }),
          prisma.question.update({
            where: { id: questionId },
            data: {
              [voteType === 'upvote' ? 'upvotes' : 'downvotes']: {
                decrement: 1,
              },
            },
          }),
        ]);

        return { message: 'Vote removed' };
      } else {
        await prisma.$transaction([
          prisma.vote.update({
            where: { id: existingVote.id },
            data: { voteType },
          }),
          prisma.question.update({
            where: { id: questionId },
            data: {
              upvotes: {
                [voteType === 'upvote' ? 'increment' : 'decrement']: 1,
              },
              downvotes: {
                [voteType === 'downvote' ? 'increment' : 'decrement']: 1,
              },
            },
          }),
        ]);

        return { message: 'Vote updated' };
      }
    } else {
      await prisma.$transaction([
        prisma.vote.create({
          data: {
            userId,
            questionId,
            voteType,
          },
        }),
        prisma.question.update({
          where: { id: questionId },
          data: {
            [voteType === 'upvote' ? 'upvotes' : 'downvotes']: {
              increment: 1,
            },
          },
        }),
      ]);

      return { message: 'Vote added' };
    }
  }

  async getComments(questionId: string) {
    const comments = await prisma.comment.findMany({
      where: { questionId },
      include: {
        user: {
          select: {
            id: true,
            fullName: true,
            avatar: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return comments;
  }

  async addComment(questionId: string, userId: string, content: string) {
    const question = await prisma.question.findUnique({
      where: { id: questionId },
    });

    if (!question) {
      throw new Error('Question not found');
    }

    const comment = await prisma.comment.create({
      data: {
        userId,
        questionId,
        content,
      },
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

    return comment;
  }
}
