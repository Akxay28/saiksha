import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { Product } from "../types";
import { toast } from "sonner";
import { useCustomerAuth } from "./CustomerAuthContext";
import { useProducts } from "./ProductContext";

interface WishlistContextType {
  wishlist: Product[];
  addToWishlist: (product: Product) => void;
  removeFromWishlist: (productId: string) => void;
  isInWishlist: (productId: string) => boolean;
  wishlistCount: number;
  saveWishlistLead: (customer: { name: string; email: string; phone: string }) => Promise<boolean>;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

export function WishlistProvider({ children }: { children: ReactNode }) {
  const { customer } = useCustomerAuth();
  const { products } = useProducts();
  const [wishlist, setWishlist] = useState<Product[]>(() => {
    if (typeof window !== "undefined") {
      const savedWishlist = localStorage.getItem("saiksha-wishlist");
      return savedWishlist ? JSON.parse(savedWishlist) : [];
    }
    return [];
  });

  useEffect(() => {
    localStorage.setItem("saiksha-wishlist", JSON.stringify(wishlist));
  }, [wishlist]);

  useEffect(() => {
    if (!customer || products.length === 0) return;
    setWishlist((current) => {
      const ids = new Set([...current.map((item) => item.id), ...(customer.wishlistProductIds || [])]);
      return products.filter((product) => ids.has(product.id));
    });
  }, [customer?.id, customer?.wishlistProductIds?.join(","), products.length]);

  useEffect(() => {
    if (!customer) return;
    const timeout = window.setTimeout(() => {
      fetch("/api/customer/wishlist", {
        method: "PUT",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productIds: wishlist.map((item) => item.id) })
      }).catch((error) => console.warn("Could not sync wishlist.", error));
    }, 500);
    return () => window.clearTimeout(timeout);
  }, [customer?.id, wishlist.map((item) => item.id).join(",")]);

  const addToWishlist = (product: Product) => {
    setWishlist((prev) => {
      if (prev.some((item) => item.id === product.id)) {
        return prev;
      }
      toast.success(`Piece added to your wishlist`);

      return [...prev, product];
    });
  };

  const removeFromWishlist = (productId: string) => {
    setWishlist((prev) => prev.filter((item) => item.id !== productId));
    toast.info("Removed from wishlist");
  };

  const isInWishlist = (productId: string) => {
    return wishlist.some((item) => item.id === productId);
  };

  const wishlistCount = wishlist.length;

  const getWishlistSessionId = () => {
    const storageKey = "saiksha-wishlist-session-id";
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

  const saveWishlistLead = async (customer: { name: string; email: string; phone: string }) => {
    const cleanPhone = customer.phone.replace(/\D/g, "");
    if (!customer.name.trim() || !customer.email.trim() || cleanPhone.length !== 10 || wishlist.length === 0) {
      toast.error("Please enter your name, email, and 10-digit mobile number.");
      return false;
    }

    try {
      const response = await fetch("/api/wishlist-leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId: getWishlistSessionId(),
          customer: {
            name: customer.name.trim(),
            email: customer.email.trim(),
            phone: cleanPhone
          },
          items: wishlist.map((item) => ({
            id: item.id,
            name: item.name,
            price: item.isSale && item.salePrice ? item.salePrice : item.price,
            image: item.images[0]
          }))
        })
      });
      if (!response.ok) throw new Error("Failed to save wishlist lead");
      localStorage.setItem("saiksha-wishlist-lead-saved", "1");
      toast.success("Your wishlist has been saved. Our team can help when you are ready.");
      return true;
    } catch (error) {
      console.error("Error saving wishlist lead:", error);
      toast.error("Could not save wishlist details. Please try again.");
      return false;
    }
  };

  return (
    <WishlistContext.Provider
      value={{
        wishlist,
        addToWishlist,
        removeFromWishlist,
        isInWishlist,
        wishlistCount,
        saveWishlistLead,
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist() {
  const context = useContext(WishlistContext);
  if (context === undefined) {
    throw new Error("useWishlist must be used within a WishlistProvider");
  }
  return context;
}
