import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  closestCenter,
  DndContext,
  KeyboardSensor,
  PointerSensor,
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
import { TemplateRow } from "./template-row";
import type { EmailTemplate } from "@/types/index";

interface TemplatesTableProps {
  items: EmailTemplate[];
  handleDragEnd: (event: DragEndEvent) => void;
}

export function TemplatesTable({ items, handleDragEnd }: TemplatesTableProps) {
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
            <TableHead>Template name</TableHead>
            <TableHead>Email subject</TableHead>
            {/* <TableHead></TableHead> */}
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <SortableContext items={items}>
          <TableBody>
            {items.map((item) => (
              <TemplateRow key={item.id} id={item.id} item={item} />
            ))}
            {items.length === 0 && (
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
