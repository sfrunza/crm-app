import { Button } from "@/components/ui/button";
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
  FieldLabel,
} from "@/components/ui/field";
import { Trash2Icon, UploadIcon } from "@/components/icons";
import type { FieldError as RHFFieldError } from "react-hook-form";
import type { RefObject, ChangeEvent } from "react";

type ImageFieldProps = {
  imagePreview: string | null;
  fileInputRef: RefObject<HTMLInputElement | null>;
  fieldError?: RHFFieldError;
  onImageChange: (e: ChangeEvent<HTMLInputElement>) => void;
  onRemoveImage: () => void;
};

export function ImageField({
  imagePreview,
  fileInputRef,
  fieldError,
  onImageChange,
  onRemoveImage,
}: ImageFieldProps) {
  return (
    <Field data-invalid={!!fieldError}>
      <FieldContent>
        <div className="flex items-center justify-between">
          <FieldLabel htmlFor="image">Image</FieldLabel>
          {imagePreview && (
            <Button
              type="button"
              variant="link"
              size="sm"
              onClick={onRemoveImage}
              className="h-auto p-0"
            >
              <Trash2Icon />
              Remove
            </Button>
          )}
        </div>
        <FieldDescription>Appears on the customer portal.</FieldDescription>
      </FieldContent>
      <input
        ref={fileInputRef}
        id="image"
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="sr-only"
        onChange={onImageChange}
      />
      {!imagePreview ? (
        <Button
          type="button"
          variant="outline"
          className="max-w-24"
          size="sm"
          onClick={() => fileInputRef.current?.click()}
        >
          <UploadIcon />
          Upload
        </Button>
      ) : (
        <div className="relative mt-2">
          <div className="border-border bg-muted/50 relative flex h-20 w-full items-center justify-center rounded-lg border">
            <img
              src={imagePreview}
              alt="Preview"
              className="h-full w-full rounded-lg object-contain"
            />
          </div>
        </div>
      )}
      {fieldError && <FieldError errors={[fieldError]} />}
    </Field>
  );
}
