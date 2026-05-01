const SESSION_STORAGE_KEY = "session_token";

/** WebSocket URLs cannot send `Authorization` in the browser; append token like the cable server expects. */
export function buildActionCableUrl(authenticated: boolean): string {
  const base = import.meta.env.VITE_WS_URL;
  if (!base) {
    throw new Error("VITE_WS_URL is not defined");
  }
  if (!authenticated) {
    return base;
  }
  const token = localStorage.getItem(SESSION_STORAGE_KEY);
  if (!token) {
    return base;
  }
  const sep = base.includes("?") ? "&" : "?";
  return `${base}${sep}token=${encodeURIComponent(token)}`;
}
