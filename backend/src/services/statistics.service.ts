import prisma from '@/config/database';

export class StatisticsService {
  /**
   * Get note statistics
   */
  async getNoteStatistics(noteId: string) {
    const note = await prisma.note.findUnique({
      where: { id: noteId },
      select: {
        id: true,
        title: true,
        viewCount: true,
        upvotes: true,
        downvotes: true,
        downloadCount: true,
        createdAt: true,
        _count: {
          select: {
            comments: true,
            bookmarks: true,
            votes: true,
          },
        },
      },
    });

    if (!note) {
      throw new Error('Note not found');
    }

    return {
      id: note.id,
      title: note.title,
      views: note.viewCount,
      upvotes: note.upvotes,
      downvotes: note.downvotes,
      downloads: note.downloadCount,
      totalVotes: note.upvotes + note.downvotes,
      voteRatio: note.upvotes + note.downvotes > 0 
        ? (note.upvotes / (note.upvotes + note.downvotes) * 100).toFixed(2) 
        : 0,
      comments: note._count.comments,
      bookmarks: note._count.bookmarks,
      totalEngagement: note.viewCount + note.upvotes + note.downvotes + note.downloadCount,
      createdAt: note.createdAt,
    };
  }

  /**
   * Get question statistics
   */
  async getQuestionStatistics(questionId: string) {
    const question = await prisma.question.findUnique({
      where: { id: questionId },
      select: {
        id: true,
        title: true,
        year: true,
        viewCount: true,
        upvotes: true,
        downvotes: true,
        downloadCount: true,
        createdAt: true,
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

    return {
      id: question.id,
      title: question.title,
      year: question.year,
      views: question.viewCount,
      upvotes: question.upvotes,
      downvotes: question.downvotes,
      downloads: question.downloadCount,
      totalVotes: question.upvotes + question.downvotes,
      voteRatio: question.upvotes + question.downvotes > 0 
        ? (question.upvotes / (question.upvotes + question.downvotes) * 100).toFixed(2) 
        : 0,
      comments: question._count.comments,
      bookmarks: question._count.bookmarks,
      totalEngagement: question.viewCount + question.upvotes + question.downvotes + question.downloadCount,
      createdAt: question.createdAt,
    };
  }

  /**
   * Get syllabus statistics
   */
  async getSyllabusStatistics(syllabusId: string) {
    const syllabus = await prisma.syllabus.findUnique({
      where: { id: syllabusId },
      select: {
        id: true,
        title: true,
        viewCount: true,
        downloadCount: true,
        createdAt: true,
        category: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    if (!syllabus) {
      throw new Error('Syllabus not found');
    }

    return {
      id: syllabus.id,
      title: syllabus.title,
      category: syllabus.category,
      views: syllabus.viewCount,
      downloads: syllabus.downloadCount,
      totalEngagement: syllabus.viewCount + syllabus.downloadCount,
      createdAt: syllabus.createdAt,
    };
  }

  /**
   * Get top notes by criteria
   */
  async getTopNotes(criteria: 'views' | 'upvotes' | 'downloads' = 'views', limit = 10) {
    const orderByField = criteria === 'views' ? 'viewCount' 
      : criteria === 'upvotes' ? 'upvotes' 
      : 'downloadCount';

    const notes = await prisma.note.findMany({
      where: {
        isApproved: true,
      },
      take: limit,
      orderBy: {
        [orderByField]: 'desc',
      },
      select: {
        id: true,
        title: true,
        viewCount: true,
        upvotes: true,
        downvotes: true,
        downloadCount: true,
        category: {
          select: {
            name: true,
          },
        },
        user: {
          select: {
            fullName: true,
          },
        },
      },
    });

    return notes;
  }

  /**
   * Get top questions by criteria
   */
  async getTopQuestions(criteria: 'views' | 'upvotes' | 'downloads' = 'views', limit = 10) {
    const orderByField = criteria === 'views' ? 'viewCount' 
      : criteria === 'upvotes' ? 'upvotes' 
      : 'downloadCount';

    const questions = await prisma.question.findMany({
      where: {
        isApproved: true,
      },
      take: limit,
      orderBy: {
        [orderByField]: 'desc',
      },
      select: {
        id: true,
        title: true,
        year: true,
        viewCount: true,
        upvotes: true,
        downvotes: true,
        downloadCount: true,
        category: {
          select: {
            name: true,
          },
        },
        user: {
          select: {
            fullName: true,
          },
        },
      },
    });

    return questions;
  }

  /**
   * Get category statistics
   */
  async getCategoryStatistics(categoryId: string) {
    const [notesStats, questionsStats, syllabusStats] = await Promise.all([
      prisma.note.aggregate({
        where: { categoryId, isApproved: true },
        _count: true,
        _sum: {
          viewCount: true,
          upvotes: true,
          downvotes: true,
          downloadCount: true,
        },
      }),
      prisma.question.aggregate({
        where: { categoryId, isApproved: true },
        _count: true,
        _sum: {
          viewCount: true,
          upvotes: true,
          downvotes: true,
          downloadCount: true,
        },
      }),
      prisma.syllabus.aggregate({
        where: { categoryId, isPublished: true },
        _count: true,
        _sum: {
          viewCount: true,
          downloadCount: true,
        },
      }),
    ]);

    const category = await prisma.category.findUnique({
      where: { id: categoryId },
      select: {
        id: true,
        name: true,
        description: true,
      },
    });

    return {
      category,
      notes: {
        count: notesStats._count,
        totalViews: notesStats._sum.viewCount || 0,
        totalUpvotes: notesStats._sum.upvotes || 0,
        totalDownvotes: notesStats._sum.downvotes || 0,
        totalDownloads: notesStats._sum.downloadCount || 0,
      },
      questions: {
        count: questionsStats._count,
        totalViews: questionsStats._sum.viewCount || 0,
        totalUpvotes: questionsStats._sum.upvotes || 0,
        totalDownvotes: questionsStats._sum.downvotes || 0,
        totalDownloads: questionsStats._sum.downloadCount || 0,
      },
      syllabus: {
        count: syllabusStats._count,
        totalViews: syllabusStats._sum.viewCount || 0,
        totalDownloads: syllabusStats._sum.downloadCount || 0,
      },
      totals: {
        views: (notesStats._sum.viewCount || 0) + (questionsStats._sum.viewCount || 0) + (syllabusStats._sum.viewCount || 0),
        downloads: (notesStats._sum.downloadCount || 0) + (questionsStats._sum.downloadCount || 0) + (syllabusStats._sum.downloadCount || 0),
        upvotes: (notesStats._sum.upvotes || 0) + (questionsStats._sum.upvotes || 0),
      },
    };
  }

  /**
   * Get user contribution statistics
   */
  async getUserContributionStats(userId: string) {
    const [notesStats, questionsStats] = await Promise.all([
      prisma.note.aggregate({
        where: { userId },
        _count: true,
        _sum: {
          viewCount: true,
          upvotes: true,
          downvotes: true,
          downloadCount: true,
        },
      }),
      prisma.question.aggregate({
        where: { userId },
        _count: true,
        _sum: {
          viewCount: true,
          upvotes: true,
          downvotes: true,
          downloadCount: true,
        },
      }),
    ]);

    return {
      notes: {
        count: notesStats._count,
        totalViews: notesStats._sum.viewCount || 0,
        totalUpvotes: notesStats._sum.upvotes || 0,
        totalDownvotes: notesStats._sum.downvotes || 0,
        totalDownloads: notesStats._sum.downloadCount || 0,
      },
      questions: {
        count: questionsStats._count,
        totalViews: questionsStats._sum.viewCount || 0,
        totalUpvotes: questionsStats._sum.upvotes || 0,
        totalDownvotes: questionsStats._sum.downvotes || 0,
        totalDownloads: questionsStats._sum.downloadCount || 0,
      },
      totals: {
        contributions: notesStats._count + questionsStats._count,
        views: (notesStats._sum.viewCount || 0) + (questionsStats._sum.viewCount || 0),
        upvotes: (notesStats._sum.upvotes || 0) + (questionsStats._sum.upvotes || 0),
        downloads: (notesStats._sum.downloadCount || 0) + (questionsStats._sum.downloadCount || 0),
      },
    };
  }

  /**
   * Get trending content (based on recent engagement)
   */
  async getTrendingContent(limit = 10) {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const [trendingNotes, trendingQuestions] = await Promise.all([
      prisma.note.findMany({
        where: {
          isApproved: true,
          createdAt: {
            gte: sevenDaysAgo,
          },
        },
        take: limit,
        orderBy: [
          { viewCount: 'desc' },
          { upvotes: 'desc' },
        ],
        select: {
          id: true,
          title: true,
          viewCount: true,
          upvotes: true,
          downloadCount: true,
          createdAt: true,
          category: {
            select: {
              name: true,
            },
          },
        },
      }),
      prisma.question.findMany({
        where: {
          isApproved: true,
          createdAt: {
            gte: sevenDaysAgo,
          },
        },
        take: limit,
        orderBy: [
          { viewCount: 'desc' },
          { upvotes: 'desc' },
        ],
        select: {
          id: true,
          title: true,
          year: true,
          viewCount: true,
          upvotes: true,
          downloadCount: true,
          createdAt: true,
          category: {
            select: {
              name: true,
            },
          },
        },
      }),
    ]);

    return {
      notes: trendingNotes,
      questions: trendingQuestions,
    };
  }

  /**
   * Increment view count
   */
  async incrementViewCount(contentType: 'note' | 'question' | 'syllabus', contentId: string) {
    if (contentType === 'note') {
      await prisma.note.update({
        where: { id: contentId },
        data: { viewCount: { increment: 1 } },
      });
    } else if (contentType === 'question') {
      await prisma.question.update({
        where: { id: contentId },
        data: { viewCount: { increment: 1 } },
      });
    } else if (contentType === 'syllabus') {
      await prisma.syllabus.update({
        where: { id: contentId },
        data: { viewCount: { increment: 1 } },
      });
    }
  }

  /**
   * Increment download count
   */
  async incrementDownloadCount(contentType: 'note' | 'question' | 'syllabus', contentId: string) {
    if (contentType === 'note') {
      await prisma.note.update({
        where: { id: contentId },
        data: { downloadCount: { increment: 1 } },
      });
    } else if (contentType === 'question') {
      await prisma.question.update({
        where: { id: contentId },
        data: { downloadCount: { increment: 1 } },
      });
    } else if (contentType === 'syllabus') {
      await prisma.syllabus.update({
        where: { id: contentId },
        data: { downloadCount: { increment: 1 } },
      });
    }
  }
}