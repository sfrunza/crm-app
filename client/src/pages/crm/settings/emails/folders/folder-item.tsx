import type { CSSProperties } from "react";

import { GripVerticalIcon, Trash2Icon } from "@/components/icons";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { LoadingSwap } from "@/components/ui/loading-swap";
import { useDeleteFolder } from "@/hooks/api/use-folders";
import { cn } from "@/lib/utils";
import type { Folder } from "@/types/index";
import { toast } from "sonner";

export function FolderItem({
  id,
  item,
  onInputChange,
}: {
  id: number;
  item: Folder;
  onInputChange: (itemId: number, value: Partial<Folder>) => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: id });

  const style: CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 1000 : "auto",
    position: isDragging ? "relative" : "static",
  };

  const { mutate: deleteFolderMutation, isPending } = useDeleteFolder({
    onSuccess: () => {
      toast.success("Folder deleted");
    },
  });

  return (
    <div
      ref={!item.is_default ? setNodeRef : null}
      style={style}
      className={cn(
        "grid grid-cols-[max-content_1fr_max-content] items-center gap-2",
        {
          "bg-background": isDragging,
        }
      )}
    >
      <Button
        size="icon"
        variant="ghost"
        className={cn("cursor-grab touch-none", {
          invisible: item.is_default,
        })}
        disabled={item.is_default}
        {...attributes}
        {...listeners}
      >
        <GripVerticalIcon className={item.is_default ? "hidden" : ""} />
      </Button>
      <Input
        readOnly={item.is_default}
        name={item.name}
        value={item.name}
        onChange={(e) => {
          onInputChange(item.id, { name: e.target.value });
        }}
        disabled={isPending}
      />
      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button
            size="icon"
            variant="ghost"
            className={cn("hover:text-destructive", {
              invisible: item.is_default,
            })}
          >
            <Trash2Icon />
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete folder?</AlertDialogTitle>
            <AlertDialogDescription>
              This will delete <strong>{item.name}.</strong>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <Button
              type="button"
              disabled={isPending}
              variant="destructive"
              onClick={() => {
                deleteFolderMutation({ id: item.id });
              }}
            >
              <LoadingSwap isLoading={isPending}>Delete</LoadingSwap>
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
