import express, { Request, Response } from "express";
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
const ADMIN_COOKIE_MAX_AGE_SECONDS = 60 * 60 * 3;
const PUBLIC_ROUTES = ["/", "/collection", "/testimonials", "/about", "/care-guide", "/contact", "/faq", "/shipping", "/privacy"];
const activeAdminSessions = new Set<string>();

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
let liveVisitorCount = 0;
let cachedTotalVisitors = 0;
let cachedTotalVisits = 0;

function broadcastVisitorCount() {
  const payload = `data: ${JSON.stringify({
    count: liveVisitorCount,
    totalVisitors: cachedTotalVisitors,
    totalVisits: cachedTotalVisits
  })}\n\n`;
  sseClients.forEach((client) => {
    try { client.write(payload); } catch (_) { /* client gone */ }
  });
}

async function getSiteAnalytics() {
  return Analytics.findOneAndUpdate(
    { key: "site" },
    { $setOnInsert: { totalVisits: 0, totalVisitors: 0, visitorIds: [] } },
    { new: true, upsert: true }
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
// ─────────────────────────────────────────────────────────────────────────────

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.set("trust proxy", true);
  app.use(express.json());

  // API Routes
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
        activeVisitors: liveVisitorCount,
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
        { new: true }
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

    try {
      if (shouldCountVisit || visitorId) {
        await recordSiteVisit(visitorId, shouldCountVisit);
      } else {
        const analytics = await getSiteAnalytics();
        cachedTotalVisitors = analytics.totalVisitors || 0;
        cachedTotalVisits = analytics.totalVisits || 0;
      }
    } catch (error) {
      console.error("Error recording live visitor analytics:", error);
    }

    sseClients.add(res);
    if (!isAdminWatcher) {
      liveVisitorCount++;
    }
    broadcastVisitorCount();

    // Keep-alive ping every 25s
    const keepAlive = setInterval(() => {
      try { res.write(": ping\n\n"); } catch (_) { clearInterval(keepAlive); }
    }, 25000);

    req.on("close", () => {
      sseClients.delete(res);
      if (!isAdminWatcher) {
        liveVisitorCount = Math.max(0, liveVisitorCount - 1);
      }
      clearInterval(keepAlive);
      broadcastVisitorCount();
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

  // Admin Login API Route
  app.post("/api/admin/login", (req: Request, res: Response) => {
    const { username, password } = req.body;
    const expectedUsername = process.env.ADMIN_USERNAME || "admin";
    const expectedPassword = process.env.ADMIN_PASSWORD || "admin-saiksha";

    if (username === expectedUsername && password === expectedPassword) {
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
        { new: true, upsert: true }
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
      const { customer, items, subTotal, discount, shipping, total, paymentMethod } = req.body;
      if (!customer || !customer.firstName || !customer.lastName || !customer.email || !customer.phone || !customer.address || !customer.city || !customer.postalCode || !items || items.length === 0) {
        return res.status(400).json({ error: "Missing required checkout details" });
      }

      // Generate random order ID
      const randomSuffix = Math.floor(1000 + Math.random() * 9000); // 4 digit random number
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
        paymentMethod,
        status: "Pending"
      });
      await newOrder.save();

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
        subTotal,
        discount,
        shipping,
        total
      } = req.body;

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
        razorpaySignature: razorpay_signature
      });
      await newOrder.save();

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

  app.get("/api/admin/abandoned-carts", checkAdminAuth, async (req: Request, res: Response) => {
    try {
      const carts = await AbandonedCart.find({}).sort({ updatedAt: -1 });
      res.json(carts);
    } catch (error) {
      console.error("Error fetching abandoned carts for admin:", error);
      res.status(500).json({ error: "Failed to fetch cart leads" });
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
      res.json(updatedOrder);
    } catch (error) {
      console.error(`Error updating order status for ${id}:`, error);
      res.status(500).json({ error: "Failed to update order status" });
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
      `Sitemap: ${siteOrigin}/sitemap.xml`,
      "",
    ].join("\n"));
  });

  app.get("/sitemap.xml", async (req: Request, res: Response) => {
    const siteOrigin = getSiteOrigin(req);
    const today = new Date().toISOString().slice(0, 10);

    const entries = PUBLIC_ROUTES.map((route) => sitemapEntry(`${siteOrigin}${route}`, {
      lastmod: today,
      changefreq: route === "/" ? "weekly" : "monthly",
      priority: route === "/" ? "1.0" : "0.8",
    }));

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
