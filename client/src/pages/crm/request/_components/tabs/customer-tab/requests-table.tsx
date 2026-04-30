import { DataTable } from "@/components/data-table/data-table"
import { useRequest } from "@/hooks/use-request"
import { api } from "@/lib/axios"
import { useQuery } from "@tanstack/react-query"
import { useState } from "react"
import { useTableColumns } from "./table-columns"
import type {
  TableRequest,
  TableRequestResponse,
} from "@/domains/requests/request.types"
import { requestKeys } from "@/domains/requests/request.keys"

export function RequestsTable() {
  const { request } = useRequest()

  const [page, setPage] = useState(1)

  const columns = useTableColumns()

  const { data, isFetching } = useQuery({
    queryKey: [
      requestKeys.list({
        page,
      }),
      requestKeys.detail(request?.id ?? 0),
    ],
    queryFn: async () => {
      const response = await api.get<TableRequestResponse>(
        `/requests/${request?.id}/customer_requests?page=${page}`
      )
      return response.data
    },
    placeholderData: (prev) => prev,
    enabled: !!request?.customer_id,
  })

  return (
    <div className="mt-10">
      {data && (
        <DataTable<TableRequest>
          columns={columns}
          data={data?.requests ?? []}
          isFetching={isFetching}
          totalCount={data?.pagination.total_count ?? 0}
          page={page}
          pageSize={5}
          setPage={setPage}
        />
      )}
    </div>
  )
}
