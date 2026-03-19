import { useState, useMemo } from "react";
import { createPortal } from "react-dom";
import { Edit2, Trash2, MoreHorizontal, ChevronDown, ChevronUp, Flag, X } from "lucide-react";
import { Comment as CommentType } from "@/types/comment.types";
import { mockUsers, CURRENT_USER_ID } from "@/data/mockData";
import { useChatStore } from "@/store/chatStore";
import { formatTimestamp } from "@/utils/dateUtils";
import UserAvatar from "./UserAvatar";
import CommentForm from "./CommentForm";
import RichTextRenderer from "./RichTextRenderer";
import { toast } from "sonner";

interface CommentProps {
  comment: CommentType;
  level?: number;
}

const QUICK_REACTIONS = ["👍", "❤️", "😂", "😮", "😢", "🔥"];
const MAX_VISIBLE_REPLIES = 2;
const MAX_NESTING = 3;

const CommentComponent = ({ comment, level = 0 }: CommentProps) => {
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(comment.content);
  const [showAllReplies, setShowAllReplies] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [showReactions, setShowReactions] = useState(false);
  const [threadCollapsed, setThreadCollapsed] = useState(false);
  const [showReactorsModal, setShowReactorsModal] = useState(false);

  const { toggleReaction, editComment, deleteComment, addComment, getReplies } = useChatStore();

  const author = mockUsers[comment.authorId];
  const replies = getReplies(comment.id);
  const isOwn = comment.authorId === CURRENT_USER_ID;

  const visibleReplies = showAllReplies ? replies : replies.slice(0, MAX_VISIBLE_REPLIES);
  const hiddenCount = replies.length - MAX_VISIBLE_REPLIES;

  const totalReactions = useMemo(
    () => Object.values(comment.reactions).reduce((sum, users) => sum + users.length, 0),
    [comment.reactions]
  );

  const handleEdit = () => {
    editComment(comment.id, editContent);
    setIsEditing(false);
  };

  const handleReply = (content: string, parentId?: string | null, mentions?: string[], attachments?: any[]) => {
    addComment(content, comment.id, mentions, attachments);
    setShowReplyForm(false);
  };

  const handleReport = () => {
    setShowMenu(false);
    toast.success("Comment reported. We'll review it shortly.");
  };

  const handleDelete = () => {
    deleteComment(comment.id);
    setShowMenu(false);
    toast.success("Comment deleted");
  };

  if (!author) return null;

  return (
    <div
      className={`${level > 0 ? "ml-10 mt-2" : "mt-4"} animate-in fade-in slide-in-from-bottom-2 duration-300`}
      role="article"
      aria-label={`Comment by ${author.displayName}`}
    >
      <div className="flex gap-2 group">
        <UserAvatar user={author} size="sm" />
        <div className="flex-1 min-w-0">
          <div className="inline-block max-w-full">
            <div className="bg-fb-comment-bg rounded-2xl px-3 py-2 relative transition-colors hover:bg-fb-hover/50">
              <div className="flex items-center gap-2">
                <span className="text-[13px] font-semibold text-foreground">{author.displayName}</span>
                {comment.isEdited && (
                  <span className="text-[11px] text-muted-foreground" title={`Edited ${comment.editedAt ? formatTimestamp(comment.editedAt) : ""}`}>
                    · edited
                  </span>
                )}
              </div>

              {isEditing ? (
                <div className="mt-1">
                  <textarea
                    value={editContent}
                    onChange={(e) => setEditContent(e.target.value)}
                    className="w-full bg-card border border-border rounded-lg px-2 py-1 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-ring resize-none"
                    rows={2}
                    autoFocus
                    aria-label="Edit comment"
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleEdit(); }
                      if (e.key === "Escape") setIsEditing(false);
                    }}
                  />
                  <div className="flex gap-2 mt-1">
                    <button onClick={handleEdit} className="text-xs text-primary font-medium hover:underline">Save</button>
                    <button onClick={() => setIsEditing(false)} className="text-xs text-muted-foreground hover:underline">Cancel</button>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-foreground mt-0.5 break-words whitespace-pre-wrap">
                  <RichTextRenderer content={comment.content} />
                </p>
              )}

              {/* Attached images displayed inline */}
              {comment.attachments.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-1">
                  {comment.attachments.map((attId) => {
                    const att = useChatStore.getState().attachments[attId];
                    if (!att) return null;
                    if (att.type.startsWith("image/")) {
                      return (
                        <img
                          key={attId}
                          src={att.path}
                          alt={att.originalName}
                          className="max-h-48 rounded-lg object-cover"
                          loading="lazy"
                        />
                      );
                    }
                    return (
                      <a
                        key={attId}
                        href={att.path}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 bg-muted rounded-lg px-3 py-2 text-xs text-primary hover:underline"
                      >
                        📎 {att.originalName}
                      </a>
                    );
                  })}
                </div>
              )}

              {/* Reaction badge — click to open reactors modal */}
              {totalReactions > 0 && (
                <div
                  className="absolute -bottom-3 right-2 flex items-center gap-0.5 bg-card rounded-full px-1.5 py-0.5 shadow-sm border border-border text-xs cursor-pointer hover:shadow-md transition-shadow"
                  onClick={() => setShowReactorsModal(true)}
                  role="button"
                  aria-label={`${totalReactions} reactions — click to see who reacted`}
                >
                  {Object.entries(comment.reactions).map(([emoji]) => (
                    <span key={emoji}>{emoji}</span>
                  ))}
                  <span className="text-muted-foreground ml-0.5">{totalReactions}</span>
                </div>
              )}
            </div>
          </div>

          {/* Reactors modal (portal) */}
          {showReactorsModal && totalReactions > 0 && createPortal(
            <>
              <div className="fixed inset-0 z-[9998] bg-foreground/20" onClick={() => setShowReactorsModal(false)} />
              <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[9999] bg-card rounded-xl border border-border shadow-xl w-80 max-h-[400px] overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                <div className="flex items-center justify-between px-4 py-3 border-b border-border">
                  <h3 className="text-sm font-semibold text-foreground">Reactions</h3>
                  <button
                    onClick={() => setShowReactorsModal(false)}
                    className="p-1 rounded-full hover:bg-fb-hover text-muted-foreground"
                    aria-label="Close"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
                <div className="overflow-y-auto max-h-[340px] scrollbar-thin">
                  {Object.entries(comment.reactions).map(([emoji, users]) => (
                    <div key={emoji}>
                      <div className="px-4 py-2 bg-muted/50 text-xs font-medium text-muted-foreground flex items-center gap-1.5 sticky top-0">
                        <span className="text-base">{emoji}</span>
                        <span>{users.length}</span>
                      </div>
                      {users.map((userId) => {
                        const reactor = mockUsers[userId];
                        return (
                          <div key={userId} className="flex items-center gap-3 px-4 py-2 hover:bg-fb-hover transition-colors">
                            {reactor ? (
                              <>
                                <UserAvatar user={reactor} size="sm" />
                                <div>
                                  <div className="text-sm font-medium text-foreground">{reactor.displayName}</div>
                                  <div className="text-xs text-muted-foreground">@{reactor.username}</div>
                                </div>
                              </>
                            ) : (
                              <span className="text-sm text-muted-foreground">{userId}</span>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  ))}
                </div>
              </div>
            </>,
            document.body
          )}

          {/* Actions row */}
          <div className="flex items-center gap-3 mt-1 ml-3" role="toolbar" aria-label="Comment actions">
            {/* Quick react */}
            <div className="relative">
              <button
                onClick={() => setShowReactions(!showReactions)}
                onMouseEnter={() => setShowReactions(true)}
                className="text-xs font-semibold text-muted-foreground hover:text-foreground hover:underline"
                aria-label="React to comment"
              >
                Like
              </button>
              {showReactions && (
                <>
                  <div className="fixed inset-0 z-30" onClick={() => setShowReactions(false)} />
                  <div
                    className="absolute bottom-full left-0 mb-1 flex gap-0.5 bg-card rounded-full px-2 py-1 shadow-lg border border-border z-40 animate-in fade-in zoom-in-95 duration-150"
                    onMouseLeave={() => setShowReactions(false)}
                    role="toolbar"
                    aria-label="Emoji reactions"
                  >
                    {QUICK_REACTIONS.map((emoji) => (
                      <button
                        key={emoji}
                        onClick={() => {
                          toggleReaction(comment.id, emoji);
                          setShowReactions(false);
                        }}
                        className="text-lg hover:scale-125 transition-transform px-0.5"
                        aria-label={`React with ${emoji}`}
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>

            <button
              onClick={() => setShowReplyForm(!showReplyForm)}
              className="text-xs font-semibold text-muted-foreground hover:text-foreground hover:underline"
              aria-label="Reply to comment"
            >
              Reply
            </button>

            <span className="text-xs text-muted-foreground">{formatTimestamp(comment.timestamp)}</span>

            {/* Collapse/expand thread toggle */}
            {replies.length > 0 && (
              <button
                onClick={() => setThreadCollapsed(!threadCollapsed)}
                className="text-xs font-semibold text-muted-foreground hover:text-foreground hover:underline flex items-center gap-0.5"
                aria-label={threadCollapsed ? "Expand thread" : "Collapse thread"}
              >
                {threadCollapsed ? <ChevronDown className="h-3 w-3" /> : <ChevronUp className="h-3 w-3" />}
                {threadCollapsed ? "Expand" : "Collapse"}
              </button>
            )}

            {/* More menu */}
            <div className="relative">
              <button
                onClick={() => setShowMenu(!showMenu)}
                className="p-1 rounded-full hover:bg-fb-hover text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity"
                aria-label="More options"
              >
                <MoreHorizontal className="h-4 w-4" />
              </button>
              {showMenu && (
                <>
                  <div className="fixed inset-0 z-30" onClick={() => setShowMenu(false)} />
                  <div className="absolute top-full right-0 mt-1 bg-card rounded-lg border border-border shadow-lg py-1 z-40 min-w-[160px] animate-in fade-in zoom-in-95 duration-150" role="menu">
                    {isOwn && (
                      <>
                        <button
                          onClick={() => { setIsEditing(true); setEditContent(comment.content); setShowMenu(false); }}
                          className="w-full flex items-center gap-2 px-3 py-2 text-sm text-foreground hover:bg-fb-hover"
                          role="menuitem"
                        >
                          <Edit2 className="h-4 w-4" /> Edit
                        </button>
                        <button
                          onClick={handleDelete}
                          className="w-full flex items-center gap-2 px-3 py-2 text-sm text-destructive hover:bg-fb-hover"
                          role="menuitem"
                        >
                          <Trash2 className="h-4 w-4" /> Delete
                        </button>
                      </>
                    )}
                    {!isOwn && (
                      <button
                        onClick={handleReport}
                        className="w-full flex items-center gap-2 px-3 py-2 text-sm text-foreground hover:bg-fb-hover"
                        role="menuitem"
                      >
                        <Flag className="h-4 w-4" /> Report
                      </button>
                    )}
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Reply form */}
          {showReplyForm && level < MAX_NESTING && (
            <div className="mt-2">
              <CommentForm
                parentId={comment.id}
                placeholder={`Reply to ${author.displayName}...`}
                onSubmit={handleReply}
                onCancel={() => setShowReplyForm(false)}
                autoFocus
              />
            </div>
          )}

          {/* Replies — collapsible thread */}
          {replies.length > 0 && !threadCollapsed && (
            <div role="list" aria-label={`Replies to ${author.displayName}`}>
              {!showAllReplies && hiddenCount > 0 && (
                <button
                  onClick={() => setShowAllReplies(true)}
                  className="flex items-center gap-1 mt-2 ml-1 text-xs font-semibold text-muted-foreground hover:text-foreground hover:underline"
                >
                  <ChevronDown className="h-3 w-3" />
                  Show {hiddenCount} more {hiddenCount === 1 ? "reply" : "replies"}
                </button>
              )}
              {visibleReplies.map((reply) => (
                <CommentComponent key={reply.id} comment={reply} level={Math.min(level + 1, MAX_NESTING)} />
              ))}
              {showAllReplies && hiddenCount > 0 && (
                <button
                  onClick={() => setShowAllReplies(false)}
                  className="flex items-center gap-1 mt-2 ml-1 text-xs font-semibold text-muted-foreground hover:text-foreground hover:underline"
                >
                  <ChevronUp className="h-3 w-3" />
                  Hide replies
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CommentComponent;
