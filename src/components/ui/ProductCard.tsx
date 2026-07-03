import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Eye, Heart, ShoppingBag, Trash2 } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { Product } from "../../types";
import { cn } from "../../lib/utils";
import { useCart } from "../../context/CartContext";
import { useWishlist } from "../../context/WishlistContext";
import { trackMetaEvent } from "../MetaPixel";

interface ProductCardProps {
  product: Product;
  className?: string;
  key?: string | number;
}

export default function ProductCard({ product, className }: ProductCardProps) {
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();
  const [showRemoveModal, setShowRemoveModal] = useState(false);

  const isLiked = isInWishlist(product.id);

  const handleCardClick = () => {
    navigate(`/product/${product.id}`);
  };

  const handleWishlistClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (isLiked) {
      setShowRemoveModal(true);
    } else {
      addToWishlist(product);
    }
  };

  const confirmRemove = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    removeFromWishlist(product.id);
    setShowRemoveModal(false);
  };

  const isOutOfStock = product.stock <= 0;
  const isLowStock = product.stock > 0 && product.stock <= 5;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (isOutOfStock) return;
    addToCart(product);
    trackMetaEvent("AddToCart", {
      content_ids: [product.id],
      content_name: product.name,
      content_type: "product",
      value: product.isSale && product.salePrice ? product.salePrice : product.price,
      currency: "INR",
      contents: [{ id: product.id, quantity: 1 }]
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      onClick={handleCardClick}
      className={cn("group relative flex flex-col gap-4 cursor-pointer", className, isOutOfStock && "opacity-75")}
    >
      {/* Image Container */}
      <div className="relative aspect-[3/4] overflow-hidden bg-brand-cream lg:aspect-[4/5]">
        <img
          src={product.images[0]}
          alt={product.name}
          referrerPolicy="no-referrer"
          className={cn("w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105", isOutOfStock && "filter grayscale-[30%] brightness-[90%]")}
        />

        {/* Sold Out Overlay */}
        {isOutOfStock && (
          <div className="absolute inset-0 bg-white/50 backdrop-blur-[1px] flex items-center justify-center z-10">
            <span className="bg-neutral-900/90 text-white text-[9px] uppercase tracking-[3px] font-bold px-4 py-2 rounded-sm shadow-md">
              Sold Out
            </span>
          </div>
        )}
        
        {/* Actions Overlay */}
        {!isOutOfStock && (
          <div className="absolute inset-x-0 bottom-0 p-4 translate-y-full group-hover:translate-y-0 transition-transform duration-500 z-10 hidden lg:block">
            <button 
              onClick={handleAddToCart}
              className="w-full bg-white/90 backdrop-blur-md text-brand-ink py-3 text-[10px] uppercase tracking-[2px] font-bold hover:bg-brand-ink hover:text-white transition-all flex items-center justify-center space-x-2"
            >
              <ShoppingBag size={14} />
              <span>Add to bag</span>
            </button>
          </div>
        )}

        {/* Mobile quick add */}
        {!isOutOfStock && (
          <button 
            onClick={handleAddToCart}
            className="lg:hidden absolute bottom-2 right-2 bg-white/90 p-2 rounded-full text-brand-ink shadow-sm active:scale-95 transition-transform z-10"
          >
            <ShoppingBag size={14} />
          </button>
        )}
        
        {/* Wishlist Overlay */}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors duration-500" />
        
        <button 
          onClick={handleWishlistClick}
          className={cn(
            "absolute top-4 right-4 z-10 w-9 h-9 flex items-center justify-center rounded-full transition-all duration-300 shadow-md",
            isLiked 
              ? "bg-red-500 text-white scale-110" 
              : "bg-white text-brand-ink opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 hover:bg-neutral-50"
          )}
        >
           <Heart size={16} strokeWidth={isLiked ? 0 : 1.5} className={cn(isLiked && "fill-current")} />
        </button>

        {/* Removal Modal Overlay for this card */}
        <AnimatePresence>
          {showRemoveModal && (
            <div 
              className="fixed inset-0 z-[100] flex items-center justify-center px-6"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
              }}
            >
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 bg-brand-ink/40 backdrop-blur-sm"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setShowRemoveModal(false);
                }}
              />
              <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                className="relative bg-white w-full max-w-sm p-8 rounded-2xl shadow-2xl text-center space-y-6 border border-black/5"
              >
                <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto">
                  <Trash2 size={24} />
                </div>
                
                <div className="space-y-2">
                  <h3 className="text-xl font-serif text-brand-ink">Remove Favorite?</h3>
                  <p className="text-sm text-neutral-400 font-light leading-relaxed">
                    Are you sure you want to remove <span className="font-medium text-brand-ink">"{product.name}"</span> from your wishlist?
                  </p>
                </div>

                <div className="flex flex-col gap-3 pt-2">
                  <button 
                    onClick={confirmRemove}
                    className="w-full bg-red-500 text-white py-4 text-[10px] uppercase tracking-[2px] font-bold hover:bg-red-600 transition-all"
                  >
                    Yes, Remove Piece
                  </button>
                  <button 
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setShowRemoveModal(false);
                    }}
                    className="w-full bg-white text-neutral-400 py-4 text-[10px] uppercase tracking-[2px] font-bold border border-black/5 hover:border-black/10 transition-all"
                  >
                    No, Keep it
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* Badges - Top Left */}
        <div className="absolute top-4 left-4 z-10 flex flex-col gap-1.5 items-start">
          {product.isNew && (
            <span className="bg-brand-rosegold text-white text-[8px] px-2.5 py-1 uppercase tracking-[2px] font-bold shadow-sm rounded-sm">
              New In
            </span>
          )}
          {product.isTrending && (
            <span className="bg-neutral-900 text-white text-[8px] px-2.5 py-1 uppercase tracking-[2px] font-bold shadow-sm rounded-sm">
              Trending
            </span>
          )}
          {product.isLimited && (
            <span className="bg-[#ad854f] text-white text-[8px] px-2.5 py-1 uppercase tracking-[2px] font-bold shadow-sm rounded-sm">
              Limited Edition
            </span>
          )}
          {product.isCustom && (
            <span className="bg-[#5a6e7f] text-white text-[8px] px-2.5 py-1 uppercase tracking-[2px] font-bold shadow-sm rounded-sm">
              {product.customText || "Custom"}
            </span>
          )}
          {product.isSale && (
            <span className="bg-brand-hotpink text-white text-[8px] px-2.5 py-1 uppercase tracking-[2px] font-bold shadow-sm rounded-sm">
              Sale
            </span>
          )}
          {isLowStock && (
            <span className="bg-red-500 text-white text-[8px] px-2.5 py-1 uppercase tracking-[2px] font-bold shadow-sm rounded-sm">
              Only {product.stock} left
            </span>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="space-y-1">
        <div className="flex justify-between items-start gap-2">
          <div className="block max-w-[70%]">
            <h3 className="text-[13px] font-sans text-brand-ink tracking-tight leading-tight">
              {product.name}
            </h3>
          </div>
          <div className="text-right shrink-0">
            {product.isSale && product.salePrice ? (
              <div className="flex items-center gap-1.5 justify-end">
                <span className="text-[11px] text-neutral-400 line-through font-serif">
                  ₹{product.price.toLocaleString()}
                </span>
                <span className="text-[13px] font-serif text-brand-ink font-bold">
                  ₹{product.salePrice.toLocaleString()}
                </span>
              </div>
            ) : (
              <p className="text-[13px] font-serif text-brand-ink">
                ₹{product.price.toLocaleString()}
              </p>
            )}
          </div>
        </div>
        <p className="text-[10px] uppercase tracking-widest text-neutral-400 font-bold">
          {product.category}
        </p>
        {(product.views || 0) > 0 && (
          <div className="flex items-center gap-1.5 text-[10px] text-neutral-400">
            <Eye size={12} className="text-[#a2855b]" />
            <span>{product.views?.toLocaleString()} viewed this piece</span>
          </div>
        )}
        {isLowStock && (
          <p className="text-[10px] uppercase tracking-widest text-red-500 font-bold">
            Selling fast
          </p>
        )}
      </div>
    </motion.div>
  );
}
