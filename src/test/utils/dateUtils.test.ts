import { describe, it, expect } from "vitest";
import { formatTimestamp } from "@/utils/dateUtils";

describe("formatTimestamp", () => {
  it("returns relative time for valid ISO timestamp", () => {
    const now = new Date().toISOString();
    expect(formatTimestamp(now)).toMatch(/less than a minute ago|seconds ago/);
  });

  it("returns 'about 1 hour ago' for 1 hour ago", () => {
    const oneHourAgo = new Date(Date.now() - 3600 * 1000).toISOString();
    expect(formatTimestamp(oneHourAgo)).toMatch(/hour/);
  });

  it("returns 'just now' for invalid timestamp", () => {
    expect(formatTimestamp("invalid-date")).toBe("just now");
  });

  it("returns 'just now' for empty string", () => {
    expect(formatTimestamp("")).toBe("just now");
  });

  it("handles timestamps from days ago", () => {
    const threeDaysAgo = new Date(Date.now() - 3 * 86400 * 1000).toISOString();
    expect(formatTimestamp(threeDaysAgo)).toMatch(/days ago/);
  });
});
