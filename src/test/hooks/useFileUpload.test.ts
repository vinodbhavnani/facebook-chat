import { describe, it, expect, vi } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useFileUpload } from "@/hooks/useFileUpload";

vi.stubGlobal("URL", { createObjectURL: vi.fn(() => "blob:x"), revokeObjectURL: vi.fn() });

function createMockFile(name: string, size: number, type: string): File {
  return new File([new ArrayBuffer(size)], name, { type });
}

describe("useFileUpload", () => {
  it("starts with empty files", () => {
    const { result } = renderHook(() => useFileUpload());
    expect(result.current.files).toEqual([]);
    expect(result.current.error).toBeNull();
  });

  it("adds valid files", () => {
    const { result } = renderHook(() => useFileUpload());
    act(() => { result.current.addFiles([createMockFile("a.jpg", 100, "image/jpeg")]); });
    expect(result.current.files.length).toBe(1);
    expect(result.current.error).toBeNull();
  });

  it("rejects invalid files and sets error", () => {
    const { result } = renderHook(() => useFileUpload());
    act(() => { result.current.addFiles([createMockFile("a.exe", 100, "application/exe")]); });
    expect(result.current.files.length).toBe(0);
    expect(result.current.error).toBeTruthy();
  });

  it("removes file by index", () => {
    const { result } = renderHook(() => useFileUpload());
    act(() => { result.current.addFiles([
      createMockFile("a.jpg", 100, "image/jpeg"),
      createMockFile("b.jpg", 100, "image/jpeg"),
    ]); });
    act(() => { result.current.removeFile(0); });
    expect(result.current.files.length).toBe(1);
    expect(result.current.files[0].name).toBe("b.jpg");
  });

  it("clears all files", () => {
    const { result } = renderHook(() => useFileUpload());
    act(() => { result.current.addFiles([createMockFile("a.jpg", 100, "image/jpeg")]); });
    act(() => { result.current.clearFiles(); });
    expect(result.current.files.length).toBe(0);
    expect(result.current.error).toBeNull();
  });

  it("generates previews for image files", () => {
    const { result } = renderHook(() => useFileUpload());
    act(() => { result.current.addFiles([createMockFile("a.jpg", 100, "image/jpeg")]); });
    expect(result.current.previews[0].url).toBe("blob:x");
  });

  it("generates null preview for non-image files", () => {
    const { result } = renderHook(() => useFileUpload());
    act(() => { result.current.addFiles([createMockFile("a.pdf", 100, "application/pdf")]); });
    expect(result.current.previews[0].url).toBeNull();
  });
});
