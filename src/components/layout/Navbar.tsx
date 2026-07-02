import { useState, useEffect, type FormEvent } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  Heart,
  Search,
  ShoppingCart,
  Menu,
  X,
  User
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { cn } from "../../lib/utils";
import { useCart } from "../../context/CartContext";
import { useWishlist } from "../../context/WishlistContext";
import { useLiveVisitors } from "../../hooks/useLiveVisitors";
import logoImg from "../../assets/images/saiksha-logo-mark.png";
import { useCustomerAuth } from "../../context/CustomerAuthContext";

export default function Navbar() {
  const { cartCount } = useCart();
  const { wishlistCount } = useWishlist();
  const { activeVisitors } = useLiveVisitors();
  const { customer } = useCustomerAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [clickCount, setClickCount] = useState(0);

  const handleSearchSubmit = (e: FormEvent) => {
    e.preventDefault();
    const query = searchTerm.trim();
    if (!query) return;

    setIsSearchOpen(false);
    setIsMobileMenuOpen(false);
    navigate(`/collection?search=${encodeURIComponent(query)}`);
  };

  const handleLogoClick = () => {
    setClickCount((prev) => {
      const next = prev + 1;
      if (next >= 5) {
        window.dispatchEvent(new CustomEvent("open-admin-dashboard"));
        return 0;
      }
      return next;
    });

    if (location.pathname !== "/") {
      navigate("/");
    }
  };

  useEffect(() => {
    if (clickCount > 0) {
      const timer = setTimeout(() => setClickCount(0), 2500);
      return () => clearTimeout(timer);
    }
  }, [clickCount]);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Prevent background scroll when mobile menu is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isMobileMenuOpen]);

  const navLinks = [
    { name: "Home", path: "/" },
    { name: "Earrings", path: "/collection?category=Earrings" },
    { name: "Necklaces", path: "/collection?category=Necklaces" },
    { name: "Bestsellers", path: "/collection?category=Bestsellers" },
    { name: "Gifts", path: "/collection?category=Gifts" },
    { name: "About", path: "/about" },
  ];

  return (
    <>
      <nav
        className={cn(
          "sticky top-0 z-40 w-full bg-white/95 backdrop-blur-md transition-shadow duration-200",
          isScrolled
            ? "shadow-[0_8px_24px_rgba(10,10,10,0.06)]"
            : "shadow-[inset_0_-1px_0_rgba(10,10,10,0.08)]"
        )}
      >
        <div
          className="relative mx-auto flex max-w-7xl items-center justify-between px-6 py-3.5 md:px-10"
        >
          {/* Mobile Menu Trigger */}
          <button 
            className="lg:hidden text-brand-ink p-2 hover:text-brand-hotpink transition-colors"
            onClick={() => setIsMobileMenuOpen(true)}
          >
            <Menu size={24} strokeWidth={1.5} />
          </button>

          {/* Logo */}
          <div 
            onClick={handleLogoClick}
            className="flex items-center gap-2.5 group cursor-pointer select-none"
          >
            <img 
              src={logoImg} 
              alt="Saiksha Logo" 
              className="h-11 w-11 rounded-full object-cover ring-1 ring-brand-rosegold/20 shadow-sm transition-transform duration-200 group-hover:scale-105 md:h-12 md:w-12"
              referrerPolicy="no-referrer"
            />
            <span
              className="font-serif text-lg tracking-[0.2em] text-brand-ink font-bold uppercase transition-colors duration-200 group-hover:text-brand-rosegold md:text-xl"
            >
              SAIKSHA
            </span>
          </div>

          {/* Desktop Nav */}
          <div className="hidden lg:flex items-center gap-9">
            {navLinks.map((link) => {
              const isActive = location.pathname + location.search === link.path;
              return (
                <Link
                  key={link.name}
                  to={link.path}
                  className={cn(
                    "relative whitespace-nowrap uppercase tracking-[2px] font-bold py-1.5 text-[11px] transition-colors duration-200 group",
                    isActive ? "text-brand-rosegold" : "text-brand-ink hover:text-brand-hotpink"
                  )}
                >
                  <span>{link.name}</span>
                  <span 
                    className={cn(
                      "absolute bottom-0 left-1/2 -translate-x-1/2 h-[1px] transition-all duration-300",
                      isActive ? "w-full bg-brand-rosegold" : "w-0 group-hover:w-full bg-brand-hotpink"
                    )} 
                  />
                </Link>
              );
            })}
          </div>

          {/* Icons */}
          <div className="flex items-center space-x-4 md:space-x-6">
            {activeVisitors > 0 && (
              <div
                className={cn(
                  "hidden xl:flex items-center gap-1.5 rounded-full border border-green-100 bg-green-50/80 px-2.5 py-1 text-[10px] font-semibold tracking-normal text-neutral-650 shadow-sm",
                  isScrolled && "border-neutral-100 bg-white"
                )}
                title={`${activeVisitors} active ${activeVisitors === 1 ? "visitor" : "visitors"} on the website`}
              >
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-50" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-green-500" />
                </span>
                <span>{activeVisitors} active</span>
              </div>
            )}
            <button
              type="button"
              onClick={() => setIsSearchOpen((current) => !current)}
              className="text-brand-ink hover:text-brand-hotpink transition-colors hidden sm:block"
              aria-label="Search products"
            >
              <Search size={21} strokeWidth={1.2} />
            </button>
            <Link to="/wishlist" className="text-brand-ink hover:text-brand-hotpink transition-colors relative group">
              <Heart 
                size={21} 
                strokeWidth={1.2} 
                className={cn(
                  "transition-all duration-300 group-hover:scale-110",
                  wishlistCount > 0 && "fill-brand-rosegold text-brand-rosegold"
                )} 
              />
              {wishlistCount > 0 && (
                <span className="absolute -top-1.5 -right-2 bg-brand-hotpink text-white text-[8px] tracking-tight w-4.5 h-4.5 rounded-full flex items-center justify-center font-bold shadow-[0_2px_8px_rgba(233,30,140,0.3)] animate-pulse">
                  {wishlistCount}
                </span>
              )}
            </Link>
            <Link to={customer ? "/account" : "/login"} className="text-brand-ink hover:text-brand-hotpink transition-colors relative group" title={customer ? "My account" : "Login"}>
              <User size={21} strokeWidth={1.2} className={cn("transition-all duration-300 group-hover:scale-110", customer && "text-brand-rosegold")} />
            </Link>
            <Link to="/cart" className="text-brand-ink hover:text-brand-hotpink transition-colors relative group">
              <ShoppingCart size={21} strokeWidth={1.2} className="transition-all duration-300 group-hover:scale-110" />
              {cartCount > 0 && (
                <span className="absolute -top-1.5 -right-2 bg-brand-deepblack text-white text-[8px] tracking-tight w-4.5 h-4.5 rounded-full flex items-center justify-center font-bold border border-white">
                  {cartCount}
                </span>
              )}
            </Link>
          </div>
        </div>

        <AnimatePresence>
          {isSearchOpen && (
            <motion.form
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              onSubmit={handleSearchSubmit}
              className="mx-auto max-w-7xl px-6 md:px-10 pt-4"
            >
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400" size={16} />
                <input
                  autoFocus
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search earrings, necklaces, gifts, or product name"
                  className="w-full border border-black/10 bg-white pl-11 pr-12 py-3.5 text-sm outline-none focus:border-brand-rosegold rounded-sm"
                />
                <button
                  type="button"
                  onClick={() => setIsSearchOpen(false)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-2 text-neutral-400 hover:text-brand-ink"
                  aria-label="Close search"
                >
                  <X size={16} />
                </button>
              </div>
            </motion.form>
          )}
        </AnimatePresence>
      </nav>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileMenuOpen(false)}
              className="fixed inset-0 bg-black/60 z-[100] lg:hidden"
            />
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed inset-y-0 left-0 w-[300px] h-full bg-white z-[101] lg:hidden shadow-2xl p-8 flex flex-col"
            >
              <div className="flex items-center justify-between mb-12">
                <Link to="/" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center gap-2">
                  <img 
                    src={logoImg} 
                    alt="Saiksha Logo" 
                    className="h-10 w-10 rounded-full object-cover ring-1 ring-brand-rosegold/20"
                    referrerPolicy="no-referrer"
                  />
                  <span className="font-serif text-xl font-bold tracking-wider text-neutral-900">SAIKSHA</span>
                </Link>
                <button 
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="text-neutral-500 p-2"
                >
                  <X size={24} />
                </button>
              </div>

              <div className="flex flex-col space-y-6">
                <form onSubmit={handleSearchSubmit} className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" size={15} />
                  <input
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search jewelry"
                    className="w-full border border-black/10 pl-10 pr-3 py-3 text-sm outline-none focus:border-brand-rosegold rounded-sm"
                  />
                </form>
                {navLinks.map((link) => (
                  <Link
                    key={link.name}
                    to={link.path}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="block text-xl font-serif hover:text-brand-rosegold transition-colors"
                  >
                    {link.name}
                  </Link>
                ))}
              </div>

              <div className="mt-auto border-t border-black/5 pt-8">
                <div className="flex flex-col space-y-4">
                  <Link 
                    to="/wishlist" 
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex items-center space-x-3 text-neutral-600 hover:text-brand-ink"
                  >
                    <Heart size={20} className={cn(wishlistCount > 0 && "fill-brand-rosegold text-brand-rosegold")} />
                    <span className="text-sm uppercase tracking-widest font-bold">Wishlist ({wishlistCount})</span>
                  </Link>
                  <Link
                    to={customer ? "/account" : "/login"}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex items-center space-x-3 text-neutral-600 hover:text-brand-ink"
                  >
                    <User size={20} className={cn(customer && "text-brand-rosegold")} />
                    <span className="text-sm uppercase tracking-widest font-bold">{customer ? "My Account" : "Login"}</span>
                  </Link>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
