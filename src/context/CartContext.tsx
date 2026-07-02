import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { CartItem, Product } from "../types";
import { toast } from "sonner";
import { useStoreSettings } from "./StoreSettingsContext";
import { DiscountCampaign, useDiscountCampaigns } from "./DiscountCampaignContext";

interface CartContextType {
  cart: CartItem[];
  addToCart: (product: Product, quantity?: number) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  cartCount: number;
  cartTotal: number;
  appliedCoupon: string | null;
  couponDiscountPercent: number;
  autoDiscountCampaign: DiscountCampaign | null;
  autoDiscountPercent: number;
  hasCampaignFreeShipping: boolean;
  applyCoupon: (code: string) => boolean;
  clearCoupon: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const { settings } = useStoreSettings();
  const { getBestCartCampaign, hasFreeShippingCampaign } = useDiscountCampaigns();
  const [showLeadModal, setShowLeadModal] = useState(false);
  const [leadName, setLeadName] = useState("");
  const [leadEmail, setLeadEmail] = useState("");
  const [leadPhone, setLeadPhone] = useState("");
  const [isSavingLead, setIsSavingLead] = useState(false);
  const [cart, setCart] = useState<CartItem[]>(() => {
    if (typeof window !== "undefined") {
      const savedCart = localStorage.getItem("saiksha-cart");
      return savedCart ? JSON.parse(savedCart) : [];
    }
    return [];
  });
  const [appliedCoupon, setAppliedCoupon] = useState<string | null>(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("saiksha-applied-coupon");
    }
    return null;
  });

  useEffect(() => {
    localStorage.setItem("saiksha-cart", JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    if (appliedCoupon) {
      localStorage.setItem("saiksha-applied-coupon", appliedCoupon);
    } else {
      localStorage.removeItem("saiksha-applied-coupon");
    }
  }, [appliedCoupon]);

  useEffect(() => {
    if (!appliedCoupon) return;
    const normalizedApplied = appliedCoupon.trim().toUpperCase();
    const normalizedCurrent = settings.couponCode.trim().toUpperCase();
    if (!normalizedCurrent || normalizedApplied !== normalizedCurrent || settings.couponDiscountPercent <= 0) {
      setAppliedCoupon(null);
    }
  }, [appliedCoupon, settings.couponCode, settings.couponDiscountPercent]);

  const getCartSessionId = () => {
    const storageKey = "saiksha-cart-session-id";
    let sessionId = localStorage.getItem(storageKey);
    if (!sessionId) {
      sessionId =
        typeof crypto !== "undefined" && "randomUUID" in crypto
          ? crypto.randomUUID()
          : `${Date.now()}-${Math.random().toString(36).slice(2)}`;
      localStorage.setItem(storageKey, sessionId);
    }
    return sessionId;
  };

  const addToCart = (product: Product, quantity: number = 1) => {
    const finalPrice = product.isSale && product.salePrice ? product.salePrice : product.price;
    const resolvedProduct = { ...product, price: finalPrice };
    
    const existingItem = cart.find((item) => item.id === resolvedProduct.id);
    if (existingItem) {
      toast.success(`Updated ${resolvedProduct.name} quantity`);
    } else {
      toast.success(`Added ${resolvedProduct.name} to bag`);
    }

    if (!localStorage.getItem("saiksha-cart-lead-saved-v2")) {
      setShowLeadModal(true);
    }

    setCart((prev) => {
      const exists = prev.some((item) => item.id === resolvedProduct.id);
      if (exists) {
        return prev.map((item) =>
          item.id === resolvedProduct.id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }
      return [...prev, { ...resolvedProduct, quantity }];
    });
  };

  const removeFromCart = (productId: string) => {
    setCart((prev) => prev.filter((item) => item.id !== productId));
    toast.error("Item removed from bag");
  };

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity < 1) return;
    setCart((prev) =>
      prev.map((item) =>
        item.id === productId ? { ...item, quantity } : item
      )
    );
  };

  const clearCart = () => {
    setCart([]);
    setAppliedCoupon(null);
  };

  const cartCount = cart.reduce((total, item) => total + item.quantity, 0);
  const cartTotal = cart.reduce((total, item) => total + item.price * item.quantity, 0);
  const autoDiscountCampaign = getBestCartCampaign(cart, cartTotal);
  const autoDiscountPercent = autoDiscountCampaign?.type === "Percent Off" ? Math.max(0, Number(autoDiscountCampaign.discountPercent || 0)) : 0;
  const hasCampaignFreeShipping = hasFreeShippingCampaign(cart, cartTotal);
  const couponDiscountPercent = appliedCoupon ? Math.max(0, Number(settings.couponDiscountPercent || 0)) : autoDiscountPercent;

  const applyCoupon = (code: string) => {
    const submittedCode = code.trim().toUpperCase();
    const activeCode = settings.couponCode.trim().toUpperCase();
    if (!submittedCode) {
      toast.error("Please enter a coupon code.");
      return false;
    }
    if (!activeCode || submittedCode !== activeCode || settings.couponDiscountPercent <= 0) {
      toast.error("This coupon code is not valid.");
      return false;
    }
    if (settings.couponMinOrder > 0 && cartTotal < settings.couponMinOrder) {
      toast.error(`This coupon requires a minimum order of Rs ${settings.couponMinOrder.toLocaleString()}.`);
      return false;
    }
    if (settings.couponExpiresAt && new Date(settings.couponExpiresAt) < new Date()) {
      toast.error("This coupon has expired.");
      return false;
    }
    setAppliedCoupon(activeCode);
    toast.success(`${activeCode} applied for ${settings.couponDiscountPercent}% off.`);
    return true;
  };

  const clearCoupon = () => {
    setAppliedCoupon(null);
    toast.info("Coupon removed.");
  };

  const handleSaveCartLead = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanPhone = leadPhone.replace(/\D/g, "");

    if (!leadName.trim() || !leadEmail.trim() || cleanPhone.length !== 10) {
      toast.error("Please enter your name, email, and 10-digit mobile number.");
      return;
    }

    setIsSavingLead(true);
    try {
      const response = await fetch("/api/abandoned-carts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId: getCartSessionId(),
          customer: {
            name: leadName.trim(),
            email: leadEmail.trim(),
            phone: cleanPhone
          },
          items: cart.map((item) => ({
            id: item.id,
            name: item.name,
            price: item.price,
            quantity: item.quantity,
            image: item.images[0]
          })),
          total: cartTotal
        })
      });

      if (!response.ok) {
        throw new Error("Failed to save cart lead");
      }

      localStorage.setItem("saiksha-cart-lead-saved-v2", "1");
      setShowLeadModal(false);
      toast.success("Your bag has been saved. Our team can help if you need anything.");
    } catch (error) {
      console.error("Error saving cart lead:", error);
      toast.error("Could not save your bag details. Please try again.");
    } finally {
      setIsSavingLead(false);
    }
  };

  const dismissLeadModal = () => {
    setShowLeadModal(false);
  };

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        cartCount,
        cartTotal,
        appliedCoupon,
        couponDiscountPercent,
        autoDiscountCampaign,
        autoDiscountPercent,
        hasCampaignFreeShipping,
        applyCoupon,
        clearCoupon,
      }}
    >
      {children}
      {showLeadModal && cart.length > 0 && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center px-4">
          <div className="absolute inset-0 bg-neutral-950/40 backdrop-blur-sm" onClick={dismissLeadModal} />
          <form
            onSubmit={handleSaveCartLead}
            className="relative w-full max-w-sm bg-white rounded-2xl border border-black/5 p-6 shadow-2xl space-y-5"
          >
            <div className="space-y-1">
              <h3 className="text-xl font-serif text-brand-ink">Save Your Bag</h3>
              <p className="text-xs text-neutral-500 leading-relaxed">
                Share your details and Saiksha can help you complete this selection later.
              </p>
            </div>

            <div className="space-y-3">
              <input
                value={leadName}
                onChange={(e) => setLeadName(e.target.value)}
                placeholder="Full name"
                className="w-full rounded-lg border border-neutral-200 px-4 py-3 text-xs outline-none focus:border-brand-rosegold"
              />
              <input
                type="email"
                value={leadEmail}
                onChange={(e) => setLeadEmail(e.target.value)}
                placeholder="Email address"
                className="w-full rounded-lg border border-neutral-200 px-4 py-3 text-xs outline-none focus:border-brand-rosegold"
              />
              <input
                type="tel"
                value={leadPhone}
                onChange={(e) => setLeadPhone(e.target.value.replace(/\D/g, "").slice(0, 10))}
                placeholder="Mobile number"
                className="w-full rounded-lg border border-neutral-200 px-4 py-3 text-xs outline-none focus:border-brand-rosegold"
              />
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={dismissLeadModal}
                className="flex-1 rounded-lg border border-neutral-200 py-3 text-[10px] font-bold uppercase tracking-widest text-neutral-500 hover:bg-neutral-50"
              >
                Not Now
              </button>
              <button
                type="submit"
                disabled={isSavingLead}
                className="flex-1 rounded-lg bg-brand-ink py-3 text-[10px] font-bold uppercase tracking-widest text-white hover:bg-neutral-800 disabled:opacity-50"
              >
                {isSavingLead ? "Saving..." : "Save Bag"}
              </button>
            </div>
          </form>
        </div>
      )}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}
