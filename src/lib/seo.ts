export interface SeoOptions {
  title: string;
  description: string;
  path?: string;
  image?: string;
  type?: "website" | "product";
  noIndex?: boolean;
  structuredData?: Record<string, unknown> | Array<Record<string, unknown>>;
}

const fallbackOrigin = "https://saiksha.in";

export function getSiteUrl() {
  if (typeof window === "undefined") return fallbackOrigin;
  return window.location.origin;
}

function upsertMeta(selector: string, create: () => HTMLMetaElement, content: string) {
  let element = document.head.querySelector(selector) as HTMLMetaElement | null;
  if (!element) {
    element = create();
    document.head.appendChild(element);
  }
  element.setAttribute("content", content);
}

function upsertLink(rel: string, href: string) {
  let element = document.head.querySelector(`link[rel="${rel}"]`) as HTMLLinkElement | null;
  if (!element) {
    element = document.createElement("link");
    element.setAttribute("rel", rel);
    document.head.appendChild(element);
  }
  element.setAttribute("href", href);
}

export function applySeo(options: SeoOptions) {
  const origin = getSiteUrl();
  const canonical = `${origin}${options.path || (typeof window !== "undefined" ? window.location.pathname : "/")}`;
  const title = options.title.includes("Saiksha") ? options.title : `${options.title} | Saiksha`;
  const image = options.image || `${origin}/src/assets/images/saiksha-logo-black.jpeg`;

  document.title = title;
  upsertMeta('meta[name="description"]', () => {
    const meta = document.createElement("meta");
    meta.setAttribute("name", "description");
    return meta;
  }, options.description);
  upsertMeta('meta[name="robots"]', () => {
    const meta = document.createElement("meta");
    meta.setAttribute("name", "robots");
    return meta;
  }, options.noIndex ? "noindex,nofollow" : "index,follow,max-image-preview:large");
  upsertMeta('meta[property="og:title"]', () => {
    const meta = document.createElement("meta");
    meta.setAttribute("property", "og:title");
    return meta;
  }, title);
  upsertMeta('meta[property="og:description"]', () => {
    const meta = document.createElement("meta");
    meta.setAttribute("property", "og:description");
    return meta;
  }, options.description);
  upsertMeta('meta[property="og:type"]', () => {
    const meta = document.createElement("meta");
    meta.setAttribute("property", "og:type");
    return meta;
  }, options.type || "website");
  upsertMeta('meta[property="og:url"]', () => {
    const meta = document.createElement("meta");
    meta.setAttribute("property", "og:url");
    return meta;
  }, canonical);
  upsertMeta('meta[property="og:image"]', () => {
    const meta = document.createElement("meta");
    meta.setAttribute("property", "og:image");
    return meta;
  }, image);
  upsertMeta('meta[name="twitter:card"]', () => {
    const meta = document.createElement("meta");
    meta.setAttribute("name", "twitter:card");
    return meta;
  }, "summary_large_image");
  upsertLink("canonical", canonical);

  document.querySelectorAll('script[data-saiksha-seo="jsonld"]').forEach((node) => node.remove());
  const structuredData = Array.isArray(options.structuredData) ? options.structuredData : options.structuredData ? [options.structuredData] : [];
  structuredData.forEach((data) => {
    const script = document.createElement("script");
    script.type = "application/ld+json";
    script.dataset.saikshaSeo = "jsonld";
    script.textContent = JSON.stringify(data);
    document.head.appendChild(script);
  });
}

export function organizationJsonLd(settings: { storeName?: string; supportEmail?: string; whatsappNumber?: string; instagramUrl?: string }) {
  const origin = getSiteUrl();
  return {
    "@context": "https://schema.org",
    "@type": "JewelryStore",
    name: settings.storeName || "Saiksha",
    url: origin,
    logo: `${origin}/src/assets/images/saiksha-logo-black.jpeg`,
    image: `${origin}/src/assets/images/saiksha-logo-black.jpeg`,
    email: settings.supportEmail || undefined,
    telephone: settings.whatsappNumber || undefined,
    areaServed: "IN",
    address: {
      "@type": "PostalAddress",
      addressCountry: "IN"
    },
    sameAs: settings.instagramUrl ? [settings.instagramUrl] : undefined
  };
}
