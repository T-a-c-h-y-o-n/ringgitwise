// Simple client-side analytics - lightweight, no dependencies
// Logs to console + POST to /api/analytics if exists + localStorage for funnel debug
// Events: page_view, calculator_started, calculation_completed, provider_clicked, email_submitted

export type AnalyticsEvent =
  | "page_view"
  | "calculator_started"
  | "calculation_completed"
  | "provider_clicked"
  | "email_submitted";

export function track(event: AnalyticsEvent, props: Record<string, any> = {}) {
  const payload = { event, props, ts: new Date().toISOString(), url: typeof window !== "undefined" ? window.location.href : "" };
  // console for dev
  if (typeof window !== "undefined") {
    console.log("[analytics]", payload);
    try {
      const key = "rw_events";
      const arr = JSON.parse(localStorage.getItem(key) || "[]");
      arr.push(payload);
      localStorage.setItem(key, JSON.stringify(arr.slice(-100)));
    } catch {}
    // Try beacon to server (optional, not required for MVP)
    try {
      navigator.sendBeacon?.("/api/analytics", JSON.stringify(payload));
    } catch {}
  }
}
