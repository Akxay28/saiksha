import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { Product } from "../types";

export interface ProductActionResult {
  success: boolean;
  status?: number;
  message?: string;
}

interface ProductContextType {
  products: Product[];
  loading: boolean;
  error: string | null;
  getProductById: (id: string) => Product | undefined;
  addProduct: (productData: Omit<Product, "id">) => Promise<ProductActionResult>;
  updateProduct: (id: string, productData: Partial<Product>) => Promise<ProductActionResult>;
  deleteProduct: (id: string) => Promise<ProductActionResult>;
  recordProductView: (id: string) => Promise<number | null>;
}

const ProductContext = createContext<ProductContextType | undefined>(undefined);

export function ProductProvider({ children }: { children: ReactNode }) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchProducts() {
      try {
        const response = await fetch("/api/products");
        if (!response.ok) {
          throw new Error(`Failed to fetch products: ${response.statusText}`);
        }
        const data = await response.json();
        if (Array.isArray(data)) {
          setProducts(data);
        }
        setError(null);
      } catch (err: any) {
        console.warn("Could not fetch products from database.", err);
        setError(err.message || "Failed to fetch products");
        setProducts([]);
      } finally {
        setLoading(false);
      }
    }

    fetchProducts();
  }, []);

  const getProductById = (id: string) => {
    return products.find((p) => p.id === id);
  };

  const addProduct = async (productData: Omit<Product, "id">) => {
    try {
      const response = await fetch("/api/products", {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(productData),
      });
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        return {
          success: false,
          status: response.status,
          message: errorData.error || "Failed to add product on backend"
        };
      }
      const newProduct = await response.json();
      setProducts((prev) => [newProduct, ...prev]);
      return { success: true };
    } catch (err) {
      console.error("Error adding product:", err);
      return { success: false, message: "Could not connect to the product API." };
    }
  };

  const updateProduct = async (id: string, productData: Partial<Product>) => {
    try {
      const response = await fetch(`/api/products/${id}`, {
        method: "PUT",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(productData),
      });
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        return {
          success: false,
          status: response.status,
          message: errorData.error || "Failed to update product on backend"
        };
      }
      const updatedProduct = await response.json();
      setProducts((prev) => prev.map((p) => (p.id === id ? updatedProduct : p)));
      return { success: true };
    } catch (err) {
      console.error("Error updating product:", err);
      return { success: false, message: "Could not connect to the product API." };
    }
  };

  const deleteProduct = async (id: string) => {
    try {
      const response = await fetch(`/api/products/${id}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        return {
          success: false,
          status: response.status,
          message: errorData.error || "Failed to delete product on backend"
        };
      }
      setProducts((prev) => prev.filter((p) => p.id !== id));
      return { success: true };
    } catch (err) {
      console.error("Error deleting product:", err);
      return { success: false, message: "Could not connect to the product API." };
    }
  };

  const recordProductView = async (id: string) => {
    try {
      const response = await fetch(`/api/products/${id}/view`, {
        method: "POST",
      });
      if (!response.ok) return null;
      const data = await response.json();
      const views = typeof data.views === "number" ? data.views : null;
      if (views !== null) {
        setProducts((prev) => prev.map((p) => (p.id === id ? { ...p, views } : p)));
      }
      return views;
    } catch (err) {
      console.error("Error recording product view:", err);
      return null;
    }
  };

  return (
    <ProductContext.Provider value={{ products, loading, error, getProductById, addProduct, updateProduct, deleteProduct, recordProductView }}>
      {children}
    </ProductContext.Provider>
  );
}

export function useProducts() {
  const context = useContext(ProductContext);
  if (context === undefined) {
    throw new Error("useProducts must be used within a ProductProvider");
  }
  return context;
}
