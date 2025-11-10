import prisma from "@/config/database";
import path from "path";
import fs from "fs";
import archiver from "archiver";
import { Response } from "express";

export class DownloadService {
  /**
   * Download a single note with its file
   */
  async downloadNote(noteId: string, userId?: string) {
    const note = await prisma.note.findUnique({
      where: { id: noteId },
      include: {
        user: {
          select: {
            id: true,
            fullName: true,
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

    if (!note) {
      throw new Error("Note not found");
    }

    // Increment download count
    await prisma.note.update({
      where: { id: noteId },
      data: {
        downloadCount: {
          increment: 1,
        },
      },
    });

    return note;
  }

  /**
   * Download a single question with its file
   */
  async downloadQuestion(questionId: string, userId?: string) {
    const question = await prisma.question.findUnique({
      where: { id: questionId },
      include: {
        user: {
          select: {
            id: true,
            fullName: true,
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

    if (!question) {
      throw new Error("Question not found");
    }

    // Increment download count
    await prisma.question.update({
      where: { id: questionId },
      data: {
        downloadCount: {
          increment: 1,
        },
      },
    });

    return question;
  }

  /**
   * Download syllabus file
   */
  async downloadSyllabus(syllabusId: string) {
    const syllabus = await prisma.syllabus.findUnique({
      where: { id: syllabusId },
      include: {
        category: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    if (!syllabus) {
      throw new Error("Syllabus not found");
    }

    if (!syllabus.isPublished) {
      throw new Error("Syllabus is not published");
    }

    // Increment download count
    await prisma.syllabus.update({
      where: { id: syllabusId },
      data: {
        downloadCount: {
          increment: 1,
        },
      },
    });

    return syllabus;
  }

  /**
   * Get file by ID
   */
  async getFileById(fileId: string, userId?: string) {
    const file = await prisma.uploadedFile.findUnique({
      where: { id: fileId },
      include: {
        user: {
          select: {
            id: true,
            fullName: true,
          },
        },
      },
    });

    if (!file) {
      throw new Error("File not found");
    }

    // Check if file exists on disk
    if (!fs.existsSync(file.path)) {
      throw new Error("File not found on server");
    }

    return file;
  }

  /**
   * Download multiple notes as ZIP
   */
  async downloadMultipleNotes(noteIds: string[], userId?: string) {
    const notes = await prisma.note.findMany({
      where: {
        id: { in: noteIds },
        isApproved: true,
      },
      include: {
        category: {
          select: {
            name: true,
          },
        },
      },
    });

    if (notes.length === 0) {
      throw new Error("No notes found");
    }

    // Increment download count for each note
    await prisma.note.updateMany({
      where: {
        id: { in: noteIds },
      },
      data: {
        downloadCount: {
          increment: 1,
        },
      },
    });

    return notes;
  }

  /**
   * Download questions by year
   */
  async downloadQuestionsByYear(year: number, categoryId?: string) {
    const where: any = {
      year,
      isApproved: true,
    };

    if (categoryId) {
      where.categoryId = categoryId;
    }

    const questions = await prisma.question.findMany({
      where,
      include: {
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
      orderBy: {
        createdAt: "desc",
      },
    });

    // Increment download count for each question
    if (questions.length > 0) {
      const questionIds = questions.map((q) => q.id);
      await prisma.question.updateMany({
        where: {
          id: { in: questionIds },
        },
        data: {
          downloadCount: {
            increment: 1,
          },
        },
      });
    }

    return questions;
  }

  /**
   * Download questions by category
   */
  async downloadQuestionsByCategory(categoryId: string, year?: number) {
    const where: any = {
      categoryId,
      isApproved: true,
    };

    if (year) {
      where.year = year;
    }

    const questions = await prisma.question.findMany({
      where,
      include: {
        category: {
          select: {
            name: true,
          },
        },
      },
      orderBy: [{ year: "desc" }, { createdAt: "desc" }],
    });

    // Increment download count for each question
    if (questions.length > 0) {
      const questionIds = questions.map((q) => q.id);
      await prisma.question.updateMany({
        where: {
          id: { in: questionIds },
        },
        data: {
          downloadCount: {
            increment: 1,
          },
        },
      });
    }

    return questions;
  }

  /**
   * Get download statistics for user's content
   */
  async getDownloadStats(userId: string) {
    // Get aggregated download counts for user's content
    const [notesStats, questionsStats, filesCount] = await Promise.all([
      // Get total downloads of user's notes
      prisma.note.aggregate({
        where: {
          userId,
        },
        _count: true,
        _sum: {
          downloadCount: true,
          viewCount: true,
        },
      }),
      // Get total downloads of user's questions
      prisma.question.aggregate({
        where: {
          userId,
        },
        _count: true,
        _sum: {
          downloadCount: true,
          viewCount: true,
        },
      }),
      // Get user's uploaded files count
      prisma.uploadedFile.count({
        where: {
          userId,
        },
      }),
    ]);

    return {
      notes: {
        count: notesStats._count,
        totalDownloads: notesStats._sum.downloadCount || 0,
        totalViews: notesStats._sum.viewCount || 0,
      },
      questions: {
        count: questionsStats._count,
        totalDownloads: questionsStats._sum.downloadCount || 0,
        totalViews: questionsStats._sum.viewCount || 0,
      },
      files: {
        count: filesCount,
      },
      totals: {
        contentCount: notesStats._count + questionsStats._count,
        totalDownloads:
          (notesStats._sum.downloadCount || 0) +
          (questionsStats._sum.downloadCount || 0),
        totalViews:
          (notesStats._sum.viewCount || 0) +
          (questionsStats._sum.viewCount || 0),
        filesUploaded: filesCount,
      },
    };
  }

  /**
   * Get user's download history (content they downloaded)
   */
  async getUserDownloadHistory(userId: string, page = 1, limit = 20) {
    const skip = (page - 1) * limit;

    // Get bookmarks as proxy for downloaded content
    // (You could create a separate DownloadHistory table for more accurate tracking)
    const bookmarks = await prisma.bookmark.findMany({
      where: { userId },
      skip,
      take: limit,
      orderBy: {
        createdAt: "desc",
      },
      include: {
        note: {
          select: {
            id: true,
            title: true,
            downloadCount: true,
            viewCount: true,
            category: {
              select: {
                name: true,
              },
            },
          },
        },
        question: {
          select: {
            id: true,
            title: true,
            year: true,
            downloadCount: true,
            viewCount: true,
            category: {
              select: {
                name: true,
              },
            },
          },
        },
      },
    });

    const total = await prisma.bookmark.count({ where: { userId } });

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
   * Create ZIP archive of files
   */
  async createZipArchive(
    res: Response,
    files: Array<{ path: string; name: string }>,
    archiveName: string
  ): Promise<void> {
    return new Promise((resolve, reject) => {
      const archive = archiver("zip", {
        zlib: { level: 9 }, // Maximum compression
      });

      // Set response headers
      res.setHeader("Content-Type", "application/zip");
      res.setHeader(
        "Content-Disposition",
        `attachment; filename="${archiveName}"`
      );

      // Pipe archive to response
      archive.pipe(res);

      // Add files to archive
      files.forEach((file) => {
        if (fs.existsSync(file.path)) {
          archive.file(file.path, { name: file.name });
        }
      });

      // Handle errors
      archive.on("error", (err) => {
        reject(err);
      });

      // Finalize archive
      archive.finalize();

      res.on("finish", () => {
        resolve();
      });
    });
  }

  /**
   * Generate PDF from note content
   */
  async generateNotePDF(noteId: string) {
    const note = await prisma.note.findUnique({
      where: { id: noteId },
      include: {
        category: true,
        user: {
          select: {
            fullName: true,
          },
        },
      },
    });

    if (!note) {
      throw new Error("Note not found");
    }

    return note;
  }

  /**
   * Generate PDF from questions
   */
  async generateQuestionsPDF(questionIds: string[]) {
    const questions = await prisma.question.findMany({
      where: {
        id: { in: questionIds },
        isApproved: true,
      },
      include: {
        category: true,
        user: {
          select: {
            fullName: true,
          },
        },
      },
      orderBy: [{ year: "desc" }, { createdAt: "desc" }],
    });

    return questions;
  }

  /**
   * Get most downloaded content
   */
  async getMostDownloadedContent(limit = 10) {
    const [notes, questions] = await Promise.all([
      prisma.note.findMany({
        where: { isApproved: true },
        take: limit,
        orderBy: {
          downloadCount: "desc",
        },
        select: {
          id: true,
          title: true,
          downloadCount: true,
          viewCount: true,
          upvotes: true,
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
      }),
      prisma.question.findMany({
        where: { isApproved: true },
        take: limit,
        orderBy: {
          downloadCount: "desc",
        },
        select: {
          id: true,
          title: true,
          year: true,
          downloadCount: true,
          viewCount: true,
          upvotes: true,
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
      }),
    ]);

    return {
      notes,
      questions,
    };
  }
}
