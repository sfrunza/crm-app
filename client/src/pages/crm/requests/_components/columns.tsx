import { AddressCell } from "@/components/data-table/cells/address-cell";
import { DateCell } from "@/components/data-table/cells/date-cell";
import { PriceCell } from "@/components/data-table/cells/price-cell";
import { StatusCell } from "@/components/data-table/cells/status-cell";
import {
  storageIcons,
  type StorageIconKey,
} from "@/domains/requests/request.constants";
import type { TableRequest } from "@/domains/requests/request.types";
import { formatPhone } from "@/lib/format-phone";
import type { ColumnDef } from "@tanstack/react-table";
import { useMemo } from "react";

export function useColumns() {
  return useMemo<ColumnDef<TableRequest>[]>(
    () => [
      {
        accessorKey: "id",
        header: "ID",
        cell: ({ getValue }) => (
          <span className="text-sm font-bold">{getValue() as string}</span>
        ),
        size: 60,
      },
      {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => <StatusCell status={row.original.status} />,
        enableSorting: false,
      },
      {
        accessorKey: "service.name",
        header: "Service type",
        enableSorting: false,
        cell: ({ getValue }) => (
          <span
          // className="wrap-break-words leading-normal whitespace-normal"
          >
            {getValue() as string}
          </span>
        ),
      },
      {
        accessorKey: "moving_date",
        header: "Move date",
        cell: ({ row }) => (
          <DateCell date={row.original.moving_date} showRelative />
        ),
      },
      {
        accessorKey: "customer",
        header: "Customer, phone",
        cell: ({ row }) => (
          <span>
            {row.original.customer?.first_name}{" "}
            {row.original.customer?.last_name}
            <br />
            {formatPhone(row.original.customer?.phone)}
          </span>
        ),
        enableSorting: false,
        // size: 130,
        width: "auto",
      },
      {
        accessorKey: "origin",
        header: "Moving from",
        cell: ({ row }) => {
          const withStorage =
            row.original.service.name === "Moving with Storage" ||
            row.original.service.name === "Overnight Truck Storage";
          const isMovingFromStorage = row.original.is_moving_from_storage;
          const hasPairedRequest = row.original.has_paired_request;
          const showStorageOrigin =
            withStorage && isMovingFromStorage && hasPairedRequest;
          if (showStorageOrigin) {
            return (
              <div className="flex items-center gap-2">
                <img
                  src={
                    storageIcons[row.original.service.name as StorageIconKey]
                  }
                  className="size-6"
                />
                From storage
              </div>
            );
          }
          return <AddressCell address={row.original.origin} />;
        },
        enableSorting: false,
      },
      {
        accessorKey: "destination",
        header: "Moving to",
        cell: ({ row }) => {
          const withStorage =
            row.original.service.name === "Moving with Storage" ||
            row.original.service.name === "Overnight Truck Storage";
          const isMovingFromStorage = row.original.is_moving_from_storage;
          const hasPairedRequest = row.original.has_paired_request;
          const showStorageDestination =
            withStorage && !isMovingFromStorage && hasPairedRequest;
          if (showStorageDestination) {
            return (
              <div className="flex items-center gap-2">
                <img
                  src={
                    storageIcons[row.original.service.name as StorageIconKey]
                  }
                  className="size-6"
                />
                To storage
              </div>
            );
          }
          return <AddressCell address={row.original.destination} />;
        },
        enableSorting: false,
      },
      {
        accessorKey: "move_size.name",
        header: "Move size",
        enableSorting: false,
        // size: 140,
        cell: ({ getValue }) => <span>{getValue() as string}</span>,
      },
      {
        accessorKey: "crew_size",
        header: "Crew",
        enableSorting: false,
        size: 80,
      },
      {
        accessorKey: "created_at",
        header: "Created at",
        cell: ({ row }) => <DateCell date={row.original.created_at} />,
        size: 120,
      },
      {
        accessorKey: "updated_at",
        header: "Updated at",
        cell: ({ row }) => <DateCell date={row.original.updated_at} />,
        size: 120,
      },
      {
        accessorKey: "booked_at",
        header: "Booked at",
        cell: ({ row }) => <DateCell date={row.original.booked_at} />,
        size: 120,
      },
      {
        accessorKey: "grand_total",
        header: "Est. Quote",
        cell: ({ row }) => <PriceCell price={row.original.grand_total} />,
        enableSorting: false,
      },
    ],
    []
  );
}
