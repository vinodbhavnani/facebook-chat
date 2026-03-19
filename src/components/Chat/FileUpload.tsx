import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { Paperclip, X, Image, FileText } from "lucide-react";
import { validateFile, formatFileSize, getFilePreviewUrl } from "@/utils/fileUtils";

interface FileUploadProps {
  files: File[];
  onFilesChange: (files: File[]) => void;
}

const FileUpload = ({ files, onFilesChange }: FileUploadProps) => {
  const [error, setError] = useState<string | null>(null);

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      setError(null);
      const validFiles: File[] = [];
      for (const file of acceptedFiles) {
        const err = validateFile(file);
        if (err) {
          setError(err);
          return;
        }
        validFiles.push(file);
      }
      onFilesChange([...files, ...validFiles]);
    },
    [files, onFilesChange]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    noClick: true,
    noKeyboard: true,
  });

  const removeFile = (index: number) => {
    onFilesChange(files.filter((_, i) => i !== index));
  };

  return (
    <div {...getRootProps()}>
      <input {...getInputProps()} />

      {isDragActive && (
        <div className="absolute inset-0 bg-primary/10 border-2 border-dashed border-primary rounded-xl flex items-center justify-center z-10">
          <p className="text-primary font-medium">Drop files here</p>
        </div>
      )}

      {error && (
        <p className="text-xs text-destructive px-1 mb-1">{error}</p>
      )}

      {files.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-2">
          {files.map((file, i) => {
            const previewUrl = getFilePreviewUrl(file);
            return (
              <div
                key={i}
                className="relative group rounded-lg border border-border overflow-hidden bg-muted"
              >
                {previewUrl ? (
                  <img
                    src={previewUrl}
                    alt={file.name}
                    className="h-20 w-20 object-cover"
                  />
                ) : (
                  <div className="h-20 w-20 flex flex-col items-center justify-center gap-1 px-1">
                    <FileText className="h-6 w-6 text-muted-foreground" />
                    <span className="text-[10px] text-muted-foreground truncate w-full text-center">
                      {file.name}
                    </span>
                  </div>
                )}
                <div className="absolute bottom-0 left-0 right-0 bg-foreground/60 text-background text-[10px] px-1 py-0.5 truncate">
                  {formatFileSize(file.size)}
                </div>
                <button
                  type="button"
                  onClick={() => removeFile(i)}
                  className="absolute top-0.5 right-0.5 h-5 w-5 bg-foreground/70 text-background rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default FileUpload;
