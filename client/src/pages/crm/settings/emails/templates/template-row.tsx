import { Button } from "@/components/ui/button";
import { GripVerticalIcon, MoreHorizontalIcon } from "@/components/icons";
import { useSearchParams } from "react-router";

import { TableCell, TableRow } from "@/components/ui/table";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { LoadingSwap } from "@/components/ui/loading-swap";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { toast } from "sonner";
import type { EmailTemplate } from "@/types/index";
import { useCreateEmailTemplate } from "@/hooks/api/use-email-templates";

export function TemplateRow({ id, item }: { id: number; item: EmailTemplate }) {
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
      <TableCell>{item.subject}</TableCell>
      <TableCell className="text-right">
        <Actions email={item} />
      </TableCell>
    </TableRow>
  );
}

function Actions({ email }: { email: EmailTemplate }) {
  const [_, setSearchParams] = useSearchParams();

  const { mutate: createEmailTemplate, isPending: isCreating } =
    useCreateEmailTemplate({
      onSuccess: () => {
        toast.success("Email duplicated");
      },
    });

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
            setSearchParams((prev) => {
              prev.set("edit_template_id", email.id.toString());
              return prev;
            });
          }}
        >
          Edit email
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => {
            setSearchParams((prev) => {
              prev.set("preview_template_id", email.id.toString());
              return prev;
            });
          }}
        >
          Preview email
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => {
            createEmailTemplate({
              name: `${email.name} Copy`,
              subject: email.subject,
              folder_id: email.folder_id,
              html: email.html,
              design: email.design,
            });
          }}
          disabled={isCreating}
        >
          <LoadingSwap isLoading={isCreating}>Duplicate email</LoadingSwap>
        </DropdownMenuItem>
        <DropdownMenuItem
          variant="destructive"
          onClick={() => {
            setSearchParams((prev) => {
              prev.set("delete_template_id", email.id.toString());
              return prev;
            });
          }}
        >
          Delete email
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
