import { useState, useCallback } from "react";
import { validateFile, getFilePreviewUrl } from "@/utils/fileUtils";

export const useFileUpload = () => {
  const [files, setFiles] = useState<File[]>([]);
  const [error, setError] = useState<string | null>(null);

  const addFiles = useCallback((newFiles: File[]) => {
    setError(null);
    for (const file of newFiles) {
      const err = validateFile(file);
      if (err) {
        setError(err);
        return;
      }
    }
    setFiles((prev) => [...prev, ...newFiles]);
  }, []);

  const removeFile = useCallback((index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const clearFiles = useCallback(() => {
    setFiles([]);
    setError(null);
  }, []);

  const previews = files.map((f) => ({
    file: f,
    url: getFilePreviewUrl(f),
  }));

  return { files, error, previews, addFiles, removeFile, clearFiles, setFiles };
};
