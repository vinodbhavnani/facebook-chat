import { Comment as CommentType } from "@/types/comment.types";
import { useChatStore } from "@/store/chatStore";
import CommentComponent from "./Comment";
import { ChevronDown, ChevronUp } from "lucide-react";
import { useState } from "react";

interface ReplyThreadProps {
  parentId: string;
  maxVisible?: number;
}

/** Manages threaded replies with expand/collapse */
const ReplyThread = ({ parentId, maxVisible = 2 }: ReplyThreadProps) => {
  const { getReplies } = useChatStore();
  const [showAll, setShowAll] = useState(false);

  const replies = getReplies(parentId);
  if (replies.length === 0) return null;

  const visibleReplies = showAll ? replies : replies.slice(0, maxVisible);
  const hiddenCount = replies.length - maxVisible;

  return (
    <div role="list" aria-label="Reply thread">
      {!showAll && hiddenCount > 0 && (
        <button
          onClick={() => setShowAll(true)}
          className="flex items-center gap-1 mt-2 ml-1 text-xs font-semibold text-muted-foreground hover:text-foreground hover:underline"
        >
          <ChevronDown className="h-3 w-3" />
          View {hiddenCount} more {hiddenCount === 1 ? "reply" : "replies"}
        </button>
      )}
      {visibleReplies.map((reply) => (
        <CommentComponent key={reply.id} comment={reply} level={1} />
      ))}
      {showAll && hiddenCount > 0 && (
        <button
          onClick={() => setShowAll(false)}
          className="flex items-center gap-1 mt-2 ml-1 text-xs font-semibold text-muted-foreground hover:text-foreground hover:underline"
        >
          <ChevronUp className="h-3 w-3" />
          Hide replies
        </button>
      )}
    </div>
  );
};

export default ReplyThread;
