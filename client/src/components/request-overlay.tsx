import { useOpenRequestsStore } from "@/stores/use-open-requests-store";
import { RequestPage } from "@/pages/crm/request/page";

/**
 * Renders the active request as a full-screen overlay on top of
 * whatever CRM page is currently shown. When no request is active,
 * renders nothing.
 *
 * The `key` prop forces React to unmount/remount the RequestPage
 * when switching between requests, giving each a fresh lifecycle.
 */
export function RequestOverlay() {
  const activeId = useOpenRequestsStore((s) => s.activeId);

  if (!activeId) return null;

  return (
    <div className="bg-accent fixed inset-0 z-30 flex w-full flex-col overflow-y-scroll overscroll-contain">
      <RequestPage key={activeId} requestId={activeId} />
    </div>
  );
}
