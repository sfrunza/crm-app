import { ChevronDownIcon } from "@/components/icons"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { queryClient } from "@/lib/query-client"
import { LoadingSwap } from "@/components/ui/loading-swap"
import { useCreateRequest } from "@/domains/requests/request.mutations"
import { requestKeys } from "@/domains/requests/request.keys"
import { openRequest } from "@/stores/use-open-requests-store"
import { useServices } from "@/hooks/api/use-services"

export function CreateRequestButton() {
  const { data: services } = useServices({
    select: (data) => data.filter((service) => service.active),
  })

  const { mutate: createRequestMutation, isPending: isCreating } =
    useCreateRequest({
      onSettled: (data, error) => {
        if (error) {
          queryClient.cancelQueries({ queryKey: requestKeys.lists() })
        }
        if (data) {
          queryClient.invalidateQueries({ queryKey: requestKeys.lists() })
          queryClient.invalidateQueries({
            queryKey: requestKeys.statusCounts(),
          })
          openRequest(data.id)
        }
      },
    })

  function handleCreateRequest(serviceId: number) {
    createRequestMutation({ service_id: serviceId })
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button disabled={false}>
          <span className="flex items-center justify-between gap-2">
            <span className="hidden md:inline-flex">Create request</span>
            <span className="inline-flex md:hidden">New</span>
            <ChevronDownIcon />
          </span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56">
        <DropdownMenuGroup>
          {services?.map((service, i) => (
            <DropdownMenuItem
              key={i}
              className="cursor-pointer"
              onClick={() => handleCreateRequest(service.id)}
              disabled={isCreating}
            >
              <LoadingSwap isLoading={isCreating}>{service.name}</LoadingSwap>
            </DropdownMenuItem>
          ))}
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
