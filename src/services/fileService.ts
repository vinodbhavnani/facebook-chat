import { Attachment } from "@/types/attachment.types";
import { validateFile } from "@/utils/fileUtils";

/** Service for file upload operations */
export const fileService = {
  validate: (file: File): string | null => {
    return validateFile(file);
  },

  createAttachment: (file: File, uploadedBy: string): Attachment => {
    return {
      id: `att_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      filename: file.name,
      originalName: file.name,
      path: URL.createObjectURL(file),
      type: file.type,
      size: file.size,
      uploadedBy,
      uploadedAt: new Date().toISOString(),
      metadata: {},
    };
  },

  revokeUrl: (path: string) => {
    URL.revokeObjectURL(path);
  },
};
