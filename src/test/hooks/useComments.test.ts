import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useComments } from "@/hooks/useComments";
import { useChatStore } from "@/store/chatStore";

vi.mock("sonner", () => ({ toast: { info: vi.fn(), success: vi.fn() } }));

let dateCounter = 0;

describe("useComments", () => {
  beforeEach(() => {
    dateCounter = 0;
    vi.spyOn(Date, "now").mockImplementation(() => 1000000 + dateCounter++);
    useChatStore.setState({ comments: {}, attachments: {}, isTyping: false, typingUser: null });
  });
  afterEach(() => vi.restoreAllMocks());

  it("returns zero totalCount initially", () => {
    const { result } = renderHook(() => useComments());
    expect(result.current.totalCount).toBe(0);
  });

  it("adds and retrieves a comment", () => {
    const { result } = renderHook(() => useComments());
    let id: string;
    act(() => { id = result.current.addComment("Test comment"); });
    expect(result.current.getCommentById(id!)).toBeTruthy();
    expect(result.current.totalCount).toBe(1);
  });

  it("returns root comments", () => {
    const { result } = renderHook(() => useComments());
    act(() => { result.current.addComment("Root 1"); });
    act(() => { result.current.addComment("Root 2"); });
    expect(result.current.getRootComments().length).toBe(2);
  });

  it("returns null for non-existent comment", () => {
    const { result } = renderHook(() => useComments());
    expect(result.current.getCommentById("nope")).toBeNull();
  });
});
