import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { Product } from "../types";

interface ProductContextType {
  products: Product[];
  loading: boolean;
  error: string | null;
  getProductById: (id: string) => Product | undefined;
  addProduct: (productData: Omit<Product, "id">, token: string) => Promise<boolean>;
  updateProduct: (id: string, productData: Partial<Product>, token: string) => Promise<boolean>;
  deleteProduct: (id: string, token: string) => Promise<boolean>;
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

  const addProduct = async (productData: Omit<Product, "id">, token: string) => {
    try {
      const response = await fetch("/api/products", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-admin-token": token,
        },
        body: JSON.stringify(productData),
      });
      if (!response.ok) {
        throw new Error("Failed to add product on backend");
      }
      const newProduct = await response.json();
      setProducts((prev) => [newProduct, ...prev]);
      return true;
    } catch (err) {
      console.error("Error adding product:", err);
      return false;
    }
  };

  const updateProduct = async (id: string, productData: Partial<Product>, token: string) => {
    try {
      const response = await fetch(`/api/products/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "x-admin-token": token,
        },
        body: JSON.stringify(productData),
      });
      if (!response.ok) {
        throw new Error("Failed to update product on backend");
      }
      const updatedProduct = await response.json();
      setProducts((prev) => prev.map((p) => (p.id === id ? updatedProduct : p)));
      return true;
    } catch (err) {
      console.error("Error updating product:", err);
      return false;
    }
  };

  const deleteProduct = async (id: string, token: string) => {
    try {
      const response = await fetch(`/api/products/${id}`, {
        method: "DELETE",
        headers: {
          "x-admin-token": token,
        },
      });
      if (!response.ok) {
        throw new Error("Failed to delete product on backend");
      }
      setProducts((prev) => prev.filter((p) => p.id !== id));
      return true;
    } catch (err) {
      console.error("Error deleting product:", err);
      return false;
    }
  };

  return (
    <ProductContext.Provider value={{ products, loading, error, getProductById, addProduct, updateProduct, deleteProduct }}>
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
