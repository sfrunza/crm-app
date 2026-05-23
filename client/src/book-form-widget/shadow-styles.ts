import shadowStyles from "@/index.css?inline"
import sonnerStyles from "sonner/dist/styles.css?inline"

/**
 * Sonner injects its CSS into document.head at runtime, which does not reach
 * shadow DOM. Bundle the styles here so toasts are fixed + styled in the widget.
 */
export function buildShadowStyles(): string {
  const scopedSonner = sonnerStyles
    .replace(/html\[dir='ltr'\]/g, ":host, html[dir='ltr']")
    .replace(/html\[dir='rtl'\]/g, ":host, html[dir='rtl']")

  return `
    ${shadowStyles}
    ${scopedSonner}

    :host {
      display: block;
      font-family: inherit !important;
    }
  `
}
