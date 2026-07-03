import express, { Request, Response } from "express";
import helmet from "helmet";
import rateLimit, { ipKeyGenerator } from "express-rate-limit";
import path from "path";
import { createServer as createViteServer } from "vite";
import { Resend } from "resend";
import dotenv from "dotenv";
import mongoose from "mongoose";
import Product from "./server/models/Product";
import Testimonial from "./server/models/Testimonial";
import Order from "./server/models/Order";
import Analytics from "./server/models/Analytics";
import AbandonedCart from "./server/models/AbandonedCart";
import LiveVisitor from "./server/models/LiveVisitor";
import StoreSettings from "./server/models/StoreSettings";
import CustomerMeta from "./server/models/CustomerMeta";
import WishlistLead from "./server/models/WishlistLead";
import SearchAnalytics from "./server/models/SearchAnalytics";
import LeadCapture from "./server/models/LeadCapture";
import DiscountCampaign from "./server/models/DiscountCampaign";
import WhatsAppCampaign from "./server/models/WhatsAppCampaign";
import CustomerAccount from "./server/models/CustomerAccount";
import HappyCustomer from "./server/models/HappyCustomer";
import dns from "dns";
import crypto from "crypto";

import Razorpay from "razorpay";

dns.setServers(["8.8.8.8", "1.1.1.1"]);

dotenv.config();

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;
const razorpay = process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET
  ? new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    })
  : null;
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "swatipaul285@gmail.com";
const ADMIN_COOKIE_NAME = "saiksha_admin_auth";
const CUSTOMER_COOKIE_NAME = "saiksha_customer_auth";
const ADMIN_COOKIE_MAX_AGE_SECONDS = 60 * 60 * 3;
const CUSTOMER_COOKIE_MAX_AGE_SECONDS = 60 * 60 * 24 * 30;
const PUBLIC_ROUTES = ["/", "/collection", "/testimonials", "/happy-customers", "/about", "/care-guide", "/contact", "/faq", "/shipping", "/privacy"];
const activeAdminSessions = new Set<string>();
const activeCustomerSessions = new Map<string, string>();

function getClientIp(req: Request) {
  const forwardedFor = String(req.headers["x-forwarded-for"] || "").split(",")[0]?.trim();
  return forwardedFor || req.ip || req.socket.remoteAddress || "unknown";
}

function createRateLimiter(options: { windowMs: number; max: number; message: string }) {
  return rateLimit({
    windowMs: options.windowMs,
    max: options.max,
    standardHeaders: true,
    legacyHeaders: false,
    keyGenerator: (req) => ipKeyGenerator(getClientIp(req)),
    message: { error: options.message }
  });
}

function sanitizeRequestValue(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(sanitizeRequestValue);
  if (!value || typeof value !== "object") return value;
  return Object.entries(value as Record<string, unknown>).reduce<Record<string, unknown>>((clean, [key, nestedValue]) => {
    if (key.startsWith("$") || key.includes(".")) return clean;
    clean[key] = sanitizeRequestValue(nestedValue);
    return clean;
  }, {});
}

function isAllowedWriteOrigin(req: Request) {
  const origin = req.headers.origin;
  if (!origin) return true;
  const allowedOrigins = [
    process.env.APP_URL,
    process.env.FRONTEND_URL,
    `${req.protocol}://${req.get("host")}`
  ].filter(Boolean).map((value) => String(value).replace(/\/+$/, ""));
  return allowedOrigins.includes(String(origin).replace(/\/+$/, ""));
}

function timingSafeStringEqual(a: string, b: string) {
  const aBuffer = Buffer.from(a);
  const bBuffer = Buffer.from(b);
  if (aBuffer.length !== bBuffer.length) return false;
  return crypto.timingSafeEqual(aBuffer, bBuffer);
}

function parseCookies(cookieHeader?: string) {
  return (cookieHeader || "").split(";").reduce<Record<string, string>>((cookies, cookie) => {
    const [name, ...valueParts] = cookie.trim().split("=");
    if (!name) return cookies;
    cookies[name] = decodeURIComponent(valueParts.join("="));
    return cookies;
  }, {});
}

function buildAdminCookie(value: string, maxAgeSeconds: number) {
  const secureFlag = process.env.NODE_ENV === "production" ? "; Secure" : "";
  return `${ADMIN_COOKIE_NAME}=${encodeURIComponent(value)}; Max-Age=${maxAgeSeconds}; Path=/; HttpOnly; SameSite=Lax${secureFlag}`;
}

function getSiteOrigin(req: Request) {
  const configuredUrl = process.env.APP_URL?.trim();
  if (configuredUrl && configuredUrl !== "MY_APP_URL") {
    return configuredUrl.replace(/\/+$/, "");
  }

  return `${req.protocol}://${req.get("host")}`.replace(/\/+$/, "");
}

function escapeXml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function sitemapEntry(location: string, options: { lastmod?: string; priority?: string; changefreq?: string } = {}) {
  return [
    "  <url>",
    `    <loc>${escapeXml(location)}</loc>`,
    options.lastmod ? `    <lastmod>${options.lastmod}</lastmod>` : "",
    options.changefreq ? `    <changefreq>${options.changefreq}</changefreq>` : "",
    options.priority ? `    <priority>${options.priority}</priority>` : "",
    "  </url>",
  ].filter(Boolean).join("\n");
}

// Connect to MongoDB Atlas
const MONGODB_URI = process.env.MONGODB_URI;
if (MONGODB_URI) {
  mongoose
    .connect(MONGODB_URI)
    .then(() => console.log("Successfully connected to MongoDB Atlas."))
    .catch((err) => console.error("Error connecting to MongoDB Atlas:", err));
} else {
  console.warn("WARNING: MONGODB_URI is not set in environment variables. Running with DB features disabled.");
}

// ── Live Visitor Tracking (SSE, in-memory) ──────────────────────────────────
const sseClients = new Set<Response>();
let cachedTotalVisitors = 0;
let cachedTotalVisits = 0;

async function getActiveVisitorCount() {
  const activeSince = new Date(Date.now() - 25000);
  return LiveVisitor.countDocuments({
    source: "storefront",
    lastSeen: { $gte: activeSince }
  });
}

function buildCustomerCookie(value: string, maxAgeSeconds: number) {
  const secureFlag = process.env.NODE_ENV === "production" ? "; Secure" : "";
  return `${CUSTOMER_COOKIE_NAME}=${encodeURIComponent(value)}; Max-Age=${maxAgeSeconds}; Path=/; HttpOnly; SameSite=Lax${secureFlag}`;
}

function hashPassword(password: string, salt = crypto.randomBytes(16).toString("hex")) {
  const hash = crypto.pbkdf2Sync(password, salt, 120000, 64, "sha512").toString("hex");
  return { salt, hash };
}

function isStrongPassword(password: string) {
  return password.length >= 8 && /[A-Za-z]/.test(password) && /\d/.test(password);
}

function safeCustomer(account: any) {
  return {
    id: String(account._id),
    name: account.name,
    email: account.email,
    phone: account.phone || "",
    savedAddress: account.savedAddress || {},
    wishlistProductIds: account.wishlistProductIds || [],
    lastLoginAt: account.lastLoginAt,
    createdAt: account.createdAt
  };
}

