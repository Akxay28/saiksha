import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { Trash2, Plus, Minus, ArrowRight, ShoppingBag, ShieldCheck, Truck, Sparkles, ReceiptText } from "lucide-react";
import { useCart } from "../context/CartContext";
import { useProducts } from "../context/ProductContext";
import { cn } from "../lib/utils";
import { motion } from "motion/react";

export default function Cart() {
  const { cart, addToCart, removeFromCart, updateQuantity, cartTotal } = useCart();
  const { products } = useProducts();

  const shipping: number = 0;
  const total = cartTotal + shipping;
  const cartIds = new Set(cart.map((item) => item.id));
  const recommendedProducts = products
    .filter((product) => !cartIds.has(product.id) && product.stock > 0)
    .slice(0, 4);

  const navigate = useNavigate();

  const handleCheckout = () => {
    if (cart.length === 0) return;
    navigate("/checkout");
  };

  if (cart.length === 0) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center px-6">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center space-y-8 max-w-md"
        >
          <div className="relative inline-block">
            <div className="w-32 h-32 bg-brand-cream rounded-full flex items-center justify-center mx-auto border border-brand-rosegold/10">
              <ShoppingBag size={48} className="text-brand-rosegold" />
            </div>
            <motion.div 
              animate={{ 
                scale: [1, 1.2, 1],
                rotate: [0, 10, -10, 0]
              }}
              transition={{ duration: 4, repeat: Infinity }}
              className="absolute -top-2 -right-2 text-brand-rosegold"
            >
              <Sparkles size={24} />
            </motion.div>
          </div>
          
          <div className="space-y-4">
            <h2 className="text-4xl font-serif font-medium text-brand-ink">Your Gallery is Empty</h2>
            <p className="text-neutral-400 font-light leading-relaxed">
              Discover our signature pieces and begin curating your personal collection today.
            </p>
          </div>

          <Link 
            to="/collection" 
            className="inline-flex items-center space-x-3 bg-brand-ink text-white px-10 py-5 text-[11px] uppercase tracking-[3px] font-bold hover:bg-neutral-800 transition-all shadow-xl shadow-brand-ink/10 group"
          >
            <span>Begin Shopping</span>
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
          <span className="text-[10px] uppercase tracking-[4px] text-brand-rosegold font-bold">Shopping Bag</span>
          <h1 className="text-5xl font-serif text-brand-ink">Your <span className="text-brand-gradient font-serif tracking-normal italic">Selection</span></h1>
        </div>
        <p className="text-neutral-400 text-sm font-light uppercase tracking-widest">{cart.length} Designer {cart.length === 1 ? "Piece" : "Pieces"}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-20">
        {/* Items List */}
        <div className="lg:col-span-7 space-y-10">
          {cart.map((item, idx) => (
            <motion.div 
              key={item.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="group flex gap-8 pb-10 border-b border-black/5 last:border-0"
            >
              <div className="w-32 sm:w-44 aspect-[4/5] bg-brand-cream rounded-sm overflow-hidden shrink-0 border border-black/5 relative">
                <img 
                  src={item.images[0]} 
                  alt={item.name} 
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105" 
                />
              </div>
              
              <div className="flex-grow flex flex-col pt-2">
                <div className="flex justify-between items-start mb-4">
                  <div className="space-y-1">
                    <span className="text-[10px] uppercase tracking-widest font-bold text-brand-rosegold/60">{item.category}</span>
                    <h3 className="text-xl font-serif text-brand-ink">{item.name}</h3>
                  </div>
                  <p className="text-lg font-sans font-medium text-brand-ink">₹{item.price.toLocaleString()}</p>
                </div>

                <div className="mt-auto flex items-center justify-between">
                  <div className="flex items-center bg-brand-cream/50 border border-black/5 rounded-sm p-1">
                    <button 
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      className="p-1.5 text-neutral-400 hover:text-brand-ink transition-colors"
                    >
                      <Minus size={14} />
                    </button>
                    <span className="w-8 text-center font-bold text-brand-ink text-xs">{item.quantity}</span>
                    <button 
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      className="p-1.5 text-neutral-400 hover:text-brand-ink transition-colors"
                    >
                      <Plus size={14} />
                    </button>
                  </div>

                  <button 
                    onClick={() => removeFromCart(item.id)}
                    className="flex items-center space-x-2 text-red-500 hover:text-red-700 transition-colors py-2 cursor-pointer"
                  >
                    <Trash2 size={16} />
                    <span className="text-[10px] uppercase tracking-widest font-bold">Remove</span>
                  </button>
                </div>
              </div>
            </motion.div>
          ))}

          {recommendedProducts.length > 0 && (
            <section className="pt-6">
              <div className="flex items-end justify-between gap-6 mb-6">
                <div className="space-y-1">
                  <span className="text-[10px] uppercase tracking-[3px] text-brand-rosegold font-bold">Complete The Look</span>
                  <h2 className="text-2xl font-serif text-brand-ink">You may also love</h2>
                </div>
                <Link to="/collection" className="hidden sm:inline-flex text-[10px] uppercase tracking-[2px] font-bold text-neutral-400 hover:text-brand-ink border-b border-transparent hover:border-brand-ink pb-1">
                  View all
                </Link>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {recommendedProducts.map((product) => (
                  <motion.div
                    key={product.id}
                    initial={{ opacity: 0, y: 14 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="group"
                  >
                    <Link to={`/product/${product.id}`} className="block">
                      <div className="relative aspect-[3/4] overflow-hidden bg-brand-cream rounded-sm border border-black/5">
                        <img
                          src={product.images[0]}
                          alt={product.name}
                          referrerPolicy="no-referrer"
                          className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                        />
                        <div className="absolute inset-x-0 bottom-0 translate-y-full group-hover:translate-y-0 transition-transform duration-300 p-2">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.preventDefault();
                              addToCart(product);
                            }}
                            className="w-full bg-white/95 text-brand-ink py-2 text-[9px] uppercase tracking-[1.5px] font-bold shadow-sm hover:bg-brand-ink hover:text-white transition-colors"
                          >
                            Add
                          </button>
                        </div>
                      </div>
                      <div className="pt-3 space-y-1">
                        <p className="text-xs font-serif text-brand-ink leading-tight line-clamp-2">{product.name}</p>
                        <p className="text-[10px] uppercase tracking-widest text-neutral-400">{product.category}</p>
                        <p className="text-xs font-bold text-brand-ink">
                          ₹{(product.isSale && product.salePrice ? product.salePrice : product.price).toLocaleString()}
                        </p>
                      </div>
                    </Link>
                  </motion.div>
                ))}
              </div>
            </section>
          )}
        </div>

        {/* Summary Card */}
        <aside className="lg:col-span-5">
          <div className="bg-white rounded-2xl p-10 shadow-2xl shadow-black/5 border border-black/5 sticky top-28 space-y-8">
            <h3 className="text-2xl font-serif text-brand-ink flex items-center gap-3">
              <ReceiptText size={20} className="text-brand-rosegold" />
              Order Summary
            </h3>
            
            <div className="space-y-5">
              <div className="flex justify-between text-neutral-400 text-sm font-light">
                <span>Selection Subtotal</span>
                <span className="text-brand-ink font-medium">₹{cartTotal.toLocaleString()}</span>
              </div>
              
              <div className="pt-6 border-t border-black/5 flex justify-between">
                <div>
                  <span className="text-brand-ink font-serif text-2xl">Total</span>
                  <p className="text-[10px] text-neutral-400 uppercase tracking-widest mt-1">Gems & Taxes Included</p>
                </div>
                <span className="text-3xl font-sans font-bold text-brand-ink">₹{total.toLocaleString()}</span>
              </div>
            </div>

            <button 
              onClick={handleCheckout}
              className="w-full bg-brand-ink text-white py-5 px-8 text-[11px] uppercase tracking-[3px] font-bold hover:bg-neutral-800 transition-all shadow-2xl shadow-brand-ink/10 flex items-center justify-center space-x-4 group"
            >
              <span>Proceed to Secure Checkout</span>
              <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
            </button>

            <div className="space-y-4 pt-4">
              <div className="flex items-center gap-4 text-neutral-500">
                <div className="w-10 h-10 rounded-full bg-brand-cream flex items-center justify-center shrink-0">
                  <ShieldCheck size={18} className="text-brand-rosegold" />
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-widest font-bold text-brand-ink">100% Encrypted</p>
                  <p className="text-[9px] text-neutral-400">Your details are safe with us</p>
                </div>
              </div>
              <div className="flex items-center gap-4 text-neutral-500">
                <div className="w-10 h-10 rounded-full bg-brand-cream flex items-center justify-center shrink-0">
                  <Truck size={18} className="text-brand-rosegold" />
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-widest font-bold text-brand-ink">Express Delivery</p>
                  <p className="text-[9px] text-neutral-400">Fast world-wide logistics</p>
                </div>
              </div>
            </div>

            <div className="pt-8 border-t border-black/5">
              <div className="bg-brand-cream/30 p-4 rounded-lg flex items-center justify-between group cursor-pointer border border-transparent hover:border-brand-rosegold/20 transition-all">
                <div className="flex items-center gap-3">
                  <Sparkles size={16} className="text-brand-rosegold" />
                  <span className="text-[10px] uppercase tracking-[2px] font-bold text-neutral-500">Add Promo Code</span>
                </div>
                <Plus size={14} className="text-neutral-400 group-hover:text-brand-rosegold group-hover:rotate-90 transition-all duration-500" />
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
