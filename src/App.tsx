import { BrowserRouter as Router, Routes, Route, Link, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { ShoppingCart, User, Heart, Search, Menu, X, Instagram, Facebook, Twitter, Phone, ArrowRight, Star, Filter, ChevronRight, Plus, Minus, Trash2 } from "lucide-react";
import { Toaster } from "sonner";
import { cn } from "./lib/utils";

// Context
import { CartProvider } from "./context/CartContext";
import { WishlistProvider } from "./context/WishlistContext";
import { ProductProvider } from "./context/ProductContext";

// Components
import Navbar from "./components/layout/Navbar";
import Footer from "./components/layout/Footer";
import GlobalBottomSections from "./components/sections/GlobalBottomSections";
import Home from "./pages/Home";
import Products from "./pages/Products";
import ProductDetail from "./pages/ProductDetail";
import Cart from "./pages/Cart";
import Wishlist from "./pages/Wishlist";
import Checkout from "./pages/Checkout";
import Auth from "./pages/Auth";
import AdminDashboard from "./pages/AdminDashboard";
import Testimonials from "./pages/Testimonials";
import About from "./pages/About";
import CareGuide from "./pages/CareGuide";
import Contact from "./pages/Contact";
import FAQ from "./pages/FAQ";
import NotFound from "./pages/NotFound";
import Privacy from "./pages/Privacy";
import Shipping from "./pages/Shipping";

function ScrollToTop() {
  const { pathname, search } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname, search]);
  return null;
}

export default function App() {
  const [showAdmin, setShowAdmin] = useState(false);

  useEffect(() => {
    const handleOpenAdmin = () => setShowAdmin(true);
    window.addEventListener("open-admin-dashboard", handleOpenAdmin);
    return () => window.removeEventListener("open-admin-dashboard", handleOpenAdmin);
  }, []);

  if (showAdmin) {
    return (
      <ProductProvider>
        <Toaster position="bottom-right" richColors toastOptions={{
          style: {
            fontFamily: "var(--font-sans)",
            borderRadius: "4px",
          }
        }} />
        <AdminDashboard onClose={() => setShowAdmin(false)} />
      </ProductProvider>
    );
  }

  return (
    <Router>
      <ProductProvider>
        <CartProvider>
          <WishlistProvider>
            <ScrollToTop />
            <Toaster position="bottom-right" richColors toastOptions={{
              style: {
                fontFamily: "var(--font-sans)",
                borderRadius: "4px",
              }
            }} />
            <div className="min-h-screen flex flex-col font-sans selection:bg-brand-blush">
              <AnnouncementBar />
              <Navbar />
              
              <main className="flex-grow">
                <Routes>
                  <Route path="/" element={<Home />} />
                  <Route path="/collection" element={<Products />} />
                  <Route path="/product/:id" element={<ProductDetail />} />
                  <Route path="/cart" element={<Cart />} />
                  <Route path="/wishlist" element={<Wishlist />} />
                  <Route path="/checkout" element={<Checkout />} />
                  <Route path="/login" element={<Auth mode="login" />} />
                  <Route path="/register" element={<Auth mode="register" />} />
                  <Route path="/testimonials" element={<Testimonials />} />
                  <Route path="/about" element={<About />} />
                  <Route path="/care-guide" element={<CareGuide />} />
                  <Route path="/contact" element={<Contact />} />
                  <Route path="/faq" element={<FAQ />} />
                  <Route path="/privacy" element={<Privacy />} />
                  <Route path="/shipping" element={<Shipping />} />
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </main>

              <GlobalBottomSections />
              <Footer />
              <WhatsAppButton />
            </div>
          </WishlistProvider>
        </CartProvider>
      </ProductProvider>
    </Router>
  );
}

function AnnouncementBar() {
  return (
    <div className="bg-neutral-900 text-white py-2 overflow-hidden whitespace-nowrap">
      <motion.div
        animate={{ x: ["100%", "-100%"] }}
        transition={{ repeat: Infinity, duration: 20, ease: "linear" }}
        className="inline-block text-xs uppercase tracking-widest font-medium"
      >
        ✨ Free shipping on orders over ₹5,000 • New Collection just launched • Use code SAIKSHA10 for 10% off ✨
      </motion.div>
    </div>
  );
}

function WhatsAppButton() {
  const phoneNumber = "917383055032";
  const message = "Hello Saiksha, I would like to inquire about your jewelry collection.";
  const encodedMessage = encodeURIComponent(message);
  
  return (
    <a
      href={`https://wa.me/${phoneNumber}?text=${encodedMessage}`}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-6 right-6 z-50 bg-[#25D366] text-white p-4 rounded-full shadow-2xl hover:scale-110 transition-transform active:scale-95 group shadow-green-500/20"
      aria-label="Contact us on WhatsApp"
    >
      <svg
        viewBox="0 0 32 32"
        aria-hidden="true"
        className="h-6 w-6 transition-transform group-hover:rotate-12"
        fill="currentColor"
      >
        <path d="M16.04 4C9.41 4 4.02 9.36 4.02 15.94c0 2.09.55 4.12 1.6 5.92L4 28l6.33-1.58a12.1 12.1 0 0 0 5.71 1.45c6.63 0 12.02-5.36 12.02-11.94C28.06 9.36 22.67 4 16.04 4Zm0 21.82c-1.78 0-3.52-.48-5.04-1.39l-.36-.21-3.75.94.96-3.63-.24-.37a9.78 9.78 0 0 1-1.5-5.22c0-5.45 4.46-9.88 9.93-9.88 5.48 0 9.94 4.43 9.94 9.88 0 5.45-4.46 9.88-9.94 9.88Zm5.45-7.38c-.3-.15-1.77-.87-2.04-.97-.27-.1-.47-.15-.67.15-.2.29-.77.96-.94 1.16-.17.2-.35.22-.64.07-.3-.15-1.25-.46-2.38-1.46a8.88 8.88 0 0 1-1.65-2.04c-.17-.29-.02-.45.13-.6.13-.13.3-.35.45-.52.15-.17.2-.29.3-.49.1-.2.05-.37-.03-.52-.07-.15-.67-1.61-.92-2.2-.24-.58-.49-.5-.67-.51h-.57c-.2 0-.52.07-.79.37-.27.29-1.04 1.01-1.04 2.47s1.06 2.87 1.21 3.07c.15.2 2.09 3.17 5.06 4.45.71.3 1.26.48 1.69.62.71.22 1.36.19 1.87.12.57-.08 1.77-.72 2.02-1.42.25-.7.25-1.3.17-1.42-.07-.13-.27-.2-.57-.35Z" />
      </svg>
      <span className="absolute -top-1 -right-1 flex h-4 w-4">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
        <span className="relative inline-flex rounded-full h-4 w-4 bg-green-500"></span>
      </span>
    </a>
  );
}

