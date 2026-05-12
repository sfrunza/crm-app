import { buildActionCableUrl } from "@/lib/action-cable"
import { useAuthStore } from "@/stores/auth-store"
import { createConsumer, type Consumer } from "@rails/actioncable"
import React, { createContext, useEffect, useMemo } from "react"

const CableContext = createContext<{ consumer: Consumer }>({
  consumer: null as unknown as Consumer,
})

function CableProvider({ children }: { children: React.ReactNode }) {
  const user = useAuthStore((s) => s.user)

  const consumer = useMemo(
    () => createConsumer(buildActionCableUrl(user != null)),
    [user]
  )

  useEffect(() => {
    return () => {
      consumer.disconnect()
    }
  }, [consumer])

  const value = useMemo(() => ({ consumer }), [consumer])

  return <CableContext.Provider value={value}>{children}</CableContext.Provider>
}

export { CableContext, CableProvider }
