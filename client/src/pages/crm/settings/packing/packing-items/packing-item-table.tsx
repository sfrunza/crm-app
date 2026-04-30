import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { PackingItem } from "@/types/index";
import {
  DndContext,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import { restrictToParentElement } from "@dnd-kit/modifiers";
import {
  SortableContext,
  sortableKeyboardCoordinates,
} from "@dnd-kit/sortable";
import { useId } from "react";
import { PackingItemRow } from "./packing-item-row";

interface PackingItemsTableProps {
  packingItems: PackingItem[];
  handleDragEnd: (event: DragEndEvent) => void;
}

export function PackingItemsTable({
  packingItems,
  handleDragEnd,
}: PackingItemsTableProps) {
  const sortableId = useId();
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );
  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
      modifiers={[restrictToParentElement]}
      id={sortableId}
    >
      <Table className="overflow-x-hidden overflow-y-hidden">
        <TableHeader>
          <TableRow>
            <TableHead className="w-12"></TableHead>
            <TableHead>Name</TableHead>
            <TableHead>Price</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <SortableContext items={packingItems}>
          <TableBody>
            {packingItems.map((item) => (
              <PackingItemRow key={item.id} id={item.id} item={item} />
            ))}
            {packingItems.length === 0 && (
              <TableRow>
                <TableCell colSpan={4} className="h-24 text-center">
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </SortableContext>
      </Table>
    </DndContext>
  );
}
