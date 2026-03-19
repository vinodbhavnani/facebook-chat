import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import EmojiPickerLib from "emoji-picker-react";
import { Smile } from "lucide-react";

interface EmojiPickerProps {
  onEmojiSelect: (emoji: string) => void;
}

const EmojiPicker = ({ onEmojiSelect }: EmojiPickerProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const [position, setPosition] = useState({ top: 0, left: 0 });

  useEffect(() => {
    if (isOpen && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      const pickerHeight = 400;
      const pickerWidth = 320;

      let top = rect.top - pickerHeight - 8;
      let left = rect.left;

      // If it would go off the top, show below
      if (top < 8) {
        top = rect.bottom + 8;
      }
      // If it would go off the right
      if (left + pickerWidth > window.innerWidth - 8) {
        left = window.innerWidth - pickerWidth - 8;
      }

      setPosition({ top, left });
    }
  }, [isOpen]);

  return (
    <>
      <button
        ref={buttonRef}
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="p-1.5 rounded-full hover:bg-fb-hover transition-colors text-muted-foreground hover:text-primary"
        title="Add emoji"
      >
        <Smile className="h-5 w-5" />
      </button>
      {isOpen &&
        createPortal(
          <>
            <div className="fixed inset-0 z-[9998]" onClick={() => setIsOpen(false)} />
            <div
              className="fixed z-[9999]"
              style={{ top: position.top, left: position.left }}
            >
              <EmojiPickerLib
                onEmojiClick={(emojiData) => {
                  onEmojiSelect(emojiData.emoji);
                  setIsOpen(false);
                }}
                width={320}
                height={400}
                searchPlaceholder="Search emoji..."
              />
            </div>
          </>,
          document.body
        )}
    </>
  );
};

export default EmojiPicker;
