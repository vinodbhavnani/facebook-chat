import { describe, it, expect, vi } from "vitest";
import { fileService } from "@/services/fileService";

vi.stubGlobal("URL", {
  createObjectURL: vi.fn(() => "blob:mock-url"),
  revokeObjectURL: vi.fn(),
});

function createMockFile(name: string, size: number, type: string): File {
  return new File([new ArrayBuffer(size)], name, { type });
}

describe("fileService", () => {
  describe("validate", () => {
    it("returns null for valid file", () => {
      expect(fileService.validate(createMockFile("a.jpg", 100, "image/jpeg"))).toBeNull();
    });

    it("returns error string for invalid file", () => {
      expect(fileService.validate(createMockFile("a.exe", 100, "application/exe"))).toBeTruthy();
    });
  });

  describe("createAttachment", () => {
    it("creates attachment object with correct properties", () => {
      const file = createMockFile("photo.png", 2048, "image/png");
      const att = fileService.createAttachment(file, "user_1");

      expect(att.id).toMatch(/^att_/);
      expect(att.filename).toBe("photo.png");
      expect(att.originalName).toBe("photo.png");
      expect(att.path).toBe("blob:mock-url");
      expect(att.type).toBe("image/png");
      expect(att.size).toBe(2048);
      expect(att.uploadedBy).toBe("user_1");
      expect(att.uploadedAt).toBeTruthy();
      expect(att.metadata).toEqual({});
    });

    it("generates unique IDs for different calls", () => {
      const file = createMockFile("a.jpg", 100, "image/jpeg");
      const a1 = fileService.createAttachment(file, "u1");
      const a2 = fileService.createAttachment(file, "u1");
      expect(a1.id).not.toBe(a2.id);
    });
  });

  describe("revokeUrl", () => {
    it("calls URL.revokeObjectURL", () => {
      fileService.revokeUrl("blob:test");
      expect(URL.revokeObjectURL).toHaveBeenCalledWith("blob:test");
    });
  });
});
