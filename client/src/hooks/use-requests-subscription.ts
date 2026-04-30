import { useContext, useEffect, useRef } from "react"
import { queryClient } from "@/lib/query-client"
import { CableContext } from "@/providers/action-cable-provider"
import { requestKeys } from "@/domains/requests/request.keys"
import { dispatchKeys } from "@/domains/dispatch/dispatch.keys"
import { formatDate, parseDateOnly } from "@/lib/format-date"

type RequestsChannelPayload = {
  type: "request_created" | "request_updated" | "customer_updated"
  id: number
  moving_date: string | null
}

export const useRequestsSubscription = (): void => {
  const { consumer } = useContext(CableContext)
  const subscriptionRef = useRef<any>(null)

  useEffect(() => {
    if (!consumer) return

    // Prevent duplicate subscriptions
    if (subscriptionRef.current) return

    subscriptionRef.current = consumer.subscriptions.create(
      { channel: "RequestsChannel" },
      {
        received: (data: RequestsChannelPayload) => {
          // if (import.meta.env.DEV) {
          // }
          // console.info("RequestsChannel received:", data)

          switch (data.type) {
            case "request_created": {
              invalidateRequestLists()
              break
            }

            case "request_updated": {
              queryClient.invalidateQueries({
                queryKey: requestKeys.detail(data.id),
              })

              invalidateRequestLists()

              if (data.moving_date) {
                invalidateDispatch(data.moving_date)
              }
              break
            }

            case "customer_updated": {
              invalidateRequestLists()
              break
            }
          }
        },
      }
    )

    return () => {
      if (subscriptionRef.current) {
        subscriptionRef.current.unsubscribe()
        subscriptionRef.current = null
      }
      // subscription.unsubscribe()
    }
  }, [consumer])
}

/* -------------------- helpers -------------------- */

function invalidateRequestLists() {
  queryClient.invalidateQueries({ queryKey: requestKeys.lists() })
  queryClient.invalidateQueries({ queryKey: requestKeys.statusCounts() })
  queryClient.invalidateQueries({ queryKey: requestKeys.bookingStats() })
}

function invalidateDispatch(movingDate: string) {
  queryClient.invalidateQueries({
    queryKey: dispatchKeys.withParams(movingDate),
  })

  const monthKey = formatDate(parseDateOnly(movingDate), "yyyy-MM")

  queryClient.invalidateQueries({
    queryKey: dispatchKeys.activeDates(monthKey),
  })
}