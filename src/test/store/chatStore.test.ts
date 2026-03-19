import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { useChatStore } from "@/store/chatStore";
import { CURRENT_USER_ID } from "@/data/mockData";

// Silence sonner toasts
vi.mock("sonner", () => ({ toast: { info: vi.fn(), success: vi.fn(), error: vi.fn() } }));

describe("chatStore", () => {
  let dateCounter = 0;
  beforeEach(() => {
    dateCounter = 0;
    vi.spyOn(Date, "now").mockImplementation(() => 1000000 + dateCounter++);
    useChatStore.setState({
      comments: {},
      attachments: {},
      isTyping: false,
      typingUser: null,
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("addComment", () => {
    it("adds a root comment", () => {
      const id = useChatStore.getState().addComment("Hello world");
      const comment = useChatStore.getState().comments[id];
      expect(comment).toBeTruthy();
      expect(comment.content).toBe("Hello world");
      expect(comment.parentId).toBeNull();
      expect(comment.authorId).toBe(CURRENT_USER_ID);
      expect(comment.reactions).toEqual({});
      expect(comment.replies).toEqual([]);
    });

    it("adds a reply and updates parent replies array", () => {
      const parentId = useChatStore.getState().addComment("Parent");
      const replyId = useChatStore.getState().addComment("Reply", parentId);

      const parent = useChatStore.getState().comments[parentId];
      const reply = useChatStore.getState().comments[replyId];
      expect(reply.parentId).toBe(parentId);
      expect(parent.replies).toContain(replyId);
    });

    it("stores file attachments", () => {
      const attachment = {
        id: "att_test",
        filename: "f.jpg",
        originalName: "f.jpg",
        path: "blob:x",
        type: "image/jpeg",
        size: 100,
        uploadedBy: CURRENT_USER_ID,
        uploadedAt: new Date().toISOString(),
        metadata: {},
      };
      const id = useChatStore.getState().addComment("With file", null, [], [attachment]);
      const comment = useChatStore.getState().comments[id];
      expect(comment.attachments).toContain("att_test");
      expect(useChatStore.getState().attachments["att_test"]).toBeTruthy();
    });

    it("records mentions", () => {
      const id = useChatStore.getState().addComment("Hey", null, ["user_1", "user_2"]);
      expect(useChatStore.getState().comments[id].mentions).toEqual(["user_1", "user_2"]);
    });
  });

  describe("editComment", () => {
    it("edits own comment", () => {
      const id = useChatStore.getState().addComment("Original");
      useChatStore.getState().editComment(id, "Edited");
      const comment = useChatStore.getState().comments[id];
      expect(comment.content).toBe("Edited");
      expect(comment.isEdited).toBe(true);
      expect(comment.editedAt).toBeTruthy();
    });

    it("does not edit another user's comment", () => {
      const id = useChatStore.getState().addComment("Original");
      // Simulate foreign author
      useChatStore.setState((s) => ({
        comments: { ...s.comments, [id]: { ...s.comments[id], authorId: "user_other" } },
      }));
      useChatStore.getState().editComment(id, "Hacked");
      expect(useChatStore.getState().comments[id].content).toBe("Original");
    });
  });

  describe("deleteComment", () => {
    it("deletes own comment", () => {
      const id = useChatStore.getState().addComment("To delete");
      useChatStore.getState().deleteComment(id);
      expect(useChatStore.getState().comments[id]).toBeUndefined();
    });

    it("removes from parent's replies on delete", () => {
      const parentId = useChatStore.getState().addComment("Parent");
      const replyId = useChatStore.getState().addComment("Reply", parentId);
      useChatStore.getState().deleteComment(replyId);
      expect(useChatStore.getState().comments[parentId].replies).not.toContain(replyId);
    });

    it("does not delete another user's comment", () => {
      const id = useChatStore.getState().addComment("Protected");
      useChatStore.setState((s) => ({
        comments: { ...s.comments, [id]: { ...s.comments[id], authorId: "user_other" } },
      }));
      useChatStore.getState().deleteComment(id);
      expect(useChatStore.getState().comments[id]).toBeTruthy();
    });
  });

  describe("toggleReaction", () => {
    it("adds a reaction", () => {
      const id = useChatStore.getState().addComment("React to me");
      useChatStore.getState().toggleReaction(id, "👍");
      expect(useChatStore.getState().comments[id].reactions["👍"]).toContain(CURRENT_USER_ID);
    });

    it("removes a reaction when toggled again", () => {
      const id = useChatStore.getState().addComment("React to me");
      useChatStore.getState().toggleReaction(id, "👍");
      useChatStore.getState().toggleReaction(id, "👍");
      expect(useChatStore.getState().comments[id].reactions["👍"]).toBeUndefined();
    });

    it("handles multiple emojis on same comment", () => {
      const id = useChatStore.getState().addComment("Multi react");
      useChatStore.getState().toggleReaction(id, "👍");
      useChatStore.getState().toggleReaction(id, "❤️");
      const reactions = useChatStore.getState().comments[id].reactions;
      expect(reactions["👍"]).toContain(CURRENT_USER_ID);
      expect(reactions["❤️"]).toContain(CURRENT_USER_ID);
    });

    it("does nothing for non-existent comment", () => {
      const stateBefore = useChatStore.getState().comments;
      useChatStore.getState().toggleReaction("nonexistent", "👍");
      expect(useChatStore.getState().comments).toEqual(stateBefore);
    });
  });

  describe("getRootComments", () => {
    it("returns only root comments sorted by timestamp", () => {
      useChatStore.getState().addComment("First");
      useChatStore.getState().addComment("Second");
      const parentId = useChatStore.getState().addComment("Third");
      useChatStore.getState().addComment("Reply", parentId);

      const roots = useChatStore.getState().getRootComments();
      expect(roots.length).toBe(3);
      expect(roots.every((c) => c.parentId === null)).toBe(true);
    });
  });

  describe("getReplies", () => {
    it("returns replies sorted by timestamp", () => {
      const parentId = useChatStore.getState().addComment("Parent");
      useChatStore.getState().addComment("Reply 1", parentId);
      useChatStore.getState().addComment("Reply 2", parentId);

      const replies = useChatStore.getState().getReplies(parentId);
      expect(replies.length).toBe(2);
      expect(new Date(replies[0].timestamp).getTime()).toBeLessThanOrEqual(
        new Date(replies[1].timestamp).getTime()
      );
    });

    it("returns empty array for comment with no replies", () => {
      const id = useChatStore.getState().addComment("No replies");
      expect(useChatStore.getState().getReplies(id)).toEqual([]);
    });

    it("returns empty array for non-existent comment", () => {
      expect(useChatStore.getState().getReplies("nonexistent")).toEqual([]);
    });
  });

  describe("typing indicator", () => {
    it("sets typing state", () => {
      useChatStore.getState().setTyping(true);
      expect(useChatStore.getState().isTyping).toBe(true);
      useChatStore.getState().setTyping(false);
      expect(useChatStore.getState().isTyping).toBe(false);
    });
  });
});
