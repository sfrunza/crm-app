import { Button } from "@/components/ui/button";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { LoadingSwap } from "@/components/ui/loading-swap";
import { Progress } from "@/components/ui/progress";
import { api } from "@/lib/axios";
import { cn } from "@/lib/utils";
import { ImagePlusIcon, XCircleIcon } from "@/components/icons";
import React, { useCallback, useState } from "react";
import { toast } from "sonner";
import { queryClient } from "@/lib/query-client";
import { requestKeys } from "@/domains/requests/request.keys";

const MAX_FILE_SIZE_MB = 10;
const MAX_FILES = 10;
const BATCH_SIZE = 3;
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/gif", "image/webp"];

interface FileUploadProps {
  requestId: number;
  disabled?: boolean;
}

const FileUpload: React.FC<FileUploadProps> = ({
  requestId,
  disabled = false,
}) => {
  const [files, setFiles] = useState<File[]>([]);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isDragOver, setIsDragOver] = useState<boolean>(false);

  const remaining = MAX_FILES - files.length;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files;
    if (!selected) return;

    const validFiles: File[] = [];
    const errors: string[] = [];

    Array.from(selected).forEach((file) => {
      if (!ALLOWED_TYPES.includes(file.type)) {
        errors.push(`${file.name}: unsupported file type (${file.type})`);
      } else if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
        errors.push(`${file.name}: exceeds 10MB size limit`);
      } else {
        validFiles.push(file);
      }
    });

    if (errors.length) {
      toast.error("Upload failed:\n" + errors.join("\n"));
      return;
    }

    if (files.length + validFiles.length > MAX_FILES) {
      toast.error(`You can select up to ${MAX_FILES} images at once.`);
      return;
    }

    setFiles((prev) => [...prev, ...validFiles]);
  };

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragOver(false);

      const droppedFiles = Array.from(e.dataTransfer.files);

      const validFiles: File[] = [];
      const errors: string[] = [];

      droppedFiles.forEach((file) => {
        if (!ALLOWED_TYPES.includes(file.type)) {
          errors.push(`${file.name}: unsupported file type (${file.type})`);
        } else if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
          errors.push(`${file.name}: exceeds 10MB size limit`);
        } else {
          validFiles.push(file);
        }
      });

      if (errors.length) {
        toast.error("Upload failed:\n" + errors.join("\n"));
        return;
      }

      if (files.length + validFiles.length > MAX_FILES) {
        toast.error(`You can select up to ${MAX_FILES} images at once.`);
        return;
      }

      if (validFiles.length > 0) {
        setFiles((prev) => [...prev, ...validFiles]);
      }
    },
    [files.length]
  );

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleFileUpload = async () => {
    if (files.length < 1) return;

    const batches: File[][] = [];
    for (let i = 0; i < files.length; i += BATCH_SIZE) {
      batches.push(files.slice(i, i + BATCH_SIZE));
    }

    setIsUploading(true);
    setUploadProgress(0);

    let failed = 0;

    for (let i = 0; i < batches.length; i++) {
      const batch = batches[i];
      const formData = new FormData();
      batch.forEach((file) => formData.append("images[]", file));

      const batchBase = (i / batches.length) * 100;
      const batchWeight = (1 / batches.length) * 100;

      try {
        await api.post(`requests/${requestId}/images`, formData, {
          headers: { "Content-Type": "multipart/form-data" },
          onUploadProgress: (e) => {
            if (e.total) {
              const batchPct = (e.loaded / e.total) * batchWeight;
              setUploadProgress(Math.round(batchBase + batchPct));
            }
          },
        });

        queryClient.invalidateQueries({
          queryKey: requestKeys.detail(requestId),
        });
      } catch {
        failed += batch.length;
      }
    }

    if (failed > 0) {
      toast.error(
        `Failed to upload ${failed} ${failed === 1 ? "image" : "images"}.`
      );
    }

    setFiles([]);
    setIsUploading(false);
    setUploadProgress(0);
  };

  const UploadArea = ({ className }: { className?: string }) => (
    // <div
    //   className={cn(
    //     "relative",
    //     // 'relative cursor-pointer rounded-lg border-2 border-dashed text-center transition-colors',
    //     isDragOver
    //       ? "border-primary bg-primary/5"
    //       : "border-muted-foreground/25 hover:border-primary/50",
    //     (isUploading || disabled || remaining <= 0) &&
    //       "cursor-not-allowed opacity-50",
    //     className
    //   )}
    //   onDragOver={handleDragOver}
    //   onDragLeave={handleDragLeave}
    //   onDrop={handleDrop}
    // >
    <Empty
      className={cn(
        "relative rounded-lg border p-6 text-center transition-colors",
        {
          "cursor-not-allowed opacity-50":
            isUploading || remaining <= 0 || disabled,
          "border-primary bg-primary/2": isDragOver && !disabled,
          "hover:border-primary/50 hover:bg-primary/2":
            !isDragOver && !disabled,
        },
        className
      )}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <input
        disabled={isUploading || disabled || remaining <= 0}
        type="file"
        multiple
        accept="image/jpeg, image/png, image/gif, image/webp"
        onChange={handleFileChange}
        className={cn(
          "absolute inset-0 h-full w-full cursor-pointer opacity-0",
          {
            "cursor-not-allowed": isUploading || disabled || remaining <= 0,
          }
        )}
      />
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <ImagePlusIcon />
        </EmptyMedia>
        <EmptyTitle>
          {files.length === 0 ? "Upload images" : "Add more images"}
        </EmptyTitle>
        <EmptyDescription>
          {remaining > 0
            ? `You can add ${remaining} more ${remaining === 1 ? "image" : "images"}.`
            : `Maximum of ${MAX_FILES} images reached.`}
        </EmptyDescription>
      </EmptyHeader>
    </Empty>
    // </div>
  );

  return (
    <div className="space-y-6">
      <UploadArea />

      {files.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-medium text-muted-foreground">
              {files.length} {files.length === 1 ? "file" : "files"} selected
            </h4>
            <Button variant="outline" size="sm" onClick={() => setFiles([])}>
              Clear all
            </Button>
          </div>

          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
            {files.map((file, index) => (
              <ImagePreview
                key={index}
                url={URL.createObjectURL(file)}
                onRemove={() => removeFile(index)}
                isUploading={isUploading}
              />
            ))}
          </div>

          {isUploading && (
            <div className="space-y-1.5">
              <Progress value={uploadProgress} className="h-2" />
              <p className="text-center text-xs text-muted-foreground tabular-nums">
                Uploading… {uploadProgress}%
              </p>
            </div>
          )}

          <div className="flex justify-end">
            <Button disabled={isUploading} onClick={handleFileUpload}>
              <LoadingSwap isLoading={isUploading}>
                Upload {files.length} {files.length === 1 ? "image" : "images"}
              </LoadingSwap>
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

const ImagePreview = ({
  url,
  onRemove,
  onClick,
  className,
  isUploading = false,
  isDeleting = false,
}: {
  url: string;
  onRemove: () => void;
  onClick?: () => void;
  className?: string;
  isUploading?: boolean;
  isDeleting?: boolean;
}) => (
  <div
    className={cn(
      "relative aspect-video rounded-md border bg-background",
      className
    )}
    onClick={onClick}
  >
    {!isUploading && !isDeleting && (
      <button
        className="absolute top-0 right-0 z-10 translate-x-1/2 -translate-y-1/2"
        onClick={(e) => {
          e.stopPropagation();
          onRemove();
        }}
      >
        <XCircleIcon className="h-5 w-5 fill-primary text-primary-foreground" />
      </button>
    )}
    <img
      src={url}
      height={200}
      width={200}
      alt=""
      className="h-full w-full rounded-md object-contain"
    />
    {(isUploading || isDeleting) && (
      <div className="absolute inset-0 flex items-center justify-center rounded-md bg-black/40">
        <div className="size-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
      </div>
    )}
  </div>
);

export { FileUpload, ImagePreview };
