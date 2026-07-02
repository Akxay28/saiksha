# Deployment Checklist

This project needs a Node.js server deployment, not only static hosting.

## Build and start

```bash
npm install
npm run build
npm start
```

The production server runs `dist/server.cjs` and serves both:

- the React storefront/admin UI
- the Express API routes under `/api/*`

## Required environment variables

Set these on the hosting platform:

```bash
APP_URL=https://your-domain.com
MONGODB_URI=your_mongodb_atlas_connection_string
ADMIN_USERNAME=your_admin_username
ADMIN_PASSWORD=your_strong_admin_password
```

Recommended:

```bash
RESEND_API_KEY=your_resend_key
ADMIN_EMAIL=your_admin_email
RAZORPAY_KEY_ID=your_razorpay_key
RAZORPAY_KEY_SECRET=your_razorpay_secret
```

Most hosts set `PORT` automatically. The server now uses `process.env.PORT || 3000`.

## Features that require MongoDB

These features will only persist after deployment when `MONGODB_URI` is set:

- products
- orders
- customers
- cart leads
- wishlist leads
- search analytics
- product views
- live visitor tracking
- store settings
- coupons and discount rules
- inventory history
- order timeline/refund records
- testimonials

## Hosting note

Use a Node-capable host such as Render, Railway, Fly.io, a VPS, or any platform that can run `npm start`.

Static-only Netlify deployment will not run the Express server by itself. If using Netlify, the API must be converted to Netlify Functions or deployed separately as a backend service.
