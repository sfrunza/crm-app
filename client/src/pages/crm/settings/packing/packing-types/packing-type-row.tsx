import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVerticalIcon, MoreHorizontalIcon } from "@/components/icons";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { TableCell, TableRow } from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { useSearchParams } from "react-router";
import { Badge } from "@/components/ui/badge";
import type { PackingType } from "@/types/index";

export function PackingTypeRow({
  id,
  item,
}: {
  id: number;
  item: PackingType;
}) {
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
      ref={item.is_default ? null : setNodeRef}
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
          className={cn("cursor-grab touch-none", {
            invisible: item.is_default,
          })}
          disabled={item.is_default}
          {...attributes}
          {...listeners}
        >
          <GripVerticalIcon className="text-muted-foreground" />
        </Button>
      </TableCell>
      <TableCell className="font-medium text-foreground">{item.name}</TableCell>
      <TableCell>
        {item.is_default && <Badge variant="secondary">Default</Badge>}
      </TableCell>
      <TableCell className="text-right">
        <Actions packingType={item} />
      </TableCell>
    </TableRow>
  );
}

function Actions({ packingType }: { packingType: PackingType }) {
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
              edit_packing_service: packingType.id.toString(),
            });
          }}
        >
          Edit packing service
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => {
            setSearchParams({
              delete_packing_service: packingType.id.toString(),
            });
          }}
          disabled={packingType.is_default}
          className="flex-col items-start gap-0"
          variant="destructive"
        >
          <span>Delete packing service</span>
          {packingType.is_default && (
            <span className="text-xs">
              Default packing service cannot be deleted.
            </span>
          )}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
