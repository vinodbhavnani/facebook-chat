import { useChatStore } from "@/store/chatStore";

export const useEmojiReactions = () => {
  const { toggleReaction } = useChatStore();

  const addReaction = (commentId: string, emoji: string) => {
    toggleReaction(commentId, emoji);
  };

  return { addReaction };
};
