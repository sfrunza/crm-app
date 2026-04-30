import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  GripVerticalIcon,
  ImageIcon,
  MoreHorizontalIcon,
  Move3DIcon,
  TruckIcon,
} from "@/components/icons";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { TableCell, TableRow } from "@/components/ui/table";
import { useSearchParams } from "react-router";
import type { MoveSize } from "@/types/index";

export function MoveSizeRow({ id, item }: { id: number; item: MoveSize }) {
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
      <TableCell className="">
        {item.image_url ? (
          <img
            src={item.image_url}
            alt={item.name}
            className="h-10 w-10 rounded object-cover"
          />
        ) : (
          <div className="flex h-10 w-10 items-center justify-center rounded bg-muted">
            <ImageIcon className="text-muted-foreground" />
          </div>
        )}
      </TableCell>
      <TableCell className="font-medium text-foreground">{item.name}</TableCell>
      <TableCell>
        <span className="flex items-center gap-2">
          <TruckIcon className="size-4" />
          {item.truck_count}
        </span>
      </TableCell>
      <TableCell>
        <span className="flex items-center gap-2">
          <Move3DIcon className="size-4" />
          {item.totals?.volume ?? 0} cbf
        </span>
      </TableCell>
      <TableCell className="text-right">
        <Actions moveSize={item} />
      </TableCell>
    </TableRow>
  );
}

function Actions({ moveSize }: { moveSize: MoveSize }) {
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
              edit_move_size: moveSize.id.toString(),
            });
          }}
        >
          Edit move size
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => {
            setSearchParams({
              delete_move_size: moveSize.id.toString(),
            });
          }}
          variant="destructive"
        >
          Delete move size
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
