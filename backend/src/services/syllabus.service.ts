import prisma from "@/config/database";
import {
  CreateSyllabusDTO,
  UpdateSyllabusDTO,
  ReorderSyllabusDTO,
} from "@/types/category.types";

export class SyllabusService {
  /**
   * Create syllabus item
   */
  async createSyllabus(data: CreateSyllabusDTO) {
    // Verify category exists
    const category = await prisma.category.findUnique({
      where: { id: data.categoryId },
    });

    if (!category) {
      throw new Error("Category not found");
    }

    // If order is not specified, add to the end
    let order = data.order;
    if (order === undefined) {
      const lastSyllabus = await prisma.syllabus.findFirst({
        where: { categoryId: data.categoryId },
        orderBy: { order: "desc" },
      });

      order = lastSyllabus ? lastSyllabus.order + 1 : 0;
    }

    const syllabus = await prisma.syllabus.create({
      data: {
        categoryId: data.categoryId,
        title: data.title,
        description: data.description,
        content: data.content,
        fileUrl: data.fileUrl,
        order,
        isPublished: data.isPublished !== undefined ? data.isPublished : true,
      },
      include: {
        category: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    return syllabus;
  }

  /**
   * Get all syllabus items
   */
  async getAllSyllabus(categoryId?: string, includeUnpublished = false) {
    const where: any = {};

    if (categoryId) {
      where.categoryId = categoryId;
    }

    if (!includeUnpublished) {
      where.isPublished = true;
    }

    const syllabusList = await prisma.syllabus.findMany({
      where,
      orderBy: [{ categoryId: "asc" }, { order: "asc" }],
      include: {
        category: {
          select: {
            id: true,
            name: true,
            icon: true,
          },
        },
      },
    });

    return syllabusList;
  }

  /**
   * Get syllabus by category
   */
  async getSyllabusByCategory(categoryId: string, includeUnpublished = false) {
    const category = await prisma.category.findUnique({
      where: { id: categoryId },
    });

    if (!category) {
      throw new Error("Category not found");
    }

    const where: any = { categoryId };

    if (!includeUnpublished) {
      where.isPublished = true;
    }

    const syllabusList = await prisma.syllabus.findMany({
      where,
      orderBy: { order: "asc" },
    });

    return {
      category,
      syllabus: syllabusList,
    };
  }

  /**
   * Get syllabus by ID
   */
  async getSyllabusById(syllabusId: string) {
    const syllabus = await prisma.syllabus.findUnique({
      where: { id: syllabusId },
      include: {
        category: {
          select: {
            id: true,
            name: true,
            description: true,
            icon: true,
          },
        },
      },
    });

    if (!syllabus) {
      throw new Error("Syllabus not found");
    }

    return syllabus;
  }

  /**
   * Update syllabus
   */
  async updateSyllabus(syllabusId: string, data: UpdateSyllabusDTO) {
    const existingSyllabus = await prisma.syllabus.findUnique({
      where: { id: syllabusId },
    });

    if (!existingSyllabus) {
      throw new Error("Syllabus not found");
    }

    const syllabus = await prisma.syllabus.update({
      where: { id: syllabusId },
      data: {
        title: data.title,
        description: data.description,
        content: data.content,
        fileUrl: data.fileUrl,
        order: data.order,
        isPublished: data.isPublished,
      },
      include: {
        category: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    return syllabus;
  }

  /**
   * Delete syllabus
   */
  async deleteSyllabus(syllabusId: string) {
    const syllabus = await prisma.syllabus.findUnique({
      where: { id: syllabusId },
    });

    if (!syllabus) {
      throw new Error("Syllabus not found");
    }

    await prisma.syllabus.delete({
      where: { id: syllabusId },
    });

    // Reorder remaining syllabus items
    await this.reorderAfterDelete(syllabus.categoryId, syllabus.order);
  }

  /**
   * Reorder syllabus items
   */
  async reorderSyllabus(categoryId: string, items: ReorderSyllabusDTO[]) {
    // Verify all syllabus items belong to the category
    const syllabusIds = items.map((item) => item.syllabusId);
    const syllabusList = await prisma.syllabus.findMany({
      where: {
        id: { in: syllabusIds },
        categoryId,
      },
    });

    if (syllabusList.length !== items.length) {
      throw new Error("Some syllabus items do not belong to this category");
    }

    // Update order for each item
    await Promise.all(
      items.map((item) =>
        prisma.syllabus.update({
          where: { id: item.syllabusId },
          data: { order: item.newOrder },
        })
      )
    );

    // Return updated list
    return await prisma.syllabus.findMany({
      where: { categoryId },
      orderBy: { order: "asc" },
    });
  }

  /**
   * Toggle publish status
   */
  async togglePublish(syllabusId: string) {
    const syllabus = await prisma.syllabus.findUnique({
      where: { id: syllabusId },
    });

    if (!syllabus) {
      throw new Error("Syllabus not found");
    }

    const updated = await prisma.syllabus.update({
      where: { id: syllabusId },
      data: {
        isPublished: !syllabus.isPublished,
      },
    });

    return updated;
  }

  /**
   * Get next and previous syllabus items
   */
  async getAdjacentSyllabus(syllabusId: string) {
    const currentSyllabus = await prisma.syllabus.findUnique({
      where: { id: syllabusId },
    });

    if (!currentSyllabus) {
      throw new Error("Syllabus not found");
    }

    const [previous, next] = await Promise.all([
      // Previous item
      prisma.syllabus.findFirst({
        where: {
          categoryId: currentSyllabus.categoryId,
          order: { lt: currentSyllabus.order },
          isPublished: true,
        },
        orderBy: { order: "desc" },
        select: {
          id: true,
          title: true,
          order: true,
        },
      }),
      // Next item
      prisma.syllabus.findFirst({
        where: {
          categoryId: currentSyllabus.categoryId,
          order: { gt: currentSyllabus.order },
          isPublished: true,
        },
        orderBy: { order: "asc" },
        select: {
          id: true,
          title: true,
          order: true,
        },
      }),
    ]);

    return {
      previous,
      next,
    };
  }

  /**
   * Private: Reorder syllabus after deletion
   */
  private async reorderAfterDelete(categoryId: string, deletedOrder: number) {
    await prisma.syllabus.updateMany({
      where: {
        categoryId,
        order: { gt: deletedOrder },
      },
      data: {
        order: { decrement: 1 },
      },
    });
  }

  /**
   * Search syllabus
   */
  async searchSyllabus(query: string, categoryId?: string) {
    const where: any = {
      isPublished: true,
      OR: [
        { title: { contains: query, mode: "insensitive" } },
        { description: { contains: query, mode: "insensitive" } },
        { content: { contains: query, mode: "insensitive" } },
      ],
    };

    if (categoryId) {
      where.categoryId = categoryId;
    }

    const results = await prisma.syllabus.findMany({
      where,
      orderBy: { order: "asc" },
      include: {
        category: {
          select: {
            id: true,
            name: true,
            icon: true,
          },
        },
      },
    });

    return results;
  }
}
