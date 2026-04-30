import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Trash2Icon, UploadIcon } from "@/components/icons";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Field, FieldGroup, FieldLabel, FieldSet } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useRef, type ChangeEvent } from "react";
import type { ItemForm } from "./inventory-settings.utils";

type RoomOption = {
  id: number;
  name: string;
};

type ItemDialogProps = {
  mode: "create" | "edit";
  open: boolean;
  item: ItemForm | null;
  roomOptions: RoomOption[];
  imagePreview: string | null;
  isSubmitting: boolean;
  isDeleting?: boolean;
  hasServerImage?: boolean;
  onOpenChange: (open: boolean) => void;
  onItemChange: (updater: (prev: ItemForm) => ItemForm) => void;
  onToggleRoomTag: (roomId: number) => void;
  onImagePreviewChange: (value: string | null) => void;
  onMarkRemoveImage: (value: boolean) => void;
  onCancel: () => void;
  onDelete?: () => void;
  onSave: () => void;
};

export function ItemDialog({
  mode,
  open,
  item,
  roomOptions,
  imagePreview,
  isSubmitting,
  isDeleting = false,
  hasServerImage = false,
  onOpenChange,
  onItemChange,
  onToggleRoomTag,
  onImagePreviewChange,
  onMarkRemoveImage,
  onCancel,
  onDelete,
  onSave,
}: ItemDialogProps) {
  const imageInputRef = useRef<HTMLInputElement>(null);

  function handleImageChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      onItemChange((prev) => ({ ...prev, image: file }));
      onImagePreviewChange(reader.result as string);
      onMarkRemoveImage(false);
    };
    reader.readAsDataURL(file);
  }

  function handleRemoveImage() {
    onItemChange((prev) => ({ ...prev, image: null }));
    onImagePreviewChange(null);
    onMarkRemoveImage(hasServerImage);

    if (imageInputRef.current) {
      imageInputRef.current.value = "";
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="px-0 sm:max-w-lg">
        <DialogHeader className="px-6">
          <DialogTitle>
            {mode === "create" ? "Add Item" : "Edit Item"}
          </DialogTitle>
          <DialogDescription>
            {mode === "create"
              ? "Create an item and link it to one or more rooms."
              : "Update this item and room links."}
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className="max-h-[calc(100vh-14rem)]">
          <div className="px-6">
            {item && (
              <FieldSet>
                <FieldGroup>
                  <Field>
                    <FieldLabel htmlFor="edit-item-name">Item name</FieldLabel>
                    <Input
                      id="edit-item-name"
                      placeholder="Item name"
                      value={item.name}
                      onChange={(event) =>
                        onItemChange((prev) => ({
                          ...prev,
                          name: event.target.value,
                        }))
                      }
                    />
                  </Field>
                  <Field>
                    <FieldLabel htmlFor="edit-item-description">
                      Description
                    </FieldLabel>
                    <Textarea
                      id="edit-item-description"
                      placeholder="Description"
                      value={item.description}
                      onChange={(event) =>
                        onItemChange((prev) => ({
                          ...prev,
                          description: event.target.value,
                        }))
                      }
                    />
                  </Field>
                </FieldGroup>

                <FieldGroup className="grid gap-3 sm:grid-cols-2">
                  <Field>
                    <FieldLabel>Item type</FieldLabel>
                    <Select
                      value={item.item_type}
                      onValueChange={(value) =>
                        onItemChange((prev) => ({
                          ...prev,
                          item_type: value as "furniture" | "box",
                        }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="furniture">Furniture</SelectItem>
                        <SelectItem value="box">Box</SelectItem>
                      </SelectContent>
                    </Select>
                  </Field>

                  <Field className="sm:col-span-2">
                    <FieldLabel>Applies to rooms</FieldLabel>
                    <div className="flex flex-wrap gap-2">
                      {roomOptions.map((room) => {
                        const active = item.room_tag_ids.includes(room.id);
                        return (
                          <Button
                            key={room.id}
                            type="button"
                            variant={active ? "default" : "outline"}
                            size="sm"
                            onClick={() => onToggleRoomTag(room.id)}
                          >
                            {room.name}
                          </Button>
                        );
                      })}
                    </div>
                  </Field>

                  <Field>
                    <FieldLabel htmlFor="edit-item-volume">Volume</FieldLabel>
                    <Input
                      id="edit-item-volume"
                      type="number"
                      min={0}
                      step="0.1"
                      value={item.volume}
                      onChange={(event) =>
                        onItemChange((prev) => ({
                          ...prev,
                          volume: Math.max(0, Number(event.target.value) || 0),
                        }))
                      }
                    />
                  </Field>
                  <Field>
                    <FieldLabel htmlFor="edit-item-weight">Weight</FieldLabel>
                    <Input
                      id="edit-item-weight"
                      type="number"
                      min={0}
                      step="0.1"
                      value={item.weight}
                      onChange={(event) =>
                        onItemChange((prev) => ({
                          ...prev,
                          weight: Math.max(0, Number(event.target.value) || 0),
                        }))
                      }
                    />
                  </Field>
                  <Field className="sm:col-span-2">
                    <div className="flex items-center justify-between">
                      <FieldLabel htmlFor="edit-item-image">
                        Item image
                      </FieldLabel>
                      {imagePreview && (
                        <Button
                          type="button"
                          variant="link"
                          size="sm"
                          className="h-auto p-0"
                          onClick={handleRemoveImage}
                        >
                          <Trash2Icon />
                          Remove
                        </Button>
                      )}
                    </div>
                    <input
                      ref={imageInputRef}
                      id="edit-item-image"
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      className="sr-only"
                      onChange={handleImageChange}
                    />
                    {!imagePreview ? (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="max-w-24"
                        onClick={() => imageInputRef.current?.click()}
                      >
                        <UploadIcon />
                        Upload
                      </Button>
                    ) : (
                      <div className="border-border bg-muted/50 relative mt-2 flex h-20 w-full items-center justify-center rounded-lg border">
                        <img
                          src={imagePreview}
                          alt="Item preview"
                          className="h-full w-full rounded-lg object-contain"
                        />
                      </div>
                    )}
                  </Field>
                </FieldGroup>
              </FieldSet>
            )}
          </div>
          <ScrollBar orientation="vertical" />
        </ScrollArea>
        <DialogFooter className="flex items-center justify-between px-6 sm:justify-between">
          {mode === "edit" && onDelete ? (
            <Button
              type="button"
              variant="destructive"
              onClick={onDelete}
              disabled={isDeleting}
            >
              <Trash2Icon className="mr-1 h-4 w-4" />
              Delete Item
            </Button>
          ) : (
            <span />
          )}
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={onCancel}>
              Cancel
            </Button>
            <Button
              onClick={onSave}
              disabled={isSubmitting || !item?.name.trim()}
            >
              {mode === "create" ? "Create Item" : "Save Item"}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
