import React, { useEffect, useState } from "react";
import { 
  Plus, 
  Edit, 
  Trash2, 
  X, 
  Lock, 
  LogOut, 
  ChevronLeft, 
  TrendingUp, 
  AlertTriangle, 
  Database,
  Eye,
  ShoppingBag,
  MessageSquare,
  Clock,
  ChevronDown,
  ChevronUp,
  Mail,
  Phone,
  MapPin,
  CreditCard,
  Star,
  CheckCircle2
} from "lucide-react";
import { useProducts } from "../context/ProductContext";
import { Product } from "../types";
import { toast } from "sonner";
import logoImg from "../assets/images/saiksha-logo-mark.png";
import { cn } from "../lib/utils";

interface AdminDashboardProps {
  onClose: () => void;
}

export default function AdminDashboard({ onClose }: AdminDashboardProps) {
  const { products, addProduct, updateProduct, deleteProduct } = useProducts();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isCheckingSession, setIsCheckingSession] = useState(true);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // Tab State
  const [activeTab, setActiveTab] = useState<"products" | "orders" | "testimonials">("products");

  // Orders State
  const [orders, setOrders] = useState<any[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);

  // Testimonials State
  const [testimonials, setTestimonials] = useState<any[]>([]);
  const [loadingTestimonials, setLoadingTestimonials] = useState(false);

  // CRUD & Modal State for Products
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    price: 0,
    description: "",
    category: "Earrings" as Product["category"],
    images: ["", "", "", ""],
    rating: 5,
    reviews: 1,
    isNew: false,
    isLimited: false,
    isCustom: false,
    customText: "",
    isSale: false,
    salePrice: 0,
    stock: 10,
    materials: "",
    stones: "",
    craftingTime: "",
    dimensions: "",
    weight: "",
    certification: "",
    careInstructions: "",
    packaging: "",
    shippingRoute: "",
    exchangePolicy: ""
  });

  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const showProductActionError = (status?: number, message?: string) => {
    if (status === 401) {
      setIsAuthenticated(false);
      toast.error("Admin session expired. Please log in again.");
      return;
    }
    toast.error(message || "Action failed. Please verify your database connection and try again.");
  };

  useEffect(() => {
    const checkSession = async () => {
      try {
        const response = await fetch("/api/admin/session", { credentials: "include" });
        setIsAuthenticated(response.ok);
      } catch (error) {
        console.error("Error checking admin session:", error);
        setIsAuthenticated(false);
      } finally {
        setIsCheckingSession(false);
      }
    };

    checkSession();
  }, []);

  // Fetch orders and testimonials on successful login
  useEffect(() => {
    if (isAuthenticated) {
      fetchOrders();
      fetchTestimonials();
    }
  }, [isAuthenticated]);

  const fetchOrders = async () => {
    setLoadingOrders(true);
    try {
      const response = await fetch("/api/admin/orders", { credentials: "include" });
      if (response.ok) {
        const data = await response.json();
        setOrders(data);
      } else if (response.status === 401) {
        setIsAuthenticated(false);
      }
    } catch (err) {
      console.error("Error fetching orders:", err);
    } finally {
      setLoadingOrders(false);
    }
  };

  const fetchTestimonials = async () => {
    setLoadingTestimonials(true);
    try {
      const response = await fetch("/api/testimonials");
      if (response.ok) {
        const data = await response.json();
        setTestimonials(data);
      }
    } catch (err) {
      console.error("Error fetching testimonials:", err);
    } finally {
      setLoadingTestimonials(false);
    }
  };

  // Authentication
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !password) {
      toast.error("Please enter both username and password.");
      return;
    }
    setIsLoggingIn(true);
    try {
      const response = await fetch("/api/admin/login", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password })
      });
      const data = await response.json();
      if (response.ok && data.success) {
        setIsAuthenticated(true);
        setUsername("");
        setPassword("");
        toast.success("Successfully authenticated as Admin.");
      } else {
        toast.error(data.error || "Wrong admin username or password.");
      }
    } catch (err) {
      console.error(err);
      toast.error("An error occurred during authentication.");
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleLogout = async () => {
    try {
      await fetch("/api/admin/logout", {
        method: "POST",
        credentials: "include"
      });
    } catch (error) {
      console.error("Error logging out:", error);
    }
    setIsAuthenticated(false);
    toast.info("Logged out from admin panel.");
  };

  // Order Fulfillment Updates
  const handleUpdateOrderStatus = async (orderId: string, status: string) => {
    try {
      const response = await fetch(`/api/admin/orders/${orderId}/status`, {
        method: "PUT",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status })
      });
      if (response.ok) {
        const updatedOrder = await response.json();
        setOrders((prev) => prev.map((o) => (o.orderId === orderId ? updatedOrder : o)));
        toast.success(`Order ${orderId} status updated to ${status}`);
      } else if (response.status === 401) {
        setIsAuthenticated(false);
        toast.error("Session expired. Please log in again.");
      } else {
        toast.error("Failed to update order status");
      }
    } catch (err) {
      console.error("Error updating order status:", err);
      toast.error("Could not update order status");
    }
  };

  // Testimonial Deletion
  const handleDeleteTestimonial = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this review permanently?")) return;
    try {
      const response = await fetch(`/api/admin/testimonials/${id}`, {
        method: "DELETE",
        credentials: "include"
      });
      if (response.ok) {
        setTestimonials((prev) => prev.filter((t) => t._id !== id));
        toast.success("Testimonial deleted successfully.");
      } else if (response.status === 401) {
        setIsAuthenticated(false);
        toast.error("Session expired. Please log in again.");
      } else {
        toast.error("Failed to delete testimonial.");
      }
    } catch (err) {
      console.error("Error deleting testimonial:", err);
      toast.error("Could not delete testimonial.");
    }
  };

  // Product Form helpers
  const openAddModal = () => {
    setEditingProduct(null);
    setFormData({
      name: "",
      price: 1500,
      description: "",
      category: "Earrings",
      images: ["", "", "", ""],
      rating: 5,
      reviews: 1,
      isNew: true,
      isLimited: false,
      isCustom: false,
      customText: "",
      isSale: false,
      salePrice: 0,
      stock: 15,
      materials: "",
      stones: "",
      craftingTime: "",
      dimensions: "",
      weight: "",
      certification: "",
      careInstructions: "",
      packaging: "",
      shippingRoute: "",
      exchangePolicy: ""
    });
    setIsModalOpen(true);
  };

  const openEditModal = (product: Product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      price: product.price,
      description: product.description,
      category: product.category,
      images: [
        product.images[0] || "",
        product.images[1] || "",
        product.images[2] || "",
        product.images[3] || ""
      ],
      rating: product.rating,
      reviews: product.reviews,
      isNew: !!product.isNew,
      isLimited: !!product.isLimited,
      isCustom: !!product.isCustom,
      customText: product.customText || "",
      isSale: !!product.isSale,
      salePrice: product.salePrice || 0,
      stock: product.stock,
      materials: product.materials || "",
      stones: product.stones || "",
      craftingTime: product.craftingTime || "",
      dimensions: product.dimensions || "",
      weight: product.weight || "",
      certification: product.certification || "",
      careInstructions: product.careInstructions ? product.careInstructions.join("\n") : "",
      packaging: product.packaging || "",
      shippingRoute: product.shippingRoute || "",
      exchangePolicy: product.exchangePolicy || ""
    });
    setIsModalOpen(true);
  };

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const val = type === "checkbox" ? (e.target as HTMLInputElement).checked : value;
    setFormData((prev) => ({ ...prev, [name]: val }));
  };

  const handleImageChange = (index: number, value: string) => {
    const updatedImages = [...formData.images];
    updatedImages[index] = value;
    setFormData((prev) => ({ ...prev, images: updatedImages }));
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAuthenticated) return;

    if (!formData.name || !formData.price || !formData.description || !formData.images[0]) {
      toast.error("Please fill in all required fields (Name, Price, Description, and at least first image URL).");
      return;
    }

    const cleanedImages = formData.images.filter((url) => url.trim() !== "");
    const careInstructionsArray = formData.careInstructions
      ? formData.careInstructions.split("\n").filter((line) => line.trim() !== "")
      : [];

    const productPayload = {
      name: formData.name,
      price: Number(formData.price),
      description: formData.description,
      category: formData.category,
      images: cleanedImages,
      rating: Number(formData.rating),
      reviews: Number(formData.reviews),
      isNew: formData.isNew,
      isLimited: formData.isLimited,
      isCustom: formData.isCustom,
      customText: formData.isCustom ? formData.customText : undefined,
      isSale: formData.isSale,
      salePrice: formData.isSale ? Number(formData.salePrice) : undefined,
      stock: Number(formData.stock),
      materials: formData.materials || undefined,
      stones: formData.stones || undefined,
      craftingTime: formData.craftingTime || undefined,
      dimensions: formData.dimensions || undefined,
      weight: formData.weight || undefined,
      certification: formData.certification || undefined,
      careInstructions: careInstructionsArray.length > 0 ? careInstructionsArray : undefined,
      packaging: formData.packaging || undefined,
      shippingRoute: formData.shippingRoute || undefined,
      exchangePolicy: formData.exchangePolicy || undefined
    };

    let success = false;
    if (editingProduct) {
      const result = await updateProduct(editingProduct.id, productPayload);
      success = result.success;
      if (success) {
        toast.success(`Product "${formData.name}" updated successfully.`);
      } else {
        showProductActionError(result.status, result.message);
      }
    } else {
      const result = await addProduct(productPayload);
      success = result.success;
      if (success) {
        toast.success(`Product "${formData.name}" added successfully.`);
      } else {
        showProductActionError(result.status, result.message);
      }
    }

    if (success) {
      setIsModalOpen(false);
    }
  };

  const handleDeleteProduct = async (id: string) => {
    if (!isAuthenticated) return;
    const result = await deleteProduct(id);
    if (result.success) {
      toast.success("Product deleted successfully.");
      setDeleteConfirmId(null);
    } else {
      showProductActionError(result.status, result.message || "Failed to delete product.");
    }
  };

  // Stats calculation
  const totalProducts = products.length;
  const pendingOrdersCount = orders.filter((o) => o.status === "Pending").length;
  const totalReviewsCount = testimonials.length;

  if (isCheckingSession) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#fdfbf7] px-6 font-sans">
        <div className="text-xs uppercase tracking-[3px] text-neutral-400 font-bold">Checking admin session...</div>
      </div>
    );
  }

  // LOGIN SCREEN
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#fdfbf7] px-6 font-sans">
        <div className="w-full max-w-md bg-white rounded-3xl p-8 shadow-2xl border border-black/5 relative overflow-hidden">
          <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-brand-rosegold via-[#ad854f] to-brand-rosegold" />
          
          <div className="text-center space-y-4 mb-8">
            <div className="h-16 w-16 rounded-full bg-white ring-1 ring-brand-rosegold/20 shadow-sm flex items-center justify-center mx-auto">
              <img 
                src={logoImg} 
                alt="Saiksha Logo" 
                className="h-14 w-14 rounded-full object-cover"
                referrerPolicy="no-referrer"
              />
            </div>
            <h2 className="text-2xl font-serif font-bold tracking-wider text-neutral-900 uppercase">Saiksha Console</h2>
            <p className="text-xs text-neutral-400 font-light tracking-wide">Enter admin credentials to manage the Atlas catalog.</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-5">
            <div className="space-y-1.5">
              <label className="text-[9px] uppercase tracking-[2px] font-bold text-neutral-400">Username</label>
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="e.g. admin"
                className="w-full text-xs px-4 py-3 rounded-xl border border-neutral-100 bg-neutral-50/50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-brand-rosegold transition-all"
              />
            </div>
            
            <div className="space-y-1.5">
              <label className="text-[9px] uppercase tracking-[2px] font-bold text-neutral-400">Password</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full text-xs px-4 py-3 rounded-xl border border-neutral-100 bg-neutral-50/50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-brand-rosegold transition-all"
              />
            </div>

            <button
              type="submit"
              disabled={isLoggingIn}
              className="w-full mt-4 bg-brand-ink hover:bg-neutral-800 text-white py-4 rounded-xl text-[10px] uppercase tracking-[2px] font-bold shadow-xl shadow-brand-ink/10 transition-all flex items-center justify-center space-x-2"
            >
              <Lock size={12} className="text-brand-rosegold" />
              <span>{isLoggingIn ? "Authenticating..." : "Authorize Console"}</span>
            </button>
          </form>

          <button 
            onClick={onClose}
            className="w-full mt-4 bg-transparent hover:bg-neutral-50 text-neutral-400 hover:text-neutral-600 py-3 text-[9px] uppercase tracking-[2px] font-bold transition-all border border-transparent rounded-xl"
          >
            Go Back to Storefront
          </button>
        </div>
      </div>
    );
  }

  // DASHBOARD WORKSPACE
  return (
    <div className="min-h-screen bg-[#faf9f6] text-neutral-800 font-sans pb-20">
      
      {/* Top Console Bar */}
      <header className="sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-neutral-100 py-4 px-6 md:px-12 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button 
            onClick={onClose}
            className="p-2 hover:bg-neutral-50 rounded-full text-neutral-400 hover:text-neutral-800 transition-colors flex items-center space-x-1"
            title="Return to Storefront"
          >
            <ChevronLeft size={16} />
            <span className="text-[9px] uppercase font-bold tracking-widest hidden md:inline">Store</span>
          </button>
          <div className="h-6 w-px bg-neutral-200" />
          <div className="flex items-center space-x-2.5">
            <div className="h-9 w-9 rounded-full bg-white ring-1 ring-brand-rosegold/20 shadow-sm flex items-center justify-center shrink-0">
              <img src={logoImg} alt="Saiksha Logo" className="h-8 w-8 rounded-full object-cover" referrerPolicy="no-referrer" />
            </div>
            <div>
              <span className="font-serif text-sm font-bold tracking-widest text-neutral-900 uppercase">SAIKSHA</span>
              <span className="text-[8px] bg-brand-rosegold/10 text-brand-rosegold font-bold uppercase px-2 py-0.5 rounded-full ml-2">Atlas Admin</span>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          {activeTab === "products" && (
            <button
              onClick={openAddModal}
              className="bg-brand-ink text-white px-4 py-2.5 rounded-lg text-[9px] uppercase tracking-widest font-bold hover:bg-neutral-800 transition-all flex items-center space-x-1.5 shadow-md shadow-brand-ink/5 cursor-pointer"
            >
              <Plus size={13} />
              <span>Add Jewelry</span>
            </button>
          )}

          <button
            onClick={handleLogout}
            className="p-2 hover:bg-red-50 rounded-lg text-neutral-400 hover:text-red-500 transition-colors cursor-pointer"
            title="Logout Admin"
          >
            <LogOut size={16} />
          </button>
        </div>
      </header>

      {/* Main Console Workspace */}
      <main className="max-w-7xl mx-auto px-6 md:px-12 pt-8 space-y-8">
        
        {/* Stats Grid */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Total Catalog Stats Card */}
          <div className="bg-white p-6 rounded-2xl border border-neutral-100 shadow-xs flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-[9px] uppercase tracking-widest text-neutral-400 font-bold">Total Collection</span>
              <h3 className="text-3xl font-serif font-bold text-neutral-900">{totalProducts} Items</h3>
            </div>
            <div className="p-4 bg-[#bda88e]/10 rounded-2xl text-[#a2855b]">
              <Database size={24} />
            </div>
          </div>

          {/* Pending Orders Stats Card */}
          <div className="bg-white p-6 rounded-2xl border border-neutral-100 shadow-xs flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-[9px] uppercase tracking-widest text-neutral-400 font-bold">Pending Orders</span>
              <h3 className="text-3xl font-serif font-bold text-neutral-900">{pendingOrdersCount} Requests</h3>
            </div>
            <div className="p-4 bg-brand-cream/20 rounded-2xl text-brand-rosegold">
              <ShoppingBag size={24} />
            </div>
          </div>

          {/* Customer Reviews Stats Card */}
          <div className="bg-white p-6 rounded-2xl border border-neutral-100 shadow-xs flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-[9px] uppercase tracking-widest text-neutral-400 font-bold">Total Testimonials</span>
              <h3 className="text-3xl font-serif font-bold text-neutral-900">{totalReviewsCount} Reviews</h3>
            </div>
            <div className="p-4 bg-neutral-50 rounded-2xl text-neutral-500">
              <MessageSquare size={24} />
            </div>
          </div>
        </section>

        {/* Tab Selection Panel */}
        <div className="border-b border-neutral-200 flex space-x-8">
          <button
            onClick={() => setActiveTab("products")}
            className={cn(
              "pb-4 text-xs font-bold uppercase tracking-widest transition-all border-b-2 cursor-pointer",
              activeTab === "products"
                ? "border-brand-ink text-brand-ink font-extrabold"
                : "border-transparent text-neutral-400 hover:text-neutral-700"
            )}
          >
            Products ({totalProducts})
          </button>
          
          <button
            onClick={() => setActiveTab("orders")}
            className={cn(
              "pb-4 text-xs font-bold uppercase tracking-widest transition-all border-b-2 cursor-pointer",
              activeTab === "orders"
                ? "border-brand-ink text-brand-ink font-extrabold"
                : "border-transparent text-neutral-400 hover:text-neutral-700"
            )}
          >
            Orders ({orders.length})
          </button>

          <button
            onClick={() => setActiveTab("testimonials")}
            className={cn(
              "pb-4 text-xs font-bold uppercase tracking-widest transition-all border-b-2 cursor-pointer",
              activeTab === "testimonials"
                ? "border-brand-ink text-brand-ink font-extrabold"
                : "border-transparent text-neutral-400 hover:text-neutral-700"
            )}
          >
            Testimonials ({totalReviewsCount})
          </button>
        </div>

        {/* TAB VIEW 1: PRODUCTS CATALOG LIST */}
        {activeTab === "products" && (
          <section className="bg-white rounded-2xl border border-neutral-100 shadow-xs overflow-hidden">
            <div className="p-6 border-b border-neutral-100 flex items-center justify-between bg-neutral-50/20">
              <h4 className="font-serif text-base font-bold text-neutral-900">Database Catalog Listing</h4>
              <span className="text-[9px] text-neutral-400 tracking-wider font-mono">Collection Name: products</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-left">
                <thead>
                  <tr className="bg-neutral-50/70 border-b border-neutral-100 text-[9px] uppercase tracking-widest text-neutral-400 font-bold">
                    <th className="py-4 px-6">Image</th>
                    <th className="py-4 px-6">Name & ID</th>
                    <th className="py-4 px-6">Category</th>
                    <th className="py-4 px-6">Price</th>
                    <th className="py-4 px-6">Stock</th>
                    <th className="py-4 px-6">Rating</th>
                    <th className="py-4 px-6 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-50 text-xs">
                  {products.map((product) => (
                    <tr key={product.id} className="hover:bg-neutral-50/30 transition-colors">
                      <td className="py-4 px-6">
                        <div className="w-10 h-12 rounded overflow-hidden bg-neutral-100 border border-neutral-100">
                          <img 
                            src={product.images[0]} 
                            alt={product.name} 
                            className="w-full h-full object-cover"
                            referrerPolicy="no-referrer"
                          />
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <div>
                          <span className="font-bold text-neutral-950 block">{product.name}</span>
                          <span className="text-[10px] text-neutral-400 font-mono block">ID: {product.id}</span>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <span className="px-2.5 py-1 rounded-full text-[9px] font-bold uppercase tracking-wider bg-brand-cream/20 text-[#a2855b]">
                          {product.category}
                        </span>
                      </td>
                      <td className="py-4 px-6 font-bold text-neutral-900">
                        {product.isSale && product.salePrice ? (
                          <div className="flex flex-col">
                            <span className="text-[10px] text-neutral-400 line-through font-normal">₹{product.price.toLocaleString()}</span>
                            <span className="text-brand-hotpink font-bold">₹{product.salePrice.toLocaleString()}</span>
                          </div>
                        ) : (
                          <span>₹{product.price.toLocaleString()}</span>
                        )}
                      </td>
                      <td className="py-4 px-6">
                        {product.stock === 0 ? (
                          <span className="font-extrabold text-red-650 bg-red-50 border border-red-100 px-2.5 py-1 rounded text-[9px] uppercase tracking-wider">
                            Out of Stock
                          </span>
                        ) : (
                          <span className={`font-bold ${product.stock < 10 ? "text-amber-600 font-extrabold" : "text-neutral-500"}`}>
                            {product.stock} pcs
                          </span>
                        )}
                      </td>
                      <td className="py-4 px-6 font-semibold text-neutral-500">
                        ★ {product.rating} ({product.reviews})
                      </td>
                      <td className="py-4 px-6 text-right">
                        <div className="flex items-center justify-end space-x-2">
                          <button
                            onClick={() => openEditModal(product)}
                            className="p-2 text-neutral-400 hover:text-brand-rosegold hover:bg-neutral-50 rounded-lg transition-all cursor-pointer"
                            title="Edit Product"
                          >
                            <Edit size={14} />
                          </button>
                          <button
                            onClick={() => setDeleteConfirmId(product.id)}
                            className="p-2 text-neutral-400 hover:text-red-500 hover:bg-neutral-50 rounded-lg transition-all cursor-pointer"
                            title="Delete Product"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}

        {/* TAB VIEW 2: ORDERS MANAGER */}
        {activeTab === "orders" && (
          <section className="space-y-6">
            <div className="bg-white p-6 rounded-2xl border border-neutral-100 shadow-xs flex items-center justify-between">
              <div>
                <h4 className="font-serif text-base font-bold text-neutral-900">Fulfillment Center</h4>
                <p className="text-[10px] text-neutral-450 mt-0.5">Manage customer purchases and update order statuses.</p>
              </div>
              <button 
                onClick={fetchOrders}
                className="text-[9px] uppercase font-bold tracking-widest text-[#a2855b] hover:text-[#7a603c]"
              >
                Refresh Data
              </button>
            </div>

            {loadingOrders ? (
              <div className="text-center py-12 text-xs text-neutral-400">Loading catalog orders...</div>
            ) : orders.length === 0 ? (
              <div className="text-center py-20 bg-white rounded-2xl border border-black/5 text-neutral-400 space-y-4">
                <ShoppingBag size={40} className="mx-auto text-neutral-300" />
                <h4 className="font-serif text-sm font-bold text-neutral-500">No Orders Placed Yet</h4>
                <p className="text-[10px] text-neutral-400 font-light">Customer checkout submissions will register here.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {orders.map((order) => {
                  const isExpanded = expandedOrderId === order.orderId;
                  const dateString = order.createdAt 
                    ? new Date(order.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
                    : "N/A";
                  
                  return (
                    <div 
                      key={order.orderId}
                      className="bg-white rounded-2xl border border-neutral-150 shadow-xs overflow-hidden transition-all duration-300"
                    >
                      {/* Accordion Trigger Header */}
                      <div 
                        onClick={() => setExpandedOrderId(isExpanded ? null : order.orderId)}
                        className="p-5 md:p-6 flex flex-wrap items-center justify-between gap-4 cursor-pointer hover:bg-neutral-50/50"
                      >
                        <div className="flex items-center space-x-4 min-w-0 flex-1">
                          <div className="w-10 h-10 rounded-full bg-brand-cream flex items-center justify-center shrink-0">
                            <Clock size={16} className="text-brand-rosegold" />
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center space-x-2">
                              <span className="font-mono font-bold text-xs text-neutral-900">{order.orderId}</span>
                              <span className="text-[10px] text-neutral-400">• {dateString}</span>
                            </div>
                            <span className="text-xs text-neutral-550 truncate block mt-0.5">
                              {order.customer.firstName} {order.customer.lastName} ({order.customer.city})
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center space-x-6">
                          <div className="text-right">
                            <span className="font-bold text-xs text-neutral-900 block">₹{order.total.toLocaleString()}</span>
                            <span className="text-[9px] uppercase tracking-wider text-neutral-450 block mt-0.5">{order.items.length} {order.items.length === 1 ? "Piece" : "Pieces"}</span>
                          </div>
                          
                          <div onClick={(e) => e.stopPropagation()}>
                            <select
                              value={order.status}
                              onChange={(e) => handleUpdateOrderStatus(order.orderId, e.target.value)}
                              className={cn(
                                "text-[9px] uppercase tracking-wider font-extrabold px-3 py-1.5 rounded-full outline-none cursor-pointer border",
                                order.status === "Pending" && "bg-amber-50 text-amber-600 border-amber-200",
                                order.status === "Confirmed" && "bg-blue-50 text-blue-600 border-blue-200",
                                order.status === "Shipped" && "bg-indigo-50 text-indigo-600 border-indigo-200",
                                order.status === "Delivered" && "bg-green-50 text-green-600 border-green-200",
                                order.status === "Cancelled" && "bg-red-50 text-red-600 border-red-200"
                              )}
                            >
                              <option value="Pending">Pending</option>
                              <option value="Confirmed">Confirmed</option>
                              <option value="Shipped">Shipped</option>
                              <option value="Delivered">Delivered</option>
                              <option value="Cancelled">Cancelled</option>
                            </select>
                          </div>

                          <div className="text-neutral-400">
                            {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                          </div>
                        </div>
                      </div>

                      {/* Accordion Details Panel */}
                      {isExpanded && (
                        <div className="border-t border-neutral-100 bg-[#fbfbfa]/30 p-6 md:p-8 grid grid-cols-1 lg:grid-cols-12 gap-8 text-xs">
                          {/* Shipping / Customer column */}
                          <div className="lg:col-span-5 space-y-4 border-b lg:border-b-0 lg:border-r border-neutral-100 pb-6 lg:pb-0 lg:pr-8">
                            <div className="space-y-1">
                              <span className="text-[9px] uppercase tracking-wider text-neutral-400 font-extrabold">Shipping Coordinates</span>
                              <p className="font-bold text-neutral-900 text-sm">
                                {order.customer.firstName} {order.customer.lastName}
                              </p>
                              <p className="text-neutral-500 font-light leading-relaxed">
                                {order.customer.address},<br />
                                {order.customer.city} - {order.customer.postalCode}
                              </p>
                            </div>

                            <div className="space-y-2 pt-2">
                              <span className="text-[9px] uppercase tracking-wider text-neutral-400 font-extrabold">Contact Details</span>
                              <p className="text-neutral-700 flex items-center gap-2">
                                <Mail size={13} className="text-neutral-400" /> {order.customer.email}
                              </p>
                              <p className="text-neutral-700 flex items-center gap-2">
                                <Phone size={13} className="text-neutral-400" /> {order.customer.phone} 
                                <span className="text-[8px] uppercase tracking-wider bg-brand-rosegold/10 text-brand-rosegold px-1.5 py-0.5 rounded font-bold">Primary</span>
                              </p>
                              {order.customer.secondaryPhone && (
                                <p className="text-neutral-700 flex items-center gap-2">
                                  <Phone size={13} className="text-neutral-400" /> {order.customer.secondaryPhone} 
                                  <span className="text-[8px] uppercase tracking-wider bg-neutral-100 text-neutral-500 px-1.5 py-0.5 rounded font-bold">Secondary</span>
                                </p>
                              )}
                            </div>

                            <div className="space-y-1 pt-2">
                              <span className="text-[9px] uppercase tracking-wider text-neutral-400 font-extrabold">Payment Parameters</span>
                              <p className="font-bold text-[#ad854f] uppercase text-[10px] tracking-wider flex items-center gap-1.5">
                                <CreditCard size={13} /> {order.paymentMethod}
                              </p>
                            </div>
                          </div>

                          {/* Items Purchased column */}
                          <div className="lg:col-span-7 space-y-4">
                            <span className="text-[9px] uppercase tracking-wider text-neutral-400 font-extrabold">Jewelry Selection ({order.items.length})</span>
                            <div className="space-y-3">
                              {order.items.map((item: any) => (
                                <div key={item.id + item.name} className="flex items-center space-x-4 bg-white p-3 rounded-xl border border-black/5 shadow-xxs">
                                  <div className="w-10 h-12 rounded bg-neutral-100 overflow-hidden shrink-0 border border-neutral-100">
                                    <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                                  </div>
                                  <div className="flex-grow min-w-0">
                                    <h5 className="font-bold text-neutral-800 text-xs truncate">{item.name}</h5>
                                    <span className="text-[10px] text-neutral-400 font-mono mt-0.5 block">ID: {item.id} • Qty {item.quantity}</span>
                                  </div>
                                  <span className="font-bold text-neutral-900 text-xs shrink-0">₹{item.price.toLocaleString()}</span>
                                </div>
                              ))}
                            </div>

                            {/* Order Totals card */}
                            <div className="bg-neutral-50 p-4 rounded-xl border border-neutral-100 space-y-2 mt-4">
                              <div className="flex justify-between text-[11px] text-neutral-500">
                                <span>Subtotal</span>
                                <span className="font-bold">₹{order.subTotal.toLocaleString()}</span>
                              </div>
                              <div className="flex justify-between text-[11px] text-neutral-500">
                                <span>Shipping & Handling</span>
                                <span className="font-bold text-brand-rosegold">{order.shipping === 0 ? "FREE" : `₹${order.shipping.toLocaleString()}`}</span>
                              </div>
                              <div className="flex justify-between text-xs font-bold border-t border-neutral-200/60 pt-2 text-neutral-900">
                                <span>Grand Total</span>
                                <span>₹{order.total.toLocaleString()}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </section>
        )}

        {/* TAB VIEW 3: TESTIMONIALS MODERATOR */}
        {activeTab === "testimonials" && (
          <section className="space-y-6">
            <div className="bg-white p-6 rounded-2xl border border-neutral-100 shadow-xs flex items-center justify-between">
              <div>
                <h4 className="font-serif text-base font-bold text-neutral-900">Review Moderator</h4>
                <p className="text-[10px] text-neutral-450 mt-0.5">Approve, verify, or remove customer experiences from the public storefront.</p>
              </div>
              <button 
                onClick={fetchTestimonials}
                className="text-[9px] uppercase font-bold tracking-widest text-[#a2855b] hover:text-[#7a603c]"
              >
                Refresh Data
              </button>
            </div>

            {loadingTestimonials ? (
              <div className="text-center py-12 text-xs text-neutral-400">Loading database testimonials...</div>
            ) : testimonials.length === 0 ? (
              <div className="text-center py-20 bg-white rounded-2xl border border-black/5 text-neutral-400 space-y-4">
                <MessageSquare size={40} className="mx-auto text-neutral-300" />
                <h4 className="font-serif text-sm font-bold text-neutral-500">No Testimonials Received</h4>
                <p className="text-[10px] text-neutral-400 font-light">Client submissions will list here to approve/remove.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {testimonials.map((testimonial) => (
                  <div 
                    key={testimonial._id}
                    className="bg-white border border-neutral-100 p-6 rounded-2xl shadow-xs relative flex flex-col justify-between"
                  >
                    <div className="space-y-4">
                      {/* Rating & Date */}
                      <div className="flex items-center justify-between">
                        <div className="flex text-yellow-400 gap-0.5">
                          {[...Array(5)].map((_, i) => (
                            <Star 
                              key={i} 
                              size={12} 
                              className={i < testimonial.rating ? "fill-current text-yellow-400" : "text-neutral-200"} 
                            />
                          ))}
                        </div>
                        <span className="text-[10px] text-neutral-400 font-mono">{testimonial.date}</span>
                      </div>

                      {/* Review details */}
                      <div className="space-y-1.5">
                        <h4 className="font-serif text-xs font-bold text-neutral-900">{testimonial.title}</h4>
                        <p className="text-[11px] text-neutral-500 font-light leading-relaxed">
                          {testimonial.comment}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-6 mt-6 border-t border-neutral-50">
                      <div className="flex items-center space-x-2.5">
                        <div className="w-7 h-7 bg-brand-rosegold/10 text-brand-rosegold rounded-full flex items-center justify-center font-bold text-[10px] uppercase">
                          {testimonial.author[0]}
                        </div>
                        <div>
                          <span className="text-[10px] font-bold text-neutral-800 block">
                            {testimonial.author}
                          </span>
                          {testimonial.verified && (
                            <span className="text-[7px] text-green-600 font-bold uppercase tracking-wider flex items-center gap-0.5 mt-0.5">
                              <CheckCircle2 size={8} className="fill-green-100" /> Verified Purchase
                            </span>
                          )}
                        </div>
                      </div>

                      <button
                        onClick={() => handleDeleteTestimonial(testimonial._id)}
                        className="text-neutral-400 hover:text-red-500 p-1.5 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                        title="Delete Review"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        )}
      </main>

      {/* Add / Edit Product Modal Form */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-neutral-950/40 backdrop-blur-xs" onClick={() => setIsModalOpen(false)} />
          <div className="relative w-full max-w-3xl bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            
            {/* Modal Header */}
            <div className="p-6 border-b border-neutral-100 flex items-center justify-between bg-neutral-50/50">
              <div>
                <h3 className="font-serif text-lg font-bold text-neutral-950">
                  {editingProduct ? `Edit Product (ID: ${editingProduct.id})` : "Add New Luxury Piece"}
                </h3>
                <p className="text-[10px] text-neutral-400 mt-0.5">Fill in the specifications to save to MongoDB Atlas.</p>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-neutral-100 rounded-full text-neutral-400 hover:text-neutral-800 transition-all cursor-pointer">
                <X size={18} />
              </button>
            </div>

            {/* Modal Body Form */}
            <form onSubmit={handleFormSubmit} className="flex-1 overflow-y-auto p-6 md:p-8 space-y-6 text-xs text-neutral-700">
              
              {/* SECTION: Core Properties */}
              <div className="space-y-4">
                <h5 className="text-[10px] uppercase tracking-widest font-bold text-brand-rosegold pb-1.5 border-b border-neutral-100">1. Core Information</h5>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="font-bold text-neutral-500">Product Name *</label>
                    <input
                      type="text"
                      required
                      name="name"
                      value={formData.name}
                      onChange={handleFormChange}
                      placeholder="Divine Gold Hoop Earrings"
                      className="w-full px-3 py-2.5 rounded-lg border border-neutral-200 focus:outline-none focus:ring-1 focus:ring-brand-rosegold"
                    />
                  </div>
                  
                  <div className="space-y-1">
                    <label className="font-bold text-neutral-500">Category *</label>
                    <select
                      name="category"
                      value={formData.category}
                      onChange={handleFormChange}
                      className="w-full px-3 py-2.5 rounded-lg border border-neutral-200 bg-white focus:outline-none focus:ring-1 focus:ring-brand-rosegold"
                    >
                      <option value="Earrings">Earrings</option>
                      <option value="Necklaces">Necklaces</option>
                      <option value="Bestsellers">Bestsellers</option>
                      <option value="New Arrivals">New Arrivals</option>
                      <option value="Gifts">Gifts</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-neutral-500">
                      {formData.isSale ? "Original/Actual Price (Rupees ₹) *" : "Price (Rupees ₹) *"}
                    </label>
                    <input
                      type="number"
                      required
                      min="0"
                      name="price"
                      value={formData.price}
                      onChange={handleFormChange}
                      placeholder="10400"
                      className="w-full px-3 py-2.5 rounded-lg border border-neutral-200 focus:outline-none focus:ring-1 focus:ring-brand-rosegold"
                    />
                  </div>

                  {formData.isSale && (
                    <div className="space-y-1">
                      <label className="font-bold text-neutral-500">Sale Price (Rupees ₹) *</label>
                      <input
                        type="number"
                        required
                        min="0"
                        name="salePrice"
                        value={formData.salePrice}
                        onChange={handleFormChange}
                        placeholder="8900"
                        className="w-full px-3 py-2.5 rounded-lg border border-[#e91e8c]/30 focus:outline-none focus:ring-1 focus:ring-brand-hotpink"
                      />
                    </div>
                  )}

                  <div className="space-y-1">
                    <label className="font-bold text-neutral-500">Available Stock *</label>
                    <input
                      type="number"
                      required
                      min="0"
                      name="stock"
                      value={formData.stock}
                      onChange={handleFormChange}
                      placeholder="15"
                      className="w-full px-3 py-2.5 rounded-lg border border-neutral-200 focus:outline-none focus:ring-1 focus:ring-brand-rosegold"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-neutral-500">Luxury Description *</label>
                  <textarea
                    required
                    rows={3}
                    name="description"
                    value={formData.description}
                    onChange={handleFormChange}
                    placeholder="Provide a luxurious description showcasing craftsmanship..."
                    className="w-full px-3 py-2.5 rounded-lg border border-neutral-200 focus:outline-none focus:ring-1 focus:ring-brand-rosegold font-sans leading-relaxed"
                  />
                </div>
              </div>

              {/* SECTION: Image Assets */}
              <div className="space-y-4">
                <h5 className="text-[10px] uppercase tracking-widest font-bold text-brand-rosegold pb-1.5 border-b border-neutral-100">2. Gallery Images</h5>
                <p className="text-[10px] text-neutral-450 -mt-2">Provide up to 4 high-resolution image URLs. The first image will be the primary item cover.</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {formData.images.map((imgUrl, index) => (
                    <div key={index} className="space-y-1">
                      <label className="font-bold text-neutral-500">Image URL {index + 1} {index === 0 && "*"}</label>
                      <input
                        type="url"
                        required={index === 0}
                        value={imgUrl}
                        onChange={(e) => handleImageChange(index, e.target.value)}
                        placeholder={`https://images.unsplash.com/photo-...`}
                        className="w-full px-3 py-2.5 rounded-lg border border-neutral-200 focus:outline-none focus:ring-1 focus:ring-brand-rosegold"
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* SECTION: Optional Detail Specs */}
              <div className="space-y-4">
                <h5 className="text-[10px] uppercase tracking-widest font-bold text-brand-rosegold pb-1.5 border-b border-neutral-100">3. Technical Details & Materials (Optional)</h5>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="font-bold text-neutral-500">Materials</label>
                    <input
                      type="text"
                      name="materials"
                      value={formData.materials}
                      onChange={handleFormChange}
                      placeholder="e.g. 18k Rose Gold plating on certified Solid Sterling Silver"
                      className="w-full px-3 py-2.5 rounded-lg border border-neutral-200 focus:outline-none focus:ring-1 focus:ring-brand-rosegold"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-neutral-500">Stones & Clarity</label>
                    <input
                      type="text"
                      name="stones"
                      value={formData.stones}
                      onChange={handleFormChange}
                      placeholder="e.g. Hand-selected VVS1 clarity equivalent simulated diamonds"
                      className="w-full px-3 py-2.5 rounded-lg border border-neutral-200 focus:outline-none focus:ring-1 focus:ring-brand-rosegold"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-neutral-500">Crafting Time</label>
                    <input
                      type="text"
                      name="craftingTime"
                      value={formData.craftingTime}
                      onChange={handleFormChange}
                      placeholder="e.g. Individually set over 14 crafting hours"
                      className="w-full px-3 py-2.5 rounded-lg border border-neutral-200 focus:outline-none focus:ring-1 focus:ring-brand-rosegold"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-neutral-500">Dimensions</label>
                    <input
                      type="text"
                      name="dimensions"
                      value={formData.dimensions}
                      onChange={handleFormChange}
                      placeholder="e.g. Approx 20mm height x 8mm width"
                      className="w-full px-3 py-2.5 rounded-lg border border-neutral-200 focus:outline-none focus:ring-1 focus:ring-brand-rosegold"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-neutral-500">Weight Profile</label>
                    <input
                      type="text"
                      name="weight"
                      value={formData.weight}
                      onChange={handleFormChange}
                      placeholder="e.g. Lightweight build (3.8 grams per earring)"
                      className="w-full px-3 py-2.5 rounded-lg border border-neutral-200 focus:outline-none focus:ring-1 focus:ring-brand-rosegold"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-neutral-500">Certification</label>
                    <input
                      type="text"
                      name="certification"
                      value={formData.certification}
                      onChange={handleFormChange}
                      placeholder="e.g. Shipped with Gemstone Appraisal certificate card"
                      className="w-full px-3 py-2.5 rounded-lg border border-neutral-200 focus:outline-none focus:ring-1 focus:ring-brand-rosegold"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-neutral-500">Packaging Type</label>
                    <input
                      type="text"
                      name="packaging"
                      value={formData.packaging}
                      onChange={handleFormChange}
                      placeholder="e.g. Custom signature ivory gift drawer box with velvet lining"
                      className="w-full px-3 py-2.5 rounded-lg border border-neutral-200 focus:outline-none focus:ring-1 focus:ring-brand-rosegold"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-neutral-500">Shipping route / time</label>
                    <input
                      type="text"
                      name="shippingRoute"
                      value={formData.shippingRoute}
                      onChange={handleFormChange}
                      placeholder="e.g. Dispatched in 12 hours via express priority air"
                      className="w-full px-3 py-2.5 rounded-lg border border-neutral-200 focus:outline-none focus:ring-1 focus:ring-brand-rosegold"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="font-bold text-neutral-500">Exchange Policy</label>
                    <input
                      type="text"
                      name="exchangePolicy"
                      value={formData.exchangePolicy}
                      onChange={handleFormChange}
                      placeholder="e.g. Extended 30-day secure Tag exchange"
                      className="w-full px-3 py-2.5 rounded-lg border border-neutral-200 focus:outline-none focus:ring-1 focus:ring-brand-rosegold"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-neutral-500">Care Instructions (One instruction per line)</label>
                    <textarea
                      rows={3}
                      name="careInstructions"
                      value={formData.careInstructions}
                      onChange={handleFormChange}
                      placeholder="Avoid body oils and perfume.&#10;Buff with microfiber polishing cloth."
                      className="w-full px-3 py-2.5 rounded-lg border border-neutral-200 focus:outline-none focus:ring-1 focus:ring-brand-rosegold font-mono"
                    />
                  </div>
                </div>
              </div>

              {/* SECTION: Marketing Metrics */}
              <div className="space-y-4">
                <h5 className="text-[10px] uppercase tracking-widest font-bold text-brand-rosegold pb-1.5 border-b border-neutral-100">4. Labels & Initial Social Proof</h5>
                
                {/* Badges Toggles */}
                <div className="flex flex-wrap items-center gap-x-8 gap-y-2 pb-2">
                  <label className="flex items-center space-x-2 cursor-pointer py-2 font-bold text-neutral-600">
                    <input
                      type="checkbox"
                      name="isNew"
                      checked={formData.isNew}
                      onChange={(e) => setFormData((prev) => ({ ...prev, isNew: e.target.checked }))}
                      className="w-4 h-4 text-brand-rosegold rounded border-neutral-300 focus:ring-brand-rosegold"
                    />
                    <span>New In Label</span>
                  </label>

                  <label className="flex items-center space-x-2 cursor-pointer py-2 font-bold text-neutral-600">
                    <input
                      type="checkbox"
                      name="isLimited"
                      checked={formData.isLimited}
                      onChange={(e) => setFormData((prev) => ({ ...prev, isLimited: e.target.checked }))}
                      className="w-4 h-4 text-brand-rosegold rounded border-neutral-300 focus:ring-brand-rosegold"
                    />
                    <span>Limited Badge</span>
                  </label>

                  <label className="flex items-center space-x-2 cursor-pointer py-2 font-bold text-neutral-600">
                    <input
                      type="checkbox"
                      name="isCustom"
                      checked={formData.isCustom}
                      onChange={(e) => setFormData((prev) => ({ ...prev, isCustom: e.target.checked }))}
                      className="w-4 h-4 text-brand-rosegold rounded border-neutral-300 focus:ring-brand-rosegold"
                    />
                    <span>Custom Label</span>
                  </label>

                  <label className="flex items-center space-x-2 cursor-pointer py-2 font-bold text-neutral-600">
                    <input
                      type="checkbox"
                      name="isSale"
                      checked={formData.isSale}
                      onChange={(e) => setFormData((prev) => ({ ...prev, isSale: e.target.checked }))}
                      className="w-4 h-4 text-brand-rosegold rounded border-neutral-300 focus:ring-brand-rosegold"
                    />
                    <span>Sale Badge</span>
                  </label>
                </div>

                {formData.isCustom && (
                  <div className="space-y-1 pb-2 max-w-xs">
                    <label className="font-bold text-neutral-500">Custom Label Text *</label>
                    <input
                      type="text"
                      required
                      name="customText"
                      value={formData.customText}
                      onChange={handleFormChange}
                      placeholder="e.g. Best Seller, Pure Silver"
                      className="w-full px-3 py-2.5 rounded-lg border border-neutral-200 focus:outline-none focus:ring-1 focus:ring-brand-rosegold"
                    />
                  </div>
                )}

                {/* Rating and Reviews */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="font-bold text-neutral-500">Initial Rating</label>
                    <input
                      type="number"
                      step="0.1"
                      min="1"
                      max="5"
                      name="rating"
                      value={formData.rating}
                      onChange={handleFormChange}
                      className="w-full px-3 py-2.5 rounded-lg border border-neutral-200 focus:outline-none focus:ring-1 focus:ring-brand-rosegold"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-neutral-500">Initial Reviews</label>
                    <input
                      type="number"
                      min="0"
                      name="reviews"
                      value={formData.reviews}
                      onChange={handleFormChange}
                      className="w-full px-3 py-2.5 rounded-lg border border-neutral-200 focus:outline-none focus:ring-1 focus:ring-brand-rosegold"
                    />
                  </div>
                </div>
              </div>

              {/* Form Buttons */}
              <div className="pt-6 border-t border-neutral-100 flex items-center justify-end space-x-3 bg-neutral-50/20 -mx-6 -mb-6 p-6">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-6 py-3 rounded-lg font-bold border border-neutral-200 hover:bg-neutral-50 text-neutral-500 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-8 py-3 rounded-lg font-bold bg-brand-ink text-white hover:bg-neutral-800 transition-colors shadow-lg shadow-brand-ink/5 cursor-pointer"
                >
                  {editingProduct ? "Save Changes" : "Publish Product"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-neutral-950/40 backdrop-blur-xs" onClick={() => setDeleteConfirmId(null)} />
          <div className="relative w-full max-w-sm bg-white rounded-2xl p-6 shadow-2xl border border-neutral-100 text-center space-y-6">
            <div className="w-14 h-14 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto">
              <Trash2 size={24} />
            </div>
            
            <div className="space-y-2">
              <h3 className="font-serif text-lg font-bold text-neutral-950">Remove Product Permanent?</h3>
              <p className="text-neutral-400 font-light leading-relaxed">
                This action is permanent and will purge this jewelry piece document from your MongoDB Atlas database collection.
              </p>
            </div>

            <div className="flex flex-col gap-2">
              <button
                onClick={() => handleDeleteProduct(deleteConfirmId)}
                className="w-full py-3 bg-red-500 text-white rounded-xl text-[10px] uppercase tracking-widest font-bold hover:bg-red-600 transition-all cursor-pointer"
              >
                Yes, Purge Document
              </button>
              <button
                onClick={() => setDeleteConfirmId(null)}
                className="w-full py-3 bg-white border border-neutral-200 text-neutral-400 rounded-xl text-[10px] uppercase tracking-widest font-bold hover:bg-neutral-50 transition-all cursor-pointer"
              >
                Keep Document
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
