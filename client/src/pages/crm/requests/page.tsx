import { DataTable } from "@/components/data-table/data-table"
import { TABLE_CONFIG } from "@/components/data-table/table.config"
import { PageContainer, PageContent } from "@/components/page-component"
import { Spinner } from "@/components/ui/spinner"
import { useGetRequests } from "@/domains/requests/request.queries"
import type { TableRequest } from "@/domains/requests/request.types"
import { useTableRequestsStore } from "@/stores/use-table-requests-store"
import { useMemo } from "react"
import { useColumns } from "./_components/columns"
import { DateFilterTabs } from "./_components/date-filter-tabs"
import { StatsCard } from "./_components/stats-card"
import { StatusTabs } from "./_components/status-tabs"

function RequestsPage() {
  const {
    statusFilter,
    dateFilter,
    page,
    sortBy,
    sortOrder,
    setPage,
    setSort,
  } = useTableRequestsStore()

  const columns = useColumns()

  const params = useMemo(
    () => ({ page, statusFilter, dateFilter, sortBy, sortOrder }),
    [page, statusFilter, dateFilter, sortBy, sortOrder]
  )
  const { data, error, isPending, isFetching } = useGetRequests(params, {
    staleTime: TABLE_CONFIG.STALE_TIME,
    retry: TABLE_CONFIG.RETRY_COUNT,
    refetchOnMount: true,
    placeholderData: (prev) => prev,
  })

  return (
    <PageContainer classNameInner="space-y-2 pt-4">
      {/* Stats card */}
      <StatsCard />
      {/* Status tabs */}
      <StatusTabs />

      {/* Date Filter for confirmed requests */}
      {statusFilter === "confirmed" && <DateFilterTabs />}

      <PageContent>
        {error && (
          <div className="flex items-center justify-center px-4 py-28">
            <p className="text-muted-foreground">{error.message}</p>
          </div>
        )}
        {isPending && (
          <div className="flex items-center justify-center px-4 py-28">
            <Spinner />
          </div>
        )}
        <DataTable<TableRequest>
          columns={columns}
          data={data?.requests ?? []}
          isFetching={isFetching}
          totalCount={data?.pagination.total_count ?? 0}
          page={page}
          pageSize={20}
          sortBy={sortBy}
          sortOrder={sortOrder}
          setPage={setPage}
          setSort={setSort}
        />
      </PageContent>
    </PageContainer>
  )
}

export const Component = RequestsPage
