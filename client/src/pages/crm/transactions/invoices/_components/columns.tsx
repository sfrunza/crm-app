import { DateCell } from "@/components/data-table/cells/date-cell";
import { TABLE_CONFIG } from "@/components/data-table/table.config";
import { Badge } from "@/components/ui/badge";
import {
  INVOICE_STATUS_BG_COLOR,
  INVOICE_STATUS_TEXT_COLOR,
} from "@/domains/payments/invoice.constants";
import type {
  InvoiceListRow,
  InvoiceStatus,
} from "@/domains/payments/payment.types";
import { cn } from "@/lib/utils";
import type { ColumnDef } from "@tanstack/react-table";
import { useMemo } from "react";

const currency = new Intl.NumberFormat("en-US", TABLE_CONFIG.CURRENCY_FORMAT);

function InvoiceStatusBadge({ status }: { status: InvoiceStatus }) {
  return (
    <Badge
      className={cn(
        "relative overflow-hidden bg-transparent capitalize",
        INVOICE_STATUS_TEXT_COLOR[status]
      )}
    >
      <span
        className={`${INVOICE_STATUS_BG_COLOR[status]} absolute inset-0 opacity-15`}
      />
      {status.charAt(0).toUpperCase() + status.slice(1)}
      <div
        className={cn(
          "ml-1 size-1.5 rounded-full",
          INVOICE_STATUS_BG_COLOR[status]
        )}
      />
    </Badge>
  );
}

export function useInvoiceColumns() {
  return useMemo<ColumnDef<InvoiceListRow>[]>(
    () => [
      {
        accessorKey: "id",
        header: "ID",
        cell: ({ getValue }) => (
          <span className="text-sm font-bold">{String(getValue())}</span>
        ),
        size: 72,
      },
      {
        accessorKey: "username",
        header: "Customer",
        cell: ({ getValue }) => (
          <span className="max-w-[200px] truncate" title={String(getValue())}>
            {getValue() as string}
          </span>
        ),
        enableSorting: false,
      },
      {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => {
          const status = row.original.status;
          return <InvoiceStatusBadge status={status} />;
        },
        enableSorting: false,
      },
      {
        accessorKey: "amount",
        header: "Amount",
        cell: ({ getValue }) => (
          <span>{currency.format((getValue() as number) / 100)}</span>
        ),
        enableSorting: false,
      },
      {
        accessorKey: "request_id",
        header: "Request",
        cell: ({ getValue }) => (
          <span className="font-medium">#{String(getValue())}</span>
        ),
        enableSorting: false,
        size: 88,
      },
      {
        accessorKey: "date",
        header: "Date",
        cell: ({ row }) => <DateCell date={row.original.date} />,
      },
    ],
    []
  );
}
