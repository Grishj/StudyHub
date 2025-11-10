export interface CreateCategoryDTO {
  name: string;
  description?: string;
  icon?: string;
}

export interface UpdateCategoryDTO {
  name?: string;
  description?: string;
  icon?: string;
}

export interface CreateSyllabusDTO {
  categoryId: string;
  title: string;
  description?: string;
  content: string;
  fileUrl?: string;
  order?: number;
  isPublished?: boolean;
}

export interface UpdateSyllabusDTO {
  title?: string;
  description?: string;
  content?: string;
  fileUrl?: string;
  order?: number;
  isPublished?: boolean;
}

export interface ReorderSyllabusDTO {
  syllabusId: string;
  newOrder: number;
}
