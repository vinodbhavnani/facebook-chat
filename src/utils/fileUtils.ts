import { MAX_FILE_SIZE, ALLOWED_FILE_TYPES } from "@/data/mockData";

export const validateFile = (file: File): string | null => {
  if (file.size > MAX_FILE_SIZE) {
    return `File "${file.name}" exceeds 5MB limit`;
  }
  if (!ALLOWED_FILE_TYPES.includes(file.type)) {
    return `File type "${file.type}" is not supported`;
  }
  return null;
};

export const formatFileSize = (bytes: number): string => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

export const getFilePreviewUrl = (file: File): string | null => {
  if (file.type.startsWith("image/")) {
    return URL.createObjectURL(file);
  }
  return null;
};
