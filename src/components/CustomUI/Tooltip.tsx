import { ReactNode, useState } from "react";

interface TooltipProps {
  content: string;
  children: ReactNode;
  position?: "top" | "bottom";
}

/** Simple tooltip component */
const Tooltip = ({ content, children, position = "top" }: TooltipProps) => {
  const [visible, setVisible] = useState(false);

  const positionClasses = position === "top"
    ? "bottom-full left-1/2 -translate-x-1/2 mb-1.5"
    : "top-full left-1/2 -translate-x-1/2 mt-1.5";

  return (
    <div
      className="relative inline-flex"
      onMouseEnter={() => setVisible(true)}
      onMouseLeave={() => setVisible(false)}
    >
      {children}
      {visible && (
        <div
          className={`absolute ${positionClasses} z-50 px-2 py-1 text-xs rounded-md bg-foreground text-background whitespace-nowrap shadow-sm animate-in fade-in duration-150`}
          role="tooltip"
        >
          {content}
        </div>
      )}
    </div>
  );
};

export default Tooltip;
