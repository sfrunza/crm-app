import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Switch } from "@/components/ui/switch";
import { TableCell, TableRow } from "@/components/ui/table";
import { MoreHorizontalIcon } from "@/components/icons";
import { useSearchParams } from "react-router";
import { VALUATION_OPTIONS_MAP } from "@/lib/constants";
import type { Valuation } from "@/types/index";

export function ValuationRow({
  item,
  index,
}: {
  item: Valuation;
  index: number;
}) {
  return (
    <TableRow>
      <TableCell className="flex flex-col gap-1">
        <span className="text-base font-semibold text-foreground">
          {VALUATION_OPTIONS_MAP[index + 1]}
        </span>
        <span className="font-medium">{item.name}</span>
      </TableCell>
      <TableCell>
        <Switch checked={item.active} />
      </TableCell>
      <TableCell className="text-right">
        <Actions valuation={item} />
      </TableCell>
    </TableRow>
  );
}

function Actions({ valuation }: { valuation: Valuation }) {
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
              edit_valuation: valuation.id.toString(),
            });
          }}
        >
          Edit valuation
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => {
            setSearchParams({
              delete_valuation: valuation.id.toString(),
            });
          }}
          disabled={valuation.is_default}
          className="flex-col items-start gap-0"
          variant="destructive"
        >
          <span>Delete valuation</span>
          {valuation.is_default && (
            <span className="text-xs">
              Default valuation cannot be deleted.
            </span>
          )}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
