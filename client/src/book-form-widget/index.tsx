import { BookingForm } from "@/components/booking-form/booking-form"
import {
  applyBookingWidgetContainerConfig,
  applyBookingWidgetScriptConfig,
} from "@/lib/crm-app-url"
import { queryClient } from "@/lib/query-client"
import { QueryClientProvider } from "@tanstack/react-query"
import { createContext, StrictMode, useContext } from "react"
import { createRoot } from "react-dom/client"
import { buildShadowStyles } from "./shadow-styles"
import { Toaster } from "@/components/ui/sonner"

type ShadowRootContextType = ShadowRoot | null
export const ShadowRootContext = createContext<ShadowRootContextType>(null)

export function useShadowRoot(): ShadowRoot | null {
  return useContext(ShadowRootContext)
}

function mountWidget(container: HTMLElement) {
  applyBookingWidgetContainerConfig(container)

  const host = document.createElement("div")
  container.appendChild(host)

  const shadowRoot = host.attachShadow({ mode: "open" })

  const style = document.createElement("style")
  style.textContent = buildShadowStyles()
  shadowRoot.appendChild(style)

  const shadowContainer = document.createElement("div")
  shadowContainer.id = "booking-form-root"
  shadowRoot.appendChild(shadowContainer)

  createRoot(shadowContainer).render(
    <StrictMode>
      <QueryClientProvider client={queryClient}>
        <ShadowRootContext.Provider value={shadowRoot}>
          <BookingForm />
          <Toaster position="bottom-right" />
        </ShadowRootContext.Provider>
      </QueryClientProvider>
    </StrictMode>
  )
}

export function initBookingWidget() {
  document
    .querySelectorAll(".booking-widget-container")
    .forEach((container) => {
      if (container.hasChildNodes()) return
      mountWidget(container as HTMLElement)
    })
}

// Auto-init
if (typeof window !== "undefined") {
  applyBookingWidgetScriptConfig()

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initBookingWidget)
  } else {
    initBookingWidget()
  }
}

// Expose globally
;(window as any).initBookingWidget = initBookingWidget