function csvEscape(value: unknown) {
  const text = String(value ?? "");
  return /[",\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}

function sendCsv(res: Response, filename: string, rows: unknown[][]) {
  res.setHeader("Content-Type", "text/csv; charset=utf-8");
  res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
  res.send(rows.map((row) => row.map(csvEscape).join(",")).join("\n"));
}

async function buildLiveStatsPayload() {
  const analytics = await getSiteAnalytics();
  cachedTotalVisitors = analytics.totalVisitors || 0;
  cachedTotalVisits = analytics.totalVisits || 0;
  return {
    count: await getActiveVisitorCount(),
    totalVisitors: cachedTotalVisitors,
    totalVisits: cachedTotalVisits
  };
}

async function broadcastVisitorCount() {
  const stats = await buildLiveStatsPayload();
  const payload = `data: ${JSON.stringify({
    count: stats.count,
    totalVisitors: stats.totalVisitors,
    totalVisits: stats.totalVisits
  })}\n\n`;
  sseClients.forEach((client) => {
    try { client.write(payload); } catch (_) { /* client gone */ }
  });
}

async function getSiteAnalytics() {
  return Analytics.findOneAndUpdate(
    { key: "site" },
    { $setOnInsert: { totalVisits: 0, totalVisitors: 0, visitorIds: [] } },
    { returnDocument: "after", upsert: true }
  );
}

async function recordSiteVisit(visitorId?: string, shouldCountVisit = false) {
  const normalizedVisitorId = visitorId?.trim().slice(0, 128);
  const analytics = await getSiteAnalytics();

  if (shouldCountVisit) {
    analytics.totalVisits = (analytics.totalVisits || 0) + 1;
  }

  if (normalizedVisitorId && !analytics.visitorIds.includes(normalizedVisitorId)) {
    analytics.visitorIds.push(normalizedVisitorId);
    analytics.totalVisitors = (analytics.totalVisitors || 0) + 1;
  }

  await analytics.save();
  cachedTotalVisitors = analytics.totalVisitors || 0;
  cachedTotalVisits = analytics.totalVisits || 0;
  return analytics;
}

async function recordLiveHeartbeat(activeId: string, source: "storefront" | "admin" = "storefront") {
  const normalizedVisitorId = activeId.trim().slice(0, 128);
  if (!normalizedVisitorId) return;

  await LiveVisitor.findOneAndUpdate(
    { visitorId: normalizedVisitorId },
    {
      visitorId: normalizedVisitorId,
      source,
      lastSeen: new Date()
    },
    { returnDocument: "after", upsert: true }
  );
}

async function getStoreSettings() {
  return StoreSettings.findOneAndUpdate(
    { key: "store" },
    { $setOnInsert: { key: "store" } },
    { returnDocument: "after", upsert: true }
  );
}

async function validateCheckoutDiscount(subTotal: number, discount: number) {
  const settings = await getStoreSettings();
  const normalizedDiscount = Math.max(0, Number(discount || 0));
  if (normalizedDiscount === 0) return { valid: true };

  if (!settings.couponCode || settings.couponDiscountPercent <= 0) {
    return { valid: false, error: "Discount code is not active" };
  }
  if (settings.couponExpiresAt && new Date(settings.couponExpiresAt) < new Date()) {
    return { valid: false, error: "Discount code has expired" };
  }
  if (settings.couponMinOrder > 0 && subTotal < settings.couponMinOrder) {
    return { valid: false, error: `Minimum order for this discount is Rs ${settings.couponMinOrder}` };
  }
  if (settings.couponUsageLimit > 0) {
    const usedCount = await Order.countDocuments({ discount: { $gt: 0 } });
    if (usedCount >= settings.couponUsageLimit) {
      return { valid: false, error: "Discount usage limit reached" };
    }
  }

  const expectedDiscount = Math.round((Number(subTotal || 0) * Number(settings.couponDiscountPercent || 0)) / 100);
  if (Math.abs(expectedDiscount - normalizedDiscount) > 1) {
    return { valid: false, error: "Discount amount does not match active rule" };
  }
  return { valid: true };
}

function campaignIsLive(campaign: any, now = new Date()) {
  if (campaign.status !== "Active") return false;
  if (campaign.startsAt && new Date(campaign.startsAt) > now) return false;
  if (campaign.endsAt && new Date(campaign.endsAt) < now) return false;
  return true;
}

function campaignMatchesItems(campaign: any, items: any[] = [], subTotal = 0) {
  const quantity = items.reduce((sum, item) => sum + Number(item.quantity || 0), 0);
  if (Number(campaign.minItems || 0) > 0 && quantity < Number(campaign.minItems || 0)) return false;
  if (Number(campaign.minCartValue || 0) > 0 && subTotal < Number(campaign.minCartValue || 0)) return false;
  if (campaign.category && campaign.category !== "All") {
    return items.some((item) => item.category === campaign.category || item.productCategory === campaign.category);
  }
  return true;
}

async function getActiveDiscountCampaigns() {
  const campaigns = await DiscountCampaign.find({ status: "Active" }).sort({ updatedAt: -1 }).lean();
  return campaigns.filter((campaign) => campaignIsLive(campaign));
}

async function validateCheckoutDiscountWithCampaigns(subTotal: number, discount: number, items: any[] = []) {
  const couponValidation = await validateCheckoutDiscount(subTotal, discount);
  if (couponValidation.valid) return { valid: true };

  const activeCampaigns = await getActiveDiscountCampaigns();
  const bestCampaignDiscount = activeCampaigns
    .filter((campaign) => campaign.type === "Percent Off" && campaignMatchesItems(campaign, items, subTotal))
    .reduce((best, campaign) => Math.max(best, Math.round((subTotal * Number(campaign.discountPercent || 0)) / 100)), 0);

  if (Math.abs(bestCampaignDiscount - Math.max(0, Number(discount || 0))) <= 1) {
    return { valid: true };
  }

  return couponValidation;
}

function normalizePhone(value: unknown) {
  return String(value || "").replace(/\D/g, "").slice(-10);
}

function buildCustomerKey(customer: { email?: string; phone?: string }) {
  const email = String(customer.email || "").trim().toLowerCase();
  const phone = normalizePhone(customer.phone);
  return email || phone;
}

// ─────────────────────────────────────────────────────────────────────────────

async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT || 3000);

  app.set("trust proxy", true);
  app.disable("x-powered-by");
  app.use(helmet({
    contentSecurityPolicy: {
      useDefaults: true,
      directives: {
        "default-src": ["'self'"],
        "script-src": ["'self'", "'unsafe-inline'", "https://www.googletagmanager.com", "https://www.google-analytics.com", "https://checkout.razorpay.com"],
        "connect-src": ["'self'", "https://www.google-analytics.com", "https://www.googletagmanager.com", "https://checkout.razorpay.com", "https://api.razorpay.com"],
        "img-src": ["'self'", "data:", "blob:", "https:"],
        "style-src": ["'self'", "'unsafe-inline'"],
        "frame-src": ["'self'", "https://api.razorpay.com", "https://checkout.razorpay.com"],
        "object-src": ["'none'"],
        "base-uri": ["'self'"],
        "form-action": ["'self'"]
      }
    },
    crossOriginEmbedderPolicy: false
  }));
  app.use(express.json({ limit: "250kb" }));
  app.use((req: Request, res: Response, next) => {
    if (["POST", "PUT", "PATCH", "DELETE"].includes(req.method) && !isAllowedWriteOrigin(req)) {
      return res.status(403).json({ error: "Invalid request origin" });
    }
    if (req.body && typeof req.body === "object") {
      req.body = sanitizeRequestValue(req.body);
    }
    next();
  });

  const generalApiLimiter = createRateLimiter({ windowMs: 15 * 60 * 1000, max: 450, message: "Too many requests. Please slow down." });
  const authLimiter = createRateLimiter({ windowMs: 15 * 60 * 1000, max: 8, message: "Too many login attempts. Please try again later." });
  const leadLimiter = createRateLimiter({ windowMs: 10 * 60 * 1000, max: 25, message: "Too many submissions. Please try again later." });
  const checkoutLimiter = createRateLimiter({ windowMs: 10 * 60 * 1000, max: 12, message: "Too many checkout attempts. Please try again later." });
  const productViewLimiter = createRateLimiter({ windowMs: 60 * 1000, max: 120, message: "Too many product view updates." });

  app.use("/api", generalApiLimiter);
  app.use(["/api/admin/login", "/api/customer/login", "/api/customer/register", "/api/customer/forgot-password", "/api/customer/reset-password"], authLimiter);
  app.use(["/api/abandoned-carts", "/api/wishlist-leads", "/api/lead-captures", "/api/search-analytics", "/api/testimonials", "/api/experience"], leadLimiter);
  app.use(["/api/checkout", "/api/create-order", "/api/verify-payment"], checkoutLimiter);
  app.use("/api/products/:id/view", productViewLimiter);

  // API Routes
  app.get("/api/store-settings", async (_req: Request, res: Response) => {
    try {
      const settings = await getStoreSettings();
      res.json(settings);
    } catch (error) {
      console.error("Error fetching store settings:", error);
      res.status(500).json({ error: "Failed to fetch store settings" });
    }
  });

  app.get("/api/discount-campaigns/active", async (_req: Request, res: Response) => {
    try {
      res.json(await getActiveDiscountCampaigns());
    } catch (error) {
      console.error("Error fetching active discount campaigns:", error);
      res.status(500).json({ error: "Failed to fetch discount campaigns" });
    }
  });

  app.get("/api/products", async (req: Request, res: Response) => {
    try {
      const products = await Product.find({}).sort({ createdAt: -1 });
      res.json(products);
    } catch (error) {
      console.error("Error fetching products:", error);
      res.status(500).json({ error: "Failed to fetch products from database" });
    }
  });

  app.get("/api/products/:id", async (req: Request, res: Response) => {
    const { id } = req.params;
    try {
      const product = await Product.findOne({ id });
      if (!product) {
        return res.status(404).json({ error: "Product not found" });
      }
      res.json(product);
    } catch (error) {
      console.error(`Error fetching product ${id}:`, error);
      res.status(500).json({ error: "Failed to fetch product from database" });
    }
  });

  app.get("/api/analytics/site", async (req: Request, res: Response) => {
    try {
      const analytics = await getSiteAnalytics();
      cachedTotalVisitors = analytics.totalVisitors || 0;
      cachedTotalVisits = analytics.totalVisits || 0;
      res.json({
        activeVisitors: await getActiveVisitorCount(),
        totalVisitors: cachedTotalVisitors,
        totalVisits: cachedTotalVisits
      });
    } catch (error) {
      console.error("Error fetching site analytics:", error);
      res.status(500).json({ error: "Failed to fetch site analytics" });
    }
  });

  // ── Product View Counter ──────────────────────────────────────────────────
  app.post("/api/products/:id/view", async (req: Request, res: Response) => {
    const { id } = req.params;
    try {
      const product = await Product.findOneAndUpdate(
        { id },
        { $inc: { views: 1 } },
    { returnDocument: "after" }
      );
      if (!product) return res.status(404).json({ error: "Product not found" });
      res.json({ views: product.views ?? 1 });
    } catch (error) {
      console.error(`Error incrementing view for product ${id}:`, error);
      res.status(500).json({ error: "Failed to update view count" });
    }
  });

  // ── SSE: Live Visitor Count ───────────────────────────────────────────────
  app.get("/api/live/visitors", async (req: Request, res: Response) => {
    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");
    res.setHeader("X-Accel-Buffering", "no"); // disable nginx buffering if proxied
    res.flushHeaders();

    const isAdminWatcher = req.query.source === "admin";
    const shouldCountVisit = req.query.visit === "1" && !isAdminWatcher;
    const visitorId = typeof req.query.visitorId === "string" ? req.query.visitorId : undefined;
    const activeId = typeof req.query.activeId === "string" ? req.query.activeId : visitorId;

    try {
      if (shouldCountVisit || visitorId) {
        await recordSiteVisit(visitorId, shouldCountVisit);
        if (!isAdminWatcher && activeId) {
          await recordLiveHeartbeat(activeId);
        }
      } else {
        const analytics = await getSiteAnalytics();
        cachedTotalVisitors = analytics.totalVisitors || 0;
        cachedTotalVisits = analytics.totalVisits || 0;
      }
    } catch (error) {
      console.error("Error recording live visitor analytics:", error);
    }

    sseClients.add(res);
    await broadcastVisitorCount();

    // Keep-alive ping every 25s
    const keepAlive = setInterval(() => {
      try { res.write(": ping\n\n"); } catch (_) { clearInterval(keepAlive); }
    }, 25000);

    req.on("close", () => {
      sseClients.delete(res);
      clearInterval(keepAlive);
      broadcastVisitorCount().catch((error) => console.error("Error broadcasting live visitor count:", error));
    });
  });
  // ─────────────────────────────────────────────────────────────────────────

  const checkAdminAuth = (req: Request, res: Response, next: () => void) => {
    const cookies = parseCookies(req.headers.cookie);
    const token = cookies[ADMIN_COOKIE_NAME];
    if (token && activeAdminSessions.has(token)) {
      next();
    } else {
      res.status(401).json({ error: "Unauthorized access" });
    }
  };

  const getCustomerAccountFromRequest = async (req: Request) => {
    const cookies = parseCookies(req.headers.cookie);
    const token = cookies[CUSTOMER_COOKIE_NAME];
    const accountId = token ? activeCustomerSessions.get(token) : undefined;
    if (!accountId) return null;
    return CustomerAccount.findById(accountId);
  };

  const checkCustomerAuth = async (req: Request, res: Response, next: () => void) => {
    const account = await getCustomerAccountFromRequest(req);
    if (!account) return res.status(401).json({ error: "Customer login required" });
    (req as any).customerAccount = account;
    next();
  };

  app.post("/api/customer/register", async (req: Request, res: Response) => {
    try {
      const name = String(req.body?.name || "").trim().slice(0, 120);
      const email = String(req.body?.email || "").trim().toLowerCase().slice(0, 160);
      const phone = normalizePhone(req.body?.phone);
      const password = String(req.body?.password || "");
      const wishlistProductIds = Array.isArray(req.body?.wishlistProductIds)
        ? req.body.wishlistProductIds.map((id: unknown) => String(id).slice(0, 80)).filter(Boolean)
        : [];

      if (!name || !email.includes("@") || !isStrongPassword(password)) {
        return res.status(400).json({ error: "Name, valid email, and an 8+ character password with letters and numbers are required" });
      }

      const existing = await CustomerAccount.findOne({ email });
      if (existing) return res.status(409).json({ error: "An account already exists with this email" });

      const passwordResult = hashPassword(password);
      const account = await CustomerAccount.create({
        name,
        email,
        phone,
        passwordHash: passwordResult.hash,
        passwordSalt: passwordResult.salt,
        wishlistProductIds,
        lastLoginAt: new Date()
      });

      const token = crypto.randomBytes(32).toString("hex");
      activeCustomerSessions.set(token, String(account._id));
      res.setHeader("Set-Cookie", buildCustomerCookie(token, CUSTOMER_COOKIE_MAX_AGE_SECONDS));
      res.status(201).json({ success: true, customer: safeCustomer(account) });
    } catch (error) {
      console.error("Error registering customer:", error);
      res.status(500).json({ error: "Failed to create customer account" });
    }
  });

  app.post("/api/customer/login", async (req: Request, res: Response) => {
    try {
      const email = String(req.body?.email || "").trim().toLowerCase();
      const password = String(req.body?.password || "");
      const account = await CustomerAccount.findOne({ email });
      if (!account) return res.status(401).json({ error: "Invalid email or password" });

      const passwordResult = hashPassword(password, account.passwordSalt);
      if (!timingSafeStringEqual(passwordResult.hash, account.passwordHash)) {
        return res.status(401).json({ error: "Invalid email or password" });
      }

      account.lastLoginAt = new Date();
      if (Array.isArray(req.body?.wishlistProductIds)) {
        const incoming = req.body.wishlistProductIds.map((id: unknown) => String(id).slice(0, 80)).filter(Boolean);
        account.wishlistProductIds = Array.from(new Set([...(account.wishlistProductIds || []), ...incoming]));
      }
      await account.save();

      const token = crypto.randomBytes(32).toString("hex");
      activeCustomerSessions.set(token, String(account._id));
      res.setHeader("Set-Cookie", buildCustomerCookie(token, CUSTOMER_COOKIE_MAX_AGE_SECONDS));
      res.json({ success: true, customer: safeCustomer(account) });
    } catch (error) {
      console.error("Error logging in customer:", error);
      res.status(500).json({ error: "Failed to log in" });
    }
  });

  app.post("/api/customer/logout", (req: Request, res: Response) => {
    const token = parseCookies(req.headers.cookie)[CUSTOMER_COOKIE_NAME];
    if (token) activeCustomerSessions.delete(token);
    res.setHeader("Set-Cookie", buildCustomerCookie("", 0));
    res.json({ success: true });
  });

  app.get("/api/customer/me", async (req: Request, res: Response) => {
    const account = await getCustomerAccountFromRequest(req);
    if (!account) return res.status(401).json({ error: "Not logged in" });
    res.json({ customer: safeCustomer(account) });
  });

  app.put("/api/customer/profile", checkCustomerAuth, async (req: Request, res: Response) => {
    try {
      const account = (req as any).customerAccount;
      account.name = String(req.body?.name || account.name).trim().slice(0, 120);
      account.phone = normalizePhone(req.body?.phone || account.phone);
      account.savedAddress = {
        firstName: String(req.body?.savedAddress?.firstName || "").trim().slice(0, 80),
        lastName: String(req.body?.savedAddress?.lastName || "").trim().slice(0, 80),
        phone: normalizePhone(req.body?.savedAddress?.phone),
        secondaryPhone: normalizePhone(req.body?.savedAddress?.secondaryPhone),
        address: String(req.body?.savedAddress?.address || "").trim().slice(0, 240),
        city: String(req.body?.savedAddress?.city || "").trim().slice(0, 80),
        postalCode: String(req.body?.savedAddress?.postalCode || "").replace(/\D/g, "").slice(0, 6)
      };
      await account.save();
      res.json({ customer: safeCustomer(account) });
    } catch (error) {
      console.error("Error updating customer profile:", error);
      res.status(500).json({ error: "Failed to update profile" });
    }
  });

  app.put("/api/customer/wishlist", checkCustomerAuth, async (req: Request, res: Response) => {
    try {
      const account = (req as any).customerAccount;
      const ids = Array.isArray(req.body?.productIds)
        ? req.body.productIds.map((id: unknown) => String(id).slice(0, 80)).filter(Boolean)
        : [];
      account.wishlistProductIds = Array.from(new Set(ids));
      await account.save();
      res.json({ customer: safeCustomer(account) });
    } catch (error) {
      console.error("Error syncing customer wishlist:", error);
      res.status(500).json({ error: "Failed to sync wishlist" });
    }
  });

  app.get("/api/customer/orders", checkCustomerAuth, async (req: Request, res: Response) => {
    try {
      const account = (req as any).customerAccount;
      const orders = await Order.find({
        $or: [
          { customerAccountId: String(account._id) },
          { "customer.email": account.email },
          { "customer.phone": account.phone }
        ]
      }).sort({ createdAt: -1 });
      res.json(orders);
    } catch (error) {
      console.error("Error fetching customer orders:", error);
      res.status(500).json({ error: "Failed to fetch orders" });
    }
  });

  app.post("/api/customer/forgot-password", async (req: Request, res: Response) => {
    try {
      const email = String(req.body?.email || "").trim().toLowerCase();
      const account = await CustomerAccount.findOne({ email });
      if (account) {
        const token = crypto.randomBytes(24).toString("hex");
        account.resetTokenHash = crypto.createHash("sha256").update(token).digest("hex");
        account.resetTokenExpiresAt = new Date(Date.now() + 1000 * 60 * 30);
        await account.save();

        const resetUrl = `${getSiteOrigin(req)}/login?resetToken=${token}&email=${encodeURIComponent(email)}`;
        if (resend) {
          await resend.emails.send({
            from: "Saiksha <onboarding@resend.dev>",
            to: email,
            subject: "Reset your Saiksha password",
            html: `<p>Use this link to reset your password:</p><p><a href="${resetUrl}">${resetUrl}</a></p>`
          });
        } else {
          console.log(`Customer password reset link for ${email}: ${resetUrl}`);
        }
      }
      res.json({ success: true });
    } catch (error) {
      console.error("Error requesting password reset:", error);
      res.status(500).json({ error: "Failed to request password reset" });
    }
  });

  app.post("/api/customer/reset-password", async (req: Request, res: Response) => {
    try {
      const email = String(req.body?.email || "").trim().toLowerCase();
      const token = String(req.body?.token || "");
      const password = String(req.body?.password || "");
      if (!isStrongPassword(password)) return res.status(400).json({ error: "Password must be at least 8 characters and include letters and numbers" });
      const tokenHash = crypto.createHash("sha256").update(token).digest("hex");
      const account = await CustomerAccount.findOne({
        email,
        resetTokenHash: tokenHash,
        resetTokenExpiresAt: { $gt: new Date() }
      });
      if (!account) return res.status(400).json({ error: "Reset link is invalid or expired" });
      const passwordResult = hashPassword(password);
      account.passwordHash = passwordResult.hash;
      account.passwordSalt = passwordResult.salt;
      account.resetTokenHash = undefined;
      account.resetTokenExpiresAt = undefined;
      await account.save();
      res.json({ success: true });
    } catch (error) {
      console.error("Error resetting password:", error);
      res.status(500).json({ error: "Failed to reset password" });
    }
  });

  // Admin Login API Route
  app.post("/api/admin/login", (req: Request, res: Response) => {
    const { username, password } = req.body;
    const expectedUsername = process.env.ADMIN_USERNAME || "admin";
    const expectedPassword = process.env.ADMIN_PASSWORD || "admin-saiksha";

    if (timingSafeStringEqual(username, expectedUsername) && timingSafeStringEqual(password, expectedPassword)) {
      const sessionToken = crypto.randomBytes(32).toString("hex");
      activeAdminSessions.add(sessionToken);
      res.setHeader("Set-Cookie", buildAdminCookie(sessionToken, ADMIN_COOKIE_MAX_AGE_SECONDS));
      res.json({ success: true });
    } else {
      res.status(401).json({ success: false, error: "Invalid credentials" });
    }
  });

  app.get("/api/admin/session", checkAdminAuth, (_req: Request, res: Response) => {
    res.json({ success: true });
  });

  app.post("/api/admin/logout", (req: Request, res: Response) => {
    const cookies = parseCookies(req.headers.cookie);
    const token = cookies[ADMIN_COOKIE_NAME];
    if (token) {
      activeAdminSessions.delete(token);
    }
    res.setHeader("Set-Cookie", buildAdminCookie("", 0));
    res.json({ success: true });
  });

  app.put("/api/admin/store-settings", checkAdminAuth, async (req: Request, res: Response) => {
    try {
      const body = req.body || {};
      const normalizePhone = (value: unknown) => String(value || "").replace(/[^\d+]/g, "").slice(0, 20);
      const settingsPayload = {
        storeName: String(body.storeName || "Saiksha").trim().slice(0, 80),
        announcementEnabled: Boolean(body.announcementEnabled),
        announcementText: String(body.announcementText || "").trim().slice(0, 240),
        whatsappNumber: normalizePhone(body.whatsappNumber || "917383055032").replace(/^\+/, ""),
        supportPhone: String(body.supportPhone || "").trim().slice(0, 30),
        supportEmail: String(body.supportEmail || "").trim().slice(0, 120),
        instagramUrl: String(body.instagramUrl || "").trim().slice(0, 240),
        freeShippingThreshold: Math.max(0, Number(body.freeShippingThreshold || 0)),
        couponCode: String(body.couponCode || "").trim().toUpperCase().slice(0, 30),
        couponDiscountPercent: Math.min(100, Math.max(0, Number(body.couponDiscountPercent || 0))),
        couponText: String(body.couponText || "").trim().slice(0, 160),
        shippingNote: String(body.shippingNote || "").trim().slice(0, 220),
        returnPolicy: String(body.returnPolicy || "").trim().slice(0, 260),
        couponMinOrder: Math.max(0, Number(body.couponMinOrder || 0)),
        couponUsageLimit: Math.max(0, Number(body.couponUsageLimit || 0)),
        couponExpiresAt: body.couponExpiresAt ? new Date(body.couponExpiresAt) : undefined,
        cartLeadFollowUpTemplates: Array.isArray(body.cartLeadFollowUpTemplates)
          ? body.cartLeadFollowUpTemplates.slice(0, 5).map((template: any) => ({
              title: String(template.title || "").trim().slice(0, 80),
              message: String(template.message || "").trim().slice(0, 320)
            })).filter((template: any) => template.title && template.message)
          : undefined
      };

      const settings = await StoreSettings.findOneAndUpdate(
        { key: "store" },
        { $set: settingsPayload, $setOnInsert: { key: "store" } },
        { returnDocument: "after", upsert: true }
      );
      res.json(settings);
    } catch (error) {
      console.error("Error updating store settings:", error);
      res.status(500).json({ error: "Failed to update store settings" });
    }
  });

  app.get("/api/admin/discount-campaigns", checkAdminAuth, async (_req: Request, res: Response) => {
    try {
      const campaigns = await DiscountCampaign.find({}).sort({ updatedAt: -1 });
      res.json(campaigns);
    } catch (error) {
      console.error("Error fetching discount campaigns:", error);
      res.status(500).json({ error: "Failed to fetch discount campaigns" });
    }
  });

  app.post("/api/admin/discount-campaigns", checkAdminAuth, async (req: Request, res: Response) => {
    try {
      const body = req.body || {};
      const campaign = await DiscountCampaign.create({
        title: String(body.title || "New Campaign").trim().slice(0, 100),
        type: body.type === "Free Shipping" ? "Free Shipping" : "Percent Off",
        status: body.status === "Active" ? "Active" : "Paused",
        discountPercent: Math.min(100, Math.max(0, Number(body.discountPercent || 0))),
        minCartValue: Math.max(0, Number(body.minCartValue || 0)),
        minItems: Math.max(0, Number(body.minItems || 0)),
        category: ["All", "Earrings", "Necklaces", "Bestsellers", "New Arrivals", "Gifts"].includes(body.category) ? body.category : "All",
        startsAt: body.startsAt ? new Date(body.startsAt) : undefined,
        endsAt: body.endsAt ? new Date(body.endsAt) : undefined,
        badgeText: String(body.badgeText || "").trim().slice(0, 120)
      });
      res.status(201).json(campaign);
    } catch (error) {
      console.error("Error creating discount campaign:", error);
      res.status(500).json({ error: "Failed to create discount campaign" });
    }
  });

  app.put("/api/admin/discount-campaigns/:id", checkAdminAuth, async (req: Request, res: Response) => {
    try {
      const body = req.body || {};
      const campaign = await DiscountCampaign.findByIdAndUpdate(
        req.params.id,
        {
          title: String(body.title || "Campaign").trim().slice(0, 100),
          type: body.type === "Free Shipping" ? "Free Shipping" : "Percent Off",
          status: body.status === "Active" ? "Active" : "Paused",
          discountPercent: Math.min(100, Math.max(0, Number(body.discountPercent || 0))),
          minCartValue: Math.max(0, Number(body.minCartValue || 0)),
          minItems: Math.max(0, Number(body.minItems || 0)),
          category: ["All", "Earrings", "Necklaces", "Bestsellers", "New Arrivals", "Gifts"].includes(body.category) ? body.category : "All",
          startsAt: body.startsAt ? new Date(body.startsAt) : undefined,
          endsAt: body.endsAt ? new Date(body.endsAt) : undefined,
          badgeText: String(body.badgeText || "").trim().slice(0, 120)
        },
        { returnDocument: "after" }
      );
      if (!campaign) return res.status(404).json({ error: "Campaign not found" });
      res.json(campaign);
    } catch (error) {
      console.error("Error updating discount campaign:", error);
      res.status(500).json({ error: "Failed to update discount campaign" });
    }
  });

  app.delete("/api/admin/discount-campaigns/:id", checkAdminAuth, async (req: Request, res: Response) => {
    try {
      const deleted = await DiscountCampaign.findByIdAndDelete(req.params.id);
      if (!deleted) return res.status(404).json({ error: "Campaign not found" });
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting discount campaign:", error);
      res.status(500).json({ error: "Failed to delete discount campaign" });
    }
  });

  app.get("/api/admin/customer-segments", checkAdminAuth, async (_req: Request, res: Response) => {
    try {
      const [orders, cartLeads, wishlistLeads] = await Promise.all([
        Order.find({}).lean(),
        AbandonedCart.find({}).lean(),
        WishlistLead.find({}).lean()
      ]);
      const customers = new Map<string, any>();

      orders.forEach((order: any) => {
        const key = buildCustomerKey(order.customer || {});
        if (!key) return;
        const current = customers.get(key) || {
          key,
          name: `${order.customer?.firstName || ""} ${order.customer?.lastName || ""}`.trim(),
          email: order.customer?.email || "",
          phone: order.customer?.phone || "",
          totalOrders: 0,
          totalSpent: 0,
          wishlistItems: 0,
          cartLeads: 0,
          segments: new Set<string>()
        };
        current.totalOrders += 1;
        current.totalSpent += Number(order.total || 0);
        current.segments.add(current.totalOrders > 1 ? "Repeat Buyers" : "New Customers");
        if (current.totalSpent >= 5000) current.segments.add("High Value");
        customers.set(key, current);
      });

      cartLeads.forEach((lead: any) => {
        const key = buildCustomerKey(lead.customer || {});
        if (!key) return;
        const current = customers.get(key) || {
          key,
          name: lead.customer?.name || "",
          email: lead.customer?.email || "",
          phone: lead.customer?.phone || "",
          totalOrders: 0,
          totalSpent: 0,
          wishlistItems: 0,
          cartLeads: 0,
          segments: new Set<string>()
        };
        current.cartLeads += 1;
        current.segments.add("Cart Abandoned");
        customers.set(key, current);
      });

      wishlistLeads.forEach((lead: any) => {
        const key = buildCustomerKey(lead.customer || {});
        if (!key) return;
        const current = customers.get(key) || {
          key,
          name: lead.customer?.name || "",
          email: lead.customer?.email || "",
          phone: lead.customer?.phone || "",
          totalOrders: 0,
          totalSpent: 0,
          wishlistItems: 0,
          cartLeads: 0,
          segments: new Set<string>()
        };
        current.wishlistItems += Array.isArray(lead.items) ? lead.items.length : 1;
        current.segments.add("Wishlist Users");
        customers.set(key, current);
      });

      const list = Array.from(customers.values()).map((customer) => ({
        ...customer,
        segments: Array.from(customer.segments)
      }));
      const counts = list.reduce<Record<string, number>>((map, customer) => {
        customer.segments.forEach((segment: string) => {
          map[segment] = (map[segment] || 0) + 1;
        });
        return map;
      }, {});
      res.json({ counts, customers: list });
    } catch (error) {
      console.error("Error building customer segments:", error);
      res.status(500).json({ error: "Failed to build customer segments" });
    }
  });

  app.get("/api/admin/review-reminders", checkAdminAuth, async (_req: Request, res: Response) => {
    try {
      const deliveredOrders = await Order.find({ status: "Delivered" }).sort({ updatedAt: -1 }).limit(60).lean();
      res.json(deliveredOrders.map((order: any) => ({
        orderId: order.orderId,
        customerName: `${order.customer?.firstName || ""} ${order.customer?.lastName || ""}`.trim(),
        phone: order.customer?.phone || "",
        email: order.customer?.email || "",
        total: order.total || 0,
        deliveredAt: order.updatedAt || order.createdAt,
        reviewUrl: "/testimonials"
      })));
    } catch (error) {
      console.error("Error fetching review reminders:", error);
      res.status(500).json({ error: "Failed to fetch review reminders" });
    }
  });

  app.get("/api/admin/whatsapp-campaigns", checkAdminAuth, async (_req: Request, res: Response) => {
    try {
      res.json(await WhatsAppCampaign.find({}).sort({ updatedAt: -1 }));
    } catch (error) {
      console.error("Error fetching WhatsApp campaigns:", error);
      res.status(500).json({ error: "Failed to fetch WhatsApp campaigns" });
    }
  });

  app.post("/api/admin/whatsapp-campaigns", checkAdminAuth, async (req: Request, res: Response) => {
    try {
      const body = req.body || {};
      const manualNumbers = String(body.manualNumbers || "")
        .split(/[\n,]/)
        .map(normalizePhone)
        .filter(Boolean);
      const campaign = await WhatsAppCampaign.create({
        title: String(body.title || "WhatsApp Campaign").trim().slice(0, 100),
        fromNumber: normalizePhone(body.fromNumber),
        audience: ["All Customers", "High Value", "Wishlist Users", "Cart Abandoned", "Repeat Buyers", "New Customers", "Manual"].includes(body.audience) ? body.audience : "All Customers",
        manualNumbers,
        message: String(body.message || "").trim().slice(0, 900),
        status: "Prepared",
        preparedCount: manualNumbers.length
      });
      res.status(201).json(campaign);
    } catch (error) {
      console.error("Error creating WhatsApp campaign:", error);
      res.status(500).json({ error: "Failed to create WhatsApp campaign" });
    }
  });

  app.delete("/api/admin/whatsapp-campaigns/:id", checkAdminAuth, async (req: Request, res: Response) => {
    try {
      const deleted = await WhatsAppCampaign.findByIdAndDelete(req.params.id);
      if (!deleted) return res.status(404).json({ error: "Campaign not found" });
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting WhatsApp campaign:", error);
      res.status(500).json({ error: "Failed to delete WhatsApp campaign" });
    }
  });

  // Create Product API Route
  app.post("/api/products", checkAdminAuth, async (req: Request, res: Response) => {
    try {
      const productData = req.body;
      const allProducts = await Product.find({}, { id: 1 });
      const ids = allProducts.map(p => parseInt(p.id, 10)).filter(num => !isNaN(num));
      const nextId = ids.length > 0 ? (Math.max(...ids) + 1).toString() : "1";

      const newProduct = new Product({
        ...productData,
        id: nextId
      });
      await newProduct.save();
      res.status(201).json(newProduct);
    } catch (error) {
      console.error("Error creating product:", error);
      res.status(500).json({ error: "Failed to create product" });
    }
  });

  // Update Product API Route
  app.put("/api/products/:id", checkAdminAuth, async (req: Request, res: Response) => {
    const { id } = req.params;
    try {
      const updatedProduct = await Product.findOneAndUpdate(
        { id },
        { $set: req.body },
        { returnDocument: "after" }
      );
      if (!updatedProduct) {
        return res.status(404).json({ error: "Product not found" });
      }
      res.json(updatedProduct);
    } catch (error) {
      console.error(`Error updating product ${id}:`, error);
      res.status(500).json({ error: "Failed to update product" });
    }
  });

  // Delete Product API Route
  app.delete("/api/products/:id", checkAdminAuth, async (req: Request, res: Response) => {
    const { id } = req.params;
    try {
      const deletedProduct = await Product.findOneAndDelete({ id });
      if (!deletedProduct) {
        return res.status(404).json({ error: "Product not found" });
      }
      res.json({ success: true, message: "Product deleted successfully" });
    } catch (error) {
      console.error(`Error deleting product ${id}:`, error);
      res.status(500).json({ error: "Failed to delete product" });
    }
  });

  app.post("/api/newsletter", async (req: Request, res: Response) => {
    const { email, phone } = req.body;
    console.log(`Newsletter subscription: ${email}, ${phone}`);

    if (resend) {
      try {
        await resend.emails.send({
          from: "Saiksha Jewelry <onboarding@resend.dev>",
          to: ADMIN_EMAIL,
          subject: "New Inner Circle Member!",
          html: `<p>A new user has joined the Inner Circle:</p>
                 <ul>
                   <li><strong>Email:</strong> ${email}</li>
                   <li><strong>Phone:</strong> ${phone}</li>
                 </ul>`,
        });
      } catch (error) {
        console.error("Error sending email:", error);
      }
    } else {
      console.warn("RESEND_API_KEY not set. Email not sent.");
    }

    res.json({ success: true });
  });

  app.post("/api/admin/products/:id/inventory", checkAdminAuth, async (req: Request, res: Response) => {
    const { id } = req.params;
    const change = Number(req.body.change || 0);
    const note = String(req.body.note || "").trim().slice(0, 180);
    try {
      const product = await Product.findOne({ id });
      if (!product) return res.status(404).json({ error: "Product not found" });
      product.stock = Math.max(0, Number(product.stock || 0) + change);
      product.inventoryHistory = [
        { change, stockAfter: product.stock, note, createdAt: new Date() },
        ...((product.inventoryHistory || []) as any[]).slice(0, 24)
      ] as any;
      await product.save();
      res.json(product);
    } catch (error) {
      console.error(`Error adjusting inventory for product ${id}:`, error);
      res.status(500).json({ error: "Failed to adjust inventory" });
    }
  });

  app.post("/api/live/heartbeat", async (req: Request, res: Response) => {
    try {
      const { visitorId, activeId, source = "storefront", visit = false } = req.body || {};
      const normalizedSource = source === "admin" ? "admin" : "storefront";

      if (normalizedSource === "storefront" && typeof visitorId === "string") {
        await recordLiveHeartbeat(typeof activeId === "string" ? activeId : visitorId, normalizedSource);
        await recordSiteVisit(visitorId, !!visit);
      } else {
        const analytics = await getSiteAnalytics();
        cachedTotalVisitors = analytics.totalVisitors || 0;
        cachedTotalVisits = analytics.totalVisits || 0;
      }

      const stats = await buildLiveStatsPayload();
      await broadcastVisitorCount();
      res.json({
        activeVisitors: stats.count,
        totalVisitors: stats.totalVisitors,
        totalVisits: stats.totalVisits
      });
    } catch (error) {
      console.error("Error recording live heartbeat:", error);
      res.status(500).json({ error: "Failed to record live heartbeat" });
    }
  });

  app.post("/api/live/inactive", async (req: Request, res: Response) => {
    try {
      const { activeId } = req.body || {};
      if (typeof activeId === "string" && activeId.trim()) {
        await LiveVisitor.deleteOne({ visitorId: activeId.trim().slice(0, 128) });
      }
      const stats = await buildLiveStatsPayload();
      await broadcastVisitorCount();
      res.json({
        activeVisitors: stats.count,
        totalVisitors: stats.totalVisitors,
        totalVisits: stats.totalVisits
      });
    } catch (error) {
      console.error("Error marking live visitor inactive:", error);
      res.status(500).json({ error: "Failed to mark visitor inactive" });
    }
  });

  app.post("/api/abandoned-carts", async (req: Request, res: Response) => {
    try {
      const { sessionId, customer, items, total } = req.body;
      if (!sessionId || !customer?.name || !customer?.email || !customer?.phone || !Array.isArray(items) || items.length === 0) {
        return res.status(400).json({ error: "Missing cart lead details" });
      }

      const savedCart = await AbandonedCart.findOneAndUpdate(
        { sessionId },
        {
          sessionId,
          customer: {
            name: String(customer.name).trim(),
            email: String(customer.email).trim(),
            phone: String(customer.phone).trim()
          },
          items,
          total: Number(total) || 0,
          status: "Open"
        },
        { returnDocument: "after", upsert: true }
      );

      if (resend) {
        try {
          const itemRows = items.map((item: any) => `
            <tr>
              <td style="padding: 8px 0; border-bottom: 1px solid #f0f0f0;">${item.name}</td>
              <td style="padding: 8px 0; border-bottom: 1px solid #f0f0f0; text-align: center;">${item.quantity}</td>
              <td style="padding: 8px 0; border-bottom: 1px solid #f0f0f0; text-align: right;">₹${Number(item.price || 0).toLocaleString()}</td>
            </tr>
          `).join("");

          await resend.emails.send({
            from: "Saiksha Cart Lead <onboarding@resend.dev>",
            to: ADMIN_EMAIL,
            subject: `[CART LEAD] ${customer.name} saved a bag`,
            html: `
              <div style="font-family: Arial, sans-serif; color: #222; max-width: 620px; margin: 0 auto;">
                <h2 style="font-family: Georgia, serif; color: #0a0a0a;">New Saved Bag Lead</h2>
                <p><strong>Name:</strong> ${customer.name}</p>
                <p><strong>Email:</strong> ${customer.email}</p>
                <p><strong>Phone:</strong> ${customer.phone}</p>
                <table style="width: 100%; border-collapse: collapse; margin-top: 18px; font-size: 13px;">
                  <thead>
                    <tr>
                      <th style="text-align: left; padding-bottom: 8px;">Product</th>
                      <th style="text-align: center; padding-bottom: 8px;">Qty</th>
                      <th style="text-align: right; padding-bottom: 8px;">Price</th>
                    </tr>
                  </thead>
                  <tbody>${itemRows}</tbody>
                </table>
                <p style="font-size: 16px;"><strong>Total:</strong> ₹${Number(total || 0).toLocaleString()}</p>
              </div>
            `
          });
        } catch (emailErr) {
          console.error("Error sending cart lead email:", emailErr);
        }
      }

      res.status(201).json({ success: true, cart: savedCart });
    } catch (error) {
      console.error("Error saving abandoned cart:", error);
      res.status(500).json({ error: "Failed to save cart lead" });
    }
  });

  app.post("/api/wishlist-leads", async (req: Request, res: Response) => {
    try {
      const { sessionId, customer, items } = req.body;
      const cleanSessionId = String(sessionId || "").trim().slice(0, 128);
      const cleanPhone = String(customer?.phone || "").replace(/\D/g, "").slice(-10);
      const cleanItems = Array.isArray(items)
        ? items.slice(0, 20).map((item: any) => ({
            id: String(item.id || "").trim(),
            name: String(item.name || "").trim(),
            price: Number(item.price || 0),
            image: String(item.image || "").trim()
          })).filter((item: any) => item.id && item.name)
        : [];

      if (!cleanSessionId || !customer?.name || !customer?.email || cleanPhone.length !== 10 || cleanItems.length === 0) {
        return res.status(400).json({ error: "Missing required wishlist lead details" });
      }

      const wishlistLead = await WishlistLead.findOneAndUpdate(
        { sessionId: cleanSessionId },
        {
          sessionId: cleanSessionId,
          customer: {
            name: String(customer.name).trim().slice(0, 120),
            email: String(customer.email).trim().toLowerCase().slice(0, 160),
            phone: cleanPhone
          },
          items: cleanItems,
          status: "Open"
        },
        { returnDocument: "after", upsert: true, setDefaultsOnInsert: true }
      );

      res.status(201).json({ success: true, wishlistLead });
    } catch (error) {
      console.error("Error saving wishlist lead:", error);
      res.status(500).json({ error: "Failed to save wishlist lead" });
    }
  });

  app.post("/api/search-analytics", async (req: Request, res: Response) => {
    try {
      const query = String(req.body.query || "").trim().slice(0, 120);
      const normalizedQuery = query.toLowerCase().replace(/\s+/g, " ");
      const resultCount = Math.max(0, Number(req.body.resultCount || 0));
      if (normalizedQuery.length < 2) {
        return res.status(400).json({ error: "Search query too short" });
      }

      const search = await SearchAnalytics.findOneAndUpdate(
        { normalizedQuery },
        {
          $set: { query, resultCount, lastSearchedAt: new Date() },
          $inc: { hits: 1 }
        },
        { returnDocument: "after", upsert: true, setDefaultsOnInsert: true }
      );

      res.status(201).json(search);
    } catch (error) {
      console.error("Error saving search analytics:", error);
      res.status(500).json({ error: "Failed to save search analytics" });
    }
  });

  app.post("/api/lead-captures", async (req: Request, res: Response) => {
    try {
      const body = req.body || {};
      const cleanPhone = String(body.customer?.phone || "").replace(/\D/g, "").slice(-10);
      const cleanEmail = String(body.customer?.email || "").trim().toLowerCase();
      const allowedLeadSources = ["Exit Offer", "First Visit Offer", "Product Inquiry", "Notify Me", "Price Drop Alert", "Checkout Recovery", "WhatsApp Help"] as const;
      const requestedSource = String(body.source || "First Visit Offer").trim().slice(0, 80);
      type LeadSource = typeof allowedLeadSources[number];
      const source: LeadSource = (allowedLeadSources as readonly string[]).includes(requestedSource) ? requestedSource as LeadSource : "First Visit Offer";
      const hasContact = cleanPhone.length === 10 || cleanEmail.includes("@");
      if (!hasContact) {
        return res.status(400).json({ error: "Please provide email or 10-digit mobile number" });
      }

      const lead = await LeadCapture.create({
        source,
        customer: {
          name: String(body.customer?.name || "").trim().slice(0, 120),
          email: cleanEmail,
          phone: cleanPhone
        },
        product: body.product ? {
          id: String(body.product.id || "").trim(),
          name: String(body.product.name || "").trim(),
          price: Number(body.product.price || 0),
          image: String(body.product.image || "").trim()
        } : undefined,
        items: Array.isArray(body.items) ? body.items.slice(0, 20).map((item: any) => ({
          id: String(item.id || "").trim(),
          name: String(item.name || "").trim(),
          price: Number(item.price || 0),
          quantity: Number(item.quantity || 1),
          image: String(item.image || "").trim()
        })) : [],
        message: String(body.message || "").trim().slice(0, 500),
        status: "Open"
      });

      res.status(201).json({ success: true, lead });
    } catch (error) {
      console.error("Error saving lead capture:", error);
      res.status(500).json({ error: "Failed to save lead" });
    }
  });

  // Testimonials API routes
  app.get("/api/testimonials", async (req: Request, res: Response) => {
    try {
      const testimonials = await Testimonial.find({}).sort({ createdAt: -1 });

      res.json(testimonials);
    } catch (error) {
      console.error("Error fetching testimonials:", error);
      res.status(500).json({ error: "Failed to fetch testimonials from database" });
    }
  });

  app.post("/api/testimonials", async (req: Request, res: Response) => {
    try {
      const { author, rating, title, comment, verified, location, productName } = req.body;
      const formattedDate = new Date().toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric"
      });
      
      const newTestimonial = new Testimonial({
        author,
        rating: Number(rating),
        date: formattedDate,
        title,
        comment,
        verified: verified !== undefined ? verified : true,
        location: location || "Verified Collector",
        productName
      });
      
      await newTestimonial.save();

      // Send email if Resend is configured
      if (resend) {
        try {
          await resend.emails.send({
            from: "Saiksha Testimonials <onboarding@resend.dev>",
            to: ADMIN_EMAIL,
            subject: `New Saiksha Testimonial from ${author}!`,
            html: `<p>A collector has shared a new testimonial:</p>
                   <ul>
                     <li><strong>Name:</strong> ${author}</li>
                     <li><strong>Rating:</strong> ${rating} / 5</li>
                     <li><strong>Location:</strong> ${location || "N/A"}</li>
                     <li><strong>Title:</strong> ${title}</li>
                     <li><strong>Comment:</strong> ${comment}</li>
                   </ul>`,
          });
        } catch (emailErr) {
          console.error("Error sending testimonial email:", emailErr);
        }
      }

      res.status(201).json(newTestimonial);
    } catch (error) {
      console.error("Error creating testimonial:", error);
      res.status(500).json({ error: "Failed to save testimonial" });
    }
  });

  app.post("/api/experience", async (req: Request, res: Response) => {
    const { name, email, phone, rating, comment, productName } = req.body;
    console.log(`New Experience Review Submitted:`, { name, email, phone, rating, comment, productName });

    try {
      const formattedDate = new Date().toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric"
      });

      const newTestimonial = new Testimonial({
        author: name,
        rating: Number(rating),
        date: formattedDate,
        title: "Verified Buyer Review",
        comment,
        verified: true,
        location: "Verified Collector",
        productName
      });

      await newTestimonial.save();

      if (resend) {
        try {
          await resend.emails.send({
            from: "Saiksha Reviews <onboarding@resend.dev>",
            to: ADMIN_EMAIL,
            subject: `New Saiksha Experience Review from ${name}!`,
            html: `<div style="font-family: sans-serif; padding: 20px; color: #1a1a1a;">
                     <h2 style="color: #bda88e; border-bottom: 1px solid #eee; padding-bottom: 10px;">New Experience Received</h2>
                     <p>A collector has shared details of their experience with Saiksha:</p>
                     <table style="width: 100%; border-collapse: collapse; margin-top: 15px;">
                       <tr>
                         <td style="padding: 8px 0; border-bottom: 1px solid #f0f0f0; font-weight: bold; width: 150px;">Name:</td>
                         <td style="padding: 8px 0; border-bottom: 1px solid #f0f0f0;">${name}</td>
                       </tr>
                       <tr>
                         <td style="padding: 8px 0; border-bottom: 1px solid #f0f0f0; font-weight: bold;">Email:</td>
                         <td style="padding: 8px 0; border-bottom: 1px solid #f0f0f0;">${email}</td>
                       </tr>
                       ${phone ? `<tr>
                         <td style="padding: 8px 0; border-bottom: 1px solid #f0f0f0; font-weight: bold;">Phone Number:</td>
                         <td style="padding: 8px 0; border-bottom: 1px solid #f0f0f0;">${phone}</td>
                       </tr>` : ""}
                       ${productName ? `<tr>
                         <td style="padding: 8px 0; border-bottom: 1px solid #f0f0f0; font-weight: bold;">Product:</td>
                         <td style="padding: 8px 0; border-bottom: 1px solid #f0f0f0;">${productName}</td>
                       </tr>` : ""}
                       <tr>
                         <td style="padding: 8px 0; border-bottom: 1px solid #f0f0f0; font-weight: bold;">Rating:</td>
                         <td style="padding: 8px 0; border-bottom: 1px solid #f0f0f0; color: #ad854f;">★ ${rating} / 5</td>
                       </tr>
                       <tr>
                         <td style="padding: 8px 0; border-bottom: 1px solid #f0f0f0; font-weight: bold; vertical-align: top;">Comment:</td>
                         <td style="padding: 8px 0; border-bottom: 1px solid #f0f0f0; white-space: pre-wrap;">${comment}</td>
                       </tr>
                     </table>
                   </div>`,
          });
        } catch (error) {
          console.error("Error sending review email:", error);
        }
      }

      res.json({ success: true, testimonial: newTestimonial });
    } catch (dbErr) {
      console.error("Error saving review to database:", dbErr);
      res.status(500).json({ error: "Failed to save experience review to database" });
    }
  });

  app.post("/api/checkout", async (req: Request, res: Response) => {
    try {
      const { customer, items, paymentMethod } = req.body;
      const subTotal = Number(req.body?.subTotal || 0);
      const discount: number = 0;
      const shipping: number = 0;
      const total = Math.max(0, subTotal);
      if (!customer || !customer.firstName || !customer.lastName || !customer.email || !customer.phone || !customer.address || !customer.city || !customer.postalCode || !items || items.length === 0) {
        return res.status(400).json({ error: "Missing required checkout details" });
      }

      const customerAccount = await getCustomerAccountFromRequest(req);

      // Generate random order ID
      const randomSuffix = Math.floor(1000 + Math.random() * 9000); // 4 digit random number
      const orderId = `SAIKSHA-${randomSuffix}`;

      // Save order to MongoDB Atlas
      const newOrder = new Order({
        orderId,
        customer,
        items,
        subTotal,
        discount,
        shipping,
        total,
        paymentMethod,
        status: "Pending",
        customerAccountId: customerAccount ? String(customerAccount._id) : undefined
      });
      await newOrder.save();
      if (customerAccount) {
        customerAccount.savedAddress = {
          firstName: customer.firstName,
          lastName: customer.lastName,
          phone: customer.phone,
          secondaryPhone: customer.secondaryPhone,
          address: customer.address,
          city: customer.city,
          postalCode: customer.postalCode
        };
        await customerAccount.save();
      }

      await AbandonedCart.updateMany(
        {
          $or: [
            { "customer.email": customer.email },
            { "customer.phone": customer.phone }
          ]
        },
        { $set: { status: "Converted" } }
      );

      // Send silent email notification to admin using Resend
      if (resend) {
        try {
          const itemsListHtml = items.map((item: any) => `
            <tr>
              <td style="padding: 10px; border-bottom: 1px solid #f0f0f0;">
                <img src="${item.image}" alt="${item.name}" style="width: 40px; height: 50px; object-fit: cover; border-radius: 4px; vertical-align: middle; margin-right: 10px;" />
                <span style="font-weight: bold; font-size: 13px;">${item.name}</span>
              </td>
              <td style="padding: 10px; border-bottom: 1px solid #f0f0f0; text-align: center; font-size: 13px;">${item.quantity}</td>
              <td style="padding: 10px; border-bottom: 1px solid #f0f0f0; text-align: right; font-size: 13px; font-weight: bold;">₹${item.price.toLocaleString()}</td>
            </tr>
          `).join("");

          const htmlContent = `
            <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: #faf9f6; padding: 30px; color: #1a1a1a;">
              <div style="max-w: 600px; margin: 0 auto; background-color: #ffffff; border: 1px solid #e8e6e1; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.03);">
                <!-- Header -->
                <div style="background-color: #0a0a0a; color: #ffffff; padding: 30px; text-align: center;">
                  <h1 style="margin: 0; font-family: Georgia, serif; font-size: 26px; letter-spacing: 4px; font-weight: normal; color: #fdfbf7;">SAIKSHA JEWELRY</h1>
                  <p style="margin: 5px 0 0 0; font-size: 10px; text-transform: uppercase; letter-spacing: 2px; color: #bda88e;">NEW ORDER RECEIVED</p>
                </div>
                
                <!-- Body Content -->
                <div style="padding: 30px;">
                  <div style="border-bottom: 1px solid #f0f0f0; padding-bottom: 20px; margin-bottom: 25px;">
                    <span style="font-size: 11px; text-transform: uppercase; letter-spacing: 1px; color: #888;">Order ID:</span>
                    <strong style="font-size: 16px; color: #0a0a0a; display: block;">${orderId}</strong>
                  </div>

                  <!-- Customer Details -->
                  <h3 style="font-family: Georgia, serif; border-bottom: 2px solid #bda88e; padding-bottom: 5px; margin-top: 0; font-weight: normal; color: #0a0a0a; font-size: 16px;">Customer Details</h3>
                  <table style="width: 100%; font-size: 13px; border-collapse: collapse; margin-bottom: 25px;">
                    <tr>
                      <td style="padding: 6px 0; color: #666; width: 150px;">Name:</td>
                      <td style="padding: 6px 0; font-weight: bold; color: #0a0a0a;">${customer.firstName} ${customer.lastName}</td>
                    </tr>
                    <tr>
                      <td style="padding: 6px 0; color: #666;">Email:</td>
                      <td style="padding: 6px 0; color: #0a0a0a;">${customer.email}</td>
                    </tr>
                    <tr>
                      <td style="padding: 6px 0; color: #666;">Primary Phone:</td>
                      <td style="padding: 6px 0; font-weight: bold; color: #0a0a0a;">${customer.phone}</td>
                    </tr>
                    ${customer.secondaryPhone ? `
                    <tr>
                      <td style="padding: 6px 0; color: #666;">Secondary Phone:</td>
                      <td style="padding: 6px 0; color: #0a0a0a;">${customer.secondaryPhone}</td>
                    </tr>
                    ` : ""}
                    <tr>
                      <td style="padding: 6px 0; color: #666; vertical-align: top;">Delivery Address:</td>
                      <td style="padding: 6px 0; color: #0a0a0a; line-height: 1.4;">
                        ${customer.address}<br />
                        ${customer.city} - ${customer.postalCode}
                      </td>
                    </tr>
                    <tr>
                      <td style="padding: 6px 0; color: #666;">Payment Method:</td>
                      <td style="padding: 6px 0; font-weight: bold; color: #ad854f; text-transform: uppercase;">${paymentMethod}</td>
                    </tr>
                  </table>

                  <!-- Order Items -->
                  <h3 style="font-family: Georgia, serif; border-bottom: 2px solid #bda88e; padding-bottom: 5px; font-weight: normal; color: #0a0a0a; font-size: 16px; margin-top: 30px;">Selection Summary</h3>
                  <table style="width: 100%; border-collapse: collapse; margin-bottom: 25px;">
                    <thead>
                      <tr style="background-color: #faf9f6; font-size: 11px; text-transform: uppercase; letter-spacing: 1px; color: #888;">
                        <th style="padding: 10px; text-align: left;">Piece Details</th>
                        <th style="padding: 10px; text-align: center;">Qty</th>
                        <th style="padding: 10px; text-align: right;">Price</th>
                      </tr>
                    </thead>
                    <tbody>
                      ${itemsListHtml}
                    </tbody>
                  </table>

                  <!-- Totals -->
                  <div style="background-color: #faf9f6; padding: 20px; border-radius: 6px; font-size: 13px; margin-top: 25px;">
                    <table style="width: 100%; border-collapse: collapse;">
                      <tr>
                        <td style="padding: 4px 0; color: #666;">Subtotal</td>
                        <td style="padding: 4px 0; text-align: right; font-weight: bold; color: #0a0a0a;">₹${subTotal.toLocaleString()}</td>
                      </tr>
                      ${discount && discount > 0 ? `
                      <tr>
                        <td style="padding: 4px 0; color: #666;">UPI Discount (10% Off)</td>
                        <td style="padding: 4px 0; text-align: right; font-weight: bold; color: #2e7d32;">-₹${discount.toLocaleString()}</td>
                      </tr>
                      ` : ""}
                      <tr>
                        <td style="padding: 4px 0; color: #666;">Shipping & Handling</td>
                        <td style="padding: 4px 0; text-align: right; font-weight: bold; color: #ad854f;">${shipping === 0 ? "FREE" : `₹${shipping.toLocaleString()}`}</td>
                      </tr>
                      <tr style="font-size: 16px; border-top: 1px dashed #ddd;">
                        <td style="padding: 12px 0 0 0; font-family: Georgia, serif; font-weight: bold; color: #0a0a0a;">Order Total</td>
                        <td style="padding: 12px 0 0 0; text-align: right; font-weight: bold; color: #0a0a0a;">₹${total.toLocaleString()}</td>
                      </tr>
                    </table>
                  </div>
                  
                  <div style="margin-top: 30px; font-size: 11px; text-align: center; color: #999; border-top: 1px solid #f0f0f0; padding-top: 20px;">
                    This is an automated notification from your Saiksha Online Console. Please update fulfillment status in your admin panel.
                  </div>
                </div>
              </div>
            </div>
          `;

          await resend.emails.send({
            from: "Saiksha Orders <onboarding@resend.dev>",
            to: ADMIN_EMAIL,
            subject: `[NEW ORDER] ${orderId} - ${customer.firstName} ${customer.lastName}`,
            html: htmlContent,
          });
        } catch (emailErr) {
          console.error("Error sending order email:", emailErr);
        }
      } else {
        console.warn("RESEND_API_KEY is not set. Silent checkout email not sent.");
      }

      res.status(201).json({ success: true, orderId, order: newOrder });
    } catch (error) {
      console.error("Error saving checkout order:", error);
      res.status(500).json({ error: "Failed to process checkout order" });
    }
  });

  app.post("/api/create-order", async (req: Request, res: Response) => {
    try {
      const { amount, receipt } = req.body;
      if (!razorpay) {
        return res.status(500).json({ error: "Razorpay is not configured on this server" });
      }
      
      const options = {
        amount: Math.round(amount * 100), // amount in paisa
        currency: "INR",
        receipt: receipt || `rcpt_${Math.floor(Math.random() * 1000000)}`,
      };

      const order = await razorpay.orders.create(options);
      res.json({ success: true, order, key_id: process.env.RAZORPAY_KEY_ID });
    } catch (error: any) {
      console.error("Error creating Razorpay order:", error);
      res.status(500).json({ error: error.message || "Failed to create payment order" });
    }
  });

  app.post("/api/verify-payment", async (req: Request, res: Response) => {
    try {
      const { 
        razorpay_order_id, 
        razorpay_payment_id, 
        razorpay_signature,
        customer,
        items,
        subTotal
      } = req.body;
      const discount: number = 0;
      const shipping: number = 0;
      const total = Math.max(0, Number(subTotal || 0));

      if (!process.env.RAZORPAY_KEY_SECRET) {
        return res.status(500).json({ error: "Razorpay key secret is not configured" });
      }

      // Verify signature
      const generated_signature = crypto
        .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
        .update(razorpay_order_id + "|" + razorpay_payment_id)
        .digest("hex");

      if (generated_signature !== razorpay_signature) {
        return res.status(400).json({ error: "Payment verification failed. Invalid signature." });
      }

      const customerAccount = await getCustomerAccountFromRequest(req);

      // Generate random order ID
      const randomSuffix = Math.floor(1000 + Math.random() * 9000);
      const orderId = `SAIKSHA-${randomSuffix}`;

      // Save order to MongoDB Atlas
      const newOrder = new Order({
        orderId,
        customer,
        items,
        subTotal,
        discount: discount || 0,
        shipping,
        total,
        paymentMethod: "Direct UPI Transfer",
        status: "Confirmed",
        paymentStatus: "Paid",
        razorpayOrderId: razorpay_order_id,
        razorpayPaymentId: razorpay_payment_id,
        razorpaySignature: razorpay_signature,
        customerAccountId: customerAccount ? String(customerAccount._id) : undefined
      });
      await newOrder.save();
      if (customerAccount) {
        customerAccount.savedAddress = {
          firstName: customer.firstName,
          lastName: customer.lastName,
          phone: customer.phone,
          secondaryPhone: customer.secondaryPhone,
          address: customer.address,
          city: customer.city,
          postalCode: customer.postalCode
        };
        await customerAccount.save();
      }

      await AbandonedCart.updateMany(
        {
          $or: [
            { "customer.email": customer.email },
            { "customer.phone": customer.phone }
          ]
        },
        { $set: { status: "Converted" } }
      );

      // Send confirmation email
      if (resend) {
        try {
          const itemsListHtml = items.map((item: any) => `
            <tr>
              <td style="padding: 10px; border-bottom: 1px solid #f0f0f0;">
                <img src="${item.image}" alt="${item.name}" style="width: 40px; height: 50px; object-fit: cover; border-radius: 4px; vertical-align: middle; margin-right: 10px;" />
                <span style="font-weight: bold; font-size: 13px;">${item.name}</span>
              </td>
              <td style="padding: 10px; border-bottom: 1px solid #f0f0f0; text-align: center; font-size: 13px;">${item.quantity}</td>
              <td style="padding: 10px; border-bottom: 1px solid #f0f0f0; text-align: right; font-size: 13px; font-weight: bold;">₹${item.price.toLocaleString()}</td>
            </tr>
          `).join("");

          const htmlContent = `
            <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: #faf9f6; padding: 30px; color: #1a1a1a;">
              <div style="max-w: 600px; margin: 0 auto; background-color: #ffffff; border: 1px solid #e8e6e1; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.03);">
                <!-- Header -->
                <div style="background-color: #0a0a0a; color: #ffffff; padding: 30px; text-align: center;">
                  <h1 style="margin: 0; font-family: Georgia, serif; font-size: 26px; letter-spacing: 4px; font-weight: normal; color: #fdfbf7;">SAIKSHA JEWELRY</h1>
                  <p style="margin: 5px 0 0 0; font-size: 10px; text-transform: uppercase; letter-spacing: 2px; color: #bda88e;">ONLINE ORDER RECEIVED (PAID)</p>
                </div>
                
                <!-- Body Content -->
                <div style="padding: 30px;">
                  <div style="border-bottom: 1px solid #f0f0f0; padding-bottom: 20px; margin-bottom: 25px;">
                    <span style="font-size: 11px; text-transform: uppercase; letter-spacing: 1px; color: #888;">Order ID:</span>
                    <strong style="font-size: 16px; color: #0a0a0a; display: block;">${orderId}</strong>
                    <span style="font-size: 10px; color: #666; display: block; margin-top: 5px;">Payment Ref: ${razorpay_payment_id}</span>
                  </div>

                  <!-- Customer Details -->
                  <h3 style="font-family: Georgia, serif; border-bottom: 2px solid #bda88e; padding-bottom: 5px; margin-top: 0; font-weight: normal; color: #0a0a0a; font-size: 16px;">Customer Details</h3>
                  <table style="width: 100%; font-size: 13px; border-collapse: collapse; margin-bottom: 25px;">
                    <tr>
                      <td style="padding: 6px 0; color: #666; width: 150px;">Name:</td>
                      <td style="padding: 6px 0; font-weight: bold; color: #0a0a0a;">${customer.firstName} ${customer.lastName}</td>
                    </tr>
                    <tr>
                      <td style="padding: 6px 0; color: #666;">Email:</td>
                      <td style="padding: 6px 0; color: #0a0a0a;">${customer.email}</td>
                    </tr>
                    <tr>
                      <td style="padding: 6px 0; color: #666;">Primary Phone:</td>
                      <td style="padding: 6px 0; font-weight: bold; color: #0a0a0a;">${customer.phone}</td>
                    </tr>
                    ${customer.secondaryPhone ? `
                    <tr>
                      <td style="padding: 6px 0; color: #666;">Secondary Phone:</td>
                      <td style="padding: 6px 0; color: #0a0a0a;">${customer.secondaryPhone}</td>
                    </tr>
                    ` : ""}
                    <tr>
                      <td style="padding: 6px 0; color: #666; vertical-align: top;">Delivery Address:</td>
                      <td style="padding: 6px 0; color: #0a0a0a; line-height: 1.4;">
                        ${customer.address}<br />
                        ${customer.city} - ${customer.postalCode}
                      </td>
                    </tr>
                    <tr>
                      <td style="padding: 6px 0; color: #666;">Payment Method:</td>
                      <td style="padding: 6px 0; font-weight: bold; color: #2e7d32; text-transform: uppercase;">ONLINE (PAID)</td>
                    </tr>
                  </table>

                  <!-- Order Items -->
                  <h3 style="font-family: Georgia, serif; border-bottom: 2px solid #bda88e; padding-bottom: 5px; font-weight: normal; color: #0a0a0a; font-size: 16px; margin-top: 30px;">Selection Summary</h3>
                  <table style="width: 100%; border-collapse: collapse; margin-bottom: 25px;">
                    <thead>
                      <tr style="background-color: #faf9f6; font-size: 11px; text-transform: uppercase; letter-spacing: 1px; color: #888;">
                        <th style="padding: 10px; text-align: left;">Piece Details</th>
                        <th style="padding: 10px; text-align: center;">Qty</th>
                        <th style="padding: 10px; text-align: right;">Price</th>
                      </tr>
                    </thead>
                    <tbody>
                      ${itemsListHtml}
                    </tbody>
                  </table>

                  <!-- Totals -->
                  <div style="background-color: #faf9f6; padding: 20px; border-radius: 6px; font-size: 13px; margin-top: 25px;">
                    <table style="width: 100%; border-collapse: collapse;">
                      <tr>
                        <td style="padding: 4px 0; color: #666;">Subtotal</td>
                        <td style="padding: 4px 0; text-align: right; font-weight: bold; color: #0a0a0a;">₹${subTotal.toLocaleString()}</td>
                      </tr>
                      ${discount && discount > 0 ? `
                      <tr>
                        <td style="padding: 4px 0; color: #666;">UPI Discount (10% Off)</td>
                        <td style="padding: 4px 0; text-align: right; font-weight: bold; color: #2e7d32;">-₹${discount.toLocaleString()}</td>
                      </tr>
                      ` : ""}
                      <tr>
                        <td style="padding: 4px 0; color: #666;">Shipping & Handling</td>
                        <td style="padding: 4px 0; text-align: right; font-weight: bold; color: #ad854f;">${shipping === 0 ? "FREE" : `₹${shipping.toLocaleString()}`}</td>
                      </tr>
                      <tr style="font-size: 16px; border-top: 1px dashed #ddd;">
                        <td style="padding: 12px 0 0 0; font-family: Georgia, serif; font-weight: bold; color: #0a0a0a;">Order Total</td>
                        <td style="padding: 12px 0 0 0; text-align: right; font-weight: bold; color: #0a0a0a;">₹${total.toLocaleString()}</td>
                      </tr>
                    </table>
                  </div>
                  
                  <div style="margin-top: 30px; font-size: 11px; text-align: center; color: #999; border-top: 1px solid #f0f0f0; padding-top: 20px;">
                    This is an automated notification from your Saiksha Online Console. Please update fulfillment status in your admin panel.
                  </div>
                </div>
              </div>
            </div>
          `;

          await resend.emails.send({
            from: "Saiksha Orders <onboarding@resend.dev>",
            to: ADMIN_EMAIL,
            subject: `[PAID ORDER] ${orderId} - ${customer.firstName} ${customer.lastName}`,
            html: htmlContent,
          });
        } catch (emailErr) {
          console.error("Error sending paid order email:", emailErr);
        }
      }

      res.json({ success: true, orderId, order: newOrder });
    } catch (error: any) {
      console.error("Error verifying payment signature:", error);
      res.status(500).json({ error: error.message || "Verification failed" });
    }
  });

  // Admin order list API
  app.get("/api/admin/orders", checkAdminAuth, async (req: Request, res: Response) => {
    try {
      const orders = await Order.find({}).sort({ createdAt: -1 });
      res.json(orders);
    } catch (error) {
      console.error("Error fetching orders for admin:", error);
      res.status(500).json({ error: "Failed to fetch orders from database" });
    }
  });

  app.get("/api/happy-customers", async (_req: Request, res: Response) => {
    try {
      const customers = await HappyCustomer.find({ isActive: true }).sort({ sortOrder: 1, createdAt: -1 });
      res.json(customers);
    } catch (error) {
      console.error("Error fetching happy customer gallery:", error);
      res.status(500).json({ error: "Failed to fetch happy customer gallery" });
    }
  });

  app.get("/api/admin/analytics/sales", checkAdminAuth, async (_req: Request, res: Response) => {
    try {
      const orders = await Order.find({}).lean();
      const products = await Product.find({}).lean();
      const completedOrders = orders.filter((order: any) => order.status !== "Cancelled");
      const revenue = completedOrders.reduce((sum: number, order: any) => sum + Number(order.total || 0), 0);
      const averageOrderValue = completedOrders.length ? Math.round(revenue / completedOrders.length) : 0;
      const salesByDay = completedOrders.reduce<Record<string, number>>((map, order: any) => {
        const day = order.createdAt ? new Date(order.createdAt).toISOString().slice(0, 10) : "Unknown";
        map[day] = (map[day] || 0) + Number(order.total || 0);
        return map;
      }, {});
      const salesByProduct = completedOrders.reduce<Record<string, { quantity: number; revenue: number }>>((map, order: any) => {
        (order.items || []).forEach((item: any) => {
          const key = item.name || item.id;
          map[key] = map[key] || { quantity: 0, revenue: 0 };
          map[key].quantity += Number(item.quantity || 0);
          map[key].revenue += Number(item.price || 0) * Number(item.quantity || 0);
        });
        return map;
      }, {});
      res.json({
        revenue,
        averageOrderValue,
        orderCount: completedOrders.length,
        pendingOrders: orders.filter((order: any) => order.status === "Pending").length,
        lowStockCount: products.filter((product: any) => Number(product.stock || 0) <= 5).length,
        salesByDay,
        topProducts: Object.entries(salesByProduct)
          .map(([name, value]) => ({ name, ...value }))
          .sort((a, b) => b.revenue - a.revenue)
          .slice(0, 8)
      });
    } catch (error) {
      console.error("Error building sales analytics:", error);
      res.status(500).json({ error: "Failed to build sales analytics" });
    }
  });

  app.get("/api/admin/export/:type", checkAdminAuth, async (req: Request, res: Response) => {
    try {
      if (req.params.type === "orders") {
        const orders = await Order.find({}).sort({ createdAt: -1 }).lean();
        return sendCsv(res, "orders.csv", [
          ["Order ID", "Customer", "Email", "Phone", "Status", "Payment", "Subtotal", "Discount", "Shipping", "Total", "Created"],
          ...orders.map((order: any) => [
            order.orderId,
            `${order.customer?.firstName || ""} ${order.customer?.lastName || ""}`.trim(),
            order.customer?.email,
            order.customer?.phone,
            order.status,
            order.paymentMethod,
            order.subTotal,
            order.discount || 0,
            order.shipping,
            order.total,
            order.createdAt
          ])
        ]);
      }
      if (req.params.type === "products") {
        const products = await Product.find({}).sort({ createdAt: -1 }).lean();
        return sendCsv(res, "products.csv", [
          ["ID", "Name", "Category", "Price", "Sale Price", "Stock", "Views", "Rating"],
          ...products.map((product: any) => [product.id, product.name, product.category, product.price, product.salePrice || "", product.stock, product.views || 0, product.rating])
        ]);
      }
      if (req.params.type === "customers") {
        const orders = await Order.find({}).lean();
        const leads = await AbandonedCart.find({}).lean();
        const map = new Map<string, any>();
        [...orders, ...leads].forEach((record: any) => {
          const customer = record.customer || {};
          const email = String(customer.email || "").toLowerCase();
          const phone = String(customer.phone || "");
          const key = email || phone;
          if (!key) return;
          const item = map.get(key) || { name: "", email, phone, orders: 0, spent: 0, leads: 0 };
          item.name = item.name || customer.name || `${customer.firstName || ""} ${customer.lastName || ""}`.trim();
          if (record.orderId) {
            item.orders += 1;
            item.spent += Number(record.total || 0);
          } else {
            item.leads += 1;
          }
          map.set(key, item);
        });
        return sendCsv(res, "customers.csv", [
          ["Name", "Email", "Phone", "Orders", "Spent", "Cart Leads"],
          ...Array.from(map.values()).map((customer: any) => [customer.name, customer.email, customer.phone, customer.orders, customer.spent, customer.leads])
        ]);
      }
      res.status(400).json({ error: "Invalid export type" });
    } catch (error) {
      console.error("Error exporting data:", error);
      res.status(500).json({ error: "Failed to export data" });
    }
  });

  app.get("/api/admin/abandoned-carts", checkAdminAuth, async (req: Request, res: Response) => {
    try {
      const carts = await AbandonedCart.find({}).sort({ updatedAt: -1 });
      res.json(carts);
    } catch (error) {
      console.error("Error fetching abandoned carts for admin:", error);
      res.status(500).json({ error: "Failed to fetch cart leads" });
    }
  });

  app.delete("/api/admin/orders/:id", checkAdminAuth, async (req: Request, res: Response) => {
    const { id } = req.params;
    try {
      const deletedOrder = await Order.findOneAndDelete({ orderId: id });
      if (!deletedOrder) {
        return res.status(404).json({ error: "Order not found" });
      }
      res.json({ success: true });
    } catch (error) {
      console.error(`Error deleting order ${id}:`, error);
      res.status(500).json({ error: "Failed to delete order" });
    }
  });

  app.delete("/api/admin/abandoned-carts/:id", checkAdminAuth, async (req: Request, res: Response) => {
    const { id } = req.params;
    try {
      const deletedCart = await AbandonedCart.findByIdAndDelete(id);
      if (!deletedCart) {
        return res.status(404).json({ error: "Cart lead not found" });
      }
      res.json({ success: true });
    } catch (error) {
      console.error(`Error deleting cart lead ${id}:`, error);
      res.status(500).json({ error: "Failed to delete cart lead" });
    }
  });

  app.put("/api/admin/abandoned-carts/:id/status", checkAdminAuth, async (req: Request, res: Response) => {
    const { id } = req.params;
    const { status } = req.body;
    const allowedStatuses = ["Open", "Contacted", "Converted"];
    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({ error: "Invalid cart lead status" });
    }

    try {
      const updatedCart = await AbandonedCart.findByIdAndUpdate(
        id,
        { status },
        { returnDocument: "after" }
      );
      if (!updatedCart) {
        return res.status(404).json({ error: "Cart lead not found" });
      }
      res.json(updatedCart);
    } catch (error) {
      console.error(`Error updating cart lead ${id}:`, error);
      res.status(500).json({ error: "Failed to update cart lead status" });
    }
  });

  app.get("/api/admin/wishlist-leads", checkAdminAuth, async (_req: Request, res: Response) => {
    try {
      const leads = await WishlistLead.find({}).sort({ createdAt: -1 });
      res.json(leads);
    } catch (error) {
      console.error("Error fetching wishlist leads:", error);
      res.status(500).json({ error: "Failed to fetch wishlist leads" });
    }
  });

  app.delete("/api/admin/wishlist-leads/:id", checkAdminAuth, async (req: Request, res: Response) => {
    try {
      const deletedLead = await WishlistLead.findByIdAndDelete(req.params.id);
      if (!deletedLead) return res.status(404).json({ error: "Wishlist lead not found" });
      res.json({ success: true });
    } catch (error) {
      console.error(`Error deleting wishlist lead ${req.params.id}:`, error);
      res.status(500).json({ error: "Failed to delete wishlist lead" });
    }
  });

  app.put("/api/admin/wishlist-leads/:id/status", checkAdminAuth, async (req: Request, res: Response) => {
    const { status } = req.body;
    const allowedStatuses = ["Open", "Contacted", "Converted"];
    if (!allowedStatuses.includes(status)) return res.status(400).json({ error: "Invalid wishlist lead status" });
    try {
      const updatedLead = await WishlistLead.findByIdAndUpdate(req.params.id, { status }, { returnDocument: "after" });
      if (!updatedLead) return res.status(404).json({ error: "Wishlist lead not found" });
      res.json(updatedLead);
    } catch (error) {
      console.error(`Error updating wishlist lead ${req.params.id}:`, error);
      res.status(500).json({ error: "Failed to update wishlist lead status" });
    }
  });

  app.get("/api/admin/search-analytics", checkAdminAuth, async (_req: Request, res: Response) => {
    try {
      const searches = await SearchAnalytics.find({}).sort({ hits: -1, lastSearchedAt: -1 }).limit(100);
      res.json(searches);
    } catch (error) {
      console.error("Error fetching search analytics:", error);
      res.status(500).json({ error: "Failed to fetch search analytics" });
    }
  });

  app.delete("/api/admin/search-analytics/:id", checkAdminAuth, async (req: Request, res: Response) => {
    try {
      const deletedSearch = await SearchAnalytics.findByIdAndDelete(req.params.id);
      if (!deletedSearch) return res.status(404).json({ error: "Search analytics entry not found" });
      res.json({ success: true });
    } catch (error) {
      console.error(`Error deleting search analytics ${req.params.id}:`, error);
      res.status(500).json({ error: "Failed to delete search analytics" });
    }
  });

  app.get("/api/admin/lead-captures", checkAdminAuth, async (_req: Request, res: Response) => {
    try {
      const leads = await LeadCapture.find({}).sort({ createdAt: -1 }).limit(200);
      res.json(leads);
    } catch (error) {
      console.error("Error fetching lead captures:", error);
      res.status(500).json({ error: "Failed to fetch lead captures" });
    }
  });

  app.delete("/api/admin/lead-captures/:id", checkAdminAuth, async (req: Request, res: Response) => {
    try {
      const deletedLead = await LeadCapture.findByIdAndDelete(req.params.id);
      if (!deletedLead) return res.status(404).json({ error: "Lead not found" });
      res.json({ success: true });
    } catch (error) {
      console.error(`Error deleting lead ${req.params.id}:`, error);
      res.status(500).json({ error: "Failed to delete lead" });
    }
  });

  app.put("/api/admin/lead-captures/:id/status", checkAdminAuth, async (req: Request, res: Response) => {
    const { status } = req.body;
    const allowedStatuses = ["Open", "Contacted", "Converted"];
    if (!allowedStatuses.includes(status)) return res.status(400).json({ error: "Invalid lead status" });
    try {
      const updatedLead = await LeadCapture.findByIdAndUpdate(req.params.id, { status }, { returnDocument: "after" });
      if (!updatedLead) return res.status(404).json({ error: "Lead not found" });
      res.json(updatedLead);
    } catch (error) {
      console.error(`Error updating lead ${req.params.id}:`, error);
      res.status(500).json({ error: "Failed to update lead status" });
    }
  });

  // Admin update order status API
  app.put("/api/admin/orders/:id/status", checkAdminAuth, async (req: Request, res: Response) => {
    const { id } = req.params;
    const { status } = req.body;
    try {
      const updatedOrder = await Order.findOneAndUpdate(
        { orderId: id },
        { status },
        { returnDocument: "after" }
      );
      if (!updatedOrder) {
        return res.status(404).json({ error: "Order not found" });
      }
      updatedOrder.timeline = [
        { title: `Status changed to ${status}`, note: "Updated from admin panel.", createdAt: new Date() },
        ...((updatedOrder.timeline || []) as any[]).slice(0, 24)
      ] as any;
      await updatedOrder.save();
      res.json(updatedOrder);
    } catch (error) {
      console.error(`Error updating order status for ${id}:`, error);
      res.status(500).json({ error: "Failed to update order status" });
    }
  });

  app.post("/api/admin/orders/:id/timeline", checkAdminAuth, async (req: Request, res: Response) => {
    const { id } = req.params;
    const title = String(req.body.title || "Admin note").trim().slice(0, 100);
    const note = String(req.body.note || "").trim().slice(0, 400);
    try {
      const order = await Order.findOne({ orderId: id });
      if (!order) return res.status(404).json({ error: "Order not found" });
      order.timeline = [{ title, note, createdAt: new Date() }, ...((order.timeline || []) as any[]).slice(0, 24)] as any;
      await order.save();
      res.json(order);
    } catch (error) {
      console.error(`Error adding order timeline ${id}:`, error);
      res.status(500).json({ error: "Failed to add timeline note" });
    }
  });

  app.put("/api/admin/orders/:id/refund", checkAdminAuth, async (req: Request, res: Response) => {
    const { id } = req.params;
    const status = String(req.body.status || "None");
    const amount = Math.max(0, Number(req.body.amount || 0));
    const reason = String(req.body.reason || "").trim().slice(0, 240);
    const allowed = ["None", "Requested", "Approved", "Rejected", "Refunded"];
    if (!allowed.includes(status)) return res.status(400).json({ error: "Invalid refund status" });
    try {
      const order = await Order.findOne({ orderId: id });
      if (!order) return res.status(404).json({ error: "Order not found" });
      order.refund = { status: status as any, amount, reason, updatedAt: new Date() };
      order.timeline = [
        { title: `Refund ${status}`, note: reason || `Amount: Rs ${amount}`, createdAt: new Date() },
        ...((order.timeline || []) as any[]).slice(0, 24)
      ] as any;
      await order.save();
      res.json(order);
    } catch (error) {
      console.error(`Error updating refund ${id}:`, error);
      res.status(500).json({ error: "Failed to update refund" });
    }
  });

  app.put("/api/admin/customers/:key/meta", checkAdminAuth, async (req: Request, res: Response) => {
    const key = String(req.params.key || "").trim().toLowerCase();
    if (!key) return res.status(400).json({ error: "Customer key required" });
    try {
      const tags = String(req.body.tags || "")
        .split(",")
        .map((tag) => tag.trim())
        .filter(Boolean)
        .slice(0, 12);
      const note = String(req.body.note || "").trim().slice(0, 500);
      const meta = await CustomerMeta.findOneAndUpdate(
        { key },
        {
          key,
          email: String(req.body.email || "").trim().toLowerCase(),
          phone: String(req.body.phone || "").trim(),
          name: String(req.body.name || "").trim(),
          tags,
          note
        },
        { returnDocument: "after", upsert: true }
      );
      res.json(meta);
    } catch (error) {
      console.error(`Error updating customer meta ${key}:`, error);
      res.status(500).json({ error: "Failed to update customer meta" });
    }
  });

  app.get("/api/admin/customers/meta", checkAdminAuth, async (_req: Request, res: Response) => {
    try {
      const metas = await CustomerMeta.find({}).lean();
      res.json(metas);
    } catch (error) {
      console.error("Error fetching customer meta:", error);
      res.status(500).json({ error: "Failed to fetch customer meta" });
    }
  });

  app.get("/api/admin/customer-accounts", checkAdminAuth, async (_req: Request, res: Response) => {
    try {
      const accounts = await CustomerAccount.find({}).sort({ updatedAt: -1 }).lean();
      const orders = await Order.find({}).lean();
      const wishlistLeads = await WishlistLead.find({}).lean();
      const cartLeads = await AbandonedCart.find({}).lean();

      res.json(accounts.map((account: any) => {
        const accountOrders = orders.filter((order: any) =>
          String(order.customerAccountId || "") === String(account._id) ||
          String(order.customer?.email || "").toLowerCase() === String(account.email || "").toLowerCase() ||
          normalizePhone(order.customer?.phone) === normalizePhone(account.phone)
        );
        const accountWishlistLeads = wishlistLeads.filter((lead: any) =>
          String(lead.customer?.email || "").toLowerCase() === String(account.email || "").toLowerCase() ||
          normalizePhone(lead.customer?.phone) === normalizePhone(account.phone)
        );
        const accountCartLeads = cartLeads.filter((lead: any) =>
          String(lead.customer?.email || "").toLowerCase() === String(account.email || "").toLowerCase() ||
          normalizePhone(lead.customer?.phone) === normalizePhone(account.phone)
        );

        return {
          ...safeCustomer(account),
          totalOrders: accountOrders.length,
          lifetimeSpend: accountOrders.reduce((sum: number, order: any) => sum + Number(order.total || 0), 0),
          orderIds: accountOrders.map((order: any) => order.orderId),
          wishlistLeadCount: accountWishlistLeads.length,
          cartLeadCount: accountCartLeads.length
        };
      }));
    } catch (error) {
      console.error("Error fetching customer accounts:", error);
      res.status(500).json({ error: "Failed to fetch customer accounts" });
    }
  });

  // Admin delete testimonial API
  app.delete("/api/admin/testimonials/:id", checkAdminAuth, async (req: Request, res: Response) => {
    const { id } = req.params;
    try {
      const deletedTestimonial = await Testimonial.findByIdAndDelete(id);
      if (!deletedTestimonial) {
        return res.status(404).json({ error: "Testimonial not found" });
      }
      res.json({ success: true, message: "Testimonial deleted successfully" });
    } catch (error) {
      console.error(`Error deleting testimonial ${id}:`, error);
      res.status(500).json({ error: "Failed to delete testimonial" });
    }
  });

  app.get("/robots.txt", (req: Request, res: Response) => {
    const siteOrigin = getSiteOrigin(req);

    res.type("text/plain").send([
      "User-agent: *",
      "Allow: /",
      "Disallow: /api/",
      "Disallow: /admin",
      "Disallow: /account",
      "Disallow: /checkout",
      "Disallow: /cart",
      "Disallow: /wishlist",
      "Disallow: /login",
      "Disallow: /register",
      `Sitemap: ${siteOrigin}/sitemap.xml`,
      "",
    ].join("\n"));
  });

  app.get("/api/admin/happy-customers", checkAdminAuth, async (_req: Request, res: Response) => {
    try {
      const customers = await HappyCustomer.find({}).sort({ sortOrder: 1, createdAt: -1 });
      res.json(customers);
    } catch (error) {
      console.error("Error fetching admin happy customers:", error);
      res.status(500).json({ error: "Failed to fetch happy customers" });
    }
  });

  app.post("/api/admin/happy-customers", checkAdminAuth, async (req: Request, res: Response) => {
    try {
      const body = req.body || {};
      const imageUrl = String(body.imageUrl || "").trim().slice(0, 600);
      if (!imageUrl) return res.status(400).json({ error: "Image URL is required" });

      const customer = await HappyCustomer.create({
        imageUrl,
        description: String(body.description || "").trim().slice(0, 220),
        instagramHandle: String(body.instagramHandle || "").trim().replace(/^@/, "").slice(0, 80),
        instagramUrl: String(body.instagramUrl || "").trim().slice(0, 300),
        isActive: body.isActive !== false,
        sortOrder: Number(body.sortOrder || 0)
      });
      res.status(201).json(customer);
    } catch (error) {
      console.error("Error creating happy customer:", error);
      res.status(500).json({ error: "Failed to create happy customer" });
    }
  });

  app.put("/api/admin/happy-customers/:id", checkAdminAuth, async (req: Request, res: Response) => {
    try {
      const body = req.body || {};
      const imageUrl = String(body.imageUrl || "").trim().slice(0, 600);
      if (!imageUrl) return res.status(400).json({ error: "Image URL is required" });

      const customer = await HappyCustomer.findByIdAndUpdate(
        req.params.id,
        {
          imageUrl,
          description: String(body.description || "").trim().slice(0, 220),
          instagramHandle: String(body.instagramHandle || "").trim().replace(/^@/, "").slice(0, 80),
          instagramUrl: String(body.instagramUrl || "").trim().slice(0, 300),
          isActive: body.isActive !== false,
          sortOrder: Number(body.sortOrder || 0)
        },
        { returnDocument: "after" }
      );
      if (!customer) return res.status(404).json({ error: "Happy customer not found" });
      res.json(customer);
    } catch (error) {
      console.error("Error updating happy customer:", error);
      res.status(500).json({ error: "Failed to update happy customer" });
    }
  });

  app.delete("/api/admin/happy-customers/:id", checkAdminAuth, async (req: Request, res: Response) => {
    try {
      const deleted = await HappyCustomer.findByIdAndDelete(req.params.id);
      if (!deleted) return res.status(404).json({ error: "Happy customer not found" });
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting happy customer:", error);
      res.status(500).json({ error: "Failed to delete happy customer" });
    }
  });

  app.get("/sitemap.xml", async (req: Request, res: Response) => {
    const siteOrigin = getSiteOrigin(req);
    const today = new Date().toISOString().slice(0, 10);

    const entries = PUBLIC_ROUTES.map((route) => sitemapEntry(`${siteOrigin}${route}`, {
      lastmod: today,
      changefreq: route === "/" ? "weekly" : "monthly",
      priority: route === "/" ? "1.0" : "0.8",
    }));
    const categoryRoutes = ["Earrings", "Necklaces", "Bestsellers", "Gifts", "New Arrivals"];
    categoryRoutes.forEach((category) => {
      entries.push(sitemapEntry(`${siteOrigin}/collection?category=${encodeURIComponent(category)}`, {
        lastmod: today,
        changefreq: "weekly",
        priority: "0.85",
      }));
    });

    try {
      const products = await Product.find({}, { id: 1, updatedAt: 1 }).lean();
      products.forEach((product: any) => {
        if (!product.id) return;
        const lastmod = product.updatedAt ? new Date(product.updatedAt).toISOString().slice(0, 10) : today;
        entries.push(sitemapEntry(`${siteOrigin}/product/${encodeURIComponent(product.id)}`, {
          lastmod,
          changefreq: "weekly",
          priority: "0.7",
        }));
      });
    } catch (error) {
      console.error("Error building sitemap product URLs:", error);
    }

    res.setHeader("Cache-Control", "public, max-age=3600");
    res.type("application/xml").send([
      '<?xml version="1.0" encoding="UTF-8"?>',
      '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
      ...entries,
      "</urlset>",
      "",
    ].join("\n"));
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
