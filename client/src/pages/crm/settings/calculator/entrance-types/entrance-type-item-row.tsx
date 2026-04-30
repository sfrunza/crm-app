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
import { useSearchParams } from "react-router";
import type { EntranceType } from "@/types/index";

export function EntranceTypeRow({
  id,
  item,
}: {
  id: number;
  item: EntranceType;
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
      <TableCell className="font-medium text-foreground">{item.name}</TableCell>
      <TableCell>{item.form_name}</TableCell>
      <TableCell className="text-right">
        <Actions entranceType={item} />
      </TableCell>
    </TableRow>
  );
}

function Actions({ entranceType }: { entranceType: EntranceType }) {
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
              edit_entrance_type: entranceType.id.toString(),
            });
          }}
        >
          Edit entrance type
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => {
            setSearchParams({
              delete_entrance_type: entranceType.id.toString(),
            });
          }}
          variant="destructive"
        >
          Delete entrance type
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
