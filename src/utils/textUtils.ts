import { mockUsers } from "@/data/mockData";

export const parseMentions = (text: string): string[] => {
  const mentionRegex = /@(\w+)/g;
  const mentions: string[] = [];
  let match;
  while ((match = mentionRegex.exec(text)) !== null) {
    const username = match[1];
    const user = Object.values(mockUsers).find((u) => u.username === username);
    if (user) mentions.push(user.id);
  }
  return mentions;
};

export const renderContentWithMentions = (content: string): (string | { type: "mention"; username: string })[] => {
  const parts: (string | { type: "mention"; username: string })[] = [];
  const regex = /@(\w+)/g;
  let lastIndex = 0;
  let match;

  while ((match = regex.exec(content)) !== null) {
    if (match.index > lastIndex) {
      parts.push(content.slice(lastIndex, match.index));
    }
    parts.push({ type: "mention", username: match[1] });
    lastIndex = match.index + match[0].length;
  }
  if (lastIndex < content.length) {
    parts.push(content.slice(lastIndex));
  }
  return parts;
};
