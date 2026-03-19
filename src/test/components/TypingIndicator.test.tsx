import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import TypingIndicator from "@/components/Chat/TypingIndicator";

describe("TypingIndicator", () => {
  it("renders typing dots", () => {
    const { container } = render(<TypingIndicator userName="Alice" />);
    const dots = container.querySelectorAll(".animate-bounce");
    expect(dots.length).toBe(3);
  });

  it("shows username when provided", () => {
    render(<TypingIndicator userName="Alice" />);
    expect(screen.getByText("Alice is typing...")).toBeInTheDocument();
  });

  it("does not show username when null", () => {
    render(<TypingIndicator userName={null} />);
    expect(screen.queryByText(/is typing/)).not.toBeInTheDocument();
  });
});
