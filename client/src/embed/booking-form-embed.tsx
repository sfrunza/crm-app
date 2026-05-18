/// <reference types="vite/client" />

import { StrictMode } from "react"
import { createRoot, type Root } from "react-dom/client"

import { BookingForm } from "@/components/booking-form/booking-form"

import embedStyles from "@/index.css?inline"

const TAG_NAME = "booking-form"

/** Hide host until shadow styles + layout have applied (avoids FOUC on refresh). */
const HOST_REVEAL_CSS =
  `:host{opacity:0}:host([data-booking-form-ready]){opacity:1;transition:opacity .12s ease-out}`

const EMBED_STYLES = `${HOST_REVEAL_CSS}${embedStyles}`

function injectShadowStyles(shadow: ShadowRoot, css: string) {
  try {
    const sheet = new CSSStyleSheet()
    sheet.replaceSync(css)
    shadow.adoptedStyleSheets = [sheet]
  } catch {
    const style = document.createElement("style")
    style.textContent = css
    shadow.appendChild(style)
  }
}

/**
 * Standalone embed for marketing sites. Build with `npm run build:booking-embed`
 * in `client/`, then host `dist-embed/booking-form.js` and add:
 *
 * <script src="https://your-cdn/booking-form.js" defer></script>
 * <booking-form></booking-form>
 *
 * Keep the tag empty (no light-DOM children); otherwise placeholders can flash
 * before the custom element upgrades.
 */
class CrmBookingFormElement extends HTMLElement {
  #reactRoot: Root | null = null
  #mount: HTMLDivElement | null = null

  connectedCallback() {
    if (this.#reactRoot) return

    this.removeAttribute("data-booking-form-ready")

    const shadow = this.attachShadow({ mode: "open" })
    injectShadowStyles(shadow, EMBED_STYLES)

    this.#mount = document.createElement("div")
    shadow.appendChild(this.#mount)

    this.#reactRoot = createRoot(this.#mount)
    this.#reactRoot.render(
      <StrictMode>
        <BookingForm />
      </StrictMode>,
    )

    // First paint after styles: avoid a frame of unstyled content inside shadow.
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        this.setAttribute("data-booking-form-ready", "")
      })
    })
  }

  disconnectedCallback() {
    this.#reactRoot?.unmount()
    this.#reactRoot = null
    this.#mount = null
    this.removeAttribute("data-booking-form-ready")
  }
}

declare global {
  interface HTMLElementTagNameMap {
    [TAG_NAME]: CrmBookingFormElement
  }
}

if (!customElements.get(TAG_NAME)) {
  customElements.define(TAG_NAME, CrmBookingFormElement)
}
