import prisma from "@/config/database";
import { CreateGroupDTO, UpdateGroupDTO } from "@/types/group.types";
import { PaginatedResponse } from "@/types/common.types";

export class GroupService {
  /**
   * Create a new group
   */
  async createGroup(userId: string, data: CreateGroupDTO) {
    const group = await prisma.group.create({
      data: {
        name: data.name,
        description: data.description,
        type: data.type || "public",
        category: data.category,
        members: {
          create: {
            userId,
            role: "admin", // Creator is admin
          },
        },
      },
      include: {
        members: {
          include: {
            user: {
              select: {
                id: true,
                fullName: true,
                avatar: true,
              },
            },
          },
        },
        _count: {
          select: {
            members: true,
          },
        },
      },
    });

    // Create notification for group creation
    await prisma.notification.create({
      data: {
        userId,
        title: "Group Created",
        message: `You created the group "${data.name}"`,
        type: "success",
        data: {
          groupId: group.id,
          groupName: group.name,
        },
      },
    });

    return group;
  }

  /**
   * Get all groups with filters
   */
  async getGroups(
    filters: {
      type?: string;
      category?: string;
      search?: string;
      page?: number;
      limit?: number;
    },
    userId?: string
  ): Promise<PaginatedResponse<any>> {
    const page = filters.page || 1;
    const limit = filters.limit || 10;
    const skip = (page - 1) * limit;

    const where: any = {};

    if (filters.type) {
      where.type = filters.type;
    }

    if (filters.category) {
      where.category = filters.category;
    }

    if (filters.search) {
      where.OR = [
        { name: { contains: filters.search, mode: "insensitive" } },
        { description: { contains: filters.search, mode: "insensitive" } },
      ];
    }

    const [groups, total] = await Promise.all([
      prisma.group.findMany({
        where,
        skip,
        take: limit,
        orderBy: {
          createdAt: "desc",
        },
        include: {
          _count: {
            select: {
              members: true,
            },
          },
        },
      }),
      prisma.group.count({ where }),
    ]);

    // If user is logged in, check their membership status
    if (userId) {
      const groupsWithMembership = await Promise.all(
        groups.map(async (group) => {
          const membership = await prisma.groupMember.findFirst({
            where: {
              groupId: group.id,
              userId,
            },
          });

          return {
            ...group,
            isMember: !!membership,
            memberRole: membership?.role || null,
          };
        })
      );

      return {
        data: groupsWithMembership,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      };
    }

    return {
      data: groups,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Get group by ID
   */
  async getGroupById(groupId: string, userId?: string) {
    const group = await prisma.group.findUnique({
      where: { id: groupId },
      include: {
        members: {
          include: {
            user: {
              select: {
                id: true,
                fullName: true,
                avatar: true,
                bio: true,
              },
            },
          },
          orderBy: [
            { role: "asc" }, // Admins first
            { joinedAt: "asc" },
          ],
        },
        _count: {
          select: {
            members: true,
          },
        },
      },
    });

    if (!group) {
      throw new Error("Group not found");
    }

    // Check user's membership status
    let userMembership = null;
    if (userId) {
      const membership = await prisma.groupMember.findFirst({
        where: {
          groupId,
          userId,
        },
      });

      userMembership = {
        isMember: !!membership,
        role: membership?.role || null,
        joinedAt: membership?.joinedAt || null,
      };
    }

    return {
      ...group,
      userMembership,
    };
  }

  /**
   * Update group
   */
  async updateGroup(groupId: string, userId: string, data: UpdateGroupDTO) {
    // Check if user is admin
    const membership = await prisma.groupMember.findFirst({
      where: {
        groupId,
        userId,
        role: { in: ["admin"] },
      },
    });

    if (!membership) {
      throw new Error("Only group admins can update the group");
    }

    const group = await prisma.group.update({
      where: { id: groupId },
      data: {
        name: data.name,
        description: data.description,
        avatar: data.avatar,
        type: data.type,
        category: data.category,
      },
      include: {
        _count: {
          select: {
            members: true,
          },
        },
      },
    });

    return group;
  }

  /**
   * Delete group
   */
  async deleteGroup(groupId: string, userId: string) {
    // Check if user is admin
    const membership = await prisma.groupMember.findFirst({
      where: {
        groupId,
        userId,
        role: "admin",
      },
    });

    if (!membership) {
      throw new Error("Only group admins can delete the group");
    }

    await prisma.group.delete({
      where: { id: groupId },
    });
  }

  /**
   * Join group
   */
  async joinGroup(groupId: string, userId: string) {
    const group = await prisma.group.findUnique({
      where: { id: groupId },
    });

    if (!group) {
      throw new Error("Group not found");
    }

    // Check if user is already a member
    const existingMember = await prisma.groupMember.findFirst({
      where: {
        groupId,
        userId,
      },
    });

    if (existingMember) {
      throw new Error("You are already a member of this group");
    }

    // For private groups, this would need approval (simplified here)
    if (group.type === "private") {
      throw new Error(
        "This is a private group. You need an invitation to join."
      );
    }

    const member = await prisma.groupMember.create({
      data: {
        groupId,
        userId,
        role: "member",
      },
      include: {
        user: {
          select: {
            id: true,
            fullName: true,
            avatar: true,
          },
        },
        group: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    // Notify group admins
    const admins = await prisma.groupMember.findMany({
      where: {
        groupId,
        role: "admin",
      },
      select: {
        userId: true,
      },
    });

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { fullName: true },
    });

    await Promise.all(
      admins.map((admin) =>
        prisma.notification.create({
          data: {
            userId: admin.userId,
            title: "New Group Member",
            message: `${user?.fullName} joined ${group.name}`,
            type: "info",
            data: {
              groupId,
              groupName: group.name,
              newMemberId: userId,
            },
          },
        })
      )
    );

    return member;
  }

  /**
   * Leave group
   */
  async leaveGroup(groupId: string, userId: string) {
    const membership = await prisma.groupMember.findFirst({
      where: {
        groupId,
        userId,
      },
    });

    if (!membership) {
      throw new Error("You are not a member of this group");
    }

    // Check if user is the only admin
    if (membership.role === "admin") {
      const adminCount = await prisma.groupMember.count({
        where: {
          groupId,
          role: "admin",
        },
      });

      if (adminCount === 1) {
        const memberCount = await prisma.groupMember.count({
          where: { groupId },
        });

        if (memberCount > 1) {
          throw new Error(
            "You are the only admin. Please assign another admin before leaving."
          );
        }
      }
    }

    await prisma.groupMember.delete({
      where: { id: membership.id },
    });

    // If this was the last member, delete the group
    const remainingMembers = await prisma.groupMember.count({
      where: { groupId },
    });

    if (remainingMembers === 0) {
      await prisma.group.delete({
        where: { id: groupId },
      });
    }
  }

  /**
   * Update member role (admin/moderator/member)
   */
  async updateMemberRole(
    groupId: string,
    adminUserId: string,
    targetUserId: string,
    newRole: "admin" | "moderator" | "member"
  ) {
    // Check if requesting user is admin
    const adminMembership = await prisma.groupMember.findFirst({
      where: {
        groupId,
        userId: adminUserId,
        role: "admin",
      },
    });

    if (!adminMembership) {
      throw new Error("Only admins can change member roles");
    }

    // Find target member
    const targetMembership = await prisma.groupMember.findFirst({
      where: {
        groupId,
        userId: targetUserId,
      },
    });

    if (!targetMembership) {
      throw new Error("User is not a member of this group");
    }

    // Update role
    const updatedMember = await prisma.groupMember.update({
      where: { id: targetMembership.id },
      data: { role: newRole },
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

    // Notify the user
    const group = await prisma.group.findUnique({
      where: { id: groupId },
      select: { name: true },
    });

    await prisma.notification.create({
      data: {
        userId: targetUserId,
        title: "Role Updated",
        message: `Your role in ${group?.name} has been changed to ${newRole}`,
        type: "info",
        data: {
          groupId,
          groupName: group?.name,
          newRole,
        },
      },
    });

    return updatedMember;
  }

  /**
   * Remove member from group
   */
  async removeMember(
    groupId: string,
    adminUserId: string,
    targetUserId: string
  ) {
    // Check if requesting user is admin
    const adminMembership = await prisma.groupMember.findFirst({
      where: {
        groupId,
        userId: adminUserId,
        role: "admin",
      },
    });

    if (!adminMembership) {
      throw new Error("Only admins can remove members");
    }

    // Find target member
    const targetMembership = await prisma.groupMember.findFirst({
      where: {
        groupId,
        userId: targetUserId,
      },
    });

    if (!targetMembership) {
      throw new Error("User is not a member of this group");
    }

    // Cannot remove yourself (use leave instead)
    if (targetUserId === adminUserId) {
      throw new Error("Use leave group to remove yourself");
    }

    await prisma.groupMember.delete({
      where: { id: targetMembership.id },
    });

    // Notify the removed user
    const group = await prisma.group.findUnique({
      where: { id: groupId },
      select: { name: true },
    });

    await prisma.notification.create({
      data: {
        userId: targetUserId,
        title: "Removed from Group",
        message: `You have been removed from ${group?.name}`,
        type: "warning",
        data: {
          groupId,
          groupName: group?.name,
        },
      },
    });
  }

  /**
   * Get user's groups
   */
  async getUserGroups(userId: string, page = 1, limit = 10) {
    const skip = (page - 1) * limit;

    const [memberships, total] = await Promise.all([
      prisma.groupMember.findMany({
        where: { userId },
        skip,
        take: limit,
        orderBy: {
          joinedAt: "desc",
        },
        include: {
          group: {
            include: {
              _count: {
                select: {
                  members: true,
                },
              },
            },
          },
        },
      }),
      prisma.groupMember.count({ where: { userId } }),
    ]);

    const groups = memberships.map((m) => ({
      ...m.group,
      memberRole: m.role,
      joinedAt: m.joinedAt,
    }));

    return {
      data: groups,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Get group members
   */
  async getGroupMembers(groupId: string, page = 1, limit = 50) {
    const skip = (page - 1) * limit;

    const [members, total] = await Promise.all([
      prisma.groupMember.findMany({
        where: { groupId },
        skip,
        take: limit,
        orderBy: [{ role: "asc" }, { joinedAt: "asc" }],
        include: {
          user: {
            select: {
              id: true,
              fullName: true,
              avatar: true,
              bio: true,
              profile: {
                select: {
                  points: true,
                },
              },
            },
          },
        },
      }),
      prisma.groupMember.count({ where: { groupId } }),
    ]);

    return {
      data: members,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }
}
