import { describe, it, expect } from "vitest";
import { parseMentions, renderContentWithMentions } from "@/utils/textUtils";
import { mockUsers } from "@/data/mockData";

describe("parseMentions", () => {
  it("returns empty array when no mentions", () => {
    expect(parseMentions("Hello world")).toEqual([]);
  });

  it("detects valid user mentions", () => {
    // Get the first non-current user
    const user = Object.values(mockUsers).find((u) => u.id !== "user_current")!;
    const text = `Hey @${user.username} check this`;
    const result = parseMentions(text);
    expect(result).toContain(user.id);
  });

  it("ignores mentions of non-existent users", () => {
    expect(parseMentions("Hey @nonexistent_user_xyz")).toEqual([]);
  });

  it("handles multiple mentions", () => {
    const users = Object.values(mockUsers).filter((u) => u.id !== "user_current").slice(0, 2);
    const text = `@${users[0].username} and @${users[1].username}`;
    const result = parseMentions(text);
    expect(result.length).toBe(2);
  });

  it("handles empty string", () => {
    expect(parseMentions("")).toEqual([]);
  });
});

describe("renderContentWithMentions", () => {
  it("returns array with single text for no mentions", () => {
    const result = renderContentWithMentions("Hello world");
    expect(result).toEqual(["Hello world"]);
  });

  it("splits text and mentions correctly", () => {
    const result = renderContentWithMentions("Hi @john how are you");
    expect(result).toHaveLength(3);
    expect(result[0]).toBe("Hi ");
    expect(result[1]).toEqual({ type: "mention", username: "john" });
    expect(result[2]).toBe(" how are you");
  });

  it("handles mention at start of text", () => {
    const result = renderContentWithMentions("@alice hello");
    expect(result[0]).toEqual({ type: "mention", username: "alice" });
    expect(result[1]).toBe(" hello");
  });

  it("handles mention at end of text", () => {
    const result = renderContentWithMentions("hello @bob");
    expect(result[0]).toBe("hello ");
    expect(result[1]).toEqual({ type: "mention", username: "bob" });
  });

  it("handles multiple consecutive mentions", () => {
    const result = renderContentWithMentions("@alice @bob");
    const mentions = result.filter((p) => typeof p !== "string");
    expect(mentions.length).toBe(2);
  });

  it("returns empty array for empty string", () => {
    expect(renderContentWithMentions("")).toEqual([]);
  });
});
