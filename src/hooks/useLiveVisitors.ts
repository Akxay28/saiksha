import { useEffect, useState } from "react";

interface LiveVisitorsOptions {
  countAsVisitor?: boolean;
}

interface LiveVisitorStats {
  activeVisitors: number;
  totalVisitors: number;
  totalVisits: number;
}

/**
 * Uses heartbeat + polling so production deployments with multiple server
 * instances do not rely on one process' memory or a long-lived SSE stream.
 * Returns live active visitors plus cumulative site analytics.
 */
export function useLiveVisitors(options: LiveVisitorsOptions = {}): LiveVisitorStats {
  const { countAsVisitor = true } = options;
  const [stats, setStats] = useState<LiveVisitorStats>({
    activeVisitors: 0,
    totalVisitors: 0,
    totalVisits: 0
  });

  useEffect(() => {
    let es: EventSource | null = null;
    let reconnectTimer: ReturnType<typeof setTimeout> | null = null;
    let heartbeatTimer: ReturnType<typeof setInterval> | null = null;
    let pollTimer: ReturnType<typeof setInterval> | null = null;
    const visitorIdKey = "saiksha_visitor_id";
    const activeIdKey = "saiksha_active_tab_id";
    const visitSessionKey = "saiksha_visit_counted";
    const visitorId =
      localStorage.getItem(visitorIdKey) ||
      (typeof crypto !== "undefined" && "randomUUID" in crypto
        ? crypto.randomUUID()
        : `${Date.now()}-${Math.random().toString(36).slice(2)}`);
    const activeId =
      sessionStorage.getItem(activeIdKey) ||
      (typeof crypto !== "undefined" && "randomUUID" in crypto
        ? crypto.randomUUID()
        : `${Date.now()}-${Math.random().toString(36).slice(2)}`);

    localStorage.setItem(visitorIdKey, visitorId);
    sessionStorage.setItem(activeIdKey, activeId);

    const applyStats = (data: any) => {
      setStats({
        activeVisitors: typeof data.activeVisitors === "number" ? data.activeVisitors : typeof data.count === "number" ? data.count : 0,
        totalVisitors: typeof data.totalVisitors === "number" ? data.totalVisitors : 0,
        totalVisits: typeof data.totalVisits === "number" ? data.totalVisits : 0
      });
    };

    const sendHeartbeat = async () => {
      try {
        const shouldCountVisit = countAsVisitor && !sessionStorage.getItem(visitSessionKey);
        if (shouldCountVisit) {
          sessionStorage.setItem(visitSessionKey, "1");
        }

        const response = await fetch("/api/live/heartbeat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            visitorId,
            activeId,
            source: countAsVisitor ? "storefront" : "admin",
            visit: shouldCountVisit
          })
        });

        if (response.ok) {
          applyStats(await response.json());
        }
      } catch (_) {}
    };

    const pollStats = async () => {
      try {
        const response = await fetch("/api/analytics/site", { cache: "no-store" });
        if (response.ok) {
          applyStats(await response.json());
        }
      } catch (_) {}
    };

    const connect = () => {
      const params = new URLSearchParams();
      params.set("source", countAsVisitor ? "storefront" : "admin");

      if (countAsVisitor) {
        params.set("visitorId", visitorId);
        params.set("activeId", activeId);
        if (!sessionStorage.getItem(visitSessionKey)) {
          params.set("visit", "1");
          sessionStorage.setItem(visitSessionKey, "1");
        }
      }

      es = new EventSource(`/api/live/visitors?${params.toString()}`);

      es.onmessage = (e) => {
        try {
          const data = JSON.parse(e.data);
          applyStats(data);
        } catch (_) {}
      };

      es.onerror = () => {
        es?.close();
        // Reconnect after 3 seconds on error
        reconnectTimer = setTimeout(connect, 3000);
      };
    };

    const markInactive = () => {
      if (!countAsVisitor) return;
      const payload = JSON.stringify({ activeId });
      if (navigator.sendBeacon) {
        navigator.sendBeacon("/api/live/inactive", new Blob([payload], { type: "application/json" }));
        return;
      }

      fetch("/api/live/inactive", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: payload,
        keepalive: true
      }).catch(() => {});
    };

    sendHeartbeat();
    heartbeatTimer = setInterval(sendHeartbeat, countAsVisitor ? 8000 : 10000);
    pollTimer = setInterval(pollStats, 8000);
    window.addEventListener("pagehide", markInactive);
    window.addEventListener("beforeunload", markInactive);
    connect();

    return () => {
      es?.close();
      if (reconnectTimer) clearTimeout(reconnectTimer);
      if (heartbeatTimer) clearInterval(heartbeatTimer);
      if (pollTimer) clearInterval(pollTimer);
      window.removeEventListener("pagehide", markInactive);
      window.removeEventListener("beforeunload", markInactive);
    };
  }, [countAsVisitor]);

  return stats;
}
