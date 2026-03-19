import { describe, it, expect, vi } from "vitest";
import { validateFile, formatFileSize, getFilePreviewUrl } from "@/utils/fileUtils";
import { MAX_FILE_SIZE, ALLOWED_FILE_TYPES } from "@/data/mockData";

// Mock URL.createObjectURL
vi.stubGlobal("URL", {
  createObjectURL: vi.fn(() => "blob:mock-url"),
  revokeObjectURL: vi.fn(),
});

function createMockFile(name: string, size: number, type: string): File {
  const buffer = new ArrayBuffer(size);
  return new File([buffer], name, { type });
}

describe("validateFile", () => {
  it("returns null for valid image file", () => {
    const file = createMockFile("photo.jpg", 1024, "image/jpeg");
    expect(validateFile(file)).toBeNull();
  });

  it("returns null for valid PDF file", () => {
    const file = createMockFile("doc.pdf", 1024, "application/pdf");
    expect(validateFile(file)).toBeNull();
  });

  it("returns error for file exceeding size limit", () => {
    const file = createMockFile("big.jpg", MAX_FILE_SIZE + 1, "image/jpeg");
    expect(validateFile(file)).toContain("exceeds 5MB limit");
  });

  it("returns error for unsupported file type", () => {
    const file = createMockFile("script.js", 100, "text/javascript");
    expect(validateFile(file)).toContain("not supported");
  });

  it("returns error for empty type with large file", () => {
    const file = createMockFile("unknown", MAX_FILE_SIZE + 1, "");
    expect(validateFile(file)).toBeTruthy();
  });

  it("accepts all allowed file types", () => {
    ALLOWED_FILE_TYPES.forEach((type) => {
      const file = createMockFile("test", 100, type);
      expect(validateFile(file)).toBeNull();
    });
  });
});

describe("formatFileSize", () => {
  it("formats bytes", () => {
    expect(formatFileSize(500)).toBe("500 B");
  });

  it("formats kilobytes", () => {
    expect(formatFileSize(2048)).toBe("2.0 KB");
  });

  it("formats megabytes", () => {
    expect(formatFileSize(1048576)).toBe("1.0 MB");
  });

  it("formats 0 bytes", () => {
    expect(formatFileSize(0)).toBe("0 B");
  });

  it("formats fractional KB", () => {
    expect(formatFileSize(1536)).toBe("1.5 KB");
  });
});

describe("getFilePreviewUrl", () => {
  it("returns blob URL for image files", () => {
    const file = createMockFile("img.png", 100, "image/png");
    expect(getFilePreviewUrl(file)).toBe("blob:mock-url");
  });

  it("returns null for non-image files", () => {
    const file = createMockFile("doc.pdf", 100, "application/pdf");
    expect(getFilePreviewUrl(file)).toBeNull();
  });

  it("returns null for text files", () => {
    const file = createMockFile("readme.txt", 100, "text/plain");
    expect(getFilePreviewUrl(file)).toBeNull();
  });
});
