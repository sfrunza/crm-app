import { DataTable } from "@/components/data-table/data-table"
import { TABLE_CONFIG } from "@/components/data-table/table.config"
import { DatePickerRangePill } from "@/components/inputs/date-picker-range-pill"
import { PageContent } from "@/components/page-component"
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area"
import { Spinner } from "@/components/ui/spinner"
import { useGetAdminPayments } from "@/domains/payments/payment.queries"
import type {
  AdminPaymentListParams,
  PaymentSortField,
  PaymentStatusFilter,
} from "@/domains/payments/payment.types"
import { getRequestById } from "@/domains/requests/request.api"
import { requestKeys } from "@/domains/requests/request.keys"
import { PAYMENT_STATUSES } from "@/lib/constants"
import { queryClient } from "@/lib/query-client"
import { openRequest } from "@/stores/use-open-requests-store"
import type { SortOrder } from "@/stores/use-table-requests-store"
import { format, isValid, parse } from "date-fns"
import { Fragment, useCallback, useMemo } from "react"
import type { DateRange } from "react-day-picker"
import { useSearchParams } from "react-router"
import { usePaymentColumns } from "./columns"
import { PaymentStatusTabs } from "./payment-status-tabs"

const currencyTotal = new Intl.NumberFormat(
  "en-US",
  TABLE_CONFIG.CURRENCY_FORMAT
)

const PAGE_SIZE = 20

function parseStatusParam(value: string | null): PaymentStatusFilter {
  if (!value) return "all"
  if (value === "all") return "all"
  return PAYMENT_STATUSES.includes(value as (typeof PAYMENT_STATUSES)[number])
    ? (value as PaymentStatusFilter)
    : "all"
}

function parseDateParam(value: string | null): Date | undefined {
  if (!value) return undefined
  const d = parse(value, "yyyy-MM-dd", new Date())
  return isValid(d) ? d : undefined
}

function dateRangeFromParams(
  start: string | null,
  end: string | null
): DateRange | undefined {
  const from = parseDateParam(start)
  if (!from) return undefined
  const to = parseDateParam(end)
  return to ? { from, to } : { from, to: undefined }
}

function dateRangeToQuery(
  range: DateRange | undefined
): Pick<AdminPaymentListParams, "start_date" | "end_date"> {
  if (!range?.from) return {}
  return {
    start_date: format(range.from, "yyyy-MM-dd"),
    ...(range.to ? { end_date: format(range.to, "yyyy-MM-dd") } : {}),
  }
}

function PaymentDateFiltersBar() {
  const [searchParams, setSearchParams] = useSearchParams()

  const appliedRange = useMemo(
    () =>
      dateRangeFromParams(
        searchParams.get("start_date"),
        searchParams.get("end_date")
      ),
    [searchParams]
  )

  const applyDateRange = useCallback(
    (range: DateRange | undefined) => {
      setSearchParams((prev) => {
        const next = new URLSearchParams(prev)
        if (range?.from) {
          next.set("start_date", format(range.from, "yyyy-MM-dd"))
          if (range.to) {
            next.set("end_date", format(range.to, "yyyy-MM-dd"))
          } else {
            next.delete("end_date")
          }
        } else {
          next.delete("start_date")
          next.delete("end_date")
        }
        next.delete("page")
        return next
      })
    },
    [setSearchParams]
  )

  return (
    <ScrollArea className="w-full px-4 whitespace-nowrap">
      <div className="flex gap-2 py-2.5">
        <DatePickerRangePill value={appliedRange} onApply={applyDateRange} />
      </div>
      <ScrollBar orientation="horizontal" className="invisible" />
    </ScrollArea>
  )
}

function PaymentTotal({ totalAmount }: { totalAmount: number }) {
  return (
    <div className="flex justify-end">
      <p className="space-x-1 text-sm">
        <span className="text-muted-foreground">Total payments</span>
        <span className="font-semibold text-foreground tabular-nums">
          {currencyTotal.format(totalAmount / 100)}
        </span>
      </p>
    </div>
  )
}

