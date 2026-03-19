import { useState, useMemo } from "react";
import { mockUsers, CURRENT_USER_ID } from "@/data/mockData";
import { User } from "@/types/user.types";

export const useUserMentions = (inputValue: string, cursorPosition: number) => {
  const textBeforeCursor = inputValue.slice(0, cursorPosition);
  const mentionMatch = textBeforeCursor.match(/@(\w*)$/);

  const searchTerm = mentionMatch ? mentionMatch[1].toLowerCase() : "";
  const isActive = !!mentionMatch;

  const suggestions = useMemo(() => {
    if (!isActive) return [];
    return Object.values(mockUsers).filter(
      (u) =>
        u.id !== CURRENT_USER_ID &&
        (u.username.toLowerCase().includes(searchTerm) ||
          u.displayName.toLowerCase().includes(searchTerm))
    );
  }, [isActive, searchTerm]);

  return { isActive, suggestions, searchTerm, mentionMatch };
};
