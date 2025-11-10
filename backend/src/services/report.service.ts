import prisma from '@/config/database';
import { ReportDTO } from '@/types/common.types';
import { PaginatedResponse } from '@/types/common.types';

export class ReportService {
  /**
   * Create a report
   */
  async createReport(userId: string, data: ReportDTO) {
    // Verify content exists
    if (data.contentType === 'note') {
      const note = await prisma.note.findUnique({ where: { id: data.contentId } });
      if (!note) {
        throw new Error('Note not found');
      }
    } else if (data.contentType === 'question') {
      const question = await prisma.question.findUnique({ where: { id: data.contentId } });
      if (!question) {
        throw new Error('Question not found');
      }
    } else if (data.contentType === 'comment') {
      const comment = await prisma.comment.findUnique({ where: { id: data.contentId } });
      if (!comment) {
        throw new Error('Comment not found');
      }
    }

    // Check if user already reported this content
    const existingReport = await prisma.report.findFirst({
      where: {
        userId,
        contentType: data.contentType,
        contentId: data.contentId,
      },
    });

    if (existingReport) {
      throw new Error('You have already reported this content');
    }

    const report = await prisma.report.create({
      data: {
        userId,
        contentType: data.contentType,
        contentId: data.contentId,
        reason: data.reason,
        description: data.description,
      },
    });

    return report;
  }

  /**
   * Get user's reports
   */
  async getUserReports(userId: string, page = 1, limit = 20): Promise<PaginatedResponse<any>> {
    const skip = (page - 1) * limit;

    const [reports, total] = await Promise.all([
      prisma.report.findMany({
        where: { userId },
        skip,
        take: limit,
        orderBy: {
          createdAt: 'desc',
        },
      }),
      prisma.report.count({ where: { userId } }),
    ]);

    return {
      data: reports,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Get all reports (admin)
   */
  async getAllReports(
    status?: string,
    contentType?: string,
    page = 1,
    limit = 20
  ): Promise<PaginatedResponse<any>> {
    const skip = (page - 1) * limit;

    const where: any = {};
    if (status) where.status = status;
    if (contentType) where.contentType = contentType;

    const [reports, total] = await Promise.all([
      prisma.report.findMany({
        where,
        skip,
        take: limit,
        orderBy: {
          createdAt: 'desc',
        },
        include: {
          user: {
            select: {
              id: true,
              fullName: true,
              email: true,
              avatar: true,
            },
          },
        },
      }),
      prisma.report.count({ where }),
    ]);

    return {
      data: reports,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Update report status (admin)
   */
  async updateReportStatus(reportId: string, status: 'pending' | 'reviewed' | 'resolved') {
    const report = await prisma.report.findUnique({
      where: { id: reportId },
    });

    if (!report) {
      throw new Error('Report not found');
    }

    return await prisma.report.update({
      where: { id: reportId },
      data: { status },
    });
  }

  /**
   * Delete report
   */
  async deleteReport(reportId: string, userId: string) {
    const report = await prisma.report.findUnique({
      where: { id: reportId },
    });

    if (!report) {
      throw new Error('Report not found');
    }

    if (report.userId !== userId) {
      throw new Error('Unauthorized to delete this report');
    }

    await prisma.report.delete({
      where: { id: reportId },
    });
  }
}