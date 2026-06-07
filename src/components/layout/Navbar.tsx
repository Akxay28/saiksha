import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { ShoppingCart, Heart, Search, Menu, X } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { cn } from "../../lib/utils";
import { useCart } from "../../context/CartContext";
import { useWishlist } from "../../context/WishlistContext";
import logoImg from "../../assets/images/saiksha_logo_1780685763441.png";

export default function Navbar() {
  const { cartCount } = useCart();
  const { wishlistCount } = useWishlist();
  const location = useLocation();
  const navigate = useNavigate();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [clickCount, setClickCount] = useState(0);

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
    { name: "Best Sellers", path: "/collection?category=Bestsellers" },
    { name: "Gifts", path: "/collection?category=Gifts" },
  ];

  return (
    <>
      <nav
        className={cn(
          "sticky top-0 z-40 w-full transition-all duration-500 bg-white/95 backdrop-blur-md border-b border-brand-ink/10",
          isScrolled ? "py-2.5 shadow-[0_4px_30px_rgba(0,0,0,0.015)]" : "py-4"
        )}
      >
        <div className="max-w-7xl mx-auto px-6 md:px-10 flex items-center justify-between">
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
              className="h-10 w-10 md:h-12 md:w-12 object-contain transition-transform duration-500 group-hover:scale-105"
              referrerPolicy="no-referrer"
            />
            <span className="text-lg md:text-xl font-serif tracking-[0.2em] text-brand-ink font-bold uppercase transition-colors group-hover:text-brand-rosegold">
              SAIKSHA
            </span>
          </div>

          {/* Desktop Nav */}
          <div className="hidden lg:flex items-center space-x-10">
            {navLinks.map((link) => {
              const isActive = location.pathname + location.search === link.path;
              return (
                <Link
                  key={link.name}
                  to={link.path}
                  className={cn(
                    "relative text-[11px] uppercase tracking-[2px] font-bold py-1.5 transition-all duration-300 group",
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
            <button className="text-brand-ink hover:text-brand-hotpink transition-colors hidden sm:block">
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
                    className="h-9 w-9 object-contain"
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
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
