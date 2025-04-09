export interface Note {
  id: string;
  userId: string;
  title: string;
  content: string;
  categories?: string[];
  isPinned?: boolean;
  tags?: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateNoteInput {
  title: string;
  content: string;
  categories?: string[];
  tags?: string[];
  isPinned?: boolean;
}

export interface UpdateNoteInput {
  id: string;
  title?: string;
  content?: string;
  categories?: string[];
  tags?: string[];
  isPinned?: boolean;
} 