import { Request, Response, NextFunction } from "express";
import { DownloadService } from "@/services/download.service";
import { sendSuccess, sendError } from "@/utils/response.util";
import prisma from "@/config/database";
import path from "path";
import fs from "fs";

const downloadService = new DownloadService();

export class DownloadController {
  /**
   * Download note file
   */
  async downloadNote(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const note = await downloadService.downloadNote(
        req.params.id,
        req.user?.id
      );

      if (!note.fileUrl) {
        sendError(res, "No file attached to this note", 404);
        return;
      }

      // If fileUrl is a full URL, redirect
      if (note.fileUrl.startsWith("http")) {
        res.redirect(note.fileUrl);
        return;
      }

      // If it's a local file path
      const filePath = path.join(__dirname, "../../uploads", note.fileUrl);

      if (!fs.existsSync(filePath)) {
        sendError(res, "File not found on server", 404);
        return;
      }

      // Generate filename
      const filename = `${note.category.name}_${note.title.replace(
        /[^a-z0-9]/gi,
        "_"
      )}.${note.fileType || "pdf"}`;

      // Set headers
      res.setHeader(
        "Content-Type",
        this.getContentType(note.fileType || "pdf")
      );
      res.setHeader(
        "Content-Disposition",
        `attachment; filename="${filename}"`
      );

      // Stream file
      const fileStream = fs.createReadStream(filePath);
      fileStream.pipe(res);
    } catch (error: any) {
      sendError(res, error.message, 404);
    }
  }

  /**
   * Download note as JSON
   */
  async downloadNoteJSON(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const note = await downloadService.downloadNote(
        req.params.id,
        req.user?.id
      );

      const filename = `${note.category.name}_${note.title.replace(
        /[^a-z0-9]/gi,
        "_"
      )}.json`;

      res.setHeader("Content-Type", "application/json");
      res.setHeader(
        "Content-Disposition",
        `attachment; filename="${filename}"`
      );

      res.json({
        id: note.id,
        title: note.title,
        content: note.content,
        category: note.category.name,
        tags: note.tags,
        author: note.user.fullName,
        createdAt: note.createdAt,
        updatedAt: note.updatedAt,
      });
    } catch (error: any) {
      sendError(res, error.message, 404);
    }
  }

  /**
   * Download question file
   */
  async downloadQuestion(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const question = await downloadService.downloadQuestion(
        req.params.id,
        req.user?.id
      );

      if (!question.fileUrl) {
        sendError(res, "No file attached to this question", 404);
        return;
      }

      // If fileUrl is a full URL, redirect
      if (question.fileUrl.startsWith("http")) {
        res.redirect(question.fileUrl);
        return;
      }

      // If it's a local file path
      const filePath = path.join(__dirname, "../../uploads", question.fileUrl);

      if (!fs.existsSync(filePath)) {
        sendError(res, "File not found on server", 404);
        return;
      }

      const filename = `${question.category.name}_${
        question.year || "Question"
      }_${question.title.replace(/[^a-z0-9]/gi, "_")}.pdf`;

      res.setHeader("Content-Type", "application/pdf");
      res.setHeader(
        "Content-Disposition",
        `attachment; filename="${filename}"`
      );

      const fileStream = fs.createReadStream(filePath);
      fileStream.pipe(res);
    } catch (error: any) {
      sendError(res, error.message, 404);
    }
  }

  /**
   * Download multiple notes as ZIP
   */
  async downloadMultipleNotes(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const noteIds = req.body.noteIds as string[];

      if (!noteIds || noteIds.length === 0) {
        sendError(res, "No note IDs provided", 400);
        return;
      }

      const notes = await downloadService.downloadMultipleNotes(
        noteIds,
        req.user?.id
      );

      const files = notes
        .filter((note) => note.fileUrl && !note.fileUrl.startsWith("http"))
        .map((note) => ({
          path: path.join(__dirname, "../../uploads", note.fileUrl!),
          name: `${note.category.name}_${note.title.replace(
            /[^a-z0-9]/gi,
            "_"
          )}.${note.fileType || "pdf"}`,
        }))
        .filter((file) => fs.existsSync(file.path));

      if (files.length === 0) {
        sendError(res, "No downloadable files found", 404);
        return;
      }

      await downloadService.createZipArchive(res, files, "notes.zip");
    } catch (error: any) {
      sendError(res, error.message, 400);
    }
  }

  /**
   * Download questions by year
   */
  async downloadQuestionsByYear(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const year = parseInt(req.params.year);
      const categoryId = req.query.categoryId as string;

      const questions = await downloadService.downloadQuestionsByYear(
        year,
        categoryId
      );

      if (questions.length === 0) {
        sendError(res, "No questions found for this year", 404);
        return;
      }

      const files = questions
        .filter((q) => q.fileUrl && !q.fileUrl.startsWith("http"))
        .map((q) => ({
          path: path.join(__dirname, "../../uploads", q.fileUrl!),
          name: `${q.category.name}_${year}_${q.title.replace(
            /[^a-z0-9]/gi,
            "_"
          )}.pdf`,
        }))
        .filter((file) => fs.existsSync(file.path));

      if (files.length === 0) {
        sendError(res, "No downloadable files found", 404);
        return;
      }

      await downloadService.createZipArchive(
        res,
        files,
        `questions_${year}${categoryId ? "_" + categoryId : ""}.zip`
      );
    } catch (error: any) {
      sendError(res, error.message, 400);
    }
  }

  /**
   * Download questions by category
   */
  async downloadQuestionsByCategory(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const categoryId = req.params.categoryId;
      const year = req.query.year
        ? parseInt(req.query.year as string)
        : undefined;

      const questions = await downloadService.downloadQuestionsByCategory(
        categoryId,
        year
      );

      if (questions.length === 0) {
        sendError(res, "No questions found", 404);
        return;
      }

      const files = questions
        .filter((q) => q.fileUrl && !q.fileUrl.startsWith("http"))
        .map((q) => ({
          path: path.join(__dirname, "../../uploads", q.fileUrl!),
          name: `${q.category.name}_${q.year || "Question"}_${q.title.replace(
            /[^a-z0-9]/gi,
            "_"
          )}.pdf`,
        }))
        .filter((file) => fs.existsSync(file.path));

      if (files.length === 0) {
        sendError(res, "No downloadable files found", 404);
        return;
      }

      const category = questions[0].category;
      await downloadService.createZipArchive(
        res,
        files,
        `${category.name}_questions${year ? "_" + year : ""}.zip`
      );
    } catch (error: any) {
      sendError(res, error.message, 400);
    }
  }

  /**
   * Download syllabus file
   */
  async downloadSyllabus(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const syllabus = await downloadService.downloadSyllabus(req.params.id);

      if (!syllabus.fileUrl) {
        // If no file, return content as text file
        const filename = `${syllabus.category.name}_${syllabus.title.replace(
          /[^a-z0-9]/gi,
          "_"
        )}.txt`;

        res.setHeader("Content-Type", "text/plain");
        res.setHeader(
          "Content-Disposition",
          `attachment; filename="${filename}"`
        );
        res.send(syllabus.content);
        return;
      }

      // If fileUrl exists
      if (syllabus.fileUrl.startsWith("http")) {
        res.redirect(syllabus.fileUrl);
        return;
      }

      const filePath = path.join(__dirname, "../../uploads", syllabus.fileUrl);

      if (!fs.existsSync(filePath)) {
        sendError(res, "File not found on server", 404);
        return;
      }

      const filename = `${syllabus.category.name}_${syllabus.title.replace(
        /[^a-z0-9]/gi,
        "_"
      )}.pdf`;

      res.setHeader("Content-Type", "application/pdf");
      res.setHeader(
        "Content-Disposition",
        `attachment; filename="${filename}"`
      );

      const fileStream = fs.createReadStream(filePath);
      fileStream.pipe(res);
    } catch (error: any) {
      sendError(res, error.message, 404);
    }
  }

  /**
   * Download all syllabus by category as ZIP
   */
  async downloadCategorySyllabus(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const categoryId = req.params.categoryId;

      const syllabusList = await prisma.syllabus.findMany({
        where: {
          categoryId,
          isPublished: true,
        },
        include: {
          category: true,
        },
        orderBy: {
          order: "asc",
        },
      });

      if (syllabusList.length === 0) {
        sendError(res, "No syllabus found for this category", 404);
        return;
      }

      interface SyllabusFile {
        path: string;
        name: string;
      }

      const files: SyllabusFile[] = syllabusList
        .filter((s: any) => s.fileUrl && !s.fileUrl.startsWith("http"))
        .map((s: any, index: number) => ({
          path: path.join(__dirname, "../../uploads", s.fileUrl!),
          name: `${index + 1}_${s.title.replace(/[^a-z0-9]/gi, "_")}.pdf`,
        }))
        .filter((file: SyllabusFile) => fs.existsSync(file.path));

      if (files.length === 0) {
        sendError(res, "No downloadable files found", 404);
        return;
      }

      const category = syllabusList[0].category;
      await downloadService.createZipArchive(
        res,
        files,
        `${category.name}_syllabus.zip`
      );
    } catch (error: any) {
      sendError(res, error.message, 400);
    }
  }

  /**
   * Get download statistics
   */
  async getDownloadStats(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const stats = await downloadService.getDownloadStats(req.user!.id);
      sendSuccess(res, "Download statistics retrieved successfully", stats);
    } catch (error: any) {
      sendError(res, error.message, 400);
    }
  }

  /**
   * Get user download history
   * NEW METHOD
   */
  async getUserDownloadHistory(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;

      const history = await downloadService.getUserDownloadHistory(
        req.user!.id,
        page,
        limit
      );

      sendSuccess(res, "Download history retrieved successfully", history);
    } catch (error: any) {
      sendError(res, error.message, 400);
    }
  }

  /**
   * Get most downloaded content
   * NEW METHOD
   */
  async getMostDownloaded(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const limit = parseInt(req.query.limit as string) || 10;
      const content = await downloadService.getMostDownloadedContent(limit);
      sendSuccess(
        res,
        "Most downloaded content retrieved successfully",
        content
      );
    } catch (error: any) {
      sendError(res, error.message, 400);
    }
  }

  /**
   * Helper: Get content type
   */
  private getContentType(fileType: string): string {
    const types: { [key: string]: string } = {
      pdf: "application/pdf",
      image: "image/jpeg",
      jpg: "image/jpeg",
      jpeg: "image/jpeg",
      png: "image/png",
      gif: "image/gif",
      text: "text/plain",
      doc: "application/msword",
      docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    };

    return types[fileType.toLowerCase()] || "application/octet-stream";
  }
}
