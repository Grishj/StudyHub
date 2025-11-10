export interface CreateQuestionDTO {
  categoryId: string;
  title: string;
  content: string;
  year?: number;
  fileUrl?: string;
  tags?: string[];
}

export interface UpdateQuestionDTO {
  title?: string;
  content?: string;
  year?: number;
  fileUrl?: string;
  tags?: string[];
}

export interface QuestionFilters {
  categoryId?: string;
  tags?: string[];
  year?: number;
  userId?: string;
  search?: string;
  isApproved?: boolean;
  sortBy?: 'recent' | 'popular' | 'trending';
  page?: number;
  limit?: number;
}
