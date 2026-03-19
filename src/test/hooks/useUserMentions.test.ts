import { describe, it, expect } from "vitest";
import { renderHook } from "@testing-library/react";
import { useUserMentions } from "@/hooks/useUserMentions";

describe("useUserMentions", () => {
  it("is inactive when no @ symbol", () => {
    const { result } = renderHook(() => useUserMentions("Hello world", 11));
    expect(result.current.isActive).toBe(false);
    expect(result.current.suggestions).toEqual([]);
  });

  it("is active when @ is present before cursor", () => {
    const { result } = renderHook(() => useUserMentions("Hello @", 7));
    expect(result.current.isActive).toBe(true);
    expect(result.current.suggestions.length).toBeGreaterThan(0);
  });

  it("filters suggestions by search term", () => {
    const { result } = renderHook(() => useUserMentions("Hello @james", 12));
    expect(result.current.isActive).toBe(true);
    result.current.suggestions.forEach((u) => {
      const match =
        u.username.toLowerCase().includes("james") ||
        u.displayName.toLowerCase().includes("james");
      expect(match).toBe(true);
    });
  });

  it("excludes current user from suggestions", () => {
    const { result } = renderHook(() => useUserMentions("@", 1));
    expect(result.current.suggestions.every((u) => u.id !== "user_current")).toBe(true);
  });

  it("is inactive when @ is not at cursor position", () => {
    const { result } = renderHook(() => useUserMentions("@john hello", 11));
    expect(result.current.isActive).toBe(false);
  });
});
