import { Server, Socket } from "socket.io";
import prisma from "@/config/database";
import { GroupChatService } from "@/services/groupChat.service";

interface AuthenticatedSocket extends Socket {
  userId?: string;
}

const groupChatService = new GroupChatService();

export class ChatHandler {
  private io: Server;
  private socket: AuthenticatedSocket;

  constructor(io: Server, socket: AuthenticatedSocket) {
    this.io = io;
    this.socket = socket;
  }

  initialize() {
    this.socket.on("chat:join-group", this.handleJoinGroup.bind(this));
    this.socket.on("chat:leave-group", this.handleLeaveGroup.bind(this));
    this.socket.on("chat:send-message", this.handleSendMessage.bind(this));
    this.socket.on("chat:edit-message", this.handleEditMessage.bind(this));
    this.socket.on("chat:delete-message", this.handleDeleteMessage.bind(this));
    this.socket.on("chat:typing", this.handleTyping.bind(this));
    this.socket.on("chat:stop-typing", this.handleStopTyping.bind(this));
    this.socket.on("chat:load-messages", this.handleLoadMessages.bind(this));
    this.socket.on("chat:mark-read", this.handleMarkRead.bind(this));
  }

  private async handleJoinGroup(data: { groupId: string }) {
    try {
      const { groupId } = data;

      // Verify user is a member
      const member = await prisma.groupMember.findFirst({
        where: {
          groupId,
          userId: this.socket.userId!,
        },
      });

      if (!member) {
        this.socket.emit("error", {
          message: "You are not a member of this group",
        });
        return;
      }

      // Join group room
      this.socket.join(`group:${groupId}`);

      // Get online members count
      const room = this.io.sockets.adapter.rooms.get(`group:${groupId}`);
      const onlineCount = room ? room.size : 0;

      // Notify others
      this.socket.to(`group:${groupId}`).emit("chat:user-joined", {
        userId: this.socket.userId,
        groupId,
        onlineCount,
      });

      // Send current online count to joining user
      this.socket.emit("chat:joined", {
        groupId,
        onlineCount,
      });

      console.log(`User ${this.socket.userId} joined group ${groupId}`);
    } catch (error: any) {
      this.socket.emit("error", { message: error.message });
    }
  }

  private handleLeaveGroup(data: { groupId: string }) {
    const { groupId } = data;

    this.socket.leave(`group:${groupId}`);

    const room = this.io.sockets.adapter.rooms.get(`group:${groupId}`);
    const onlineCount = room ? room.size : 0;

    this.socket.to(`group:${groupId}`).emit("chat:user-left", {
      userId: this.socket.userId,
      groupId,
      onlineCount,
    });
  }

  private async handleSendMessage(data: {
    groupId: string;
    content: string;
    messageType?: string;
    fileUrl?: string;
    fileName?: string;
    fileSize?: number;
    replyToId?: string;
  }) {
    try {
      // Save message to database using service
      const message = await groupChatService.sendMessage(
        data.groupId,
        this.socket.userId!,
        data.content,
        data.messageType || "text",
        data.fileUrl,
        data.fileName,
        data.fileSize,
        data.replyToId
      );

      // Broadcast to group
      this.io.to(`group:${data.groupId}`).emit("chat:new-message", message);

      // Send notification to offline members
      this.notifyOfflineMembers(data.groupId, message);
    } catch (error: any) {
      this.socket.emit("error", { message: error.message });
    }
  }

  private async handleEditMessage(data: {
    messageId: string;
    content: string;
  }) {
    try {
      const updatedMessage = await groupChatService.editMessage(
        data.messageId,
        this.socket.userId!,
        data.content
      );

      const message = await prisma.groupMessage.findUnique({
        where: { id: data.messageId },
        select: { groupId: true },
      });

      if (message) {
        this.io
          .to(`group:${message.groupId}`)
          .emit("chat:message-edited", updatedMessage);
      }
    } catch (error: any) {
      this.socket.emit("error", { message: error.message });
    }
  }

  private async handleDeleteMessage(data: { messageId: string }) {
    try {
      const message = await prisma.groupMessage.findUnique({
        where: { id: data.messageId },
        select: { groupId: true },
      });

      await groupChatService.deleteMessage(data.messageId, this.socket.userId!);

      if (message) {
        this.io.to(`group:${message.groupId}`).emit("chat:message-deleted", {
          messageId: data.messageId,
        });
      }
    } catch (error: any) {
      this.socket.emit("error", { message: error.message });
    }
  }

  private handleTyping(data: { groupId: string }) {
    this.socket.to(`group:${data.groupId}`).emit("chat:user-typing", {
      userId: this.socket.userId,
      groupId: data.groupId,
    });
  }

  private handleStopTyping(data: { groupId: string }) {
    this.socket.to(`group:${data.groupId}`).emit("chat:user-stop-typing", {
      userId: this.socket.userId,
      groupId: data.groupId,
    });
  }

  private async handleLoadMessages(data: {
    groupId: string;
    cursor?: string;
    limit?: number;
  }) {
    try {
      const limit = data.limit || 50;
      const where: any = {
        groupId: data.groupId,
        isDeleted: false,
      };

      if (data.cursor) {
        where.id = { lt: data.cursor };
      }

      const messages = await prisma.groupMessage.findMany({
        where,
        take: limit,
        orderBy: {
          createdAt: "desc",
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

      this.socket.emit("chat:messages-loaded", {
        messages: messages.reverse(),
        hasMore: messages.length === limit,
        cursor: messages.length > 0 ? messages[0].id : null,
      });
    } catch (error: any) {
      this.socket.emit("error", { message: error.message });
    }
  }

  private handleMarkRead(data: { groupId: string; messageId: string }) {
    // Broadcast read receipt
    this.socket.to(`group:${data.groupId}`).emit("chat:message-read", {
      userId: this.socket.userId,
      messageId: data.messageId,
      groupId: data.groupId,
    });
  }

  /**
   * Notify offline members
   */
  private async notifyOfflineMembers(groupId: string, message: any) {
    try {
      // Get all group members
      const members = await prisma.groupMember.findMany({
        where: { groupId },
        select: { userId: true },
      });

      // Get online members in this group
      const room = this.io.sockets.adapter.rooms.get(`group:${groupId}`);
      const onlineSockets = room ? Array.from(room) : [];

      // Get online user IDs
      const onlineUserIds = new Set<string>();
      for (const socketId of onlineSockets) {
        const socket = this.io.sockets.sockets.get(
          socketId
        ) as AuthenticatedSocket;
        if (socket?.userId) {
          onlineUserIds.add(socket.userId);
        }
      }

      // Get group name
      const group = await prisma.group.findUnique({
        where: { id: groupId },
        select: { name: true },
      });

      // Create notifications for offline members
      const offlineMembers = members.filter(
        (m) => !onlineUserIds.has(m.userId)
      );

      if (offlineMembers.length > 0) {
        await prisma.notification.createMany({
          data: offlineMembers.map((member) => ({
            userId: member.userId,
            title: `New message in ${group?.name}`,
            message: `${message.sender.fullName}: ${message.content.substring(
              0,
              50
            )}${message.content.length > 50 ? "..." : ""}`,
            type: "info",
            data: {
              groupId,
              messageId: message.id,
              type: "group_message",
            },
          })),
        });
      }
    } catch (error) {
      console.error("Error notifying offline members:", error);
    }
  }
}
