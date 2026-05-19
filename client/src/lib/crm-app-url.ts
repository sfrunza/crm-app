/**
 * CRM web app origin for links that must leave the host page (e.g. marketing site embed).
 *
 * Resolution order:
 * 1. window.__BOOKING_WIDGET_CONFIG__.crmUrl (set by embed init)
 * 2. data-crm-url on .booking-widget-container or the widget script tag
 * 3. VITE_APP_URL at build time
 * 4. window.location.origin (same-origin /book page on the CRM site)
 */
export type BookingWidgetConfig = {
  crmUrl?: string
}

declare global {
  interface Window {
    __BOOKING_WIDGET_CONFIG__?: BookingWidgetConfig
  }
}

function normalizeAppOrigin(url: string): string {
  const parsed = new URL(url, window.location.origin)
  return parsed.origin
}

function readEmbedCrmUrlFromDom(): string | undefined {
  const container = document.querySelector<HTMLElement>(
    ".booking-widget-container[data-crm-url]",
  )
  if (container?.dataset.crmUrl) {
    return container.dataset.crmUrl
  }

  const script =
    document.querySelector<HTMLScriptElement>(
      'script[data-crm-url][src*="book-form-widget"]',
    ) ??
    document.querySelector<HTMLScriptElement>("script[data-crm-url]")

  return script?.dataset.crmUrl
}

/** CRM frontend origin (no trailing slash). */
export function getCrmAppUrl(): string {
  const configured =
    window.__BOOKING_WIDGET_CONFIG__?.crmUrl?.trim() ||
    readEmbedCrmUrlFromDom()?.trim() ||
    (import.meta.env.VITE_APP_URL as string | undefined)?.trim() ||
    ""

  if (configured) {
    return normalizeAppOrigin(configured)
  }

  if (typeof window !== "undefined") {
    return window.location.origin
  }

  throw new Error(
    "CRM app URL is not configured. Set VITE_APP_URL or data-crm-url on the embed script/container.",
  )
}

export function buildCrmAutoLoginUrl(
  requestId: number,
  magicLoginToken: string,
): string {
  const url = new URL("/auth/auto-login", getCrmAppUrl())
  url.searchParams.set("token", magicLoginToken)
  url.searchParams.set("return_to", `/account/requests/${requestId}`)
  return url.toString()
}

export function buildCrmLoginUrl(): string {
  return new URL("/auth/login", getCrmAppUrl()).toString()
}

function setBookingWidgetCrmUrl(crmUrl: string) {
  window.__BOOKING_WIDGET_CONFIG__ = {
    ...window.__BOOKING_WIDGET_CONFIG__,
    crmUrl,
  }
}

/** Apply data-crm-url from the widget script tag (runs once on embed load). */
export function applyBookingWidgetScriptConfig() {
  const script =
    document.querySelector<HTMLScriptElement>(
      'script[data-crm-url][src*="book-form-widget"]',
    ) ??
    document.querySelector<HTMLScriptElement>("script[data-crm-url]")

  const crmUrl = script?.dataset.crmUrl?.trim()
  if (crmUrl) setBookingWidgetCrmUrl(crmUrl)
}

/** Apply data-crm-url from a widget mount container before rendering. */
export function applyBookingWidgetContainerConfig(container: HTMLElement) {
  const crmUrl = container.dataset.crmUrl?.trim()
  if (crmUrl) setBookingWidgetCrmUrl(crmUrl)
}
