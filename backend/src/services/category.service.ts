import prisma from '@/config/database';
import { CreateCategoryDTO, UpdateCategoryDTO } from '@/types/category.types';

export class CategoryService {
  /**
   * Create a new category
   */
  async createCategory(data: CreateCategoryDTO) {
    // Check if category with same name already exists
    const existingCategory = await prisma.category.findUnique({
      where: { name: data.name },
    });

    if (existingCategory) {
      throw new Error('Category with this name already exists');
    }

    const category = await prisma.category.create({
      data: {
        name: data.name,
        description: data.description,
        icon: data.icon,
      },
    });

    return category;
  }

  /**
   * Get all categories
   */
  async getCategories(includeStats = false) {
    if (includeStats) {
      const categories = await prisma.category.findMany({
        orderBy: {
          name: 'asc',
        },
        include: {
          _count: {
            select: {
              syllabi: true,
              notes: true,
              questions: true,
              quizzes: true,
            },
          },
        },
      });

      return categories;
    }

    const categories = await prisma.category.findMany({
      orderBy: {
        name: 'asc',
      },
    });

    return categories;
  }

  /**
   * Get category by ID
   */
  async getCategoryById(categoryId: string, includeSyllabus = false) {
    const category = await prisma.category.findUnique({
      where: { id: categoryId },
      include: {
        syllabi: includeSyllabus
          ? {
              where: { isPublished: true },
              orderBy: { order: 'asc' },
            }
          : false,
        _count: {
          select: {
            syllabi: true,
            notes: true,
            questions: true,
            quizzes: true,
          },
        },
      },
    });

    if (!category) {
      throw new Error('Category not found');
    }

    return category;
  }

  /**
   * Get category by name
   */
  async getCategoryByName(name: string) {
    const category = await prisma.category.findUnique({
      where: { name },
      include: {
        syllabi: {
          where: { isPublished: true },
          orderBy: { order: 'asc' },
        },
        _count: {
          select: {
            syllabi: true,
            notes: true,
            questions: true,
            quizzes: true,
          },
        },
      },
    });

    if (!category) {
      throw new Error('Category not found');
    }

    return category;
  }

  /**
   * Update category
   */
  async updateCategory(categoryId: string, data: UpdateCategoryDTO) {
    // Check if category exists
    const existingCategory = await prisma.category.findUnique({
      where: { id: categoryId },
    });

    if (!existingCategory) {
      throw new Error('Category not found');
    }

    // If name is being changed, check for duplicates
    if (data.name && data.name !== existingCategory.name) {
      const duplicateCategory = await prisma.category.findUnique({
        where: { name: data.name },
      });

      if (duplicateCategory) {
        throw new Error('Category with this name already exists');
      }
    }

    const category = await prisma.category.update({
      where: { id: categoryId },
      data: {
        name: data.name,
        description: data.description,
        icon: data.icon,
      },
    });

    return category;
  }

  /**
   * Delete category
   */
  async deleteCategory(categoryId: string) {
    // Check if category has related content
    const category = await prisma.category.findUnique({
      where: { id: categoryId },
      include: {
        _count: {
          select: {
            notes: true,
            questions: true,
            quizzes: true,
          },
        },
      },
    });

    if (!category) {
      throw new Error('Category not found');
    }

    // Check if category has content (optional - remove this if you want cascade delete)
    if (
      category._count.notes > 0 ||
      category._count.questions > 0 ||
      category._count.quizzes > 0
    ) {
      throw new Error(
        'Cannot delete category with existing content. Please delete all related notes, questions, and quizzes first.'
      );
    }

    await prisma.category.delete({
      where: { id: categoryId },
    });
  }

  /**
   * Get category statistics
   */
  async getCategoryStats(categoryId: string) {
    const [category, notesCount, questionsCount, quizzesCount, syllabusCount] =
      await Promise.all([
        prisma.category.findUnique({ where: { id: categoryId } }),
        prisma.note.count({ where: { categoryId } }),
        prisma.question.count({ where: { categoryId } }),
        prisma.quiz.count({ where: { categoryId } }),
        prisma.syllabus.count({ where: { categoryId, isPublished: true } }),
      ]);

    if (!category) {
      throw new Error('Category not found');
    }

    // Get most active contributors
    const topContributors = await prisma.note.groupBy({
      by: ['userId'],
      where: { categoryId },
      _count: {
        userId: true,
      },
      orderBy: {
        _count: {
          userId: 'desc',
        },
      },
      take: 5,
    });

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
          contributions: contributor._count.userId,
        };
      })
    );

    return {
      category,
      stats: {
        notes: notesCount,
        questions: questionsCount,
        quizzes: quizzesCount,
        syllabus: syllabusCount,
      },
      topContributors: contributorDetails,
    };
  }
}