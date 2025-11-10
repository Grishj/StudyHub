import { Server, Socket } from "socket.io";
import prisma from "@/config/database";

interface AuthenticatedSocket extends Socket {
  userId?: string;
}

interface ActiveCall {
  groupId: string;
  participants: Set<string>;
  startedAt: Date;
  type: "audio" | "video";
}

export class WebRTCHandler {
  private io: Server;
  private socket: AuthenticatedSocket;
  private activeCalls: Map<string, ActiveCall> = new Map();

  constructor(io: Server, socket: AuthenticatedSocket) {
    this.io = io;
    this.socket = socket;
  }

  initialize() {
    // Call management
    this.socket.on("call:start", this.handleStartCall.bind(this));
    this.socket.on("call:join", this.handleJoinCall.bind(this));
    this.socket.on("call:leave", this.handleLeaveCall.bind(this));
    this.socket.on("call:end", this.handleEndCall.bind(this));

    // WebRTC signaling
    this.socket.on("webrtc:offer", this.handleOffer.bind(this));
    this.socket.on("webrtc:answer", this.handleAnswer.bind(this));
    this.socket.on("webrtc:ice-candidate", this.handleIceCandidate.bind(this));

    // Media controls
    this.socket.on("call:toggle-audio", this.handleToggleAudio.bind(this));
    this.socket.on("call:toggle-video", this.handleToggleVideo.bind(this));
    this.socket.on(
      "call:start-screen-share",
      this.handleStartScreenShare.bind(this)
    );
    this.socket.on(
      "call:stop-screen-share",
      this.handleStopScreenShare.bind(this)
    );
  }

  private async handleStartCall(data: {
    groupId: string;
    type: "audio" | "video";
  }) {
    try {
      // Verify membership
      const member = await prisma.groupMember.findFirst({
        where: {
          groupId: data.groupId,
          userId: this.socket.userId!,
        },
      });

      if (!member) {
        this.socket.emit("error", {
          message: "You are not a member of this group",
        });
        return;
      }

      const roomId = `call:${data.groupId}`;

      // Check if there's already an active call
      if (this.activeCalls.has(data.groupId)) {
        this.socket.emit("error", { message: "A call is already in progress" });
        return;
      }

      // Create active call
      this.activeCalls.set(data.groupId, {
        groupId: data.groupId,
        participants: new Set([this.socket.userId!]),
        startedAt: new Date(),
        type: data.type,
      });

      // Join call room
      this.socket.join(roomId);

      // Get group info
      const group = await prisma.group.findUnique({
        where: { id: data.groupId },
        select: { name: true },
      });

      // Notify all group members about the call
      this.io.to(`group:${data.groupId}`).emit("call:started", {
        groupId: data.groupId,
        groupName: group?.name,
        type: data.type,
        startedBy: this.socket.userId,
        callId: roomId,
      });

      this.socket.emit("call:created", {
        callId: roomId,
        groupId: data.groupId,
        type: data.type,
      });
    } catch (error: any) {
      this.socket.emit("error", { message: error.message });
    }
  }

  private async handleJoinCall(data: { groupId: string }) {
    try {
      // Verify membership
      const member = await prisma.groupMember.findFirst({
        where: {
          groupId: data.groupId,
          userId: this.socket.userId!,
        },
      });

      if (!member) {
        this.socket.emit("error", {
          message: "You are not a member of this group",
        });
        return;
      }

      const roomId = `call:${data.groupId}`;
      const activeCall = this.activeCalls.get(data.groupId);

      if (!activeCall) {
        this.socket.emit("error", { message: "No active call in this group" });
        return;
      }

      // Get existing participants
      const socketsInRoom = await this.io.in(roomId).fetchSockets();
      const peers = socketsInRoom
        .filter((s: any) => s.userId !== this.socket.userId)
        .map((s: any) => ({
          userId: s.userId,
          socketId: s.id,
        }));

      // Join room
      this.socket.join(roomId);

      // Add to active call participants
      activeCall.participants.add(this.socket.userId!);

      // Notify others
      this.socket.to(roomId).emit("call:user-joined", {
        userId: this.socket.userId,
        socketId: this.socket.id,
      });

      // Send existing peers to new user
      this.socket.emit("call:peers", {
        peers,
        callType: activeCall.type,
      });

      console.log(
        `User ${this.socket.userId} joined call in group ${data.groupId}`
      );
    } catch (error: any) {
      this.socket.emit("error", { message: error.message });
    }
  }

  private handleLeaveCall(data: { groupId: string }) {
    const roomId = `call:${data.groupId}`;
    const activeCall = this.activeCalls.get(data.groupId);

    if (activeCall) {
      activeCall.participants.delete(this.socket.userId!);

      // If no participants left, remove the call
      if (activeCall.participants.size === 0) {
        this.activeCalls.delete(data.groupId);
        this.io.to(`group:${data.groupId}`).emit("call:ended", {
          groupId: data.groupId,
        });
      }
    }

    this.socket.leave(roomId);

    this.socket.to(roomId).emit("call:user-left", {
      userId: this.socket.userId,
      socketId: this.socket.id,
    });
  }

  private handleEndCall(data: { groupId: string }) {
    const roomId = `call:${data.groupId}`;

    // Remove active call
    this.activeCalls.delete(data.groupId);

    // Notify all participants
    this.io.to(roomId).emit("call:ended", {
      groupId: data.groupId,
      endedBy: this.socket.userId,
    });

    // Make all sockets leave the room
    this.io.in(roomId).socketsLeave(roomId);
  }

  private handleOffer(data: { to: string; offer: any }) {
    this.io.to(data.to).emit("webrtc:offer", {
      from: this.socket.id,
      fromUserId: this.socket.userId,
      offer: data.offer,
    });
  }

  private handleAnswer(data: { to: string; answer: any }) {
    this.io.to(data.to).emit("webrtc:answer", {
      from: this.socket.id,
      fromUserId: this.socket.userId,
      answer: data.answer,
    });
  }

  private handleIceCandidate(data: { to: string; candidate: any }) {
    this.io.to(data.to).emit("webrtc:ice-candidate", {
      from: this.socket.id,
      candidate: data.candidate,
    });
  }

  private handleToggleAudio(data: { groupId: string; enabled: boolean }) {
    const roomId = `call:${data.groupId}`;

    this.socket.to(roomId).emit("call:audio-toggled", {
      userId: this.socket.userId,
      enabled: data.enabled,
    });
  }

  private handleToggleVideo(data: { groupId: string; enabled: boolean }) {
    const roomId = `call:${data.groupId}`;

    this.socket.to(roomId).emit("call:video-toggled", {
      userId: this.socket.userId,
      enabled: data.enabled,
    });
  }

  private handleStartScreenShare(data: { groupId: string }) {
    const roomId = `call:${data.groupId}`;

    this.socket.to(roomId).emit("call:screen-share-started", {
      userId: this.socket.userId,
      socketId: this.socket.id,
    });
  }

  private handleStopScreenShare(data: { groupId: string }) {
    const roomId = `call:${data.groupId}`;

    this.socket.to(roomId).emit("call:screen-share-stopped", {
      userId: this.socket.userId,
    });
  }
}
