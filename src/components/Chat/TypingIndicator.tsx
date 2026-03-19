/** Typing indicator bubble with animated dots */
const TypingIndicator = ({ userName }: { userName: string | null }) => {
  return (
    <div className="flex items-center gap-2 mt-3 ml-1 animate-in fade-in duration-300">
      <div className="bg-fb-comment-bg rounded-2xl px-3 py-2 flex items-center gap-1.5">
        <div className="flex gap-0.5">
          <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground animate-bounce" style={{ animationDelay: "0ms" }} />
          <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground animate-bounce" style={{ animationDelay: "150ms" }} />
          <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground animate-bounce" style={{ animationDelay: "300ms" }} />
        </div>
      </div>
      {userName && (
        <span className="text-xs text-muted-foreground">{userName} is typing...</span>
      )}
    </div>
  );
};

export default TypingIndicator;
