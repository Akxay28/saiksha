import React, { createContext, ReactNode, useContext, useEffect, useMemo, useState } from "react";
import { CartItem } from "../types";

export interface DiscountCampaign {
  _id?: string;
  title: string;
  type: "Percent Off" | "Free Shipping";
  status: "Active" | "Paused";
  discountPercent: number;
  minCartValue: number;
  minItems: number;
  category: "All" | "Earrings" | "Necklaces" | "Bestsellers" | "New Arrivals" | "Gifts";
  startsAt?: string;
  endsAt?: string;
  badgeText: string;
}

interface DiscountCampaignContextType {
  campaigns: DiscountCampaign[];
  refreshCampaigns: () => Promise<void>;
  getBestCartCampaign: (cart: CartItem[], cartTotal: number) => DiscountCampaign | null;
  hasFreeShippingCampaign: (cart: CartItem[], cartTotal: number) => boolean;
}

const DiscountCampaignContext = createContext<DiscountCampaignContextType | undefined>(undefined);

function campaignMatches(campaign: DiscountCampaign, cart: CartItem[], cartTotal: number) {
  const quantity = cart.reduce((sum, item) => sum + item.quantity, 0);
  if (campaign.minItems > 0 && quantity < campaign.minItems) return false;
  if (campaign.minCartValue > 0 && cartTotal < campaign.minCartValue) return false;
  if (campaign.category !== "All" && !cart.some((item) => item.category === campaign.category)) return false;
  return true;
}

export function DiscountCampaignProvider({ children }: { children: ReactNode }) {
  const [campaigns, setCampaigns] = useState<DiscountCampaign[]>([]);

  const refreshCampaigns = async () => {
    try {
      const response = await fetch("/api/discount-campaigns/active");
      if (!response.ok) throw new Error("Failed to fetch campaigns");
      setCampaigns(await response.json());
    } catch (error) {
      console.warn("Could not load discount campaigns.", error);
      setCampaigns([]);
    }
  };

  useEffect(() => {
    refreshCampaigns();
  }, []);

  const value = useMemo<DiscountCampaignContextType>(() => ({
    campaigns,
    refreshCampaigns,
    getBestCartCampaign: (cart, cartTotal) => {
      const matching = campaigns.filter((campaign) => campaign.type === "Percent Off" && campaignMatches(campaign, cart, cartTotal));
      if (matching.length === 0) return null;
      return matching.sort((a, b) => Number(b.discountPercent || 0) - Number(a.discountPercent || 0))[0];
    },
    hasFreeShippingCampaign: (cart, cartTotal) => campaigns.some((campaign) => campaign.type === "Free Shipping" && campaignMatches(campaign, cart, cartTotal))
  }), [campaigns]);

  return <DiscountCampaignContext.Provider value={value}>{children}</DiscountCampaignContext.Provider>;
}

export function useDiscountCampaigns() {
  const context = useContext(DiscountCampaignContext);
  if (!context) {
    throw new Error("useDiscountCampaigns must be used within DiscountCampaignProvider");
  }
  return context;
}
