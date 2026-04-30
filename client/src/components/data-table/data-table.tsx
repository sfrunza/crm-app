import {
  type ColumnDef,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  type Row,
  type SortingState,
  useReactTable,
} from "@tanstack/react-table";

import { Button } from "@/components/ui/button";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { queryClient } from "@/lib/query-client";
import { cn } from "@/lib/utils";
import { type SortOrder } from "@/stores/use-table-requests-store";
import { useCallback, useMemo, useState } from "react";
import { useSearchParams } from "react-router";
import { TABLE_CONFIG } from "./table.config";
import { requestKeys } from "@/domains/requests/request.keys";
import { getRequestById } from "@/domains/requests/request.api";
import { openRequest } from "@/stores/use-open-requests-store";
// import { DataTablePagination } from "./data-table-pagination";

interface DataTableProps<T extends { id: number }> {
  className?: string;
  columns: ColumnDef<T>[];
  data: T[];
  totalCount: number;
  isFetching: boolean;
  page: number;
  pageSize: number;
  sortBy?: string;
  sortOrder?: SortOrder;
  setPage: (page: number) => void;
  setSort?: (field: string, order: SortOrder) => void;
  /** Used when sorting is cleared (e.g. third header click). Defaults to id/desc. */
  defaultSortField?: string;
  defaultSortOrder?: SortOrder;
  onRowClick?: (row: T) => void;
}

function getPaginationRangeText(
  pageIndex: number,
  pageSize: number,
  totalCount: number
): React.ReactNode {
  if (totalCount === 0) {
    return <p className="text-sm text-muted-foreground">No results</p>;
  }

  const start = pageIndex * pageSize + 1;
  const end = Math.min((pageIndex + 1) * pageSize, totalCount);

  return (
    <p className="text-sm text-muted-foreground">
      Viewing <strong>{start}</strong>-<strong>{end}</strong> of{" "}
      <strong>{totalCount}</strong> results
    </p>
  );
}

const getSortValue = (
  isSorted: false | "asc" | "desc"
): "none" | "ascending" | "descending" => {
  if (!isSorted) return "none";
  return isSorted === "asc" ? "ascending" : "descending";
};

export function DataTable<T extends { id: number }>({
  className,
  data,
  columns,
  totalCount,
  isFetching,
  page,
  pageSize,
  sortBy,
  sortOrder,
  setPage,
  setSort,
  defaultSortField = "id",
  defaultSortOrder = "desc",
  onRowClick,
}: DataTableProps<T>) {
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [, setSearchParams] = useSearchParams();

  const sorting: SortingState = useMemo(() => {
    if (sortBy) {
      return [
        {
          id: sortBy,
          desc: sortOrder === "desc",
        },
      ];
    }
    return [];
  }, [sortBy, sortOrder]);

  const table = useReactTable<T>({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    rowCount: totalCount,
    state: {
      pagination: {
        pageIndex: page - 1,
        pageSize,
      },
      sorting,
    },
    manualPagination: true,
    manualSorting: true,
    onPaginationChange: (updater) => {
      if (typeof updater === "function") {
        const newState = updater({
          pageIndex: page,
          pageSize,
        });
        setPage(newState.pageIndex);
      } else {
        setPage(updater.pageIndex);
      }
    },
    onSortingChange: (updater) => {
      if (!setSort) return;
      const newSorting =
        typeof updater === "function" ? updater(sorting) : updater;

      if (newSorting.length > 0) {
        const { id, desc } = newSorting[0];
        const order: "asc" | "desc" = desc ? "desc" : "asc";
        setSort(id, order);
      } else {
        setSort(defaultSortField, defaultSortOrder);
      }
    },
  });

  const handleRowClick = useCallback(
    (row: Row<T>) => {
      const id = row.original.id;

      if (onRowClick) {
        onRowClick(row.original);
        return;
      }

      // Default behavior for requests (backward compatibility)
      if (selectedId === id) {
        setSearchParams((prev) => {
          prev.delete("tab");
          return prev;
        });
        openRequest(id);
      } else {
        setSelectedId(id);
        queryClient.prefetchQuery({
          queryKey: requestKeys.detail(id),
          queryFn: () => getRequestById(id),
          staleTime: TABLE_CONFIG.STALE_TIME,
        });
      }
    },
    [selectedId, onRowClick]
  );

  const paginationText = useMemo(() => {
    const { pageIndex, pageSize } = table.getState().pagination;
    return getPaginationRangeText(pageIndex, pageSize, totalCount);
  }, [
    table.getState().pagination.pageIndex,
    table.getState().pagination.pageSize,
    totalCount,
  ]);

  return (
    <>
      <ScrollArea
        className={cn(
          "w-full pt-1 whitespace-nowrap",
          isFetching && "pointer-events-none opacity-50 select-none"
        )}
      >
        <Table className={cn("w-full min-w-220 table-auto", className)}>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead
                    key={header.id}
                    onClick={header.column.getToggleSortingHandler()}
                    role="columnheader"
                    aria-sort={getSortValue(header.column.getIsSorted())}
                    className="bg-muted text-muted-foreground"
                    style={{ width: header.getSize() }}
                  >
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows.map((row) => {
              const isSelected = row.original.id === selectedId;
              return (
                <TableRow
                  key={row.id}
                  data-state={isSelected && "selected"}
                  className="h-14 text-xs font-medium hover:cursor-pointer"
                  onClick={() => handleRowClick(row)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      handleRowClick(row);
                    }
                  }}
                  role="row"
                  tabIndex={0}
                  aria-selected={isSelected}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell
                      key={cell.id}
                      className="text-foreground"
                      style={{ width: cell.column.getSize() }}
                    >
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              );
            })}
            {table.getRowModel().rows.length === 0 && (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>

      {/* Pagination */}
      <div className="sticky bottom-0 mt-4 flex items-center justify-between gap-2 border-t bg-background py-2">
        {paginationText}
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            Next
          </Button>
        </div>
      </div>
    </>
  );
}
