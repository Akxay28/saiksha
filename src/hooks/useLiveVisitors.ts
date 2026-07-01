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
 * Connects to the SSE endpoint /api/live/visitors.
 * Returns live active visitors plus cumulative site analytics.
 * Automatically reconnects on disconnect.
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
    const visitorIdKey = "saiksha_visitor_id";
    const visitSessionKey = "saiksha_visit_counted";

    const connect = () => {
      const params = new URLSearchParams();
      params.set("source", countAsVisitor ? "storefront" : "admin");

      if (countAsVisitor) {
        let visitorId = localStorage.getItem(visitorIdKey);
        if (!visitorId) {
          visitorId =
            typeof crypto !== "undefined" && "randomUUID" in crypto
              ? crypto.randomUUID()
              : `${Date.now()}-${Math.random().toString(36).slice(2)}`;
          localStorage.setItem(visitorIdKey, visitorId);
        }

        params.set("visitorId", visitorId);
        if (!sessionStorage.getItem(visitSessionKey)) {
          params.set("visit", "1");
          sessionStorage.setItem(visitSessionKey, "1");
        }
      }

      es = new EventSource(`/api/live/visitors?${params.toString()}`);

      es.onmessage = (e) => {
        try {
          const data = JSON.parse(e.data);
          setStats({
            activeVisitors: typeof data.count === "number" ? data.count : 0,
            totalVisitors: typeof data.totalVisitors === "number" ? data.totalVisitors : 0,
            totalVisits: typeof data.totalVisits === "number" ? data.totalVisits : 0
          });
        } catch (_) {}
      };

      es.onerror = () => {
        es?.close();
        // Reconnect after 3 seconds on error
        reconnectTimer = setTimeout(connect, 3000);
      };
    };

    connect();

    return () => {
      es?.close();
      if (reconnectTimer) clearTimeout(reconnectTimer);
    };
  }, [countAsVisitor]);

  return stats;
}
