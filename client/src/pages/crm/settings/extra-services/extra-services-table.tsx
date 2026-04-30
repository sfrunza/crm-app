import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
import * as React from "react";
import { ExtraServiceRow } from "./extra-service-row";
import type { ExtraService } from "@/types/index";

interface ExtraServicesTableProps {
  extraServices: ExtraService[];
  handleDragEnd: (event: DragEndEvent) => void;
}

export function ExtraServicesTable({
  extraServices,
  handleDragEnd,
}: ExtraServicesTableProps) {
  const sortableId = React.useId();
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
            <TableHead>Active</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <SortableContext items={extraServices}>
          <TableBody>
            {extraServices.map((item) => (
              <ExtraServiceRow key={item.id} id={item.id} item={item} />
            ))}
            {/* Empty state */}
            {extraServices.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center">
                  No extra services yet.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </SortableContext>
      </Table>
    </DndContext>
  );
}