function PaymentsPage() {
  const [searchParams, setSearchParams] = useSearchParams()

  const startQ = searchParams.get("start_date") ?? ""
  const endQ = searchParams.get("end_date") ?? ""
  const appliedDateFilterKey = `${startQ}|${endQ}`

  const { appliedQueryParams, sortBy, sortOrder } = useMemo(() => {
    const page = Math.max(
      1,
      Number.parseInt(searchParams.get("page") ?? "1", 10) || 1
    )
    const status = parseStatusParam(searchParams.get("status"))
    const dates = dateRangeToQuery(
      dateRangeFromParams(
        searchParams.get("start_date"),
        searchParams.get("end_date")
      )
    )
    const sort_by = (searchParams.get("sort_by") ?? "date") as PaymentSortField
    const sort_order = (
      searchParams.get("sort_order") === "asc" ? "asc" : "desc"
    ) as "asc" | "desc"
    const params: AdminPaymentListParams = {
      page,
      per_page: PAGE_SIZE,
      ...(status !== "all" ? { status } : {}),
      ...dates,
      sort_by,
      sort_order,
    }
    return {
      appliedQueryParams: params,
      sortBy: sort_by,
      sortOrder: sort_order as SortOrder,
    }
  }, [searchParams])

  const columns = usePaymentColumns()

  const { data, error, isPending, isFetching, isLoading } = useGetAdminPayments(
    appliedQueryParams,
    {
      staleTime: TABLE_CONFIG.STALE_TIME,
      retry: TABLE_CONFIG.RETRY_COUNT,
      refetchOnMount: true,
      placeholderData: (prev) => prev,
    }
  )

  const currentPage = Math.max(
    1,
    Number.parseInt(searchParams.get("page") ?? "1", 10) || 1
  )

  const setPage = useCallback(
    (page: number) => {
      setSearchParams((prev) => {
        const next = new URLSearchParams(prev)
        if (page <= 1) next.delete("page")
        else next.set("page", String(page))
        return next
      })
    },
    [setSearchParams]
  )

  const setSort = useCallback(
    (field: string, order: SortOrder) => {
      setSearchParams((prev) => {
        const next = new URLSearchParams(prev)
        next.set("sort_by", field)
        next.set("sort_order", order)
        next.delete("page")
        return next
      })
    },
    [setSearchParams]
  )

  const onRowClick = useCallback((row: { id: number; request_id: number }) => {
    queryClient.prefetchQuery({
      queryKey: requestKeys.detail(row.request_id),
      queryFn: () => getRequestById(row.request_id),
      staleTime: TABLE_CONFIG.STALE_TIME,
    })
    openRequest(row.request_id)
  }, [])

  return (
    <Fragment>
      <PaymentStatusTabs />
      <PaymentDateFiltersBar key={appliedDateFilterKey} />

      <PageContent>
        {isLoading && (
          <div className="flex items-center justify-center px-4 py-28">
            <Spinner />
          </div>
        )}

        {error && (
          <div className="flex items-center justify-center px-4 py-28">
            <p className="text-muted-foreground">{error.message}</p>
          </div>
        )}

        {!isPending && !error && data && (
          <>
            <PaymentTotal totalAmount={data.total_amount} />
            <DataTable
              columns={columns}
              data={data.payments}
              isFetching={isFetching}
              totalCount={data.pagination.total_count}
              page={currentPage}
              pageSize={PAGE_SIZE}
              sortBy={sortBy}
              sortOrder={sortOrder}
              setSort={setSort}
              defaultSortField="id"
              defaultSortOrder="desc"
              setPage={setPage}
              onRowClick={onRowClick}
            />
          </>
        )}
      </PageContent>
    </Fragment>
  )
}

export const Component = PaymentsPage
