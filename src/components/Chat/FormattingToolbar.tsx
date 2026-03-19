import { Bold, Italic, Code, Strikethrough, Link } from "lucide-react";

interface FormattingToolbarProps {
  onFormat: (prefix: string, suffix: string, placeholder: string) => void;
}

const tools = [
  { icon: Bold, prefix: "**", suffix: "**", placeholder: "bold text", title: "Bold (Ctrl+B)", shortcut: "b" },
  { icon: Italic, prefix: "*", suffix: "*", placeholder: "italic text", title: "Italic (Ctrl+I)", shortcut: "i" },
  { icon: Code, prefix: "`", suffix: "`", placeholder: "code", title: "Code (Ctrl+E)", shortcut: "e" },
  { icon: Strikethrough, prefix: "~~", suffix: "~~", placeholder: "strikethrough", title: "Strikethrough (Ctrl+Shift+X)", shortcut: "x" },
  { icon: Link, prefix: "[", suffix: "](url)", placeholder: "link text", title: "Link (Ctrl+K)", shortcut: "k" },
];

const FormattingToolbar = ({ onFormat }: FormattingToolbarProps) => {
  return (
    <div className="flex items-center gap-0.5 border-t border-border pt-1.5 mt-1.5">
      {tools.map(({ icon: Icon, prefix, suffix, placeholder, title }) => (
        <button
          key={title}
          type="button"
          onClick={() => onFormat(prefix, suffix, placeholder)}
          className="p-1 rounded hover:bg-fb-hover transition-colors text-muted-foreground hover:text-foreground"
          title={title}
          aria-label={title}
        >
          <Icon className="h-3.5 w-3.5" />
        </button>
      ))}
      <span className="ml-auto text-[10px] text-muted-foreground select-none">
        **bold** *italic* `code` ~~strike~~
      </span>
    </div>
  );
};

export { tools as formattingTools };
export default FormattingToolbar;
