import { describe, it, expect, beforeEach, vi } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useEmojiReactions } from "@/hooks/useEmojiReactions";
import { useChatStore } from "@/store/chatStore";
import { CURRENT_USER_ID } from "@/data/mockData";

vi.mock("sonner", () => ({ toast: { info: vi.fn(), success: vi.fn() } }));

describe("useEmojiReactions", () => {
  beforeEach(() => {
    useChatStore.setState({ comments: {}, attachments: {}, isTyping: false, typingUser: null });
  });

  it("adds reaction to a comment", () => {
    const id = useChatStore.getState().addComment("Test");
    const { result } = renderHook(() => useEmojiReactions());
    act(() => { result.current.addReaction(id, "🔥"); });
    expect(useChatStore.getState().comments[id].reactions["🔥"]).toContain(CURRENT_USER_ID);
  });

  it("toggles reaction off", () => {
    const id = useChatStore.getState().addComment("Test");
    const { result } = renderHook(() => useEmojiReactions());
    act(() => { result.current.addReaction(id, "🔥"); });
    act(() => { result.current.addReaction(id, "🔥"); });
    expect(useChatStore.getState().comments[id].reactions["🔥"]).toBeUndefined();
  });
});
