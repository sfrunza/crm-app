import { Trash2 } from "lucide-react";
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
import { useRef, type ChangeEvent } from "react";

type RoomDraft = {
  name: string;
  image: File | null;
  imagePreview: string | null;
};

type RoomDialogProps = {
  open: boolean;
  mode: "create" | "edit";
  draft: RoomDraft;
  editingRoomId: number | null;
  isCreatingRoom: boolean;
  isUpdatingRoom: boolean;
  isDeletingRoom: boolean;
  onOpenChange: (open: boolean) => void;
  onDraftChange: (updater: (prev: RoomDraft) => RoomDraft) => void;
  onSave: () => void;
  onDelete: () => void;
  onCancel: () => void;
};

export function RoomDialog({
  open,
  mode,
  draft,
  editingRoomId,
  isCreatingRoom,
  isUpdatingRoom,
  isDeletingRoom,
  onOpenChange,
  onDraftChange,
  onSave,
  onDelete,
  onCancel,
}: RoomDialogProps) {
  const roomImageInputRef = useRef<HTMLInputElement>(null);

  function handleRoomImageChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      onDraftChange((prev) => ({
        ...prev,
        image: file,
        imagePreview: reader.result as string,
      }));
    };
    reader.readAsDataURL(file);
  }

  function handleRemoveRoomImage() {
    onDraftChange((prev) => ({
      ...prev,
      image: null,
      imagePreview: null,
    }));

    if (roomImageInputRef.current) {
      roomImageInputRef.current.value = "";
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {mode === "create" ? "Add Room" : "Edit Room"}
          </DialogTitle>
          <DialogDescription>
            {mode === "create"
              ? "Create a reusable room for inventory templates."
              : "Update this room. Deleting the room removes room-to-item links."}
          </DialogDescription>
        </DialogHeader>
        <FieldSet>
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="room-name-dialog">Room name</FieldLabel>
              <Input
                id="room-name-dialog"
                placeholder="Living Room"
                value={draft.name}
                onChange={(event) =>
                  onDraftChange((prev) => ({
                    ...prev,
                    name: event.target.value,
                  }))
                }
              />
            </Field>
            <Field>
              <div className="flex items-center justify-between">
                <FieldLabel htmlFor="room-image-dialog">Room image</FieldLabel>
                {draft.imagePreview && (
                  <Button
                    type="button"
                    variant="link"
                    size="sm"
                    className="h-auto p-0"
                    onClick={handleRemoveRoomImage}
                  >
                    <Trash2Icon />
                    Remove
                  </Button>
                )}
              </div>
              <input
                ref={roomImageInputRef}
                id="room-image-dialog"
                type="file"
                accept="image/jpeg,image/png,image/webp"
                className="sr-only"
                onChange={handleRoomImageChange}
              />
              {!draft.imagePreview ? (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="max-w-24"
                  onClick={() => roomImageInputRef.current?.click()}
                >
                  <UploadIcon />
                  Upload
                </Button>
              ) : (
                <div className="border-border bg-muted/50 relative mt-2 flex h-20 w-full items-center justify-center rounded-lg border">
                  <img
                    src={draft.imagePreview}
                    alt="Room preview"
                    className="h-full w-full rounded-lg object-contain"
                  />
                </div>
              )}
            </Field>
          </FieldGroup>
        </FieldSet>
        <DialogFooter className="flex items-center justify-between sm:justify-between">
          {mode === "edit" && editingRoomId ? (
            <Button
              type="button"
              variant="destructive"
              onClick={onDelete}
              disabled={isDeletingRoom}
            >
              <Trash2 className="mr-1 h-4 w-4" />
              Delete Room
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
              disabled={
                !draft.name.trim() ||
                isCreatingRoom ||
                (mode === "edit" && isUpdatingRoom)
              }
            >
              {mode === "create" ? "Create Room" : "Save Room"}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
