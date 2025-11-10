import { Request, Response, NextFunction } from 'express';
import { GroupChatService } from '@/services/groupChat.service';
import { sendSuccess, sendError } from '@/utils/response.util';

const groupChatService = new GroupChatService();

export class GroupChatController {
  /**
   * Get group messages
   */
  async getMessages(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const groupId = req.params.groupId;
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 50;

      const messages = await groupChatService.getGroupMessages(
        groupId,
        req.user!.id,
        page,
        limit
      );

      sendSuccess(res, 'Messages retrieved successfully', messages);
    } catch (error: any) {
      sendError(res, error.message, 400);
    }
  }

  /**
   * Send message (REST API fallback, WebSocket preferred)
   */
  async sendMessage(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const groupId = req.params.groupId;
      const { content, messageType, fileUrl, fileName, fileSize, replyToId } = req.body;

      const message = await groupChatService.sendMessage(
        groupId,
        req.user!.id,
        content,
        messageType,
        fileUrl,
        fileName,
        fileSize,
        replyToId
      );

      sendSuccess(res, 'Message sent successfully', message, 201);
    } catch (error: any) {
      sendError(res, error.message, 400);
    }
  }

  /**
   * Edit message
   */
  async editMessage(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { messageId } = req.params;
      const { content } = req.body;

      const message = await groupChatService.editMessage(
        messageId,
        req.user!.id,
        content
      );

      sendSuccess(res, 'Message updated successfully', message);
    } catch (error: any) {
      sendError(res, error.message, 400);
    }
  }

  /**
   * Delete message
   */
  async deleteMessage(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      await groupChatService.deleteMessage(req.params.messageId, req.user!.id);
      sendSuccess(res, 'Message deleted successfully');
    } catch (error: any) {
      sendError(res, error.message, 400);
    }
  }

  /**
   * Get chat statistics
   */
  async getChatStats(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const stats = await groupChatService.getGroupChatStats(
        req.params.groupId,
        req.user!.id
      );
      sendSuccess(res, 'Chat statistics retrieved successfully', stats);
    } catch (error: any) {
      sendError(res, error.message, 400);
    }
  }

  /**
   * Search messages
   */
  async searchMessages(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { groupId } = req.params;
      const query = req.query.q as string;
      const limit = parseInt(req.query.limit as string) || 20;

      if (!query || query.length < 2) {
        sendError(res, 'Search query must be at least 2 characters', 400);
        return;
      }

      const messages = await groupChatService.searchMessages(
        groupId,
        req.user!.id,
        query,
        limit
      );

      sendSuccess(res, 'Search results retrieved successfully', messages);
    } catch (error: any) {
      sendError(res, error.message, 400);
    }
  }

  /**
   * Upload file to chat
   */
  async uploadFile(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.file) {
        sendError(res, 'No file uploaded', 400);
        return;
      }

      const { groupId } = req.params;
      const fileUrl = `/uploads/chat/${req.file.filename}`;

      const message = await groupChatService.uploadChatFile(
        groupId,
        req.user!.id,
        fileUrl,
        req.file.originalname,
        req.file.size,
        this.getMessageType(req.file.mimetype)
      );

      sendSuccess(res, 'File uploaded successfully', message, 201);
    } catch (error: any) {
      sendError(res, error.message, 400);
    }
  }

  /**
   * Helper to determine message type from mime type
   */
  private getMessageType(mimeType: string): string {
    if (mimeType.startsWith('image/')) return 'image';
    if (mimeType.startsWith('video/')) return 'video';
    if (mimeType.startsWith('audio/')) return 'audio';
    return 'file';
  }
}