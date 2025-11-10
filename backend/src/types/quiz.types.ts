export interface CreateQuizDTO {
  categoryId?: string;
  title: string;
  description?: string;
  difficulty?: 'easy' | 'medium' | 'hard';
  timeLimit?: number;
  isDaily?: boolean;
  questions: CreateQuizQuestionDTO[];
}

export interface CreateQuizQuestionDTO {
  question: string;
  options: string[];
  correctAnswer: string;
  explanation?: string;
  points?: number;
  order?: number;
}

export interface UpdateQuizDTO {
  title?: string;
  description?: string;
  difficulty?: 'easy' | 'medium' | 'hard';
  timeLimit?: number;
  isPublished?: boolean;
}

export interface SubmitQuizDTO {
  answers: { questionId: string; answer: string }[];
  timeTaken?: number;
}

export interface QuizFilters {
  categoryId?: string;
  difficulty?: string;
  isDaily?: boolean;
  page?: number;
  limit?: number;
}
