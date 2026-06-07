import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Heart, Trash2, ArrowRight, Sparkles, X } from "lucide-react";
import { useWishlist } from "../context/WishlistContext";
import { useCart } from "../context/CartContext";
import { motion, AnimatePresence } from "motion/react";
import { cn } from "../lib/utils";
import ProductCard from "../components/ui/ProductCard";

export default function Wishlist() {
  const { wishlist } = useWishlist();

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

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-12">
        {wishlist.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </div>
  );
}
