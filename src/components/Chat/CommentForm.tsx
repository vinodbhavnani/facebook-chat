import { useState, useRef } from "react";
import { Send, Paperclip, X } from "lucide-react";
import { MAX_COMMENT_LENGTH } from "@/data/mockData";
import { User } from "@/types/user.types";
import { Attachment } from "@/types/attachment.types";
import { parseMentions } from "@/utils/textUtils";
import FileUpload from "./FileUpload";
import EmojiPicker from "./EmojiPicker";
import UserMention from "./UserMention";
import FormattingToolbar from "./FormattingToolbar";

interface CommentFormProps {
  parentId?: string | null;
  placeholder?: string;
  onSubmit: (content: string, parentId?: string | null, mentions?: string[], attachments?: Attachment[]) => void;
  onCancel?: () => void;
  autoFocus?: boolean;
  maxLength?: number;
}

const CommentForm = ({
  parentId = null,
  placeholder = "Write a comment...",
  onSubmit,
  onCancel,
  autoFocus = false,
  maxLength = MAX_COMMENT_LENGTH,
}: CommentFormProps) => {
  const [content, setContent] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [showFileUpload, setShowFileUpload] = useState(false);
  const [cursorPosition, setCursorPosition] = useState(0);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = () => {
    const trimmed = content.trim();
    if (!trimmed && files.length === 0) return;

    const mentions = parseMentions(trimmed);
    const attachments: Attachment[] = files.map((f, i) => ({
      id: `att_${Date.now()}_${i}`,
      filename: f.name,
      originalName: f.name,
      path: URL.createObjectURL(f),
      type: f.type,
      size: f.size,
      uploadedBy: "user_current",
      uploadedAt: new Date().toISOString(),
      metadata: {},
    }));

    onSubmit(trimmed, parentId, mentions, attachments);
    setContent("");
    setFiles([]);
    setShowFileUpload(false);
  };

  const applyFormatting = (prefix: string, suffix: string, placeholder: string) => {
    const textarea = inputRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = content.slice(start, end);
    const replacement = selectedText || placeholder;
    const newContent =
      content.slice(0, start) + prefix + replacement + suffix + content.slice(end);

    setContent(newContent);

    const newCursorPos = selectedText
      ? start + prefix.length + selectedText.length + suffix.length
      : start + prefix.length;
    const newSelEnd = selectedText
      ? newCursorPos
      : newCursorPos + placeholder.length;

    setTimeout(() => {
      textarea.focus();
      textarea.selectionStart = selectedText ? newCursorPos : newCursorPos;
      textarea.selectionEnd = newSelEnd;
      setCursorPosition(newCursorPos);
    }, 0);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
    if (e.key === "Escape" && onCancel) {
      onCancel();
    }

    // Formatting keyboard shortcuts
    if (e.ctrlKey || e.metaKey) {
      switch (e.key.toLowerCase()) {
        case "b":
          e.preventDefault();
          applyFormatting("**", "**", "bold text");
          break;
        case "i":
          e.preventDefault();
          applyFormatting("*", "*", "italic text");
          break;
        case "e":
          e.preventDefault();
          applyFormatting("`", "`", "code");
          break;
        case "k":
          e.preventDefault();
          applyFormatting("[", "](url)", "link text");
          break;
      }
      if (e.shiftKey && e.key.toLowerCase() === "x") {
        e.preventDefault();
        applyFormatting("~~", "~~", "strikethrough");
      }
    }
  };

  const handleMentionSelect = (user: User) => {
    const textBeforeCursor = content.slice(0, cursorPosition);
    const textAfterCursor = content.slice(cursorPosition);
    const mentionMatch = textBeforeCursor.match(/@(\w*)$/);
    if (mentionMatch) {
      const newText =
        textBeforeCursor.slice(0, mentionMatch.index) +
        `@${user.username} ` +
        textAfterCursor;
      setContent(newText);
      const newPos = (mentionMatch.index || 0) + user.username.length + 2;
      setCursorPosition(newPos);
      setTimeout(() => {
        if (inputRef.current) {
          inputRef.current.selectionStart = newPos;
          inputRef.current.selectionEnd = newPos;
          inputRef.current.focus();
        }
      }, 0);
    }
  };

  const handleEmojiSelect = (emoji: string) => {
    const newContent = content.slice(0, cursorPosition) + emoji + content.slice(cursorPosition);
    setContent(newContent);
    const newPos = cursorPosition + emoji.length;
    setCursorPosition(newPos);
    setTimeout(() => {
      if (inputRef.current) {
        inputRef.current.selectionStart = newPos;
        inputRef.current.selectionEnd = newPos;
        inputRef.current.focus();
      }
    }, 0);
  };

  const handleFileButtonClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFiles((prev) => [...prev, ...Array.from(e.target.files!)]);
      setShowFileUpload(true);
    }
  };

  const remaining = maxLength - content.length;

  return (
    <div className="relative">
      <UserMention
        inputValue={content}
        cursorPosition={cursorPosition}
        onSelect={handleMentionSelect}
        anchorRef={inputRef}
      />
      <div className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden">
        {showFileUpload && (
          <div className="px-3 pt-3">
            <FileUpload files={files} onFilesChange={setFiles} />
          </div>
        )}
        <div className="flex items-end gap-1 p-1.5">
          <div className="flex items-center gap-0.5 pl-1">
            <button
              type="button"
              onClick={handleFileButtonClick}
              className="p-1.5 rounded-full hover:bg-fb-hover transition-colors text-muted-foreground hover:text-primary"
              title="Attach file"
              aria-label="Attach file"
            >
              <Paperclip className="h-5 w-5" />
            </button>
            <input
              ref={fileInputRef}
              type="file"
              multiple
              className="hidden"
              onChange={handleFileInputChange}
              accept="image/*,.pdf"
              aria-label="Upload files"
            />
            <EmojiPicker onEmojiSelect={handleEmojiSelect} />
          </div>

          <div className="flex-1">
            <textarea
              ref={inputRef}
              value={content}
              onChange={(e) => {
                setContent(e.target.value);
                setCursorPosition(e.target.selectionStart);
              }}
              onSelect={(e) => setCursorPosition((e.target as HTMLTextAreaElement).selectionStart)}
              onKeyDown={handleKeyDown}
              placeholder={placeholder}
              autoFocus={autoFocus}
              rows={1}
              maxLength={maxLength}
              aria-label="Comment input"
              className="w-full resize-none bg-fb-comment-bg rounded-xl px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring min-h-[36px] max-h-[120px] scrollbar-thin"
              style={{ height: "auto", overflow: "hidden" }}
              onInput={(e) => {
                const target = e.target as HTMLTextAreaElement;
                target.style.height = "auto";
                target.style.height = Math.min(target.scrollHeight, 120) + "px";
                target.style.overflow = target.scrollHeight > 120 ? "auto" : "hidden";
              }}
            />
            {content.length > 0 && (
              <FormattingToolbar onFormat={applyFormatting} />
            )}
          </div>

          <div className="flex items-center gap-1 pr-1">
            <span
              className={`text-xs tabular-nums ${
                remaining <= 10
                  ? "text-destructive font-semibold"
                  : remaining <= 50
                  ? "text-amber-500"
                  : "text-muted-foreground"
              }`}
            >
              {content.length}/{maxLength}
            </span>
            {onCancel && (
              <button
                type="button"
                onClick={onCancel}
                className="p-1.5 rounded-full hover:bg-fb-hover transition-colors text-muted-foreground"
                aria-label="Cancel"
              >
                <X className="h-4 w-4" />
              </button>
            )}
            <button
              type="button"
              onClick={handleSubmit}
              disabled={!content.trim() && files.length === 0}
              className="p-1.5 rounded-full hover:bg-fb-hover transition-colors text-primary disabled:text-muted-foreground disabled:opacity-50"
              aria-label="Send comment"
            >
              <Send className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CommentForm;
