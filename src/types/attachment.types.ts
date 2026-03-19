export interface AttachmentMetadata {
  width?: number;
  height?: number;
  thumbnail?: string;
}

export interface Attachment {
  id: string;
  filename: string;
  originalName: string;
  path: string;
  type: string;
  size: number;
  uploadedBy: string;
  uploadedAt: string;
  metadata: AttachmentMetadata;
}
