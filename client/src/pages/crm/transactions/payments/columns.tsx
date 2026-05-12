import { DateCell } from "@/components/data-table/cells/date-cell"
import { TABLE_CONFIG } from "@/components/data-table/table.config"
import { Badge } from "@/components/ui/badge"
import {
  PAYMENT_STATUS_BG_COLOR,
  PAYMENT_STATUS_TEXT_COLOR,
} from "@/domains/payments/payment.constants"
import type {
  PaymentListRow,
  PaymentStatus,
} from "@/domains/payments/payment.types"
import { PAYMENT_TYPE_LABELS } from "@/lib/constants"
import { cn } from "@/lib/utils"
import type { ColumnDef } from "@tanstack/react-table"
import { useMemo } from "react"

const currency = new Intl.NumberFormat("en-US", TABLE_CONFIG.CURRENCY_FORMAT)

function PaymentStatusBadge({ status }: { status: PaymentStatus }) {
  const label =
    status.charAt(0).toUpperCase() + status.slice(1).replace(/_/g, " ")
  return (
    <Badge
      className={cn(
        "relative overflow-hidden bg-transparent capitalize",
        PAYMENT_STATUS_TEXT_COLOR[status]
      )}
    >
      <span
        className={`${PAYMENT_STATUS_BG_COLOR[status]} absolute inset-0 opacity-15`}
      />
      {label}
      <div
        className={cn(
          "ml-1 size-1.5 rounded-full",
          PAYMENT_STATUS_BG_COLOR[status]
        )}
      />
    </Badge>
  )
}

export function usePaymentColumns() {
  return useMemo<ColumnDef<PaymentListRow>[]>(
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
        accessorKey: "payment_type",
        header: "Type",
        cell: ({ row }) => {
          const key = row.original.payment_type
          return (
            <span className="capitalize">
              {PAYMENT_TYPE_LABELS[key] ?? key.replace(/_/g, " ")}
            </span>
          )
        },
        enableSorting: false,
      },
      {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => <PaymentStatusBadge status={row.original.status} />,
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
  )
}
