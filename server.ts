import express, { Request, Response } from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { Resend } from "resend";
import dotenv from "dotenv";
import mongoose from "mongoose";
import Product from "./server/models/Product";
import Testimonial from "./server/models/Testimonial";
import dns from "dns";

dns.setServers(["8.8.8.8", "1.1.1.1"]);

dotenv.config();

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "swatipaul285@gmail.com";
const ADMIN_COOKIE_NAME = "saiksha_admin_auth";
const ADMIN_COOKIE_MAX_AGE_SECONDS = 60 * 60 * 3;
const PUBLIC_ROUTES = ["/", "/collection", "/testimonials"];

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

  // Admin Authentication Middleware
  const checkAdminAuth = (req: Request, res: Response, next: () => void) => {
    const cookies = parseCookies(req.headers.cookie);
    const token = cookies[ADMIN_COOKIE_NAME];
    const expectedPassword = process.env.ADMIN_PASSWORD || "admin-saiksha";
    if (token === expectedPassword) {
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
      res.setHeader("Set-Cookie", buildAdminCookie(expectedPassword, ADMIN_COOKIE_MAX_AGE_SECONDS));
      res.json({ success: true });
    } else {
      res.status(401).json({ success: false, error: "Invalid credentials" });
    }
  });

  app.get("/api/admin/session", checkAdminAuth, (_req: Request, res: Response) => {
    res.json({ success: true });
  });

  app.post("/api/admin/logout", (_req: Request, res: Response) => {
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
