import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { useChatStore } from "@/store/chatStore";
import { CURRENT_USER_ID } from "@/data/mockData";

vi.mock("sonner", () => ({ toast: { info: vi.fn(), success: vi.fn() } }));

let dateCounter = 0;

function resetStore() {
  dateCounter = 0;
  vi.spyOn(Date, "now").mockImplementation(() => 1000000 + dateCounter++);
  useChatStore.setState({ comments: {}, attachments: {}, isTyping: false, typingUser: null });
}

describe("Integration: Comment Submission Flow", () => {
  beforeEach(resetStore);
  afterEach(() => vi.restoreAllMocks());

  it("full comment lifecycle: create → edit → react → delete", () => {
    const id = useChatStore.getState().addComment("Initial content");
    expect(useChatStore.getState().comments[id].content).toBe("Initial content");

    useChatStore.getState().editComment(id, "Updated content");
    expect(useChatStore.getState().comments[id].content).toBe("Updated content");
    expect(useChatStore.getState().comments[id].isEdited).toBe(true);

    useChatStore.getState().toggleReaction(id, "👍");
    expect(useChatStore.getState().comments[id].reactions["👍"]).toContain(CURRENT_USER_ID);

    useChatStore.getState().deleteComment(id);
    expect(useChatStore.getState().comments[id]).toBeUndefined();
  });

  it("comment with mentions triggers notification data", () => {
    const id = useChatStore.getState().addComment("Hey @user_0", null, ["user_0"]);
    expect(useChatStore.getState().comments[id].mentions).toContain("user_0");
  });

  it("comment with file attachments persists them", () => {
    const att = {
      id: "att_integration",
      filename: "test.png",
      originalName: "test.png",
      path: "blob:test",
      type: "image/png",
      size: 500,
      uploadedBy: CURRENT_USER_ID,
      uploadedAt: new Date().toISOString(),
      metadata: {},
    };

    const id = useChatStore.getState().addComment("With attachment", null, [], [att]);
    expect(useChatStore.getState().comments[id].attachments).toContain("att_integration");
    expect(useChatStore.getState().attachments["att_integration"]).toBeTruthy();
  });
});

describe("Integration: Reply Thread", () => {
  beforeEach(resetStore);
  afterEach(() => vi.restoreAllMocks());

  it("creates nested reply chain", () => {
    const rootId = useChatStore.getState().addComment("Root");
    const reply1 = useChatStore.getState().addComment("Reply 1", rootId);
    const reply2 = useChatStore.getState().addComment("Reply 2", rootId);
    const nestedReply = useChatStore.getState().addComment("Nested", reply1);

    const rootReplies = useChatStore.getState().getReplies(rootId);
    expect(rootReplies.length).toBe(2);

    const reply1Replies = useChatStore.getState().getReplies(reply1);
    expect(reply1Replies.length).toBe(1);
    expect(reply1Replies[0].id).toBe(nestedReply);
  });

  it("deleting reply removes from parent's replies array", () => {
    const rootId = useChatStore.getState().addComment("Root");
    const replyId = useChatStore.getState().addComment("Reply", rootId);

    useChatStore.getState().deleteComment(replyId);
    expect(useChatStore.getState().getReplies(rootId).length).toBe(0);
    expect(useChatStore.getState().comments[rootId].replies).not.toContain(replyId);
  });
});

describe("Integration: User Mention Detection", () => {
  beforeEach(resetStore);
  afterEach(() => vi.restoreAllMocks());

  it("stores mentioned user IDs in comment", () => {
    const id = useChatStore.getState().addComment(
      "Hey @user_5 and @user_10",
      null,
      ["user_5", "user_10"]
    );
    const comment = useChatStore.getState().comments[id];
    expect(comment.mentions).toEqual(["user_5", "user_10"]);
  });
});

describe("Integration: Data Persistence", () => {
  beforeEach(resetStore);
  afterEach(() => vi.restoreAllMocks());

  it("persists comments across store operations", () => {
    const id1 = useChatStore.getState().addComment("Comment 1");
    const id2 = useChatStore.getState().addComment("Comment 2");

    expect(Object.keys(useChatStore.getState().comments).length).toBe(2);

    useChatStore.getState().deleteComment(id1);
    expect(Object.keys(useChatStore.getState().comments).length).toBe(1);
    expect(useChatStore.getState().comments[id2]).toBeTruthy();
  });

  it("attachments persist after comment creation", () => {
    const att = {
      id: "att_persist",
      filename: "f.jpg",
      originalName: "f.jpg",
      path: "blob:x",
      type: "image/jpeg",
      size: 100,
      uploadedBy: CURRENT_USER_ID,
      uploadedAt: new Date().toISOString(),
      metadata: {},
    };

    useChatStore.getState().addComment("Att comment", null, [], [att]);
    useChatStore.getState().addComment("Another comment");
    expect(useChatStore.getState().attachments["att_persist"]).toBeTruthy();
  });

  it("reactions persist across multiple operations", () => {
    const id = useChatStore.getState().addComment("React test");
    useChatStore.getState().toggleReaction(id, "👍");
    useChatStore.getState().toggleReaction(id, "❤️");

    useChatStore.getState().addComment("Other");

    const reactions = useChatStore.getState().comments[id].reactions;
    expect(reactions["👍"]).toBeDefined();
    expect(reactions["👍"]).toContain(CURRENT_USER_ID);
    expect(reactions["❤️"]).toBeDefined();
    expect(reactions["❤️"]).toContain(CURRENT_USER_ID);
  });
});

describe("Integration: File Attachment Process", () => {
  beforeEach(resetStore);
  afterEach(() => vi.restoreAllMocks());

  it("multiple attachments on single comment", () => {
    const atts = [
      { id: "att_1", filename: "a.jpg", originalName: "a.jpg", path: "blob:1", type: "image/jpeg", size: 100, uploadedBy: CURRENT_USER_ID, uploadedAt: new Date().toISOString(), metadata: {} },
      { id: "att_2", filename: "b.pdf", originalName: "b.pdf", path: "blob:2", type: "application/pdf", size: 200, uploadedBy: CURRENT_USER_ID, uploadedAt: new Date().toISOString(), metadata: {} },
    ];

    const id = useChatStore.getState().addComment("Files", null, [], atts);
    const comment = useChatStore.getState().comments[id];
    expect(comment.attachments).toEqual(["att_1", "att_2"]);
    expect(useChatStore.getState().attachments["att_1"]).toBeTruthy();
    expect(useChatStore.getState().attachments["att_2"]).toBeTruthy();
  });
});
