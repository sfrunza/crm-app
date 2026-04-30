import { useUpdateFolder } from "@/hooks/api/use-folders";
import type { Folder } from "@/types/index";
import {
  DndContext,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { restrictToParentElement } from "@dnd-kit/modifiers";
import {
  SortableContext,
  arrayMove,
  sortableKeyboardCoordinates,
} from "@dnd-kit/sortable";
import { useCallback } from "react";
import { toast } from "sonner";
import { debounce } from "throttle-debounce";
import { FolderItem } from "./folder-item";

interface FoldersListProps {
  items: Folder[];
  setItems: (items: Folder[]) => void;
}

export function FoldersList({ items, setItems }: FoldersListProps) {
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const { mutate: updateFolderMutation } = useUpdateFolder({
    onSuccess: () => {
      toast.success("Folder updated");
    },
  });

  const debouncedUpdateFolder = useCallback(
    debounce(
      1000,
      (itemId: number, values: Partial<Folder>) => {
        updateFolderMutation({ id: itemId, data: values });
      },
      { atBegin: false }
    ),
    [updateFolderMutation]
  );

  function onDragEnd(event: any) {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = items.findIndex((item) => item.id === active.id);
      const newIndex = items.findIndex((item) => item.id === over.id);
      const newItems = arrayMove(items, oldIndex, newIndex);
      const updatedItems = newItems.map((item, i) => ({
        ...item,
        position: i,
      }));

      setItems(updatedItems);
      const activeItem = newItems.find((item) => item.position === oldIndex);

      if (activeItem) {
        updateFolderMutation({
          id: activeItem.id,
          data: {
            position: newIndex,
          },
        });
      }
    }
  }

  function onInputChange(itemId: number, values: Partial<Folder>) {
    setItems(
      items.map((item) => (item.id === itemId ? { ...item, ...values } : item))
    );

    debouncedUpdateFolder(itemId, values);
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={onDragEnd}
      modifiers={[restrictToParentElement]}
    >
      <SortableContext items={items}>
        {items.map((item) => (
          <FolderItem
            key={item.id}
            id={item.id}
            item={item}
            onInputChange={onInputChange}
          />
        ))}
      </SortableContext>
    </DndContext>
  );
}
