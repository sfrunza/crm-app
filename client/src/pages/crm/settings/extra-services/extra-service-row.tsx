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
import { Switch } from "@/components/ui/switch";
import { TableCell, TableRow } from "@/components/ui/table";
import { useSearchParams } from "react-router";
import type { ExtraService } from "@/types/index";

export function ExtraServiceRow({
  id,
  item,
}: {
  id: number;
  item: ExtraService;
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
      <TableCell>${(item.price / 100).toFixed(2)}</TableCell>
      <TableCell>
        <Switch checked={item.active} />
      </TableCell>
      <TableCell className="text-right">
        <Actions extraService={item} />
      </TableCell>
    </TableRow>
  );
}

function Actions({ extraService }: { extraService: ExtraService }) {
  const [_, setSearchParams] = useSearchParams();
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          className="h-7 data-[state=open]:bg-muted"
        >
          <span className="sr-only">Open menu</span>
          <MoreHorizontalIcon />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem
          onClick={() => {
            setSearchParams({
              edit_extra_service: extraService.id.toString(),
            });
          }}
        >
          Edit extra service
        </DropdownMenuItem>
        <DropdownMenuItem
          variant="destructive"
          onClick={() => {
            setSearchParams({
              delete_extra_service: extraService.id.toString(),
            });
          }}
        >
          Delete extra service
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
