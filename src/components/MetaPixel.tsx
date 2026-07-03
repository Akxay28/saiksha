import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { useStoreSettings } from "../context/StoreSettingsContext";

declare global {
  interface Window {
    fbq?: (...args: any[]) => void;
    _fbq?: (...args: any[]) => void;
  }
}

let pixelScriptLoaded = false;
let initializedPixelId = "";

function getVisitorId() {
  if (typeof window === "undefined") return "";
  const key = "saiksha_meta_visitor_id";
  const existing = localStorage.getItem(key);
  if (existing) return existing;
  const next = `${Date.now()}_${Math.random().toString(36).slice(2, 12)}`;
  localStorage.setItem(key, next);
  return next;
}

function captureEventForAdmin(eventName: string, params?: Record<string, any>) {
  if (typeof window === "undefined") return;
  const query = new URLSearchParams(window.location.search);
  const payload = {
    ...(params || {}),
    eventName,
    path: `${window.location.pathname}${window.location.search}`,
    referrer: document.referrer,
    visitorId: getVisitorId(),
    utm_source: query.get("utm_source") || "",
    utm_medium: query.get("utm_medium") || "",
    utm_campaign: query.get("utm_campaign") || "",
    fbclid: query.get("fbclid") || ""
  };

  fetch("/api/meta-events", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
    keepalive: true
  }).catch(() => undefined);
}

export function trackMetaEvent(eventName: string, params?: Record<string, any>) {
  if (typeof window === "undefined") return;
  if (typeof window.fbq === "function") {
    window.fbq("track", eventName, params || {});
  }
  captureEventForAdmin(eventName, params);
}

export default function MetaPixel() {
  const { pathname, search } = useLocation();
  const { settings } = useStoreSettings();
  const pixelId = String(settings.metaPixelId || "").trim();

  useEffect(() => {
    if (!pixelId || typeof window === "undefined") return;

    if (!window.fbq) {
      const fbq = function (...args: any[]) {
        (fbq as any).callMethod
          ? (fbq as any).callMethod.apply(fbq, args)
          : (fbq as any).queue.push(args);
      } as any;
      if (!window._fbq) window._fbq = fbq;
      fbq.push = fbq;
      fbq.loaded = true;
      fbq.version = "2.0";
      fbq.queue = [];
      window.fbq = fbq;
    }

    if (!pixelScriptLoaded) {
      const script = document.createElement("script");
      script.async = true;
      script.src = "https://connect.facebook.net/en_US/fbevents.js";
      document.head.appendChild(script);
      pixelScriptLoaded = true;
    }

    if (initializedPixelId !== pixelId) {
      window.fbq("init", pixelId);
      initializedPixelId = pixelId;
    }
  }, [pixelId]);

  useEffect(() => {
    if (!pixelId && typeof window === "undefined") return;
    trackMetaEvent("PageView");
  }, [pixelId, pathname, search]);

  return null;
}
