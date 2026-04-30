import { DataTable } from "@/components/data-table/data-table";
import { TABLE_CONFIG } from "@/components/data-table/table.config";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useGetRequests } from "@/domains/requests/request.queries";
import type { TableRequest } from "@/domains/requests/request.types";
import { useMemo } from "react";
import { useNavigate, useSearchParams } from "react-router";
import { CustomerCard } from "./_components/customer-card";
import { useTableColumns } from "./table-columns";

const PAGE_SIZE = 10;

function AccountPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const filter =
    (searchParams.get("filter") as "current" | "past") || "current";
  const page = Number(searchParams.get("page")) || 1;
  const columns = useTableColumns();

  const params = useMemo(
    () => ({ page, filter, per_page: PAGE_SIZE }),
    [page, filter]
  );

  const { data, isFetching } = useGetRequests(params, {
    staleTime: TABLE_CONFIG.STALE_TIME,
    retry: TABLE_CONFIG.RETRY_COUNT,
    refetchOnMount: true,
    placeholderData: (prev) => prev,
  });

  function setPage(page: number) {
    setSearchParams((prev) => {
      prev.set("page", page.toString());
      return prev;
    });
  }

  function setFilter(value: "current" | "past") {
    setSearchParams({ filter: value });
  }

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-4">
      <CustomerCard />

      <div className="lg:col-span-3">
        <Card>
          <CardHeader>
            <CardTitle>Moves history</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs
              value={filter}
              onValueChange={(value) => setFilter(value as "current" | "past")}
            >
              <ScrollArea className="h-10">
                <TabsList variant="line">
                  <TabsTrigger value="current">Current movers</TabsTrigger>
                  <TabsTrigger value="past">Past movers</TabsTrigger>
                </TabsList>
                <ScrollBar orientation="horizontal" className="invisible" />
              </ScrollArea>
            </Tabs>
            <Separator className="-mt-1" />
            <DataTable<TableRequest>
              columns={columns}
              data={data?.requests ?? []}
              isFetching={isFetching}
              totalCount={data?.pagination.total_count ?? 0}
              page={page}
              pageSize={PAGE_SIZE}
              setPage={setPage}
              onRowClick={(row) => {
                navigate(`/account/requests/${row.id}`);
              }}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export const Component = AccountPage;
