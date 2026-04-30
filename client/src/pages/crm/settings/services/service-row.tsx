import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVerticalIcon, MoreHorizontalIcon } from "@/components/icons";

import { Badge } from "@/components/ui/badge";
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
import type { Service } from "@/types/index";

export function ServiceRow({ id, item }: { id: number; item: Service }) {
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
      <TableCell>
        {item.is_default && <Badge variant="secondary">Default</Badge>}
      </TableCell>
      <TableCell>
        <Switch checked={item.active} />
      </TableCell>
      <TableCell className="text-right">
        <Actions service={item} />
      </TableCell>
    </TableRow>
  );
}

function Actions({ service }: { service: Service }) {
  const [_, setSearchParams] = useSearchParams();
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          className="h-7 data-[state=open]:bg-muted"
        >
          <MoreHorizontalIcon />
          <span className="sr-only">Open menu</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem
          onClick={() => {
            setSearchParams({
              edit_service: service.id.toString(),
            });
          }}
        >
          Edit service
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => {
            setSearchParams({
              delete_service: service.id.toString(),
            });
          }}
          disabled={service.is_default}
          className="flex-col items-start gap-0"
          variant="destructive"
        >
          <span>Delete service</span>
          {service.is_default && (
            <span className="text-xs">Default service cannot be deleted.</span>
          )}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
