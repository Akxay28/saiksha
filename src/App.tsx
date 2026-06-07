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
import Home from "./pages/Home";
import Products from "./pages/Products";
import ProductDetail from "./pages/ProductDetail";
import Cart from "./pages/Cart";
import Wishlist from "./pages/Wishlist";
import Checkout from "./pages/Checkout";
import Auth from "./pages/Auth";
import AdminDashboard from "./pages/AdminDashboard";
import Testimonials from "./pages/Testimonials";

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
                </Routes>
              </main>

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
  const phoneNumber = "916351357299";
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
      <Phone size={24} className="group-hover:rotate-12 transition-transform" />
      <span className="absolute -top-1 -right-1 flex h-4 w-4">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
        <span className="relative inline-flex rounded-full h-4 w-4 bg-green-500"></span>
      </span>
    </a>
  );
}

