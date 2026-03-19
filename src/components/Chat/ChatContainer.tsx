import { useEffect, useCallback, useRef, useState } from "react";
import { useChatStore } from "@/store/chatStore";
import CommentComponent from "./Comment";
import CommentForm from "./CommentForm";
import TypingIndicator from "./TypingIndicator";
import { MessageCircle, RotateCcw, Loader2 } from "lucide-react";
import { mockComments, mockAttachments } from "@/data/mockData";

const COMMENTS_PAGE_SIZE = 20;

const ChatContainer = () => {
  const { getRootComments, addComment, isTyping, typingUser, simulateTypingIndicator } = useChatStore();
  const allRootComments = getRootComments();
  const commentsEndRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [visibleCount, setVisibleCount] = useState(COMMENTS_PAGE_SIZE);
  const [loading, setLoading] = useState(false);
  const [initialScrollDone, setInitialScrollDone] = useState(false);

  // Show the LAST visibleCount comments (newest at bottom)
  const startIndex = Math.max(0, allRootComments.length - visibleCount);
  const visibleComments = allRootComments.slice(startIndex);
  const hasMore = startIndex > 0;

  const handleScroll = useCallback(() => {
    const el = scrollContainerRef.current;
    if (!el || loading || !hasMore) return;
    // Load more when scrolling near the TOP
    if (el.scrollTop <= 100) {
      const prevScrollHeight = el.scrollHeight;
      setLoading(true);
      setTimeout(() => {
        setVisibleCount((prev) => Math.min(prev + COMMENTS_PAGE_SIZE, allRootComments.length));
        setLoading(false);
        // Preserve scroll position after prepending older comments
        requestAnimationFrame(() => {
          if (el) {
            el.scrollTop = el.scrollHeight - prevScrollHeight;
          }
        });
      }, 150);
    }
  }, [loading, hasMore, allRootComments.length]);

  const handleNewComment = (
    content: string,
    parentId?: string | null,
    mentions?: string[],
    attachments?: any[]
  ) => {
    addComment(content, parentId, mentions, attachments);
    setTimeout(() => simulateTypingIndicator(), 1500);
    setTimeout(() => {
      commentsEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 100);
  };

  const handleResetData = () => {
    useChatStore.setState({ comments: mockComments, attachments: mockAttachments });
    localStorage.removeItem("fb-chat-storage");
    setVisibleCount(COMMENTS_PAGE_SIZE);
    setInitialScrollDone(false);
  };

  // Scroll to bottom on initial load
  useEffect(() => {
    if (!initialScrollDone && allRootComments.length > 0) {
      requestAnimationFrame(() => {
        commentsEndRef.current?.scrollIntoView();
        setInitialScrollDone(true);
      });
    }
  }, [initialScrollDone, allRootComments.length]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "/") {
        e.preventDefault();
        const input = document.querySelector<HTMLTextAreaElement>('textarea[aria-label="Comment input"]');
        input?.focus();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  const totalComments = Object.keys(useChatStore.getState().comments).length;

  return (
    <div className="w-full max-w-2xl mx-auto flex flex-col flex-1 min-h-0" role="region" aria-label="Discussion thread">
      {/* Header */}
      <div className="bg-card rounded-t-xl border border-border px-5 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MessageCircle className="h-5 w-5 text-primary" />
            <h1 className="text-lg font-semibold text-foreground">Discussion</h1>
            <span className="text-sm text-muted-foreground">
              · {totalComments} {totalComments === 1 ? "comment" : "comments"}
            </span>
          </div>
          <button
            onClick={handleResetData}
            className="p-1.5 rounded-full hover:bg-fb-hover transition-colors text-muted-foreground hover:text-foreground"
            title="Reset to sample data"
            aria-label="Reset comments"
          >
            <RotateCcw className="h-4 w-4" />
          </button>
        </div>
        <p className="text-xs text-muted-foreground mt-1">
          Tip: Use **bold**, *italic*, `code`, ~~strike~~ formatting · Ctrl+/ to focus · Ctrl+B/I/E for shortcuts
        </p>
      </div>

      {/* Comments list */}
      <div
        ref={scrollContainerRef}
        onScroll={handleScroll}
        className="bg-card border-x border-border px-5 pb-4 flex-1 overflow-y-auto scrollbar-thin"
        role="feed"
        aria-label="Comments"
      >
        {allRootComments.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <MessageCircle className="h-10 w-10 mx-auto mb-2 opacity-40" />
            <p className="text-sm">No comments yet. Be the first to comment!</p>
          </div>
        ) : (
          <>
            {hasMore && (
              <div className="flex items-center justify-center py-3 gap-2 text-muted-foreground">
                {loading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <span className="text-xs">
                    Showing {visibleComments.length} of {allRootComments.length} comments — scroll up for more
                  </span>
                )}
              </div>
            )}
            {visibleComments.map((comment) => (
              <CommentComponent key={comment.id} comment={comment} />
            ))}
          </>
        )}
        {isTyping && <TypingIndicator userName={typingUser} />}
        <div ref={commentsEndRef} />
      </div>

      {/* New comment form */}
      <div className="bg-card rounded-b-xl border border-border border-t-0 px-5 py-3">
        <CommentForm
          placeholder="Write a comment..."
          onSubmit={handleNewComment}
        />
      </div>
    </div>
  );
};

export default ChatContainer;
