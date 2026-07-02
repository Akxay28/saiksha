import React, { createContext, ReactNode, useContext, useEffect, useState } from "react";

export interface StoreSettings {
  storeName: string;
  announcementEnabled: boolean;
  announcementText: string;
  whatsappNumber: string;
  supportPhone: string;
  supportEmail: string;
  instagramUrl: string;
  freeShippingThreshold: number;
  couponCode: string;
  couponDiscountPercent: number;
  couponText: string;
  couponMinOrder: number;
  couponUsageLimit: number;
  couponExpiresAt?: string;
  shippingNote: string;
  returnPolicy: string;
  cartLeadFollowUpTemplates: Array<{
    title: string;
    message: string;
  }>;
}

interface StoreSettingsContextType {
  settings: StoreSettings;
  loading: boolean;
  refreshSettings: () => Promise<void>;
  updateSettings: (settings: StoreSettings) => Promise<{ success: boolean; message?: string; status?: number }>;
}

export const defaultStoreSettings: StoreSettings = {
  storeName: "Saiksha",
  announcementEnabled: true,
  announcementText: "Free shipping on orders over Rs 5,000 - New Collection just launched - Use code SAIKSHA10 for 10% off",
  whatsappNumber: "917383055032",
  supportPhone: "+91 73830 55032",
  supportEmail: "support@saiksha.in",
  instagramUrl: "https://www.instagram.com/saiksha.jewels/",
  freeShippingThreshold: 5000,
  couponCode: "SAIKSHA10",
  couponDiscountPercent: 10,
  couponText: "Use code SAIKSHA10 for 10% off",
  couponMinOrder: 0,
  couponUsageLimit: 0,
  couponExpiresAt: "",
  shippingNote: "Online jewelry orders and customer support across India.",
  returnPolicy: "Exchange and return support depends on product condition, packaging, and campaign policy.",
  cartLeadFollowUpTemplates: [
    {
      title: "Friendly reminder",
      message: "Hello {{name}}, you saved a Saiksha bag. Would you like help completing your selection?"
    },
    {
      title: "Offer follow-up",
      message: "Hello {{name}}, your selected Saiksha pieces are still waiting. Use {{coupon}} while the offer is active."
    }
  ]
};

const StoreSettingsContext = createContext<StoreSettingsContextType | undefined>(undefined);

function normalizeSettings(data: Partial<StoreSettings>): StoreSettings {
  return {
    ...defaultStoreSettings,
    ...data,
    freeShippingThreshold: Number(data.freeShippingThreshold ?? defaultStoreSettings.freeShippingThreshold),
    couponDiscountPercent: Number(data.couponDiscountPercent ?? defaultStoreSettings.couponDiscountPercent),
    couponMinOrder: Number(data.couponMinOrder ?? defaultStoreSettings.couponMinOrder),
    couponUsageLimit: Number(data.couponUsageLimit ?? defaultStoreSettings.couponUsageLimit),
    couponExpiresAt: data.couponExpiresAt ? String(data.couponExpiresAt).slice(0, 10) : "",
    cartLeadFollowUpTemplates: Array.isArray(data.cartLeadFollowUpTemplates) && data.cartLeadFollowUpTemplates.length > 0
      ? data.cartLeadFollowUpTemplates
      : defaultStoreSettings.cartLeadFollowUpTemplates
  };
}

export function StoreSettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<StoreSettings>(defaultStoreSettings);
  const [loading, setLoading] = useState(true);

  const refreshSettings = async () => {
    try {
      const response = await fetch("/api/store-settings");
      if (!response.ok) throw new Error("Failed to fetch store settings");
      const data = await response.json();
      setSettings(normalizeSettings(data));
    } catch (error) {
      console.warn("Could not load store settings. Using defaults.", error);
      setSettings(defaultStoreSettings);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshSettings();
  }, []);

  const updateSettings = async (nextSettings: StoreSettings) => {
    try {
      const response = await fetch("/api/admin/store-settings", {
        method: "PUT",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(nextSettings)
      });
      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        return { success: false, status: response.status, message: data.error || "Failed to update store settings" };
      }
      const data = await response.json();
      setSettings(normalizeSettings(data));
      return { success: true };
    } catch (error) {
      console.error("Error updating store settings:", error);
      return { success: false, message: "Could not connect to store settings API." };
    }
  };

  return (
    <StoreSettingsContext.Provider value={{ settings, loading, refreshSettings, updateSettings }}>
      {children}
    </StoreSettingsContext.Provider>
  );
}

export function useStoreSettings() {
  const context = useContext(StoreSettingsContext);
  if (!context) {
    throw new Error("useStoreSettings must be used within a StoreSettingsProvider");
  }
  return context;
}
