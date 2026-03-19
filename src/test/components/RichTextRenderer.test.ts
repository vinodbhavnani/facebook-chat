import { describe, it, expect } from "vitest";
import { parseRichText } from "@/components/Chat/richTextParser";

describe("parseRichText", () => {
  it("returns plain text for no formatting", () => {
    const result = parseRichText("Hello world");
    expect(result).toEqual([{ type: "text", value: "Hello world" }]);
  });

  it("parses bold text", () => {
    const result = parseRichText("This is **bold** text");
    expect(result).toHaveLength(3);
    expect(result[1]).toEqual({ type: "bold", value: "bold" });
  });

  it("parses italic text", () => {
    const result = parseRichText("This is *italic* text");
    expect(result).toHaveLength(3);
    expect(result[1]).toEqual({ type: "italic", value: "italic" });
  });

  it("parses inline code", () => {
    const result = parseRichText("Use `const x = 1` here");
    expect(result).toHaveLength(3);
    expect(result[1]).toEqual({ type: "code", value: "const x = 1" });
  });

  it("parses strikethrough", () => {
    const result = parseRichText("This is ~~deleted~~ text");
    expect(result).toHaveLength(3);
    expect(result[1]).toEqual({ type: "strikethrough", value: "deleted" });
  });

  it("parses links", () => {
    const result = parseRichText("Click [here](https://example.com) now");
    expect(result).toHaveLength(3);
    expect(result[1]).toEqual({ type: "link", text: "here", url: "https://example.com" });
  });

  it("parses mentions", () => {
    const result = parseRichText("Hey @john check this");
    expect(result).toHaveLength(3);
    expect(result[1]).toEqual({ type: "mention", username: "john" });
  });

  it("parses multiple formatting types in one string", () => {
    const result = parseRichText("**bold** and *italic* and `code`");
    const types = result.map((p) => p.type);
    expect(types).toContain("bold");
    expect(types).toContain("italic");
    expect(types).toContain("code");
  });

  it("returns empty array for empty string", () => {
    expect(parseRichText("")).toEqual([]);
  });

  it("handles text with no closing markers", () => {
    const result = parseRichText("No **closing marker");
    // Should return as plain text since no match
    expect(result.length).toBeGreaterThanOrEqual(1);
  });
});
