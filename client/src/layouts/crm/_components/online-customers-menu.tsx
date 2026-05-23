import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { Avatar, AvatarBadge, AvatarFallback } from "@/components/ui/avatar"
import { Badge, badgeVariants } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Spinner } from "@/components/ui/spinner"
import {
  STATUS_SOFT_BG_COLOR,
  STATUS_TEXT_COLOR,
  statusesMap,
} from "@/domains/requests/request.constants"
import type { Status } from "@/domains/requests/request.types"
import { useOnlineCustomers } from "@/hooks/api/use-online-customers"
import { cn } from "@/lib/utils"
import { openRequest } from "@/stores/use-open-requests-store"
import type { OnlineCustomer } from "@/types/api"
import { UsersIcon } from "@/components/icons"
import { useState } from "react"

function requestStatusClasses(
  status: OnlineCustomer["requests"][number]["status"]
) {
  const s = status as Status
  return cn(
    STATUS_SOFT_BG_COLOR[s] ?? STATUS_SOFT_BG_COLOR.all,
    STATUS_TEXT_COLOR[s] ?? STATUS_TEXT_COLOR.all,
    "border-0 shadow-none hover:opacity-90"
  )
}

export function OnlineCustomersMenu() {
  const [open, setOpen] = useState(false)
  const { data, isLoading, isError, refetch } = useOnlineCustomers()

  const customers = data?.online_customers ?? []
  const onlineCount = customers.length

  function handleOpenRequest(requestId: number) {
    openRequest(requestId)
    setOpen(false)
  }

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          type="button"
          variant="outline"
          size="icon"
          className="relative"
          aria-label="Customers online"
        >
          <UsersIcon />
          {onlineCount > 0 ? (
            <Badge className="absolute -top-2.5 -right-2.5 h-5 min-w-5 px-1 tabular-nums">
              {onlineCount > 99 ? "99+" : onlineCount}
            </Badge>
          ) : null}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="w-[min(92vw,420px)] p-0"
        onCloseAutoFocus={(e) => e.preventDefault()}
      >
        <div className="border-b px-3 py-2">
          <p className="text-sm font-medium">Customers online</p>
          <p className="text-xs text-muted-foreground">
            Active on the customer portal in the last few minutes
          </p>
        </div>
        <div className="max-h-[min(70vh,420px)] overflow-auto px-1">
          {isLoading ? (
            <div className="flex justify-center py-10">
              <Spinner className="size-6" />
            </div>
          ) : isError ? (
            <div className="space-y-2 px-3 py-4 text-center text-sm">
              <p className="text-destructive">
                Could not load online customers.
              </p>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => void refetch()}
              >
                Retry
              </Button>
            </div>
          ) : customers.length === 0 ? (
            <p className="px-3 py-8 text-center text-sm text-muted-foreground">
              No customers are online right now.
            </p>
          ) : (
            <Accordion type="single" collapsible className="w-full pb-2">
              {customers.map((customer) => {
                return (
                  <AccordionItem
                    key={customer.id}
                    value={`customer-${customer.id}`}
                    className="border-b px-2 last:border-b-0"
                  >
                    <AccordionTrigger className="hover:no-underline">
                      <div className="flex items-center gap-2">
                        <Avatar>
                          <AvatarFallback>
                            {`${customer.first_name.charAt(0)}${customer.last_name.charAt(0)}`}
                          </AvatarFallback>
                          <AvatarBadge className="bg-green-600 dark:bg-green-800" />
                        </Avatar>
                        <div className="grid flex-1 text-left text-sm leading-tight">
                          <span className="truncate font-medium">
                            {customer.first_name} {customer.last_name}
                          </span>
                          <span className="truncate text-xs text-muted-foreground">
                            {customer.email_address}
                          </span>
                        </div>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="px-1 pb-3">
                      {customer.requests.length === 0 ? (
                        <p className="text-xs text-muted-foreground">
                          No jobs for this customer.
                        </p>
                      ) : (
                        <div className="flex flex-wrap gap-2">
                          {customer.requests.map((req) => {
                            const label =
                              statusesMap[req.status as Status] ?? req.status

                            return (
                              <button
                                key={req.id}
                                type="button"
                                className={cn(
                                  badgeVariants({ variant: "ghost" }),
                                  "h-6 min-h-6 cursor-pointer px-2.5 py-0 text-xs font-medium tabular-nums focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:outline-none",
                                  requestStatusClasses(req.status)
                                )}
                                title={label}
                                onClick={(e) => {
                                  e.preventDefault()
                                  e.stopPropagation()
                                  handleOpenRequest(req.id)
                                }}
                              >
                                #{req.id}
                              </button>
                            )
                          })}
                        </div>
                      )}
                    </AccordionContent>
                  </AccordionItem>
                )
              })}
            </Accordion>
          )}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
