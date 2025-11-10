export interface PaginationParams {
  page?: number;
  limit?: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface VoteDTO {
  voteType: 'upvote' | 'downvote';
}

export interface CommentDTO {
  content: string;
}

export interface ReportDTO {
  contentType: 'note' | 'question' | 'comment';
  contentId: string;
  reason: string;
  description?: string;
}
