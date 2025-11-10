import prisma from "@/config/database";
import { config } from "@/config/env";
import path from "path";
import fs from "fs";

export class UploadService {
  /**
   * Save file metadata to database
   */
  async saveFileMetadata(
    userId: string,
    file: Express.Multer.File,
    category?: string
  ) {
    const fileUrl = `${config.frontend.url}/uploads/${category || "general"}/${
      file.filename
    }`;

    const uploadedFile = await prisma.uploadedFile.create({
      data: {
        userId,
        fileName: file.filename,
        originalName: file.originalname,
        mimeType: file.mimetype,
        size: file.size,
        path: file.path,
        url: fileUrl,
        category: category || "general",
      },
    });

    return uploadedFile;
  }

  /**
   * Save multiple files metadata
   */
  async saveMultipleFilesMetadata(
    userId: string,
    files: Express.Multer.File[],
    category?: string
  ) {
    const uploadedFiles = await Promise.all(
      files.map((file) => this.saveFileMetadata(userId, file, category))
    );

    return uploadedFiles;
  }

  /**
   * Get file by ID
   */
  async getFileById(fileId: string) {
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

    return file;
  }

  /**
   * Delete file
   */
  async deleteFile(fileId: string, userId: string) {
    const file = await prisma.uploadedFile.findUnique({
      where: { id: fileId },
    });

    if (!file) {
      throw new Error("File not found");
    }

    if (file.userId !== userId) {
      throw new Error("Unauthorized to delete this file");
    }

    // Delete physical file
    if (fs.existsSync(file.path)) {
      fs.unlinkSync(file.path);
    }

    // Delete from database
    await prisma.uploadedFile.delete({
      where: { id: fileId },
    });
  }

  /**
   * Get user's uploaded files
   */
  async getUserFiles(userId: string, category?: string) {
    const where: any = { userId };
    if (category) {
      where.category = category;
    }

    const files = await prisma.uploadedFile.findMany({
      where,
      orderBy: {
        createdAt: "desc",
      },
    });

    return files;
  }
}
