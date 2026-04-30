import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { Valuation } from "@/types/index";
import { ValuationRow } from "./valuation-row";

interface ValuationsTableProps {
  valuations: Valuation[];
}

export function ValuationsTable({ valuations }: ValuationsTableProps) {
  return (
    <Table className="overflow-x-hidden overflow-y-hidden">
      <TableHeader>
        <TableRow>
          <TableHead>Name</TableHead>
          <TableHead>Active</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {valuations.map((item, index) => (
          <ValuationRow key={item.id} item={item} index={index} />
        ))}
        {/* Empty state */}
        {valuations.length === 0 && (
          <TableRow>
            <TableCell colSpan={5} className="h-24 text-center">
              No valuations yet.
            </TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  );
}
