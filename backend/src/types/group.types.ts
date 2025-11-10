export interface CreateGroupDTO {
  name: string;
  description?: string;
  type?: 'public' | 'private';
  category?: string;
}

export interface UpdateGroupDTO {
  name?: string;
  description?: string;
  avatar?: string;
  type?: 'public' | 'private';
  category?: string;
}
