import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  GripVerticalIcon,
  MoreHorizontalIcon,
  TruckIcon,
} from "@/components/icons";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Switch } from "@/components/ui/switch";
import { TableCell, TableRow } from "@/components/ui/table";
import type { Truck } from "@/types/index";
import { useSearchParams } from "react-router";

export function TruckRow({ id, item }: { id: number; item: Truck }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: id });

  return (
    <TableRow
      ref={setNodeRef}
      data-dragging={isDragging}
      className="data-[dragging=true]:bg-muted data-[dragging=true]:shadow-lg"
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
        zIndex: isDragging ? 1000 : "auto",
        position: isDragging ? "relative" : "static",
      }}
    >
      <TableCell className="w-12">
        <Button
          size="icon"
          variant="ghost"
          className="cursor-grab touch-none"
          {...attributes}
          {...listeners}
        >
          <GripVerticalIcon className="text-muted-foreground" />
        </Button>
      </TableCell>
      <TableCell className="font-medium text-foreground">
        <span className="flex items-center gap-2">
          <TruckIcon className="size-4 shrink-0" aria-hidden="true" />
          {item.name}
        </span>
      </TableCell>
      <TableCell>
        <Switch checked={item.active} aria-readonly={true} />
      </TableCell>
      <TableCell className="text-right">
        <Actions truck={item} />
      </TableCell>
    </TableRow>
  );
}

function Actions({ truck }: { truck: Truck }) {
  const [_, setSearchParams] = useSearchParams();
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="icon" className="h-7">
          <span className="sr-only">Open menu</span>
          <MoreHorizontalIcon />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem
          onClick={() => {
            setSearchParams({
              edit_truck: truck.id.toString(),
            });
          }}
        >
          Edit truck
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
