export interface Comment {
  id: string;
  parentId: string | null;
  authorId: string;
  content: string;
  timestamp: string;
  attachments: string[];
  reactions: Record<string, string[]>;
  mentions: string[];
  isEdited: boolean;
  editedAt: string | null;
  replies: string[];
}

export interface CreateCommentData {
  content: string;
  parentId?: string | null;
  attachments?: File[];
  mentions?: string[];
}
