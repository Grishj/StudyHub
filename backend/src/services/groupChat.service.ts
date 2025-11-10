import prisma from '@/config/database';
import { PaginatedResponse } from '@/types/common.types';

export class GroupChatService {
  /**
   * Get group messages with pagination
   */
  async getGroupMessages(
    groupId: string,
    userId: string,
    page = 1,
    limit = 50
  ): Promise<PaginatedResponse<any>> {
    // Verify user is a member
    const member = await prisma.groupMember.findFirst({
      where: {
        groupId,
        userId,
      },
    });

    if (!member) {
      throw new Error('You are not a member of this group');
    }

    const skip = (page - 1) * limit;

    const [messages, total] = await Promise.all([
      prisma.groupMessage.findMany({
        where: {
          groupId,
          isDeleted: false,
        },
        skip,
        take: limit,
        orderBy: {
          createdAt: 'desc',
        },
        include: {
          sender: {
            select: {
              id: true,
              fullName: true,
              avatar: true,
            },
          },
          replyTo: {
            select: {
              id: true,
              content: true,
              sender: {
                select: {
                  fullName: true,
                },
              },
            },
          },
        },
      }),
      prisma.groupMessage.count({
        where: {
          groupId,
          isDeleted: false,
        },
      }),
    ]);

    return {
      data: messages.reverse(), // Oldest first
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Send a message to group
   */
  async sendMessage(
    groupId: string,
    userId: string,
    content: string,
    messageType: string = 'text',
    fileUrl?: string,
    fileName?: string,
    fileSize?: number,
    replyToId?: string
  ) {
    // Verify membership
    const member = await prisma.groupMember.findFirst({
      where: {
        groupId,
        userId,
      },
    });

    if (!member) {
      throw new Error('You are not a member of this group');
    }

    const message = await prisma.groupMessage.create({
      data: {
        groupId,
        userId,
        content,
        messageType,
        fileUrl,
        fileName,
        fileSize,
        replyToId,
      },
      include: {
        sender: {
          select: {
            id: true,
            fullName: true,
            avatar: true,
          },
        },
        replyTo: {
          select: {
            id: true,
            content: true,
            sender: {
              select: {
                fullName: true,
              },
            },
          },
        },
      },
    });

    return message;
  }

  /**
   * Edit message
   */
  async editMessage(messageId: string, userId: string, content: string) {
    const message = await prisma.groupMessage.findUnique({
      where: { id: messageId },
    });

    if (!message) {
      throw new Error('Message not found');
    }

    if (message.userId !== userId) {
      throw new Error('You can only edit your own messages');
    }

    const updatedMessage = await prisma.groupMessage.update({
      where: { id: messageId },
      data: {
        content,
        isEdited: true,
      },
      include: {
        sender: {
          select: {
            id: true,
            fullName: true,
            avatar: true,
          },
        },
      },
    });

    return updatedMessage;
  }

  /**
   * Delete message
   */
  async deleteMessage(messageId: string, userId: string) {
    const message = await prisma.groupMessage.findUnique({
      where: { id: messageId },
    });

    if (!message) {
      throw new Error('Message not found');
    }

    if (message.userId !== userId) {
      throw new Error('You can only delete your own messages');
    }

    await prisma.groupMessage.update({
      where: { id: messageId },
      data: {
        isDeleted: true,
        content: 'This message was deleted',
      },
    });
  }

  /**
   * Get group message statistics
   */
  async getGroupChatStats(groupId: string, userId: string) {
    // Verify membership
    const member = await prisma.groupMember.findFirst({
      where: {
        groupId,
        userId,
      },
    });

    if (!member) {
      throw new Error('You are not a member of this group');
    }

    const [totalMessages, messagesByType, topContributors] = await Promise.all([
      prisma.groupMessage.count({
        where: {
          groupId,
          isDeleted: false,
        },
      }),
      prisma.groupMessage.groupBy({
        by: ['messageType'],
        where: {
          groupId,
          isDeleted: false,
        },
        _count: true,
      }),
      prisma.groupMessage.groupBy({
        by: ['userId'],
        where: {
          groupId,
          isDeleted: false,
        },
        _count: true,
        orderBy: {
          _count: {
            userId: 'desc',
          },
        },
        take: 5,
      }),
    ]);

    // Get user details for top contributors
    const contributorDetails = await Promise.all(
      topContributors.map(async (contributor) => {
        const user = await prisma.user.findUnique({
          where: { id: contributor.userId },
          select: {
            id: true,
            fullName: true,
            avatar: true,
          },
        });

        return {
          user,
          messageCount: contributor._count,
        };
      })
    );

    return {
      totalMessages,
      messagesByType,
      topContributors: contributorDetails,
    };
  }

  /**
   * Search messages in group
   */
  async searchMessages(groupId: string, userId: string, query: string, limit = 20) {
    // Verify membership
    const member = await prisma.groupMember.findFirst({
      where: {
        groupId,
        userId,
      },
    });

    if (!member) {
      throw new Error('You are not a member of this group');
    }

    const messages = await prisma.groupMessage.findMany({
      where: {
        groupId,
        isDeleted: false,
        content: {
          contains: query,
          mode: 'insensitive',
        },
      },
      take: limit,
      orderBy: {
        createdAt: 'desc',
      },
      include: {
        sender: {
          select: {
            id: true,
            fullName: true,
            avatar: true,
          },
        },
      },
    });

    return messages;
  }

  /**
   * Upload file to group chat
   */
  async uploadChatFile(
    groupId: string,
    userId: string,
    fileUrl: string,
    fileName: string,
    fileSize: number,
    fileType: string
  ) {
    return await this.sendMessage(
      groupId,
      userId,
      fileName, // Use filename as content
      fileType, // image, video, audio, file
      fileUrl,
      fileName,
      fileSize
    );
  }
}