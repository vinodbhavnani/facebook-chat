import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { mockUsers, CURRENT_USER_ID } from "@/data/mockData";
import { User } from "@/types/user.types";

interface UserMentionProps {
  inputValue: string;
  cursorPosition: number;
  onSelect: (user: User) => void;
  anchorRef: React.RefObject<HTMLElement | null>;
}

const DEBOUNCE_MS = 200;
const PAGE_SIZE = 10;

const UserMention = ({ inputValue, cursorPosition, onSelect }: UserMentionProps) => {
  const textBeforeCursor = inputValue.slice(0, cursorPosition);
  const mentionMatch = textBeforeCursor.match(/@(\w*)$/);
  const rawQuery = mentionMatch ? mentionMatch[1].toLowerCase() : "";
  const isActive = !!mentionMatch;

  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const listRef = useRef<HTMLDivElement>(null);

  // Debounce
  useEffect(() => {
    if (!isActive) { setDebouncedQuery(""); return; }
    const timer = setTimeout(() => setDebouncedQuery(rawQuery), DEBOUNCE_MS);
    return () => clearTimeout(timer);
  }, [rawQuery, isActive]);

  // Reset on query change
  useEffect(() => {
    setSelectedIndex(0);
    setVisibleCount(PAGE_SIZE);
  }, [debouncedQuery]);

  // All matching users (computed once per query)
  const allMatches = useMemo(() => {
    if (!isActive) return [];
    return Object.values(mockUsers).filter(
      (u) =>
        u.id !== CURRENT_USER_ID &&
        (u.username.toLowerCase().includes(debouncedQuery) ||
          u.displayName.toLowerCase().includes(debouncedQuery))
    );
  }, [isActive, debouncedQuery]);

  const visibleUsers = useMemo(() => allMatches.slice(0, visibleCount), [allMatches, visibleCount]);

  // Infinite scroll handler
  const handleScroll = useCallback(() => {
    const el = listRef.current;
    if (!el) return;
    if (el.scrollTop + el.clientHeight >= el.scrollHeight - 20) {
      setVisibleCount((prev) => Math.min(prev + PAGE_SIZE, allMatches.length));
    }
  }, [allMatches.length]);

  // Scroll selected into view
  useEffect(() => {
    if (listRef.current) {
      const selected = listRef.current.children[selectedIndex] as HTMLElement;
      selected?.scrollIntoView({ block: "nearest" });
    }
  }, [selectedIndex]);

  if (!isActive || visibleUsers.length === 0) return null;

  return (
    <div className="absolute bottom-full left-0 mb-1 w-72 bg-card rounded-lg border border-border shadow-lg overflow-hidden z-50">
      <div className="px-3 py-1.5 border-b border-border flex items-center gap-2">
        <svg className="h-3.5 w-3.5 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <circle cx="11" cy="11" r="8" />
          <path d="m21 21-4.3-4.3" />
        </svg>
        <span className="text-xs text-muted-foreground truncate">
          {rawQuery ? `Searching "${rawQuery}"…` : "Type to search users…"}
        </span>
        <span className="ml-auto text-xs text-muted-foreground/60">
          {visibleUsers.length} of {allMatches.length}
        </span>
      </div>
      <div
        ref={listRef}
        className="py-1 max-h-52 overflow-y-auto scrollbar-thin"
        onScroll={handleScroll}
      >
        {visibleUsers.map((user, idx) => (
          <button
            key={user.id}
            type="button"
            className={`w-full flex items-center gap-2.5 px-3 py-2 transition-colors text-left ${
              idx === selectedIndex ? "bg-accent text-accent-foreground" : "hover:bg-accent/50"
            }`}
            onMouseDown={(e) => { e.preventDefault(); onSelect(user); }}
            onMouseEnter={() => setSelectedIndex(idx)}
          >
            <div className="h-7 w-7 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-semibold shrink-0">
              {user.displayName[0]}
            </div>
            <div className="min-w-0">
              <div className="text-sm font-medium text-foreground truncate">{user.displayName}</div>
              <div className="text-xs text-muted-foreground truncate">@{user.username}</div>
            </div>
          </button>
        ))}
        {visibleCount < allMatches.length && (
          <div className="text-center py-2 text-xs text-muted-foreground">Scroll for more…</div>
        )}
      </div>
    </div>
  );
};

export default UserMention;
