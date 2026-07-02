import React, { createContext, ReactNode, useContext, useEffect, useState } from "react";
import { toast } from "sonner";

export interface CustomerAccount {
  id: string;
  name: string;
  email: string;
  phone: string;
  savedAddress?: {
    firstName?: string;
    lastName?: string;
    phone?: string;
    secondaryPhone?: string;
    address?: string;
    city?: string;
    postalCode?: string;
  };
  wishlistProductIds: string[];
}

interface CustomerAuthContextType {
  customer: CustomerAccount | null;
  loadingCustomer: boolean;
  login: (email: string, password: string, wishlistProductIds?: string[]) => Promise<boolean>;
  register: (payload: { name: string; email: string; phone?: string; password: string; wishlistProductIds?: string[] }) => Promise<boolean>;
  logout: () => Promise<void>;
  refreshCustomer: () => Promise<void>;
  updateProfile: (payload: Partial<CustomerAccount>) => Promise<boolean>;
}

const CustomerAuthContext = createContext<CustomerAuthContextType | undefined>(undefined);

export function CustomerAuthProvider({ children }: { children: ReactNode }) {
  const [customer, setCustomer] = useState<CustomerAccount | null>(null);
  const [loadingCustomer, setLoadingCustomer] = useState(true);

  const refreshCustomer = async () => {
    try {
      const response = await fetch("/api/customer/me", { credentials: "include" });
      if (!response.ok) {
        setCustomer(null);
        return;
      }
      const data = await response.json();
      setCustomer(data.customer);
    } catch {
      setCustomer(null);
    } finally {
      setLoadingCustomer(false);
    }
  };

  useEffect(() => {
    refreshCustomer();
  }, []);

  const login = async (email: string, password: string, wishlistProductIds: string[] = []) => {
    try {
      const response = await fetch("/api/customer/login", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, wishlistProductIds })
      });
      const data = await response.json();
      if (!response.ok) {
        toast.error(data.error || "Could not log in.");
        return false;
      }
      setCustomer(data.customer);
      toast.success("Logged in successfully.");
      return true;
    } catch {
      toast.error("Could not connect to login.");
      return false;
    }
  };

  const register = async (payload: { name: string; email: string; phone?: string; password: string; wishlistProductIds?: string[] }) => {
    try {
      const response = await fetch("/api/customer/register", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      const data = await response.json();
      if (!response.ok) {
        toast.error(data.error || "Could not create account.");
        return false;
      }
      setCustomer(data.customer);
      toast.success("Account created.");
      return true;
    } catch {
      toast.error("Could not connect to registration.");
      return false;
    }
  };

  const logout = async () => {
    await fetch("/api/customer/logout", { method: "POST", credentials: "include" }).catch(() => {});
    setCustomer(null);
    toast.info("Logged out.");
  };

  const updateProfile = async (payload: Partial<CustomerAccount>) => {
    try {
      const response = await fetch("/api/customer/profile", {
        method: "PUT",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      const data = await response.json();
      if (!response.ok) {
        toast.error(data.error || "Could not update profile.");
        return false;
      }
      setCustomer(data.customer);
      toast.success("Account updated.");
      return true;
    } catch {
      toast.error("Could not update profile.");
      return false;
    }
  };

  return (
    <CustomerAuthContext.Provider value={{ customer, loadingCustomer, login, register, logout, refreshCustomer, updateProfile }}>
      {children}
    </CustomerAuthContext.Provider>
  );
}

export function useCustomerAuth() {
  const context = useContext(CustomerAuthContext);
  if (!context) {
    throw new Error("useCustomerAuth must be used within CustomerAuthProvider");
  }
  return context;
}
