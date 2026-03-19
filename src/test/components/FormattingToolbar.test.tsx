import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import FormattingToolbar, { formattingTools } from "@/components/Chat/FormattingToolbar";

describe("FormattingToolbar", () => {
  it("renders all formatting buttons", () => {
    render(<FormattingToolbar onFormat={vi.fn()} />);
    formattingTools.forEach((tool) => {
      expect(screen.getByTitle(tool.title)).toBeInTheDocument();
    });
  });

  it("calls onFormat with correct args when bold is clicked", () => {
    const onFormat = vi.fn();
    render(<FormattingToolbar onFormat={onFormat} />);
    fireEvent.click(screen.getByTitle("Bold (Ctrl+B)"));
    expect(onFormat).toHaveBeenCalledWith("**", "**", "bold text");
  });

  it("calls onFormat with correct args when italic is clicked", () => {
    const onFormat = vi.fn();
    render(<FormattingToolbar onFormat={onFormat} />);
    fireEvent.click(screen.getByTitle("Italic (Ctrl+I)"));
    expect(onFormat).toHaveBeenCalledWith("*", "*", "italic text");
  });

  it("calls onFormat with correct args when code is clicked", () => {
    const onFormat = vi.fn();
    render(<FormattingToolbar onFormat={onFormat} />);
    fireEvent.click(screen.getByTitle("Code (Ctrl+E)"));
    expect(onFormat).toHaveBeenCalledWith("`", "`", "code");
  });

  it("renders formatting hint text", () => {
    render(<FormattingToolbar onFormat={vi.fn()} />);
    expect(screen.getByText(/\*\*bold\*\*/)).toBeInTheDocument();
  });
});
