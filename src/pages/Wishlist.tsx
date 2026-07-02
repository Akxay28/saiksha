import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Heart, Trash2, ArrowRight, Sparkles, X } from "lucide-react";
import { useWishlist } from "../context/WishlistContext";
import { useCart } from "../context/CartContext";
import { motion, AnimatePresence } from "motion/react";
import { cn } from "../lib/utils";
import ProductCard from "../components/ui/ProductCard";

export default function Wishlist() {
  const { wishlist, saveWishlistLead } = useWishlist();
  const [leadName, setLeadName] = useState("");
  const [leadEmail, setLeadEmail] = useState("");
  const [leadPhone, setLeadPhone] = useState("");
  const [isSavingLead, setIsSavingLead] = useState(false);

  const handleSaveWishlist = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingLead(true);
    const saved = await saveWishlistLead({ name: leadName, email: leadEmail, phone: leadPhone });
    setIsSavingLead(false);
    if (saved) {
      setLeadName("");
      setLeadEmail("");
      setLeadPhone("");
    }
  };

  if (wishlist.length === 0) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center px-6">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center space-y-8 max-w-md"
        >
          <div className="relative inline-block">
            <div className="w-32 h-32 bg-brand-cream rounded-full flex items-center justify-center mx-auto border border-brand-rosegold/10">
              <Heart size={48} className="text-brand-rosegold" />
            </div>
            <motion.div 
              animate={{ 
                scale: [1, 1.2, 1],
              }}
              transition={{ duration: 4, repeat: Infinity }}
              className="absolute -top-2 -right-2 text-brand-rosegold"
            >
              <Sparkles size={24} />
            </motion.div>
          </div>
          
          <div className="space-y-4">
            <h2 className="text-4xl font-serif font-medium text-brand-ink">Your Wishlist is Empty</h2>
            <p className="text-neutral-400 font-light leading-relaxed">
              Saved pieces you love to your wishlist and find them here when you're ready to make them yours.
            </p>
          </div>

          <Link 
            to="/collection" 
            className="inline-flex items-center space-x-3 bg-brand-ink text-white px-10 py-5 text-[11px] uppercase tracking-[3px] font-bold hover:bg-neutral-800 transition-all shadow-xl shadow-brand-ink/10 group"
          >
            <span>Explore Collection</span>
            <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
          </Link>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-6 md:px-10 py-24">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-16">
        <div className="space-y-2">
          <span className="text-[10px] uppercase tracking-[4px] text-brand-rosegold font-bold">Your Favorites</span>
          <h1 className="text-5xl font-serif text-brand-ink">The <span className="text-brand-gradient font-serif tracking-normal italic">Wishlist</span></h1>
        </div>
        <p className="text-neutral-400 text-sm font-light uppercase tracking-widest">{wishlist.length} Saved {wishlist.length === 1 ? "Piece" : "Pieces"}</p>
      </div>

      <form onSubmit={handleSaveWishlist} className="mb-12 rounded-2xl border border-brand-rosegold/20 bg-brand-cream/25 p-5 md:p-6 grid grid-cols-1 lg:grid-cols-[1.2fr_1fr_1fr_1fr_auto] gap-3 items-end">
        <div>
          <p className="text-[10px] uppercase tracking-[3px] font-bold text-brand-rosegold">Wishlist Recovery</p>
          <p className="mt-1 text-xs text-neutral-500">Save these favorites with your details so Saiksha can help you choose later.</p>
        </div>
        <input
          value={leadName}
          onChange={(e) => setLeadName(e.target.value)}
          placeholder="Full name"
          className="rounded-lg border border-neutral-200 bg-white px-3 py-3 text-xs outline-none focus:border-brand-rosegold"
        />
        <input
          type="email"
          value={leadEmail}
          onChange={(e) => setLeadEmail(e.target.value)}
          placeholder="Email"
          className="rounded-lg border border-neutral-200 bg-white px-3 py-3 text-xs outline-none focus:border-brand-rosegold"
        />
        <input
          type="tel"
          value={leadPhone}
          onChange={(e) => setLeadPhone(e.target.value.replace(/\D/g, "").slice(0, 10))}
          placeholder="Mobile"
          className="rounded-lg border border-neutral-200 bg-white px-3 py-3 text-xs outline-none focus:border-brand-rosegold"
        />
        <button
          type="submit"
          disabled={isSavingLead}
          className="rounded-lg bg-brand-ink px-5 py-3 text-[10px] uppercase tracking-widest font-bold text-white hover:bg-neutral-800 disabled:opacity-60 cursor-pointer"
        >
          {isSavingLead ? "Saving" : "Save"}
        </button>
      </form>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-12">
        {wishlist.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </div>
  );
}
