export interface CreateNoteDTO {
  categoryId: string;
  title: string;
  content: string;
  fileType?: string;
  fileUrl?: string;
  tags?: string[];
}

export interface UpdateNoteDTO {
  title?: string;
  content?: string;
  fileType?: string;
  fileUrl?: string;
  tags?: string[];
}

export interface NoteFilters {
  categoryId?: string;
  tags?: string[];
  userId?: string;
  search?: string;
  isApproved?: boolean;
  sortBy?: 'recent' | 'popular' | 'trending';
  page?: number;
  limit?: number;
}
