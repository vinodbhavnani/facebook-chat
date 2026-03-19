import { useChatStore } from "@/store/chatStore";
import { Attachment } from "@/types/attachment.types";

/** Hook wrapping comment operations from the chat store */
export const useComments = () => {
  const { comments, addComment, editComment, deleteComment, getRootComments, getReplies } = useChatStore();

  const getCommentById = (id: string) => comments[id] || null;
  const totalCount = Object.keys(comments).length;

  return {
    comments,
    totalCount,
    addComment,
    editComment,
    deleteComment,
    getRootComments,
    getReplies,
    getCommentById,
  };
};
