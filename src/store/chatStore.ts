import { create } from "zustand";
import { persist } from "zustand/middleware";
import { Comment } from "@/types/comment.types";
import { Attachment } from "@/types/attachment.types";
import { mockComments, mockAttachments, CURRENT_USER_ID, mockUsers } from "@/data/mockData";
import { toast } from "sonner";

interface ChatState {
  comments: Record<string, Comment>;
  attachments: Record<string, Attachment>;
  isTyping: boolean;
  typingUser: string | null;
  addComment: (content: string, parentId?: string | null, mentions?: string[], fileAttachments?: Attachment[]) => string;
  editComment: (commentId: string, newContent: string) => void;
  deleteComment: (commentId: string) => void;
  toggleReaction: (commentId: string, emoji: string) => void;
  getRootComments: () => Comment[];
  getReplies: (commentId: string) => Comment[];
  setTyping: (isTyping: boolean) => void;
  simulateTypingIndicator: () => void;
}

export const useChatStore = create<ChatState>()(
  persist(
    (set, get) => ({
      comments: mockComments,
      attachments: mockAttachments,
      isTyping: false,
      typingUser: null,

      addComment: (content, parentId = null, mentions = [], fileAttachments = []) => {
        const id = `comment_${Date.now()}`;
        const newComment: Comment = {
          id,
          parentId,
          authorId: CURRENT_USER_ID,
          content,
          timestamp: new Date().toISOString(),
          attachments: fileAttachments.map((a) => a.id),
          reactions: {},
          mentions,
          isEdited: false,
          editedAt: null,
          replies: [],
        };

        set((state) => {
          const newComments = { ...state.comments, [id]: newComment };
          const newAttachmentsState = { ...state.attachments };

          fileAttachments.forEach((a) => {
            newAttachmentsState[a.id] = a;
          });

          if (parentId && newComments[parentId]) {
            newComments[parentId] = {
              ...newComments[parentId],
              replies: [...newComments[parentId].replies, id],
            };
          }

          return { comments: newComments, attachments: newAttachmentsState };
        });

        // Send notifications for mentioned users
        if (mentions.length > 0) {
          mentions.forEach((userId) => {
            const user = mockUsers[userId];
            if (user) {
              toast.info(`${user.displayName} was mentioned in your comment`, {
                description: content.slice(0, 80) + (content.length > 80 ? "..." : ""),
              });
            }
          });
        }

        return id;
      },

      editComment: (commentId, newContent) => {
        set((state) => {
          const comment = state.comments[commentId];
          if (!comment || comment.authorId !== CURRENT_USER_ID) return state;
          return {
            comments: {
              ...state.comments,
              [commentId]: {
                ...comment,
                content: newContent,
                isEdited: true,
                editedAt: new Date().toISOString(),
              },
            },
          };
        });
      },

      deleteComment: (commentId) => {
        set((state) => {
          const comment = state.comments[commentId];
          if (!comment || comment.authorId !== CURRENT_USER_ID) return state;

          const newComments = { ...state.comments };
          delete newComments[commentId];

          if (comment.parentId && newComments[comment.parentId]) {
            newComments[comment.parentId] = {
              ...newComments[comment.parentId],
              replies: newComments[comment.parentId].replies.filter((r) => r !== commentId),
            };
          }

          return { comments: newComments };
        });
      },

      toggleReaction: (commentId, emoji) => {
        set((state) => {
          const comment = state.comments[commentId];
          if (!comment) return state;

          const reactions = { ...comment.reactions };
          const users = reactions[emoji] ? [...reactions[emoji]] : [];
          const userIndex = users.indexOf(CURRENT_USER_ID);

          if (userIndex > -1) {
            users.splice(userIndex, 1);
            if (users.length === 0) delete reactions[emoji];
            else reactions[emoji] = users;
          } else {
            reactions[emoji] = [...users, CURRENT_USER_ID];
          }

          return {
            comments: { ...state.comments, [commentId]: { ...comment, reactions } },
          };
        });
      },

      getRootComments: () => {
        const { comments } = get();
        return Object.values(comments)
          .filter((c) => c.parentId === null)
          .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
      },

      getReplies: (commentId) => {
        const { comments } = get();
        const comment = comments[commentId];
        if (!comment) return [];
        return comment.replies
          .map((id) => comments[id])
          .filter(Boolean)
          .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
      },

      setTyping: (isTyping) => set({ isTyping }),

      simulateTypingIndicator: () => {
        // Simulate another user typing for demo purposes
        const otherUsers = Object.values(mockUsers).filter((u) => u.id !== CURRENT_USER_ID && u.isOnline);
        if (otherUsers.length === 0) return;
        const randomUser = otherUsers[Math.floor(Math.random() * otherUsers.length)];
        set({ isTyping: true, typingUser: randomUser.displayName });
        setTimeout(() => set({ isTyping: false, typingUser: null }), 3000);
      },
    }),
    {
      name: "fb-chat-storage",
      partialize: (state) => ({
        comments: state.comments,
        attachments: state.attachments,
      }),
    }
  )
);
