import { Comment } from "@/types/comment.types";
import { useChatStore } from "@/store/chatStore";

/** Service layer for comment CRUD operations */
export const commentService = {
  getAll: (): Record<string, Comment> => {
    return useChatStore.getState().comments;
  },

  getById: (id: string): Comment | null => {
    return useChatStore.getState().comments[id] || null;
  },

  create: (content: string, parentId?: string | null, mentions?: string[]) => {
    return useChatStore.getState().addComment(content, parentId, mentions);
  },

  update: (id: string, content: string) => {
    useChatStore.getState().editComment(id, content);
  },

  delete: (id: string) => {
    useChatStore.getState().deleteComment(id);
  },

  getRootComments: () => {
    return useChatStore.getState().getRootComments();
  },

  getReplies: (commentId: string) => {
    return useChatStore.getState().getReplies(commentId);
  },
};
