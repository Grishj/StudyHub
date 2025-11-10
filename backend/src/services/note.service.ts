import prisma from '@/config/database';
import { CreateNoteDTO, UpdateNoteDTO, NoteFilters } from '@/types/note.types';
import { PaginatedResponse } from '@/types/common.types';

export class NoteService {
  async createNote(userId: string, data: CreateNoteDTO) {
    const note = await prisma.note.create({
      data: {
        userId,
        categoryId: data.categoryId,
        title: data.title,
        content: data.content,
        fileType: data.fileType,
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

    return note;
  }

  async getNotes(filters: NoteFilters): Promise<PaginatedResponse<any>> {
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

    const [notes, total] = await Promise.all([
      prisma.note.findMany({
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
      prisma.note.count({ where }),
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
  }

  async getNoteById(noteId: string, userId?: string) {
    const note = await prisma.note.findUnique({
      where: { id: noteId },
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

    if (!note) {
      throw new Error('Note not found');
    }

    // Increment view count
    await prisma.note.update({
      where: { id: noteId },
      data: { viewCount: { increment: 1 } },
    });

    // Check if user has bookmarked or voted
    let userInteraction = null;
    if (userId) {
      const [bookmark, vote] = await Promise.all([
        prisma.bookmark.findFirst({
          where: { userId, noteId },
        }),
        prisma.vote.findFirst({
          where: { userId, noteId },
        }),
      ]);

      userInteraction = {
        isBookmarked: !!bookmark,
        userVote: vote?.voteType || null,
      };
    }

    return {
      ...note,
      userInteraction,
    };
  }

  async updateNote(noteId: string, userId: string, data: UpdateNoteDTO) {
    // Check if note belongs to user
    const existingNote = await prisma.note.findUnique({
      where: { id: noteId },
    });

    if (!existingNote) {
      throw new Error('Note not found');
    }

    if (existingNote.userId !== userId) {
      throw new Error('You are not authorized to update this note');
    }

    const note = await prisma.note.update({
      where: { id: noteId },
      data: {
        title: data.title,
        content: data.content,
        fileType: data.fileType,
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

    return note;
  }

  async deleteNote(noteId: string, userId: string) {
    const note = await prisma.note.findUnique({
      where: { id: noteId },
    });

    if (!note) {
      throw new Error('Note not found');
    }

    if (note.userId !== userId) {
      throw new Error('You are not authorized to delete this note');
    }

    await prisma.note.delete({
      where: { id: noteId },
    });
  }

  async voteNote(noteId: string, userId: string, voteType: 'upvote' | 'downvote') {
    const note = await prisma.note.findUnique({
      where: { id: noteId },
    });

    if (!note) {
      throw new Error('Note not found');
    }

    // Check if user has already voted
    const existingVote = await prisma.vote.findFirst({
      where: { userId, noteId },
    });

    if (existingVote) {
      if (existingVote.voteType === voteType) {
        // Remove vote
        await prisma.$transaction([
          prisma.vote.delete({
            where: { id: existingVote.id },
          }),
          prisma.note.update({
            where: { id: noteId },
            data: {
              [voteType === 'upvote' ? 'upvotes' : 'downvotes']: {
                decrement: 1,
              },
            },
          }),
        ]);

        return { message: 'Vote removed' };
      } else {
        // Change vote
        await prisma.$transaction([
          prisma.vote.update({
            where: { id: existingVote.id },
            data: { voteType },
          }),
          prisma.note.update({
            where: { id: noteId },
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
      // Create new vote
      await prisma.$transaction([
        prisma.vote.create({
          data: {
            userId,
            noteId,
            voteType,
          },
        }),
        prisma.note.update({
          where: { id: noteId },
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

  async getComments(noteId: string) {
    const comments = await prisma.comment.findMany({
      where: { noteId },
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

  async addComment(noteId: string, userId: string, content: string) {
    const note = await prisma.note.findUnique({
      where: { id: noteId },
    });

    if (!note) {
      throw new Error('Note not found');
    }

    const comment = await prisma.comment.create({
      data: {
        userId,
        noteId,
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

  async deleteComment(commentId: string, userId: string) {
    const comment = await prisma.comment.findUnique({
      where: { id: commentId },
    });

    if (!comment) {
      throw new Error('Comment not found');
    }

    if (comment.userId !== userId) {
      throw new Error('You are not authorized to delete this comment');
    }

    await prisma.comment.delete({
      where: { id: commentId },
    });
  }
}
