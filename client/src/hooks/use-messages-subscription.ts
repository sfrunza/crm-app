
import { CableContext } from "@/providers/action-cable-provider"
import type { CableMessageEvent } from '@/types/index'
import { useContext, useEffect, useRef } from "react"

interface UseMessagesSubscriptionProps {
  requestId: number | undefined
  onReceived: (data: CableMessageEvent) => void
  deps: any[]
}
export function useMessagesSubscription({ requestId, onReceived, deps }: UseMessagesSubscriptionProps): void {
  const { consumer } = useContext(CableContext)
  const subscriptionRef = useRef<any>(null)

  useEffect(() => {
    if (!requestId) return
    if (!consumer) return
    // Prevent duplicate subscriptions
    if (subscriptionRef.current) return

    subscriptionRef.current = consumer.subscriptions.create(
      { channel: "MessagesChannel", request_id: requestId },
      {
        received: (data: CableMessageEvent) => {
          console.info("MessagesChannel received:", data)
          onReceived?.(data)
        },
      }
    )

    return () => {
      if (subscriptionRef.current) {
        subscriptionRef.current.unsubscribe()
        subscriptionRef.current = null
      }
    }
  }, [consumer, requestId, ...deps])
}
