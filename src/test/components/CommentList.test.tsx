import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import CommentList from "@/components/Chat/CommentList";
import { Comment } from "@/types/comment.types";

// Mock the Comment component to avoid deep rendering
vi.mock("@/components/Chat/Comment", () => ({
  default: ({ comment }: { comment: Comment }) => (
    <div data-testid={`comment-${comment.id}`}>{comment.content}</div>
  ),
}));

const makeComment = (id: string, content: string): Comment => ({
  id,
  parentId: null,
  authorId: "user_1",
  content,
  timestamp: new Date().toISOString(),
  attachments: [],
  reactions: {},
  mentions: [],
  isEdited: false,
  editedAt: null,
  replies: [],
});

describe("CommentList", () => {
  it("renders all comments", () => {
    const comments = [makeComment("1", "First"), makeComment("2", "Second")];
    render(<CommentList comments={comments} />);
    expect(screen.getByTestId("comment-1")).toBeInTheDocument();
    expect(screen.getByTestId("comment-2")).toBeInTheDocument();
  });

  it("returns null for empty comments", () => {
    const { container } = render(<CommentList comments={[]} />);
    expect(container.firstChild).toBeNull();
  });

  it("has accessible list role", () => {
    const comments = [makeComment("1", "First")];
    render(<CommentList comments={comments} />);
    expect(screen.getByRole("list")).toBeInTheDocument();
  });
});
