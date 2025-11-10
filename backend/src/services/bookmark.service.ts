import prisma from '@/config/database';
import { PaginatedResponse } from '@/types/common.types';

export class BookmarkService {
  /**
   * Toggle bookmark (add/remove)
   */
  async toggleBookmark(
    userId: string,
    contentType: 'note' | 'question',
    contentId: string
  ) {
    // Check if bookmark already exists
    const where: any = { userId };
    
    if (contentType === 'note') {
      where.noteId = contentId;
      
      // Verify note exists
      const note = await prisma.note.findUnique({ where: { id: contentId } });
      if (!note) {
        throw new Error('Note not found');
      }
    } else {
      where.questionId = contentId;
      
      // Verify question exists
      const question = await prisma.question.findUnique({ where: { id: contentId } });
      if (!question) {
        throw new Error('Question not found');
      }
    }

    const existingBookmark = await prisma.bookmark.findFirst({ where });

    if (existingBookmark) {
      // Remove bookmark
      await prisma.bookmark.delete({
        where: { id: existingBookmark.id },
      });

      return {
        bookmarked: false,
        message: 'Bookmark removed',
      };
    } else {
      // Add bookmark
      const data: any = { userId };
      if (contentType === 'note') {
        data.noteId = contentId;
      } else {
        data.questionId = contentId;
      }

      await prisma.bookmark.create({ data });

      return {
        bookmarked: true,
        message: 'Bookmark added',
      };
    }
  }

  /**
   * Get user's bookmarks
   */
  async getUserBookmarks(
    userId: string,
    type?: 'note' | 'question',
    page = 1,
    limit = 20
  ): Promise<PaginatedResponse<any>> {
    const skip = (page - 1) * limit;

    const where: any = { userId };

    if (type === 'note') {
      where.noteId = { not: null };
    } else if (type === 'question') {
      where.questionId = { not: null };
    }

    const [bookmarks, total] = await Promise.all([
      prisma.bookmark.findMany({
        where,
        skip,
        take: limit,
        orderBy: {
          createdAt: 'desc',
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
              _count: {
                select: {
                  comments: true,
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
              _count: {
                select: {
                  comments: true,
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
   * Check if content is bookmarked
   */
  async isBookmarked(
    userId: string,
    contentType: 'note' | 'question',
    contentId: string
  ): Promise<boolean> {
    const where: any = { userId };

    if (contentType === 'note') {
      where.noteId = contentId;
    } else {
      where.questionId = contentId;
    }

    const bookmark = await prisma.bookmark.findFirst({ where });
    return !!bookmark;
  }

  /**
   * Get bookmark count for content
   */
  async getBookmarkCount(contentType: 'note' | 'question', contentId: string): Promise<number> {
    const where: any = {};

    if (contentType === 'note') {
      where.noteId = contentId;
    } else {
      where.questionId = contentId;
    }

    return await prisma.bookmark.count({ where });
  }
}