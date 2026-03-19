/**
 * Legacy parseRichText function — kept for backward compatibility with tests.
 * The main RichTextRenderer now uses react-markdown + highlight.js.
 */

type RichPart =
  | { type: "text"; value: string }
  | { type: "bold"; value: string }
  | { type: "italic"; value: string }
  | { type: "code"; value: string }
  | { type: "strikethrough"; value: string }
  | { type: "link"; text: string; url: string }
  | { type: "mention"; username: string };

export const parseRichText = (content: string): RichPart[] => {
  const parts: RichPart[] = [];
  const regex =
    /(\*\*(.+?)\*\*)|(\*(.+?)\*)|(`(.+?)`)|(~~(.+?)~~)|(\[(.+?)\]\((.+?)\))|(@(\w+))/g;

  let lastIndex = 0;
  let match;

  while ((match = regex.exec(content)) !== null) {
    if (match.index > lastIndex) {
      parts.push({ type: "text", value: content.slice(lastIndex, match.index) });
    }

    if (match[1]) {
      parts.push({ type: "bold", value: match[2] });
    } else if (match[3]) {
      parts.push({ type: "italic", value: match[4] });
    } else if (match[5]) {
      parts.push({ type: "code", value: match[6] });
    } else if (match[7]) {
      parts.push({ type: "strikethrough", value: match[8] });
    } else if (match[9]) {
      parts.push({ type: "link", text: match[10], url: match[11] });
    } else if (match[12]) {
      parts.push({ type: "mention", username: match[13] });
    }

    lastIndex = match.index + match[0].length;
  }

  if (lastIndex < content.length) {
    parts.push({ type: "text", value: content.slice(lastIndex) });
  }

  return parts;
};
