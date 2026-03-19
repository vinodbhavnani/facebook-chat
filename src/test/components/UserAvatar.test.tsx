import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import UserAvatar from "@/components/Chat/UserAvatar";
import { User } from "@/types/user.types";

const mockUser: User = {
  id: "user_1",
  username: "john_doe",
  displayName: "John Doe",
  avatar: "",
  isOnline: true,
  lastSeen: new Date().toISOString(),
};

describe("UserAvatar", () => {
  it("renders initials from display name", () => {
    render(<UserAvatar user={mockUser} />);
    expect(screen.getByText("JD")).toBeInTheDocument();
  });

  it("applies sm size class", () => {
    const { container } = render(<UserAvatar user={mockUser} size="sm" />);
    const avatar = container.querySelector(".h-8");
    expect(avatar).toBeTruthy();
  });

  it("applies lg size class", () => {
    const { container } = render(<UserAvatar user={mockUser} size="lg" />);
    const avatar = container.querySelector(".h-12");
    expect(avatar).toBeTruthy();
  });

  it("defaults to md size", () => {
    const { container } = render(<UserAvatar user={mockUser} />);
    const avatar = container.querySelector(".h-10");
    expect(avatar).toBeTruthy();
  });

  it("handles single-word display name", () => {
    render(<UserAvatar user={{ ...mockUser, displayName: "Alice" }} />);
    expect(screen.getByText("A")).toBeInTheDocument();
  });
});
