import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useRequest } from "@/hooks/use-request"
import { Link } from "react-router"

export function RequestsToggle() {
  const { request } = useRequest()

  return (
    <div className="grid grid-cols-12 lg:col-span-12">
      <div className="col-span-12 justify-items-center lg:col-span-8">
        <Tabs
          value={
            request?.is_moving_from_storage ? "from_storage" : "to_storage"
          }
        >
          <TabsList className="h-12 rounded-full border p-1">
            <TabsTrigger value="to_storage" className="rounded-full" asChild>
              <Link
                to={`/account/requests/${request?.is_moving_from_storage ? request?.paired_request?.id : request?.id}`}
              >
                Move to storage
              </Link>
            </TabsTrigger>
            <TabsTrigger value="from_storage" className="rounded-full" asChild>
              <Link
                to={`/account/requests/${request?.is_moving_from_storage ? request?.id : request?.paired_request?.id}`}
              >
                Move from storage
              </Link>
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>
    </div>
  )
}
