import React, { useEffect, useState } from "react";
import { 
  Plus, 
  Edit, 
  Trash2, 
  X, 
  Lock, 
  LogOut, 
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  TrendingUp, 
  AlertTriangle, 
  Database,
  Eye,
  Search,
  SlidersHorizontal,
  ShoppingBag,
  MessageSquare,
  MessageCircle,
  Clock,
  ChevronDown,
  ChevronUp,
  Mail,
  Phone,
  MapPin,
  CreditCard,
  Star,
  CheckCircle2,
  Activity,
  Users,
  Home,
  Package,
  UserRoundCheck,
  Settings,
  Download
  , Heart
  , Megaphone
  , Send
  , Tag
} from "lucide-react";
import { useProducts } from "../context/ProductContext";
import { Product } from "../types";
import { toast } from "sonner";
import logoImg from "../assets/images/saiksha-logo-mark.png";
import { cn } from "../lib/utils";
import { useLiveVisitors } from "../hooks/useLiveVisitors";
import { StoreSettings, useStoreSettings } from "../context/StoreSettingsContext";
import { useDiscountCampaigns } from "../context/DiscountCampaignContext";

interface AdminDashboardProps {
  onClose: () => void;
}

interface AdminCustomer {
  key: string;
  name: string;
  email: string;
  phone: string;
  city: string;
  totalOrders: number;
  totalSpent: number;
  cartLeads: number;
  lastActivity: string;
  source: "Customer" | "Lead";
}

type ProductCategoryFilter = "All" | Product["category"];
type ProductStatusFilter = "All" | "New" | "Sale" | "Limited" | "Custom";
type ProductStockFilter = "All" | "In Stock" | "Low Stock" | "Out of Stock";
type ProductSortOption = "Newest" | "Name A-Z" | "Price Low" | "Price High" | "Stock Low" | "Most Viewed";

export default function AdminDashboard({ onClose }: AdminDashboardProps) {
  const { products, addProduct, updateProduct, deleteProduct, adjustInventory } = useProducts();
  const { settings, updateSettings } = useStoreSettings();
  const { refreshCampaigns } = useDiscountCampaigns();
  const { activeVisitors, totalVisitors } = useLiveVisitors({ countAsVisitor: false });
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isCheckingSession, setIsCheckingSession] = useState(true);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // Tab State
  const [activeTab, setActiveTab] = useState<"overview" | "products" | "orders" | "customers" | "accounts" | "segments" | "discounts" | "campaigns" | "reviewAutomation" | "cartLeads" | "wishlistLeads" | "leadCaptures" | "searchAnalytics" | "testimonials" | "settings">("overview");

  // Orders State
  const [orders, setOrders] = useState<any[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<any | null>(null);
  const [orderSearch, setOrderSearch] = useState("");
  const [ordersPerPage, setOrdersPerPage] = useState(10);
  const [currentOrderPage, setCurrentOrderPage] = useState(1);
  const [salesAnalytics, setSalesAnalytics] = useState<any | null>(null);

  // Customer list controls
  const [customerSearch, setCustomerSearch] = useState("");
  const [customersPerPage, setCustomersPerPage] = useState(10);
  const [currentCustomerPage, setCurrentCustomerPage] = useState(1);
  const [customerMeta, setCustomerMeta] = useState<Record<string, any>>({});
  const [editingCustomerKey, setEditingCustomerKey] = useState<string | null>(null);
  const [customerMetaForm, setCustomerMetaForm] = useState({ tags: "", note: "" });
  const [customerAccounts, setCustomerAccounts] = useState<any[]>([]);

  // Product list controls
  const [productSearch, setProductSearch] = useState("");
  const [productCategoryFilter, setProductCategoryFilter] = useState<ProductCategoryFilter>("All");
  const [productStatusFilter, setProductStatusFilter] = useState<ProductStatusFilter>("All");
  const [productStockFilter, setProductStockFilter] = useState<ProductStockFilter>("All");
  const [productPriceFilter, setProductPriceFilter] = useState("All");
  const [productSort, setProductSort] = useState<ProductSortOption>("Newest");
  const [productsPerPage, setProductsPerPage] = useState(10);
  const [currentProductPage, setCurrentProductPage] = useState(1);

  // Saved Cart Leads State
  const [cartLeads, setCartLeads] = useState<any[]>([]);
  const [loadingCartLeads, setLoadingCartLeads] = useState(false);
  const [cartLeadsPerPage, setCartLeadsPerPage] = useState(10);
  const [currentCartLeadPage, setCurrentCartLeadPage] = useState(1);

  // Wishlist Recovery State
  const [wishlistLeads, setWishlistLeads] = useState<any[]>([]);
  const [loadingWishlistLeads, setLoadingWishlistLeads] = useState(false);
  const [wishlistLeadsPerPage, setWishlistLeadsPerPage] = useState(10);
  const [currentWishlistLeadPage, setCurrentWishlistLeadPage] = useState(1);

  // Search Analytics State
  const [searchAnalytics, setSearchAnalytics] = useState<any[]>([]);
  const [loadingSearchAnalytics, setLoadingSearchAnalytics] = useState(false);

  // Lead Capture State
  const [leadCaptures, setLeadCaptures] = useState<any[]>([]);
  const [loadingLeadCaptures, setLoadingLeadCaptures] = useState(false);
  const [leadCapturesPerPage, setLeadCapturesPerPage] = useState(10);
  const [currentLeadCapturePage, setCurrentLeadCapturePage] = useState(1);

  // Growth Tools State
  const [discountCampaigns, setDiscountCampaigns] = useState<any[]>([]);
  const [customerSegments, setCustomerSegments] = useState<any>({ counts: {}, customers: [] });
  const [whatsAppCampaigns, setWhatsAppCampaigns] = useState<any[]>([]);
  const [reviewReminders, setReviewReminders] = useState<any[]>([]);
  const [discountForm, setDiscountForm] = useState({
    title: "Buy 2 get 10% off",
    type: "Percent Off",
    status: "Paused",
    discountPercent: 10,
    minCartValue: 0,
    minItems: 2,
    category: "All",
    startsAt: "",
    endsAt: "",
    badgeText: "Auto applied"
  });
  const [campaignForm, setCampaignForm] = useState({
    title: "New arrivals follow-up",
    fromNumber: settings.whatsappNumber || "917383055032",
    audience: "All Customers",
    manualNumbers: "",
    message: "Hello {{name}}, Saiksha has a new jewelry update for you. Explore the latest collection today."
  });

  // Testimonials State
  const [testimonials, setTestimonials] = useState<any[]>([]);
  const [loadingTestimonials, setLoadingTestimonials] = useState(false);
  const [testimonialsPerPage, setTestimonialsPerPage] = useState(9);
  const [currentTestimonialPage, setCurrentTestimonialPage] = useState(1);

  // Store Settings State
  const [settingsForm, setSettingsForm] = useState<StoreSettings>(settings);
  const [savingSettings, setSavingSettings] = useState(false);

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
    exchangePolicy: "",
    variantsText: ""
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
      fetchCartLeads();
      fetchWishlistLeads();
      fetchLeadCaptures();
      fetchSearchAnalytics();
      fetchTestimonials();
      fetchSalesAnalytics();
      fetchCustomerMeta();
      fetchCustomerAccounts();
      fetchDiscountCampaigns();
      fetchCustomerSegments();
      fetchWhatsAppCampaigns();
      fetchReviewReminders();
    }
  }, [isAuthenticated]);

  useEffect(() => {
    setSettingsForm(settings);
    setCampaignForm((prev) => ({ ...prev, fromNumber: prev.fromNumber || settings.whatsappNumber || "917383055032" }));
  }, [settings]);

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

  const fetchCartLeads = async () => {
    setLoadingCartLeads(true);
    try {
      const response = await fetch("/api/admin/abandoned-carts", { credentials: "include" });
      if (response.ok) {
        const data = await response.json();
        setCartLeads(data);
      } else if (response.status === 401) {
        setIsAuthenticated(false);
      }
    } catch (err) {
      console.error("Error fetching cart leads:", err);
    } finally {
      setLoadingCartLeads(false);
    }
  };

  const fetchWishlistLeads = async () => {
    setLoadingWishlistLeads(true);
    try {
      const response = await fetch("/api/admin/wishlist-leads", { credentials: "include" });
      if (response.ok) {
        setWishlistLeads(await response.json());
      } else if (response.status === 401) {
        setIsAuthenticated(false);
      }
    } catch (err) {
      console.error("Error fetching wishlist leads:", err);
    } finally {
      setLoadingWishlistLeads(false);
    }
  };

  const fetchSearchAnalytics = async () => {
    setLoadingSearchAnalytics(true);
    try {
      const response = await fetch("/api/admin/search-analytics", { credentials: "include" });
      if (response.ok) {
        setSearchAnalytics(await response.json());
      } else if (response.status === 401) {
        setIsAuthenticated(false);
      }
    } catch (err) {
      console.error("Error fetching search analytics:", err);
    } finally {
      setLoadingSearchAnalytics(false);
    }
  };

  const fetchLeadCaptures = async () => {
    setLoadingLeadCaptures(true);
    try {
      const response = await fetch("/api/admin/lead-captures", { credentials: "include" });
      if (response.ok) {
        setLeadCaptures(await response.json());
      } else if (response.status === 401) {
        setIsAuthenticated(false);
      }
    } catch (err) {
      console.error("Error fetching lead captures:", err);
    } finally {
      setLoadingLeadCaptures(false);
    }
  };

  const fetchDiscountCampaigns = async () => {
    try {
      const response = await fetch("/api/admin/discount-campaigns", { credentials: "include" });
      if (response.ok) setDiscountCampaigns(await response.json());
      else if (response.status === 401) setIsAuthenticated(false);
    } catch (err) {
      console.error("Error fetching discount campaigns:", err);
    }
  };

  const fetchCustomerSegments = async () => {
    try {
      const response = await fetch("/api/admin/customer-segments", { credentials: "include" });
      if (response.ok) setCustomerSegments(await response.json());
      else if (response.status === 401) setIsAuthenticated(false);
    } catch (err) {
      console.error("Error fetching customer segments:", err);
    }
  };

  const fetchWhatsAppCampaigns = async () => {
    try {
      const response = await fetch("/api/admin/whatsapp-campaigns", { credentials: "include" });
      if (response.ok) setWhatsAppCampaigns(await response.json());
      else if (response.status === 401) setIsAuthenticated(false);
    } catch (err) {
      console.error("Error fetching WhatsApp campaigns:", err);
    }
  };

  const fetchReviewReminders = async () => {
    try {
      const response = await fetch("/api/admin/review-reminders", { credentials: "include" });
      if (response.ok) setReviewReminders(await response.json());
      else if (response.status === 401) setIsAuthenticated(false);
    } catch (err) {
      console.error("Error fetching review reminders:", err);
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

  const fetchSalesAnalytics = async () => {
    try {
      const response = await fetch("/api/admin/analytics/sales", { credentials: "include" });
      if (response.ok) {
        setSalesAnalytics(await response.json());
      } else if (response.status === 401) {
        setIsAuthenticated(false);
      }
    } catch (err) {
      console.error("Error fetching sales analytics:", err);
    }
  };

  const fetchCustomerMeta = async () => {
    try {
      const response = await fetch("/api/admin/customers/meta", { credentials: "include" });
      if (response.ok) {
        const data = await response.json();
        setCustomerMeta(
          data.reduce((map: Record<string, any>, item: any) => {
            map[item.key] = item;
            return map;
          }, {})
        );
      }
    } catch (err) {
      console.error("Error fetching customer meta:", err);
    }
  };

  const fetchCustomerAccounts = async () => {
    try {
      const response = await fetch("/api/admin/customer-accounts", { credentials: "include" });
      if (response.ok) {
        setCustomerAccounts(await response.json());
      } else if (response.status === 401) {
        setIsAuthenticated(false);
      }
    } catch (err) {
      console.error("Error fetching customer accounts:", err);
    }
  };

  const openCustomerMetaEditor = (customer: AdminCustomer) => {
    const meta = customerMeta[customer.key] || {};
    setEditingCustomerKey(customer.key);
    setCustomerMetaForm({
      tags: (meta.tags || []).join(", "),
      note: meta.note || ""
    });
  };

  const saveCustomerMeta = async (customer: AdminCustomer) => {
    try {
      const response = await fetch(`/api/admin/customers/${encodeURIComponent(customer.key)}/meta`, {
        method: "PUT",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: customer.name,
          email: customer.email,
          phone: customer.phone,
          tags: customerMetaForm.tags,
          note: customerMetaForm.note
        })
      });
      if (response.ok) {
        const updated = await response.json();
        setCustomerMeta((prev) => ({ ...prev, [customer.key]: updated }));
        setEditingCustomerKey(null);
        toast.success("Customer notes saved.");
      } else {
        toast.error("Could not save customer notes.");
      }
    } catch (err) {
      console.error("Error saving customer meta:", err);
      toast.error("Could not save customer notes.");
    }
  };

  const exportAdminData = (type: "orders" | "products" | "customers") => {
    window.open(`/api/admin/export/${type}`, "_blank");
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

  const handleSettingsChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    const nextValue = type === "checkbox" ? (e.target as HTMLInputElement).checked : value;
    setSettingsForm((prev) => ({
      ...prev,
      [name]: ["freeShippingThreshold", "couponDiscountPercent", "couponMinOrder", "couponUsageLimit"].includes(name) ? Number(nextValue) : nextValue
    }));
  };

  const handleFollowUpTemplateChange = (index: number, field: "title" | "message", value: string) => {
    setSettingsForm((prev) => {
      const templates = [...(prev.cartLeadFollowUpTemplates || [])];
      templates[index] = { ...templates[index], [field]: value };
      return { ...prev, cartLeadFollowUpTemplates: templates };
    });
  };

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAuthenticated) return;
    setSavingSettings(true);
    const result = await updateSettings(settingsForm);
    setSavingSettings(false);
    if (result.success) {
      toast.success("Store settings saved.");
    } else if (result.status === 401) {
      setIsAuthenticated(false);
      toast.error("Admin session expired. Please log in again.");
    } else {
      toast.error(result.message || "Failed to save store settings.");
    }
  };

  const handleSaveDiscountCampaign = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch("/api/admin/discount-campaigns", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(discountForm)
      });
      if (!response.ok) throw new Error("Failed to save campaign");
      toast.success("Discount campaign added.");
      setDiscountForm((prev) => ({ ...prev, status: "Paused" }));
      fetchDiscountCampaigns();
      refreshCampaigns();
    } catch (err) {
      console.error("Error saving discount campaign:", err);
      toast.error("Could not save discount campaign.");
    }
  };

  const handleUpdateDiscountCampaignStatus = async (campaign: any, status: "Active" | "Paused") => {
    try {
      const response = await fetch(`/api/admin/discount-campaigns/${campaign._id}`, {
        method: "PUT",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...campaign, status })
      });
      if (!response.ok) throw new Error("Failed to update campaign");
      toast.success(`Campaign ${status.toLowerCase()}.`);
      fetchDiscountCampaigns();
      refreshCampaigns();
    } catch (err) {
      console.error("Error updating discount campaign:", err);
      toast.error("Could not update campaign.");
    }
  };

  const handleDeleteDiscountCampaign = async (id: string) => {
    if (!window.confirm("Delete this discount campaign?")) return;
    try {
      const response = await fetch(`/api/admin/discount-campaigns/${id}`, { method: "DELETE", credentials: "include" });
      if (!response.ok) throw new Error("Failed to delete campaign");
      setDiscountCampaigns((prev) => prev.filter((campaign) => campaign._id !== id));
      toast.success("Campaign deleted.");
      refreshCampaigns();
    } catch (err) {
      console.error("Error deleting discount campaign:", err);
      toast.error("Could not delete campaign.");
    }
  };

  const audienceCustomers = (audience: string) => {
    const allCustomers = customerSegments.customers || [];
    if (audience === "All Customers") return allCustomers;
    return allCustomers.filter((customer: any) => (customer.segments || []).includes(audience));
  };

  const buildWhatsAppCampaignUrl = (phone: string, message: string, name = "there") => {
    const cleanPhone = String(phone || "").replace(/\D/g, "").slice(-10);
    const text = message.replace(/{{name}}/g, name || "there").replace(/{{coupon}}/g, settings.couponCode || "our current offer");
    return `https://wa.me/91${cleanPhone}?text=${encodeURIComponent(text)}`;
  };

  const handleSaveWhatsAppCampaign = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch("/api/admin/whatsapp-campaigns", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...campaignForm,
          manualNumbers: campaignForm.audience === "Manual"
            ? campaignForm.manualNumbers
            : audienceCustomers(campaignForm.audience).map((customer: any) => customer.phone).join(",")
        })
      });
      if (!response.ok) throw new Error("Failed to prepare campaign");
      toast.success("WhatsApp campaign prepared.");
      fetchWhatsAppCampaigns();
    } catch (err) {
      console.error("Error preparing WhatsApp campaign:", err);
      toast.error("Could not prepare WhatsApp campaign.");
    }
  };

  const handleDeleteWhatsAppCampaign = async (id: string) => {
    if (!window.confirm("Delete this WhatsApp campaign?")) return;
    try {
      const response = await fetch(`/api/admin/whatsapp-campaigns/${id}`, { method: "DELETE", credentials: "include" });
      if (!response.ok) throw new Error("Failed to delete campaign");
      setWhatsAppCampaigns((prev) => prev.filter((campaign) => campaign._id !== id));
      toast.success("WhatsApp campaign deleted.");
    } catch (err) {
      console.error("Error deleting WhatsApp campaign:", err);
      toast.error("Could not delete WhatsApp campaign.");
    }
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

  const handleDeleteOrder = async (orderId: string) => {
    if (!window.confirm(`Delete order ${orderId} permanently?`)) return;
    try {
      const response = await fetch(`/api/admin/orders/${orderId}`, {
        method: "DELETE",
        credentials: "include"
      });
      if (response.ok) {
        setOrders((prev) => prev.filter((order) => order.orderId !== orderId));
        if (expandedOrderId === orderId) setExpandedOrderId(null);
        if (selectedOrder?.orderId === orderId) setSelectedOrder(null);
        toast.success(`Order ${orderId} deleted.`);
      } else if (response.status === 401) {
        setIsAuthenticated(false);
        toast.error("Session expired. Please log in again.");
      } else {
        const data = await response.json().catch(() => ({}));
        toast.error(data.error || "Failed to delete order.");
      }
    } catch (err) {
      console.error("Error deleting order:", err);
      toast.error("Could not delete order.");
    }
  };

  const updateOrderInState = (updatedOrder: any) => {
    setOrders((prev) => prev.map((order) => (order.orderId === updatedOrder.orderId ? updatedOrder : order)));
    setSelectedOrder((current: any) => current?.orderId === updatedOrder.orderId ? updatedOrder : current);
  };

  const handleAddOrderTimeline = async (orderId: string) => {
    const note = window.prompt("Add order timeline note");
    if (!note) return;
    try {
      const response = await fetch(`/api/admin/orders/${orderId}/timeline`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: "Admin note", note })
      });
      if (response.ok) {
        updateOrderInState(await response.json());
        toast.success("Order timeline updated.");
      } else {
        toast.error("Could not add timeline note.");
      }
    } catch (err) {
      console.error("Error adding timeline note:", err);
      toast.error("Could not add timeline note.");
    }
  };

  const handleUpdateRefund = async (orderId: string) => {
    const status = window.prompt("Refund status: Requested, Approved, Rejected, Refunded, None", "Requested");
    if (!status) return;
    const amount = Number(window.prompt("Refund amount", "0") || 0);
    const reason = window.prompt("Refund reason", "") || "";
    try {
      const response = await fetch(`/api/admin/orders/${orderId}/refund`, {
        method: "PUT",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status, amount, reason })
      });
      if (response.ok) {
        updateOrderInState(await response.json());
        toast.success("Refund details updated.");
      } else {
        const data = await response.json().catch(() => ({}));
        toast.error(data.error || "Could not update refund.");
      }
    } catch (err) {
      console.error("Error updating refund:", err);
      toast.error("Could not update refund.");
    }
  };

  const handleDeleteCartLead = async (id: string) => {
    if (!window.confirm("Delete this cart lead permanently?")) return;
    try {
      const response = await fetch(`/api/admin/abandoned-carts/${id}`, {
        method: "DELETE",
        credentials: "include"
      });
      if (response.ok) {
        setCartLeads((prev) => prev.filter((lead) => lead._id !== id));
        toast.success("Cart lead deleted.");
      } else if (response.status === 401) {
        setIsAuthenticated(false);
        toast.error("Session expired. Please log in again.");
      } else {
        const data = await response.json().catch(() => ({}));
        toast.error(data.error || "Failed to delete cart lead.");
      }
    } catch (err) {
      console.error("Error deleting cart lead:", err);
      toast.error("Could not delete cart lead.");
    }
  };

  const handleUpdateCartLeadStatus = async (id: string, status: "Open" | "Contacted" | "Converted") => {
    try {
      const response = await fetch(`/api/admin/abandoned-carts/${id}/status`, {
        method: "PUT",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status })
      });
      if (response.ok) {
        const updatedLead = await response.json();
        setCartLeads((prev) => prev.map((lead) => (lead._id === id ? updatedLead : lead)));
        toast.success(`Cart lead marked ${status.toLowerCase()}.`);
      } else if (response.status === 401) {
        setIsAuthenticated(false);
        toast.error("Session expired. Please log in again.");
      } else {
        const data = await response.json().catch(() => ({}));
        toast.error(data.error || "Failed to update cart lead.");
      }
    } catch (err) {
      console.error("Error updating cart lead:", err);
      toast.error("Could not update cart lead.");
    }
  };

  const handleDeleteWishlistLead = async (id: string) => {
    if (!window.confirm("Delete this wishlist lead permanently?")) return;
    try {
      const response = await fetch(`/api/admin/wishlist-leads/${id}`, {
        method: "DELETE",
        credentials: "include"
      });
      if (response.ok) {
        setWishlistLeads((prev) => prev.filter((lead) => lead._id !== id));
        toast.success("Wishlist lead deleted.");
      } else {
        toast.error("Failed to delete wishlist lead.");
      }
    } catch (err) {
      console.error("Error deleting wishlist lead:", err);
      toast.error("Could not delete wishlist lead.");
    }
  };

  const handleUpdateWishlistLeadStatus = async (id: string, status: "Open" | "Contacted" | "Converted") => {
    try {
      const response = await fetch(`/api/admin/wishlist-leads/${id}/status`, {
        method: "PUT",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status })
      });
      if (response.ok) {
        const updatedLead = await response.json();
        setWishlistLeads((prev) => prev.map((lead) => (lead._id === id ? updatedLead : lead)));
        toast.success(`Wishlist lead marked ${status.toLowerCase()}.`);
      } else {
        toast.error("Failed to update wishlist lead.");
      }
    } catch (err) {
      console.error("Error updating wishlist lead:", err);
      toast.error("Could not update wishlist lead.");
    }
  };

  const handleDeleteSearchAnalytics = async (id: string) => {
    try {
      const response = await fetch(`/api/admin/search-analytics/${id}`, {
        method: "DELETE",
        credentials: "include"
      });
      if (response.ok) {
        setSearchAnalytics((prev) => prev.filter((entry) => entry._id !== id));
        toast.success("Search entry removed.");
      } else {
        toast.error("Failed to delete search entry.");
      }
    } catch (err) {
      console.error("Error deleting search analytics:", err);
      toast.error("Could not delete search entry.");
    }
  };

  const handleDeleteLeadCapture = async (id: string) => {
    if (!window.confirm("Delete this lead permanently?")) return;
    try {
      const response = await fetch(`/api/admin/lead-captures/${id}`, {
        method: "DELETE",
        credentials: "include"
      });
      if (response.ok) {
        setLeadCaptures((prev) => prev.filter((lead) => lead._id !== id));
        toast.success("Lead deleted.");
      } else {
        toast.error("Failed to delete lead.");
      }
    } catch (err) {
      console.error("Error deleting lead:", err);
      toast.error("Could not delete lead.");
    }
  };

  const handleUpdateLeadCaptureStatus = async (id: string, status: "Open" | "Contacted" | "Converted") => {
    try {
      const response = await fetch(`/api/admin/lead-captures/${id}/status`, {
        method: "PUT",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status })
      });
      if (response.ok) {
        const updatedLead = await response.json();
        setLeadCaptures((prev) => prev.map((lead) => (lead._id === id ? updatedLead : lead)));
        toast.success(`Lead marked ${status.toLowerCase()}.`);
      } else {
        toast.error("Failed to update lead.");
      }
    } catch (err) {
      console.error("Error updating lead:", err);
      toast.error("Could not update lead.");
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
      exchangePolicy: "",
      variantsText: ""
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
      exchangePolicy: product.exchangePolicy || "",
      variantsText: (product.variants || []).map((variant) => `${variant.name} | ${variant.value} | ${variant.price || ""} | ${variant.stock || ""}`).join("\n")
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
    const variantsArray = formData.variantsText
      ? formData.variantsText
          .split("\n")
          .map((line) => {
            const [name, value, price, stock] = line.split("|").map((part) => part.trim());
            return name && value
              ? {
                  name,
                  value,
                  price: price ? Number(price) : undefined,
                  stock: stock ? Number(stock) : undefined
                }
              : null;
          })
          .filter(Boolean)
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
      variants: variantsArray.length > 0 ? variantsArray : undefined,
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

  const handleAdjustInventory = async (product: Product) => {
    const changeValue = window.prompt(`Adjust stock for ${product.name}. Use positive or negative number.`, "0");
    if (changeValue === null) return;
    const change = Number(changeValue);
    if (!Number.isFinite(change) || change === 0) {
      toast.error("Enter a valid non-zero stock adjustment.");
      return;
    }
    const note = window.prompt("Inventory note", change > 0 ? "Stock added" : "Stock reduced") || "";
    const result = await adjustInventory(product.id, change, note);
    if (result.success) {
      toast.success("Inventory adjusted and logged.");
    } else {
      showProductActionError(result.status, result.message);
    }
  };

  const getCartLeadStatusClass = (status?: string) => {
    if (status === "Converted") return "bg-green-50 text-green-700 border-green-100";
    if (status === "Contacted") return "bg-blue-50 text-blue-700 border-blue-100";
    return "bg-amber-50 text-amber-700 border-amber-100";
  };

  const buildCartLeadFollowUpUrl = (lead: any, message: string) => {
    const cleanPhone = String(lead.customer?.phone || "").replace(/\D/g, "");
    const personalized = message
      .replace(/{{name}}/g, lead.customer?.name || "there")
      .replace(/{{coupon}}/g, settings.couponCode || "our current offer");
    return `https://wa.me/91${cleanPhone}?text=${encodeURIComponent(personalized)}`;
  };

  // Stats calculation
  const totalProducts = products.length;
  const pendingOrdersCount = orders.filter((o) => o.status === "Pending").length;
  const totalReviewsCount = testimonials.length;
  const totalProductViews = products.reduce((total, product) => total + (product.views || 0), 0);
  const openCartLeadsCount = cartLeads.filter((lead) => lead.status !== "Converted").length;
  const openWishlistLeadsCount = wishlistLeads.filter((lead) => lead.status !== "Converted").length;
  const openLeadCapturesCount = leadCaptures.filter((lead) => lead.status !== "Converted").length;
  const lowStockProducts = products
    .filter((product) => product.stock <= 5)
    .slice(0, 5);
  const recentOrders = orders.slice(0, 5);
  const recentCartLeads = cartLeads.slice(0, 4);
  const customers: AdminCustomer[] = Array.from(
    [...orders, ...cartLeads].reduce<Map<string, AdminCustomer>>((map, record) => {
      const isOrder = !!record.orderId;
      const customer = record.customer || {};
      const email = String(customer.email || "").trim().toLowerCase();
      const phone = String(customer.phone || "").trim();
      const key = email || phone;
      if (!key) return map;

      const existing: AdminCustomer = map.get(key) || {
        key,
        name: "",
        email: "",
        phone: "",
        city: "",
        totalOrders: 0,
        totalSpent: 0,
        cartLeads: 0,
        lastActivity: "",
        source: "Lead"
      };

      const fullName = isOrder
        ? `${customer.firstName || ""} ${customer.lastName || ""}`.trim()
        : customer.name || "";

      existing.name = existing.name || fullName || "Unnamed customer";
      existing.email = existing.email || email;
      existing.phone = existing.phone || phone;
      existing.city = existing.city || customer.city || "";
      existing.lastActivity = [existing.lastActivity, record.updatedAt || record.createdAt]
        .filter(Boolean)
        .sort()
        .at(-1) || "";

      if (isOrder) {
        existing.totalOrders += 1;
        existing.totalSpent += Number(record.total || 0);
        existing.source = "Customer";
      } else {
        existing.cartLeads += 1;
      }

      map.set(key, existing);
      return map;
    }, new Map<string, any>()).values()
  ).sort((a, b) => String(b.lastActivity).localeCompare(String(a.lastActivity)));
  const filteredCustomers = customers.filter((customer) => {
    const query = customerSearch.trim().toLowerCase();
    if (!query) return true;
    return [customer.name, customer.email, customer.phone, customer.city, customer.source]
      .filter(Boolean)
      .join(" ")
      .toLowerCase()
      .includes(query);
  });
  const paginatedCustomers = filteredCustomers.slice(
    (currentCustomerPage - 1) * customersPerPage,
    currentCustomerPage * customersPerPage
  );
  const adminNavItems = [
    { id: "overview" as const, label: "Home", count: null, icon: Home },
    { id: "products" as const, label: "Products", count: totalProducts, icon: Package },
    { id: "orders" as const, label: "Orders", count: orders.length, icon: ShoppingBag },
    { id: "customers" as const, label: "Customers", count: customers.length, icon: Users },
    { id: "accounts" as const, label: "Accounts", count: customerAccounts.length, icon: UserRoundCheck },
    { id: "segments" as const, label: "Segments", count: (customerSegments.customers || []).length, icon: Tag },
    { id: "discounts" as const, label: "Discounts", count: discountCampaigns.filter((campaign) => campaign.status === "Active").length, icon: Megaphone },
    { id: "campaigns" as const, label: "Campaign Center", count: whatsAppCampaigns.length, icon: Send },
    { id: "reviewAutomation" as const, label: "Review Requests", count: reviewReminders.length, icon: Star },
    { id: "cartLeads" as const, label: "Cart Leads", count: openCartLeadsCount, icon: UserRoundCheck },
    { id: "wishlistLeads" as const, label: "Wishlist Leads", count: openWishlistLeadsCount, icon: Heart },
    { id: "leadCaptures" as const, label: "Lead Captures", count: openLeadCapturesCount, icon: MessageCircle },
    { id: "searchAnalytics" as const, label: "Search Analytics", count: searchAnalytics.length, icon: Search },
    { id: "testimonials" as const, label: "Testimonials", count: totalReviewsCount, icon: MessageSquare },
    { id: "settings" as const, label: "Store Settings", count: null, icon: Settings }
  ];
  const productCategories: ProductCategoryFilter[] = ["All", "Earrings", "Necklaces", "Bestsellers", "New Arrivals", "Gifts"];
  const productPriceFilters = ["All", "Under Rs 1,000", "Rs 1,000 - Rs 2,500", "Rs 2,500 - Rs 5,000", "Above Rs 5,000"];
  const productFiltersActive = [
    productSearch.trim(),
    productCategoryFilter !== "All",
    productStatusFilter !== "All",
    productStockFilter !== "All",
    productPriceFilter !== "All",
    productSort !== "Newest"
  ].some(Boolean);
  const getProductDisplayPrice = (product: Product) => product.isSale && product.salePrice ? product.salePrice : product.price;
  const clearProductFilters = () => {
    setProductSearch("");
    setProductCategoryFilter("All");
    setProductStatusFilter("All");
    setProductStockFilter("All");
    setProductPriceFilter("All");
    setProductSort("Newest");
  };
  const filteredProducts = products
    .filter((product) => {
      const query = productSearch.trim().toLowerCase();
      if (query && !product.name.toLowerCase().includes(query)) return false;
      if (productCategoryFilter !== "All" && product.category !== productCategoryFilter) return false;

      if (productStatusFilter === "New" && !product.isNew) return false;
      if (productStatusFilter === "Sale" && !product.isSale) return false;
      if (productStatusFilter === "Limited" && !product.isLimited) return false;
      if (productStatusFilter === "Custom" && !product.isCustom) return false;

      if (productStockFilter === "In Stock" && product.stock <= 0) return false;
      if (productStockFilter === "Low Stock" && (product.stock <= 0 || product.stock > 5)) return false;
      if (productStockFilter === "Out of Stock" && product.stock !== 0) return false;

      const displayPrice = getProductDisplayPrice(product);
      if (productPriceFilter === "Under Rs 1,000" && displayPrice >= 1000) return false;
      if (productPriceFilter === "Rs 1,000 - Rs 2,500" && (displayPrice < 1000 || displayPrice > 2500)) return false;
      if (productPriceFilter === "Rs 2,500 - Rs 5,000" && (displayPrice < 2500 || displayPrice > 5000)) return false;
      if (productPriceFilter === "Above Rs 5,000" && displayPrice <= 5000) return false;

      return true;
    })
    .sort((a, b) => {
      if (productSort === "Name A-Z") return a.name.localeCompare(b.name);
      if (productSort === "Price Low") return getProductDisplayPrice(a) - getProductDisplayPrice(b);
      if (productSort === "Price High") return getProductDisplayPrice(b) - getProductDisplayPrice(a);
      if (productSort === "Stock Low") return a.stock - b.stock;
      if (productSort === "Most Viewed") return (b.views || 0) - (a.views || 0);
      return 0;
    });
  const filteredOrders = orders.filter((order) => {
    const query = orderSearch.trim().toLowerCase();
    if (!query) return true;

    const searchable = [
      order.orderId,
      order.customer?.firstName,
      order.customer?.lastName,
      order.customer?.email,
      order.customer?.phone,
      order.customer?.city,
      order.status,
      ...(order.items || []).map((item: any) => item.name)
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();

    return searchable.includes(query);
  });
  const paginatedProducts = filteredProducts.slice(
    (currentProductPage - 1) * productsPerPage,
    currentProductPage * productsPerPage
  );
  const paginatedOrders = filteredOrders.slice(
    (currentOrderPage - 1) * ordersPerPage,
    currentOrderPage * ordersPerPage
  );
  const paginatedCartLeads = cartLeads.slice(
    (currentCartLeadPage - 1) * cartLeadsPerPage,
    currentCartLeadPage * cartLeadsPerPage
  );
  const paginatedWishlistLeads = wishlistLeads.slice(
    (currentWishlistLeadPage - 1) * wishlistLeadsPerPage,
    currentWishlistLeadPage * wishlistLeadsPerPage
  );
  const paginatedLeadCaptures = leadCaptures.slice(
    (currentLeadCapturePage - 1) * leadCapturesPerPage,
    currentLeadCapturePage * leadCapturesPerPage
  );
  const paginatedTestimonials = testimonials.slice(
    (currentTestimonialPage - 1) * testimonialsPerPage,
    currentTestimonialPage * testimonialsPerPage
  );

  useEffect(() => {
    setCurrentProductPage(1);
  }, [
    productSearch,
    productCategoryFilter,
    productStatusFilter,
    productStockFilter,
    productPriceFilter,
    productSort,
    productsPerPage
  ]);

  useEffect(() => {
    setCurrentOrderPage(1);
  }, [orderSearch, ordersPerPage]);

  useEffect(() => {
    setCurrentCustomerPage(1);
  }, [customerSearch, customersPerPage]);

  useEffect(() => {
    const totalPages = Math.max(1, Math.ceil(filteredProducts.length / productsPerPage));
    if (currentProductPage > totalPages) setCurrentProductPage(totalPages);
  }, [currentProductPage, filteredProducts.length, productsPerPage]);

  useEffect(() => {
    const totalPages = Math.max(1, Math.ceil(filteredOrders.length / ordersPerPage));
    if (currentOrderPage > totalPages) setCurrentOrderPage(totalPages);
  }, [currentOrderPage, filteredOrders.length, ordersPerPage]);

  useEffect(() => {
    const totalPages = Math.max(1, Math.ceil(filteredCustomers.length / customersPerPage));
    if (currentCustomerPage > totalPages) setCurrentCustomerPage(totalPages);
  }, [currentCustomerPage, filteredCustomers.length, customersPerPage]);

  useEffect(() => {
    const totalPages = Math.max(1, Math.ceil(cartLeads.length / cartLeadsPerPage));
    if (currentCartLeadPage > totalPages) setCurrentCartLeadPage(totalPages);
  }, [cartLeads.length, cartLeadsPerPage, currentCartLeadPage]);

  useEffect(() => {
    const totalPages = Math.max(1, Math.ceil(wishlistLeads.length / wishlistLeadsPerPage));
    if (currentWishlistLeadPage > totalPages) setCurrentWishlistLeadPage(totalPages);
  }, [wishlistLeads.length, wishlistLeadsPerPage, currentWishlistLeadPage]);

  useEffect(() => {
    const totalPages = Math.max(1, Math.ceil(leadCaptures.length / leadCapturesPerPage));
    if (currentLeadCapturePage > totalPages) setCurrentLeadCapturePage(totalPages);
  }, [leadCaptures.length, leadCapturesPerPage, currentLeadCapturePage]);

  useEffect(() => {
    const totalPages = Math.max(1, Math.ceil(testimonials.length / testimonialsPerPage));
    if (currentTestimonialPage > totalPages) setCurrentTestimonialPage(totalPages);
  }, [testimonials.length, testimonialsPerPage, currentTestimonialPage]);

  const renderPagination = (
    totalItems: number,
    currentPage: number,
    perPage: number,
    setCurrentPage: React.Dispatch<React.SetStateAction<number>>,
    setPerPage: React.Dispatch<React.SetStateAction<number>>,
    label: string,
    options: number[] = [10, 20, 30, 50]
  ) => {
    if (totalItems === 0) return null;

    const totalPages = Math.max(1, Math.ceil(totalItems / perPage));
    const start = (currentPage - 1) * perPage + 1;
    const end = Math.min(currentPage * perPage, totalItems);
    const pages = Array.from({ length: totalPages }, (_, i) => i + 1);

    return (
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-white px-5 py-3 border-t border-neutral-100">
        <div className="flex items-center gap-3">
          <span className="text-[10px] uppercase tracking-wider text-neutral-400 font-bold">Show</span>
          <select
            value={perPage}
            onChange={(e) => {
              setPerPage(Number(e.target.value));
              setCurrentPage(1);
            }}
            className="text-[10px] font-bold text-neutral-700 border border-neutral-200 rounded-lg px-3 py-1.5 bg-neutral-50 focus:outline-none focus:ring-1 focus:ring-brand-rosegold cursor-pointer"
          >
            {options.map((value) => (
              <option key={value} value={value}>{value}</option>
            ))}
          </select>
          <span className="text-[10px] text-neutral-400 font-mono">
            Showing {start}-{end} of {totalItems} {label}
          </span>
        </div>

        {totalPages > 1 && (
          <div className="flex items-center gap-1">
            <button
              onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
              disabled={currentPage === 1}
              className="p-1.5 rounded-lg border border-neutral-200 text-neutral-400 hover:text-neutral-700 hover:bg-neutral-50 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
            >
              <ChevronLeft size={14} />
            </button>
            {pages.map((page) => (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                className={cn(
                  "min-w-[32px] h-8 px-2 rounded-lg text-[10px] font-bold border transition-all",
                  currentPage === page
                    ? "bg-brand-ink text-white border-brand-ink"
                    : "bg-white text-neutral-500 border-neutral-200 hover:bg-neutral-50 hover:text-neutral-800"
                )}
              >
                {page}
              </button>
            ))}
            <button
              onClick={() => setCurrentPage((page) => Math.min(totalPages, page + 1))}
              disabled={currentPage === totalPages}
              className="p-1.5 rounded-lg border border-neutral-200 text-neutral-400 hover:text-neutral-700 hover:bg-neutral-50 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
            >
              <ChevronRight size={14} />
            </button>
          </div>
        )}
      </div>
    );
  };

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
    <div className="min-h-screen bg-[#f6f6f3] text-neutral-800 font-sans">
      <div className="flex min-h-screen">
        <aside className="hidden lg:flex w-72 shrink-0 flex-col border-r border-neutral-200 bg-[#202123] text-white">
          <div className="p-5 border-b border-white/10">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-white flex items-center justify-center overflow-hidden">
                <img src={logoImg} alt="Saiksha Logo" className="h-9 w-9 rounded-full object-cover" referrerPolicy="no-referrer" />
              </div>
              <div>
                <p className="font-serif text-sm tracking-[3px] uppercase font-bold">Saiksha</p>
                <p className="text-[10px] text-white/45">Commerce admin</p>
              </div>
            </div>
          </div>

          <nav className="flex-1 p-3 space-y-1">
            {adminNavItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={cn(
                    "w-full flex items-center justify-between rounded-lg px-3 py-2.5 text-sm transition-colors cursor-pointer",
                    isActive ? "bg-white text-neutral-950 shadow-sm" : "text-white/75 hover:bg-white/10 hover:text-white"
                  )}
                >
                  <span className="flex items-center gap-3">
                    <Icon size={17} />
                    <span className="font-medium">{item.label}</span>
                  </span>
                  {item.count !== null && (
                    <span className={cn("text-[10px] rounded-full px-2 py-0.5", isActive ? "bg-neutral-100 text-neutral-600" : "bg-white/10 text-white/60")}>
                      {item.count}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          <div className="p-3 border-t border-white/10 space-y-2">
            <button
              onClick={onClose}
              className="w-full flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-white/70 hover:bg-white/10 hover:text-white transition-colors cursor-pointer"
            >
              <ChevronLeft size={16} />
              <span>View storefront</span>
            </button>
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-red-200 hover:bg-red-500/15 hover:text-red-100 transition-colors cursor-pointer"
            >
              <LogOut size={16} />
              <span>Log out</span>
            </button>
          </div>
        </aside>

        <div className="min-w-0 flex-1">
          <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-neutral-200 px-5 md:px-8 py-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <p className="text-[10px] uppercase tracking-[2px] text-neutral-400 font-bold">Saiksha Admin</p>
              <h1 className="text-xl font-serif font-bold text-neutral-950">
                {adminNavItems.find((item) => item.id === activeTab)?.label || "Home"}
              </h1>
            </div>

            <div className="flex items-center gap-3">
              <div className="hidden sm:flex items-center gap-2 rounded-lg bg-neutral-50 border border-neutral-200 px-3 py-2 text-xs text-neutral-500">
                <Activity size={14} className="text-green-600" />
                <span>{activeVisitors > 0 ? `${activeVisitors} active now` : "No live visitors"}</span>
              </div>
              {activeTab === "products" && (
                <button
                  onClick={openAddModal}
                  className="bg-brand-ink text-white px-4 py-2.5 rounded-lg text-[9px] uppercase tracking-widest font-bold hover:bg-neutral-800 transition-all flex items-center space-x-1.5 shadow-md shadow-brand-ink/5 cursor-pointer"
                >
                  <Plus size={13} />
                  <span>Add Product</span>
                </button>
              )}
              <button
                onClick={handleLogout}
                className="lg:hidden p-2 hover:bg-red-50 rounded-lg text-neutral-400 hover:text-red-500 transition-colors cursor-pointer"
                title="Logout Admin"
              >
                <LogOut size={16} />
              </button>
            </div>
          </header>

          <main className="px-5 md:px-8 py-8 space-y-8">
        
        {activeTab === "overview" && (
          <section className="space-y-6">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-6">
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
              <span className="text-[9px] uppercase tracking-widest text-neutral-400 font-bold">Customers</span>
              <h3 className="text-3xl font-serif font-bold text-neutral-900">{customers.length}</h3>
            </div>
            <div className="p-4 bg-neutral-50 rounded-2xl text-neutral-500">
              <Users size={24} />
            </div>
          </div>

          {/* Website Visitors Stats Card */}
          <div className="bg-white p-6 rounded-2xl border border-neutral-100 shadow-xs flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-[9px] uppercase tracking-widest text-neutral-400 font-bold">Website Visitors</span>
              <h3 className="text-3xl font-serif font-bold text-neutral-900">{totalVisitors.toLocaleString()}</h3>
            </div>
            <div className="p-4 bg-green-50 rounded-2xl text-green-600">
              <Users size={24} />
            </div>
          </div>

          {/* Live Visitors Stats Card */}
          <div className="bg-white p-6 rounded-2xl border border-neutral-100 shadow-xs flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-[9px] uppercase tracking-widest text-neutral-400 font-bold">Live Watching</span>
              <h3 className="text-3xl font-serif font-bold text-neutral-900">
                {activeVisitors > 0 ? `${activeVisitors} Active` : "Quiet"}
              </h3>
              <span className="text-[10px] text-neutral-400">
                {totalProductViews.toLocaleString()} product views
              </span>
            </div>
            <div className="p-4 bg-[#bda88e]/10 rounded-2xl text-[#a2855b]">
              <Activity size={24} />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          <div className="xl:col-span-2 bg-white rounded-2xl border border-neutral-100 shadow-xs p-6 space-y-5">
            <div className="flex items-center justify-between gap-4">
              <div>
                <h3 className="font-serif font-bold text-neutral-950">Sales Analytics</h3>
                <p className="text-[10px] text-neutral-400">Revenue, AOV, and product performance.</p>
              </div>
              <button onClick={fetchSalesAnalytics} className="text-[10px] uppercase tracking-widest font-bold text-[#a2855b] cursor-pointer">Refresh</button>
            </div>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              {[
                ["Revenue", `Rs ${Number(salesAnalytics?.revenue || 0).toLocaleString()}`],
                ["AOV", `Rs ${Number(salesAnalytics?.averageOrderValue || 0).toLocaleString()}`],
                ["Orders", Number(salesAnalytics?.orderCount || 0).toLocaleString()],
                ["Low Stock", Number(salesAnalytics?.lowStockCount || 0).toLocaleString()]
              ].map(([label, value]) => (
                <div key={label} className="rounded-xl bg-neutral-50 border border-neutral-100 p-4">
                  <p className="text-[9px] uppercase tracking-widest text-neutral-400 font-bold">{label}</p>
                  <p className="mt-1 text-lg font-serif font-bold text-neutral-950">{value}</p>
                </div>
              ))}
            </div>
            <div className="space-y-2">
              <p className="text-[9px] uppercase tracking-widest text-neutral-400 font-bold">Top Products</p>
              {(salesAnalytics?.topProducts || []).length === 0 ? (
                <p className="text-xs text-neutral-400">No product sales yet.</p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {salesAnalytics.topProducts.map((product: any) => (
                    <div key={product.name} className="flex items-center justify-between rounded-lg border border-neutral-100 px-3 py-2 text-xs">
                      <span className="font-bold text-neutral-700 truncate">{product.name}</span>
                      <span className="text-neutral-400">Qty {product.quantity} · Rs {Number(product.revenue || 0).toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-neutral-100 shadow-xs p-6 space-y-4">
            <div>
              <h3 className="font-serif font-bold text-neutral-950">Data Exports</h3>
              <p className="text-[10px] text-neutral-400">Download CSV files for accounting, ads, or records.</p>
            </div>
            {(["orders", "products", "customers"] as const).map((type) => (
              <button
                key={type}
                onClick={() => exportAdminData(type)}
                className="w-full flex items-center justify-between rounded-xl border border-neutral-100 px-4 py-3 text-xs font-bold text-neutral-700 hover:bg-neutral-50 cursor-pointer"
              >
                <span className="capitalize">{type} CSV</span>
                <Download size={14} className="text-neutral-400" />
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          <div className="xl:col-span-2 bg-white rounded-2xl border border-neutral-100 shadow-xs overflow-hidden">
            <div className="px-6 py-4 border-b border-neutral-100 flex items-center justify-between">
              <div>
                <h3 className="font-serif font-bold text-neutral-950">Recent Orders</h3>
                <p className="text-[10px] text-neutral-400">Latest checkout activity</p>
              </div>
              <button onClick={() => setActiveTab("orders")} className="text-[10px] uppercase tracking-widest font-bold text-[#a2855b] cursor-pointer">View all</button>
            </div>
            <div className="divide-y divide-neutral-50">
              {recentOrders.length === 0 ? (
                <div className="p-6 text-sm text-neutral-400">No orders yet.</div>
              ) : recentOrders.map((order) => (
                <button
                  key={order.orderId}
                  onClick={() => {
                    setActiveTab("orders");
                    setExpandedOrderId(order.orderId);
                  }}
                  className="w-full p-5 flex items-center justify-between gap-4 hover:bg-neutral-50 text-left cursor-pointer"
                >
                  <div className="min-w-0">
                    <p className="font-mono text-xs font-bold text-neutral-950">{order.orderId}</p>
                    <p className="text-xs text-neutral-500 truncate">{order.customer?.firstName} {order.customer?.lastName} · {order.items?.length || 0} items</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-bold text-neutral-950">Rs {Number(order.total || 0).toLocaleString()}</p>
                    <p className="text-[10px] text-neutral-400">{order.status}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-neutral-100 shadow-xs overflow-hidden">
            <div className="px-6 py-4 border-b border-neutral-100">
              <h3 className="font-serif font-bold text-neutral-950">Quick Actions</h3>
              <p className="text-[10px] text-neutral-400">Common store tasks</p>
            </div>
            <div className="p-4 space-y-2">
              <button onClick={openAddModal} className="w-full flex items-center gap-3 rounded-xl border border-neutral-100 p-3 text-left hover:bg-neutral-50 cursor-pointer">
                <Plus size={16} className="text-[#a2855b]" />
                <span className="text-xs font-bold">Add product</span>
              </button>
              <button onClick={() => setActiveTab("cartLeads")} className="w-full flex items-center gap-3 rounded-xl border border-neutral-100 p-3 text-left hover:bg-neutral-50 cursor-pointer">
                <UserRoundCheck size={16} className="text-[#a2855b]" />
                <span className="text-xs font-bold">Review cart leads</span>
              </button>
              <button onClick={fetchOrders} className="w-full flex items-center gap-3 rounded-xl border border-neutral-100 p-3 text-left hover:bg-neutral-50 cursor-pointer">
                <RefreshCw size={16} className="text-[#a2855b]" />
                <span className="text-xs font-bold">Refresh orders</span>
              </button>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-neutral-100 shadow-xs overflow-hidden">
            <div className="px-6 py-4 border-b border-neutral-100 flex items-center justify-between">
              <div>
                <h3 className="font-serif font-bold text-neutral-950">Low Stock</h3>
                <p className="text-[10px] text-neutral-400">Needs attention</p>
              </div>
              <AlertTriangle size={16} className="text-amber-500" />
            </div>
            <div className="divide-y divide-neutral-50">
              {lowStockProducts.length === 0 ? (
                <div className="p-5 text-xs text-neutral-400">No low-stock items.</div>
              ) : lowStockProducts.map((product) => (
                <div key={product.id} className="p-4 flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-neutral-900 truncate">{product.name}</p>
                    <p className="text-[10px] text-neutral-400">{product.category}</p>
                  </div>
                  <span className="text-[10px] font-bold text-amber-700 bg-amber-50 border border-amber-100 rounded-full px-2 py-1">{product.stock} left</span>
                </div>
              ))}
            </div>
          </div>

          <div className="xl:col-span-2 bg-white rounded-2xl border border-neutral-100 shadow-xs overflow-hidden">
            <div className="px-6 py-4 border-b border-neutral-100 flex items-center justify-between">
              <div>
                <h3 className="font-serif font-bold text-neutral-950">Saved Bag Leads</h3>
                <p className="text-[10px] text-neutral-400">Customers who may need follow-up</p>
              </div>
              <button onClick={() => setActiveTab("cartLeads")} className="text-[10px] uppercase tracking-widest font-bold text-[#a2855b] cursor-pointer">View all</button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4">
              {recentCartLeads.length === 0 ? (
                <div className="text-sm text-neutral-400">No saved bags yet.</div>
              ) : recentCartLeads.map((lead) => (
                <div key={lead._id || lead.sessionId} className="rounded-xl border border-neutral-100 p-4">
                  <p className="text-xs font-bold text-neutral-950">{lead.customer?.name}</p>
                  <p className="text-[10px] text-neutral-400">{lead.customer?.phone} · Rs {Number(lead.total || 0).toLocaleString()}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
          </section>
        )}

        {/* TAB VIEW 1: PRODUCTS CATALOG LIST */}
        {activeTab === "products" && (
          <section className="bg-white rounded-2xl border border-neutral-100 shadow-xs overflow-hidden">
            <div className="p-6 border-b border-neutral-100 bg-neutral-50/20 space-y-4">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div>
                  <h4 className="font-serif text-base font-bold text-neutral-900">Database Catalog Listing</h4>
                  <span className="text-[9px] text-neutral-400 tracking-wider font-mono">Collection Name: products</span>
                </div>
                <div className="relative w-full lg:w-80">
                  <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
                  <input
                    value={productSearch}
                    onChange={(e) => setProductSearch(e.target.value)}
                    placeholder="Search product title"
                    className="w-full rounded-lg border border-neutral-200 bg-white pl-9 pr-3 py-2.5 text-xs outline-none focus:border-brand-rosegold focus:ring-1 focus:ring-brand-rosegold/30"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-6 gap-3">
                <label className="space-y-1">
                  <span className="flex items-center gap-1.5 text-[9px] uppercase tracking-widest font-bold text-neutral-400">
                    <SlidersHorizontal size={11} />
                    Category
                  </span>
                  <select
                    value={productCategoryFilter}
                    onChange={(e) => setProductCategoryFilter(e.target.value as ProductCategoryFilter)}
                    className="w-full rounded-lg border border-neutral-200 bg-white px-3 py-2.5 text-xs font-semibold text-neutral-700 outline-none focus:border-brand-rosegold focus:ring-1 focus:ring-brand-rosegold/30"
                  >
                    {productCategories.map((category) => (
                      <option key={category} value={category}>{category}</option>
                    ))}
                  </select>
                </label>

                <label className="space-y-1">
                  <span className="text-[9px] uppercase tracking-widest font-bold text-neutral-400">Status</span>
                  <select
                    value={productStatusFilter}
                    onChange={(e) => setProductStatusFilter(e.target.value as ProductStatusFilter)}
                    className="w-full rounded-lg border border-neutral-200 bg-white px-3 py-2.5 text-xs font-semibold text-neutral-700 outline-none focus:border-brand-rosegold focus:ring-1 focus:ring-brand-rosegold/30"
                  >
                    {["All", "New", "Sale", "Limited", "Custom"].map((status) => (
                      <option key={status} value={status}>{status}</option>
                    ))}
                  </select>
                </label>

                <label className="space-y-1">
                  <span className="text-[9px] uppercase tracking-widest font-bold text-neutral-400">Stock</span>
                  <select
                    value={productStockFilter}
                    onChange={(e) => setProductStockFilter(e.target.value as ProductStockFilter)}
                    className="w-full rounded-lg border border-neutral-200 bg-white px-3 py-2.5 text-xs font-semibold text-neutral-700 outline-none focus:border-brand-rosegold focus:ring-1 focus:ring-brand-rosegold/30"
                  >
                    {["All", "In Stock", "Low Stock", "Out of Stock"].map((stock) => (
                      <option key={stock} value={stock}>{stock}</option>
                    ))}
                  </select>
                </label>

                <label className="space-y-1">
                  <span className="text-[9px] uppercase tracking-widest font-bold text-neutral-400">Price</span>
                  <select
                    value={productPriceFilter}
                    onChange={(e) => setProductPriceFilter(e.target.value)}
                    className="w-full rounded-lg border border-neutral-200 bg-white px-3 py-2.5 text-xs font-semibold text-neutral-700 outline-none focus:border-brand-rosegold focus:ring-1 focus:ring-brand-rosegold/30"
                  >
                    {productPriceFilters.map((price) => (
                      <option key={price} value={price}>{price}</option>
                    ))}
                  </select>
                </label>

                <label className="space-y-1">
                  <span className="text-[9px] uppercase tracking-widest font-bold text-neutral-400">Sort</span>
                  <select
                    value={productSort}
                    onChange={(e) => setProductSort(e.target.value as ProductSortOption)}
                    className="w-full rounded-lg border border-neutral-200 bg-white px-3 py-2.5 text-xs font-semibold text-neutral-700 outline-none focus:border-brand-rosegold focus:ring-1 focus:ring-brand-rosegold/30"
                  >
                    {["Newest", "Name A-Z", "Price Low", "Price High", "Stock Low", "Most Viewed"].map((sort) => (
                      <option key={sort} value={sort}>{sort}</option>
                    ))}
                  </select>
                </label>

                <div className="flex items-end gap-2">
                  <button
                    type="button"
                    onClick={clearProductFilters}
                    disabled={!productFiltersActive}
                    className="w-full rounded-lg border border-neutral-200 bg-white px-3 py-2.5 text-[10px] uppercase tracking-widest font-bold text-neutral-500 transition-colors hover:bg-neutral-50 disabled:cursor-not-allowed disabled:opacity-40 cursor-pointer"
                  >
                    Clear
                  </button>
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-2 text-[10px] text-neutral-400">
                <span>
                  Showing <strong className="text-neutral-700">{filteredProducts.length}</strong> of <strong className="text-neutral-700">{products.length}</strong> products
                </span>
                {productFiltersActive && (
                  <span className="rounded-full border border-brand-rosegold/20 bg-brand-cream/20 px-2.5 py-1 font-bold uppercase tracking-wider text-[#a2855b]">
                    Filters active
                  </span>
                )}
              </div>
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
                    <th className="py-4 px-6">Views</th>
                    <th className="py-4 px-6 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-50 text-xs">
                  {paginatedProducts.map((product) => (
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
                      <td className="py-4 px-6">
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-neutral-50 px-2.5 py-1 text-[10px] font-bold text-neutral-600">
                          <Eye size={12} className="text-[#a2855b]" />
                          {(product.views || 0).toLocaleString()}
                        </span>
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
                            onClick={() => handleAdjustInventory(product)}
                            className="p-2 text-neutral-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-all cursor-pointer"
                            title="Adjust Inventory"
                          >
                            <RefreshCw size={14} />
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
            {filteredProducts.length === 0 ? (
              <div className="px-6 py-12 text-center text-xs text-neutral-400">
                No products matched the selected filters.
              </div>
            ) : (
              renderPagination(
                filteredProducts.length,
                currentProductPage,
                productsPerPage,
                setCurrentProductPage,
                setProductsPerPage,
                "products"
              )
            )}
          </section>
        )}

        {/* TAB VIEW 2: ORDERS MANAGER */}
        {activeTab === "orders" && (
          <section className="space-y-6">
            <div className="bg-white p-6 rounded-2xl border border-neutral-100 shadow-xs flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              <div>
                <h4 className="font-serif text-base font-bold text-neutral-900">Fulfillment Center</h4>
                <p className="text-[10px] text-neutral-450 mt-0.5">Manage customer purchases and update order statuses.</p>
              </div>
              <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
                <div className="relative w-full lg:w-96">
                  <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
                  <input
                    value={orderSearch}
                    onChange={(e) => setOrderSearch(e.target.value)}
                    placeholder="Search order, customer, phone, email, product"
                    className="w-full rounded-lg border border-neutral-200 bg-white pl-9 pr-3 py-2.5 text-xs outline-none focus:border-brand-rosegold focus:ring-1 focus:ring-brand-rosegold/30"
                  />
                </div>
                <button 
                  onClick={fetchOrders}
                  className="text-[9px] uppercase font-bold tracking-widest text-[#a2855b] hover:text-[#7a603c] whitespace-nowrap"
                >
                  Refresh Data
                </button>
              </div>
            </div>

            {loadingOrders ? (
              <div className="text-center py-12 text-xs text-neutral-400">Loading catalog orders...</div>
            ) : orders.length === 0 ? (
              <div className="text-center py-20 bg-white rounded-2xl border border-black/5 text-neutral-400 space-y-4">
                <ShoppingBag size={40} className="mx-auto text-neutral-300" />
                <h4 className="font-serif text-sm font-bold text-neutral-500">No Orders Placed Yet</h4>
                <p className="text-[10px] text-neutral-400 font-light">Customer checkout submissions will register here.</p>
              </div>
            ) : filteredOrders.length === 0 ? (
              <div className="text-center py-20 bg-white rounded-2xl border border-black/5 text-neutral-400 space-y-4">
                <ShoppingBag size={40} className="mx-auto text-neutral-300" />
                <h4 className="font-serif text-sm font-bold text-neutral-500">No Matching Orders</h4>
                <p className="text-[10px] text-neutral-400 font-light">Try searching by order ID, customer details, status, or product name.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {/* ── Show-entries dropdown ── */}
                <div className="flex items-center justify-between bg-white px-5 py-3 rounded-xl border border-neutral-100 shadow-xs">
                  <div className="flex items-center gap-3">
                    <span className="text-[10px] uppercase tracking-wider text-neutral-400 font-bold">Show entries</span>
                    <select
                      value={ordersPerPage}
                      onChange={(e) => {
                        setOrdersPerPage(Number(e.target.value));
                        setCurrentOrderPage(1);
                      }}
                      className="text-[10px] font-bold text-neutral-700 border border-neutral-200 rounded-lg px-3 py-1.5 bg-neutral-50 focus:outline-none focus:ring-1 focus:ring-brand-rosegold cursor-pointer"
                    >
                      {/* Only show page-size options smaller than total orders */}
                      {[10, 20, 30, 50, 100, 200].filter(n => n < filteredOrders.length).map((n) => (
                        <option key={n} value={n}>Show {n}</option>
                      ))}
                      {/* Always show a single "Show All" at the end */}
                      <option value={filteredOrders.length}>Show All ({filteredOrders.length})</option>
                    </select>
                  </div>
                  <span className="text-[10px] text-neutral-400 font-mono">
                    {ordersPerPage >= filteredOrders.length
                      ? `Showing all ${filteredOrders.length} orders`
                      : `Showing ${(currentOrderPage - 1) * ordersPerPage + 1}–${Math.min(currentOrderPage * ordersPerPage, filteredOrders.length)} of ${filteredOrders.length} orders`}
                  </span>
                </div>

                {/* ── Orders list (current page slice) ── */}
                {paginatedOrders.map((order) => {
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

                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedOrder(order);
                              }}
                              className="p-2 rounded-lg bg-neutral-50 text-neutral-500 hover:bg-[#bda88e]/10 hover:text-[#a2855b] transition-colors cursor-pointer"
                              title="View Order Details"
                            >
                              <Eye size={14} />
                            </button>

                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteOrder(order.orderId);
                              }}
                              className="p-2 rounded-lg bg-red-50 text-red-500 hover:bg-red-100 hover:text-red-700 transition-colors cursor-pointer"
                              title="Delete Order"
                            >
                              <Trash2 size={14} />
                            </button>

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

                {/* ── Pagination bar ── */}
                {(() => {
                  const totalPages = Math.ceil(filteredOrders.length / ordersPerPage);
                  if (totalPages <= 1) return null;
                  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);
                  return (
                    <div className="flex items-center justify-between bg-white px-5 py-3 rounded-xl border border-neutral-100 shadow-xs">
                      <span className="text-[10px] text-neutral-400 font-mono">
                        Page {currentOrderPage} of {totalPages}
                      </span>
                      <div className="flex items-center gap-1">
                        {/* Prev button */}
                        <button
                          onClick={() => setCurrentOrderPage((p) => Math.max(1, p - 1))}
                          disabled={currentOrderPage === 1}
                          className="p-1.5 rounded-lg border border-neutral-200 text-neutral-400 hover:text-neutral-700 hover:bg-neutral-50 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                        >
                          <ChevronLeft size={14} />
                        </button>

                        {/* Page number buttons */}
                        {pages.map((page) => (
                          <button
                            key={page}
                            onClick={() => setCurrentOrderPage(page)}
                            className={cn(
                              "min-w-[32px] h-8 px-2 rounded-lg text-[10px] font-bold border transition-all",
                              currentOrderPage === page
                                ? "bg-brand-ink text-white border-brand-ink"
                                : "bg-white text-neutral-500 border-neutral-200 hover:bg-neutral-50 hover:text-neutral-800"
                            )}
                          >
                            {page}
                          </button>
                        ))}

                        {/* Next button */}
                        <button
                          onClick={() => setCurrentOrderPage((p) => Math.min(totalPages, p + 1))}
                          disabled={currentOrderPage === totalPages}
                          className="p-1.5 rounded-lg border border-neutral-200 text-neutral-400 hover:text-neutral-700 hover:bg-neutral-50 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                        >
                          <ChevronRight size={14} />
                        </button>
                      </div>
                    </div>
                  );
                })()}
              </div>
            )}
          </section>
        )}

        {/* TAB VIEW 3: CUSTOMERS */}
        {activeTab === "customers" && (
          <section className="bg-white rounded-2xl border border-neutral-100 shadow-xs overflow-hidden">
            <div className="p-6 border-b border-neutral-100 flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-neutral-50/20">
              <div>
                <h4 className="font-serif text-base font-bold text-neutral-900">Customers</h4>
                <p className="text-[10px] text-neutral-450 mt-0.5">Unified customer profiles from orders and saved bag leads.</p>
              </div>
              <div className="relative w-full lg:w-96">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
                <input
                  value={customerSearch}
                  onChange={(e) => setCustomerSearch(e.target.value)}
                  placeholder="Search name, email, phone, city"
                  className="w-full rounded-lg border border-neutral-200 bg-white pl-9 pr-3 py-2.5 text-xs outline-none focus:border-brand-rosegold focus:ring-1 focus:ring-brand-rosegold/30"
                />
              </div>
            </div>

            {customers.length === 0 ? (
              <div className="p-12 text-center text-neutral-400">
                <Users size={40} className="mx-auto text-neutral-300 mb-4" />
                <h4 className="font-serif text-sm font-bold text-neutral-500">No Customers Yet</h4>
                <p className="text-[10px] text-neutral-400 font-light mt-1">Customers will appear after orders or saved bag leads.</p>
              </div>
            ) : filteredCustomers.length === 0 ? (
              <div className="p-12 text-center text-xs text-neutral-400">
                No customers matched "{customerSearch}".
              </div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse text-left">
                    <thead>
                      <tr className="bg-neutral-50/70 border-b border-neutral-100 text-[9px] uppercase tracking-widest text-neutral-400 font-bold">
                        <th className="py-4 px-6">Customer</th>
                        <th className="py-4 px-6">Contact</th>
                        <th className="py-4 px-6">Orders</th>
                        <th className="py-4 px-6">Spent</th>
                        <th className="py-4 px-6">Cart Leads</th>
                        <th className="py-4 px-6">Tags & Notes</th>
                        <th className="py-4 px-6">Last Activity</th>
                        <th className="py-4 px-6 text-right">Type</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-50 text-xs">
                      {paginatedCustomers.map((customer) => {
                        const meta = customerMeta[customer.key] || {};
                        const isEditingMeta = editingCustomerKey === customer.key;
                        return (
                        <tr key={customer.key} className="hover:bg-neutral-50/30 transition-colors align-top">
                          <td className="py-4 px-6">
                            <div className="flex items-center gap-3">
                              <div className="h-9 w-9 rounded-full bg-brand-rosegold/10 text-brand-rosegold flex items-center justify-center text-[11px] font-bold uppercase">
                                {(customer.name || customer.email || "?")[0]}
                              </div>
                              <div>
                                <p className="font-bold text-neutral-950">{customer.name}</p>
                                {customer.city && <p className="text-[10px] text-neutral-400">{customer.city}</p>}
                              </div>
                            </div>
                          </td>
                          <td className="py-4 px-6 text-neutral-500">
                            <div className="space-y-1">
                              {customer.email && <p className="flex items-center gap-1.5"><Mail size={12} /> {customer.email}</p>}
                              {customer.phone && <p className="flex items-center gap-1.5"><Phone size={12} /> {customer.phone}</p>}
                            </div>
                          </td>
                          <td className="py-4 px-6 font-bold text-neutral-900">{customer.totalOrders}</td>
                          <td className="py-4 px-6 font-bold text-neutral-900">Rs {customer.totalSpent.toLocaleString()}</td>
                          <td className="py-4 px-6 text-neutral-600">{customer.cartLeads}</td>
                          <td className="py-4 px-6 min-w-[260px]">
                            {isEditingMeta ? (
                              <div className="space-y-2">
                                <input
                                  value={customerMetaForm.tags}
                                  onChange={(e) => setCustomerMetaForm((prev) => ({ ...prev, tags: e.target.value }))}
                                  placeholder="VIP, repeat buyer"
                                  className="w-full rounded-lg border border-neutral-200 px-3 py-2 text-[10px] outline-none focus:border-brand-rosegold"
                                />
                                <textarea
                                  value={customerMetaForm.note}
                                  onChange={(e) => setCustomerMetaForm((prev) => ({ ...prev, note: e.target.value }))}
                                  placeholder="Private admin note"
                                  rows={2}
                                  className="w-full rounded-lg border border-neutral-200 px-3 py-2 text-[10px] outline-none focus:border-brand-rosegold"
                                />
                                <div className="flex gap-2">
                                  <button onClick={() => saveCustomerMeta(customer)} className="rounded bg-brand-ink px-3 py-1.5 text-[9px] uppercase tracking-wider font-bold text-white cursor-pointer">Save</button>
                                  <button onClick={() => setEditingCustomerKey(null)} className="rounded border border-neutral-200 px-3 py-1.5 text-[9px] uppercase tracking-wider font-bold text-neutral-500 cursor-pointer">Cancel</button>
                                </div>
                              </div>
                            ) : (
                              <button onClick={() => openCustomerMetaEditor(customer)} className="w-full text-left space-y-2 rounded-lg border border-neutral-100 bg-neutral-50/60 p-3 hover:bg-neutral-50 cursor-pointer">
                                <div className="flex flex-wrap gap-1">
                                  {(meta.tags || []).length > 0 ? meta.tags.map((tag: string) => (
                                    <span key={tag} className="rounded-full bg-white border border-neutral-100 px-2 py-0.5 text-[9px] font-bold text-neutral-500">{tag}</span>
                                  )) : <span className="text-[10px] text-neutral-400">Add tags</span>}
                                </div>
                                <p className="line-clamp-2 text-[10px] text-neutral-500">{meta.note || "Add private note"}</p>
                              </button>
                            )}
                          </td>
                          <td className="py-4 px-6 text-neutral-400">
                            {customer.lastActivity
                              ? new Date(customer.lastActivity).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" })
                              : "N/A"}
                          </td>
                          <td className="py-4 px-6 text-right">
                            <span className={cn(
                              "rounded-full px-2.5 py-1 text-[9px] font-bold uppercase tracking-wider border",
                              customer.source === "Customer"
                                ? "bg-green-50 text-green-700 border-green-100"
                                : "bg-amber-50 text-amber-700 border-amber-100"
                            )}>
                              {customer.source}
                            </span>
                          </td>
                        </tr>
                      );})}
                    </tbody>
                  </table>
                </div>
                {renderPagination(
                  filteredCustomers.length,
                  currentCustomerPage,
                  customersPerPage,
                  setCurrentCustomerPage,
                  setCustomersPerPage,
                  "customers"
                )}
              </>
            )}
          </section>
        )}

        {/* TAB VIEW 4: SAVED / ABANDONED CART LEADS */}
        {activeTab === "accounts" && (
          <div className="bg-white rounded-2xl border border-neutral-100 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-neutral-100 flex items-center justify-between">
              <div>
                <h4 className="font-serif text-base font-bold text-neutral-900">Registered Customer Accounts</h4>
                <p className="text-[10px] text-neutral-400 mt-0.5">People who created/login to customer accounts. Guest checkout still remains available.</p>
              </div>
              <button onClick={fetchCustomerAccounts} className="text-[9px] uppercase font-bold tracking-widest text-[#a2855b]">Refresh</button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-neutral-50 text-[9px] uppercase tracking-widest text-neutral-400">
                  <tr>
                    <th className="py-4 px-6">Account</th>
                    <th className="py-4 px-6">Saved Address</th>
                    <th className="py-4 px-6">Orders</th>
                    <th className="py-4 px-6">Wishlist</th>
                    <th className="py-4 px-6">Leads</th>
                    <th className="py-4 px-6">Lifetime Spend</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100">
                  {customerAccounts.map((account) => (
                    <tr key={account.id} className="text-xs">
                      <td className="py-4 px-6">
                        <p className="font-bold text-neutral-900">{account.name}</p>
                        <p className="text-neutral-400">{account.email}</p>
                        <p className="text-neutral-400">{account.phone}</p>
                      </td>
                      <td className="py-4 px-6 text-neutral-500 max-w-xs">
                        {account.savedAddress?.address ? (
                          <span>{account.savedAddress.address}, {account.savedAddress.city} - {account.savedAddress.postalCode}</span>
                        ) : (
                          <span className="text-neutral-300">No address saved</span>
                        )}
                      </td>
                      <td className="py-4 px-6">
                        <p className="font-bold">{account.totalOrders || 0}</p>
                        <p className="text-[10px] text-neutral-400">{(account.orderIds || []).slice(0, 2).join(", ")}</p>
                      </td>
                      <td className="py-4 px-6">{account.wishlistProductIds?.length || 0} products</td>
                      <td className="py-4 px-6">{account.cartLeadCount || 0} cart • {account.wishlistLeadCount || 0} wishlist</td>
                      <td className="py-4 px-6 font-bold text-neutral-900">Rs {Number(account.lifetimeSpend || 0).toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {customerAccounts.length === 0 && (
                <div className="p-10 text-center text-sm text-neutral-400">No customer accounts yet.</div>
              )}
            </div>
          </div>
        )}

        {activeTab === "segments" && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 xl:grid-cols-5 gap-4">
              {["High Value", "Wishlist Users", "Cart Abandoned", "Repeat Buyers", "New Customers"].map((segment) => (
                <div key={segment} className="rounded-2xl border border-neutral-100 bg-white p-5 shadow-sm">
                  <p className="text-[9px] uppercase tracking-[2px] text-neutral-400 font-bold">{segment}</p>
                  <p className="mt-3 text-3xl font-serif text-neutral-950">{customerSegments.counts?.[segment] || 0}</p>
                </div>
              ))}
            </div>
            <div className="bg-white rounded-2xl border border-neutral-100 shadow-sm overflow-hidden">
              <div className="p-6 border-b border-neutral-100 flex items-center justify-between">
                <div>
                  <h4 className="font-serif text-base font-bold text-neutral-900">Customer Segmentation</h4>
                  <p className="text-[10px] text-neutral-400 mt-0.5">Automatically grouped from orders, cart leads, and wishlist leads.</p>
                </div>
                <button onClick={fetchCustomerSegments} className="text-[9px] uppercase font-bold tracking-widest text-[#a2855b]">Refresh</button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-neutral-50 text-[9px] uppercase tracking-widest text-neutral-400">
                    <tr>
                      <th className="py-4 px-6">Customer</th>
                      <th className="py-4 px-6">Segments</th>
                      <th className="py-4 px-6">Orders</th>
                      <th className="py-4 px-6">Spent</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-100">
                    {(customerSegments.customers || []).map((customer: any) => (
                      <tr key={customer.key} className="text-xs">
                        <td className="py-4 px-6">
                          <p className="font-bold text-neutral-900">{customer.name || "Unnamed customer"}</p>
                          <p className="text-neutral-400">{customer.phone || customer.email}</p>
                        </td>
                        <td className="py-4 px-6">
                          <div className="flex flex-wrap gap-1.5">
                            {(customer.segments || []).map((segment: string) => (
                              <span key={segment} className="rounded-full border border-brand-rosegold/20 bg-brand-cream/40 px-2 py-1 text-[9px] uppercase tracking-wider text-[#7a603c] font-bold">{segment}</span>
                            ))}
                          </div>
                        </td>
                        <td className="py-4 px-6">{customer.totalOrders}</td>
                        <td className="py-4 px-6">Rs {Number(customer.totalSpent || 0).toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {activeTab === "discounts" && (
          <div className="grid grid-cols-1 xl:grid-cols-[420px_1fr] gap-6">
            <form onSubmit={handleSaveDiscountCampaign} className="bg-white rounded-2xl border border-neutral-100 p-6 shadow-sm space-y-4">
              <div>
                <h4 className="font-serif text-base font-bold text-neutral-900">Automated Discount Campaign</h4>
                <p className="text-[10px] text-neutral-400 mt-0.5">Only active campaigns appear on the website and auto-apply in cart.</p>
              </div>
              <input value={discountForm.title} onChange={(e) => setDiscountForm((p) => ({ ...p, title: e.target.value }))} className="w-full rounded-lg border border-neutral-200 px-4 py-3 text-xs" placeholder="Campaign title" />
              <div className="grid grid-cols-2 gap-3">
                <select value={discountForm.type} onChange={(e) => setDiscountForm((p) => ({ ...p, type: e.target.value }))} className="rounded-lg border border-neutral-200 px-3 py-3 text-xs">
                  <option>Percent Off</option>
                  <option>Free Shipping</option>
                </select>
                <select value={discountForm.status} onChange={(e) => setDiscountForm((p) => ({ ...p, status: e.target.value }))} className="rounded-lg border border-neutral-200 px-3 py-3 text-xs">
                  <option>Paused</option>
                  <option>Active</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <input type="number" value={discountForm.discountPercent} onChange={(e) => setDiscountForm((p) => ({ ...p, discountPercent: Number(e.target.value) }))} className="rounded-lg border border-neutral-200 px-4 py-3 text-xs" placeholder="Discount %" />
                <input type="number" value={discountForm.minItems} onChange={(e) => setDiscountForm((p) => ({ ...p, minItems: Number(e.target.value) }))} className="rounded-lg border border-neutral-200 px-4 py-3 text-xs" placeholder="Min items" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <input type="number" value={discountForm.minCartValue} onChange={(e) => setDiscountForm((p) => ({ ...p, minCartValue: Number(e.target.value) }))} className="rounded-lg border border-neutral-200 px-4 py-3 text-xs" placeholder="Min cart value" />
                <select value={discountForm.category} onChange={(e) => setDiscountForm((p) => ({ ...p, category: e.target.value }))} className="rounded-lg border border-neutral-200 px-3 py-3 text-xs">
                  {["All", "Earrings", "Necklaces", "Bestsellers", "New Arrivals", "Gifts"].map((category) => <option key={category}>{category}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <input type="date" value={discountForm.startsAt} onChange={(e) => setDiscountForm((p) => ({ ...p, startsAt: e.target.value }))} className="rounded-lg border border-neutral-200 px-4 py-3 text-xs" />
                <input type="date" value={discountForm.endsAt} onChange={(e) => setDiscountForm((p) => ({ ...p, endsAt: e.target.value }))} className="rounded-lg border border-neutral-200 px-4 py-3 text-xs" />
              </div>
              <input value={discountForm.badgeText} onChange={(e) => setDiscountForm((p) => ({ ...p, badgeText: e.target.value }))} className="w-full rounded-lg border border-neutral-200 px-4 py-3 text-xs" placeholder="Storefront badge text" />
              <button className="w-full rounded-lg bg-brand-ink py-3 text-[10px] uppercase tracking-widest font-bold text-white">Add Campaign</button>
            </form>
            <div className="bg-white rounded-2xl border border-neutral-100 shadow-sm overflow-hidden">
              <div className="p-6 border-b border-neutral-100 flex items-center justify-between">
                <h4 className="font-serif text-base font-bold text-neutral-900">Campaigns</h4>
                <button onClick={fetchDiscountCampaigns} className="text-[9px] uppercase font-bold tracking-widest text-[#a2855b]">Refresh</button>
              </div>
              <div className="divide-y divide-neutral-100">
                {discountCampaigns.map((campaign) => (
                  <div key={campaign._id} className="p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    <div>
                      <p className="font-bold text-sm text-neutral-900">{campaign.title}</p>
                      <p className="text-[10px] text-neutral-400 mt-1">{campaign.type} • {campaign.discountPercent}% • Min {campaign.minItems || 0} items • {campaign.category}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={cn("rounded-full border px-2 py-1 text-[9px] uppercase tracking-wider font-bold", campaign.status === "Active" ? "border-green-100 bg-green-50 text-green-700" : "border-neutral-200 bg-neutral-50 text-neutral-500")}>{campaign.status}</span>
                      <button onClick={() => handleUpdateDiscountCampaignStatus(campaign, campaign.status === "Active" ? "Paused" : "Active")} className="rounded-lg border border-neutral-200 px-3 py-2 text-[9px] uppercase tracking-wider font-bold cursor-pointer">{campaign.status === "Active" ? "Pause" : "Activate"}</button>
                      <button onClick={() => handleDeleteDiscountCampaign(campaign._id)} className="rounded-lg bg-red-50 px-3 py-2 text-[9px] uppercase tracking-wider font-bold text-red-600 cursor-pointer">Delete</button>
                    </div>
                  </div>
                ))}
                {discountCampaigns.length === 0 && <p className="p-8 text-sm text-neutral-400">No discount campaigns yet.</p>}
              </div>
            </div>
          </div>
        )}

        {activeTab === "campaigns" && (
          <div className="grid grid-cols-1 xl:grid-cols-[420px_1fr] gap-6">
            <form onSubmit={handleSaveWhatsAppCampaign} className="bg-white rounded-2xl border border-neutral-100 p-6 shadow-sm space-y-4">
              <div>
                <h4 className="font-serif text-base font-bold text-neutral-900">WhatsApp Campaign Center</h4>
                <p className="text-[10px] text-neutral-400 mt-0.5">Prepared messages open in WhatsApp from the number logged in on this device.</p>
              </div>
              <input value={campaignForm.title} onChange={(e) => setCampaignForm((p) => ({ ...p, title: e.target.value }))} className="w-full rounded-lg border border-neutral-200 px-4 py-3 text-xs" placeholder="Campaign title" />
              <input value={campaignForm.fromNumber} onChange={(e) => setCampaignForm((p) => ({ ...p, fromNumber: e.target.value }))} className="w-full rounded-lg border border-neutral-200 px-4 py-3 text-xs" placeholder="Sender WhatsApp number" />
              <select value={campaignForm.audience} onChange={(e) => setCampaignForm((p) => ({ ...p, audience: e.target.value }))} className="w-full rounded-lg border border-neutral-200 px-3 py-3 text-xs">
                {["All Customers", "High Value", "Wishlist Users", "Cart Abandoned", "Repeat Buyers", "New Customers", "Manual"].map((audience) => <option key={audience}>{audience}</option>)}
              </select>
              {campaignForm.audience === "Manual" && (
                <textarea value={campaignForm.manualNumbers} onChange={(e) => setCampaignForm((p) => ({ ...p, manualNumbers: e.target.value }))} className="w-full rounded-lg border border-neutral-200 px-4 py-3 text-xs min-h-24" placeholder="One phone number per line" />
              )}
              <textarea value={campaignForm.message} onChange={(e) => setCampaignForm((p) => ({ ...p, message: e.target.value }))} className="w-full rounded-lg border border-neutral-200 px-4 py-3 text-xs min-h-32" placeholder="Message. Variables: {{name}}, {{coupon}}" />
              <button className="w-full rounded-lg bg-brand-ink py-3 text-[10px] uppercase tracking-widest font-bold text-white">Prepare Campaign</button>
            </form>
            <div className="bg-white rounded-2xl border border-neutral-100 shadow-sm overflow-hidden">
              <div className="p-6 border-b border-neutral-100">
                <h4 className="font-serif text-base font-bold text-neutral-900">Prepared Campaigns</h4>
              </div>
              <div className="divide-y divide-neutral-100">
                {whatsAppCampaigns.map((campaign) => {
                  const recipients = campaign.audience === "Manual"
                    ? (campaign.manualNumbers || []).map((phone: string) => ({ phone, name: "there" }))
                    : audienceCustomers(campaign.audience);
                  return (
                    <div key={campaign._id} className="p-5 space-y-4">
                      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
                        <div>
                          <p className="font-bold text-sm text-neutral-900">{campaign.title}</p>
                          <p className="text-[10px] text-neutral-400 mt-1">From {campaign.fromNumber || "current WhatsApp"} • {campaign.audience} • {recipients.length} recipients</p>
                        </div>
                        <button onClick={() => handleDeleteWhatsAppCampaign(campaign._id)} className="rounded-lg bg-red-50 px-3 py-2 text-[9px] uppercase tracking-wider font-bold text-red-600 cursor-pointer">Delete</button>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {recipients.slice(0, 12).map((recipient: any, index: number) => (
                          <a key={`${recipient.phone}-${index}`} href={buildWhatsAppCampaignUrl(recipient.phone, campaign.message, recipient.name)} target="_blank" rel="noopener noreferrer" className="rounded-lg border border-green-100 bg-green-50 px-3 py-2 text-[9px] uppercase tracking-wider font-bold text-green-700">Send {index + 1}</a>
                        ))}
                      </div>
                    </div>
                  );
                })}
                {whatsAppCampaigns.length === 0 && <p className="p-8 text-sm text-neutral-400">No WhatsApp campaigns prepared yet.</p>}
              </div>
            </div>
          </div>
        )}

        {activeTab === "reviewAutomation" && (
          <div className="bg-white rounded-2xl border border-neutral-100 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-neutral-100 flex items-center justify-between">
              <div>
                <h4 className="font-serif text-base font-bold text-neutral-900">Review Request Automation</h4>
                <p className="text-[10px] text-neutral-400 mt-0.5">Delivered orders are ready for WhatsApp review follow-up.</p>
              </div>
              <button onClick={fetchReviewReminders} className="text-[9px] uppercase font-bold tracking-widest text-[#a2855b]">Refresh</button>
            </div>
            <div className="divide-y divide-neutral-100">
              {reviewReminders.map((order) => (
                <div key={order.orderId} className="p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  <div>
                    <p className="font-bold text-sm text-neutral-900">{order.customerName || "Customer"} • {order.orderId}</p>
                    <p className="text-[10px] text-neutral-400 mt-1">{order.phone} • Rs {Number(order.total || 0).toLocaleString()}</p>
                  </div>
                  <a
                    href={buildWhatsAppCampaignUrl(order.phone, `Hello {{name}}, thank you for shopping with Saiksha. Could you share your experience here: ${window.location.origin}/testimonials`, order.customerName)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="rounded-lg border border-green-100 bg-green-50 px-4 py-3 text-[9px] uppercase tracking-wider font-bold text-green-700"
                  >
                    Send Review Request
                  </a>
                </div>
              ))}
              {reviewReminders.length === 0 && <p className="p-8 text-sm text-neutral-400">Delivered orders will appear here.</p>}
            </div>
          </div>
        )}

        {activeTab === "cartLeads" && (
          <section className="space-y-6">
            <div className="bg-white p-6 rounded-2xl border border-neutral-100 shadow-xs flex items-center justify-between">
              <div>
                <h4 className="font-serif text-base font-bold text-neutral-900">Saved Bag Leads</h4>
                <p className="text-[10px] text-neutral-450 mt-0.5">Customers who shared contact details after adding products to their bag.</p>
              </div>
              <button
                onClick={fetchCartLeads}
                className="text-[9px] uppercase font-bold tracking-widest text-[#a2855b] hover:text-[#7a603c]"
              >
                Refresh Data
              </button>
            </div>

            {loadingCartLeads ? (
              <div className="bg-white rounded-2xl border border-neutral-100 p-10 text-center text-xs uppercase tracking-widest text-neutral-400 font-bold">
                Loading cart leads...
              </div>
            ) : cartLeads.length === 0 ? (
              <div className="bg-white rounded-2xl border border-neutral-100 p-10 text-center text-neutral-400">
                No saved bag leads yet.
              </div>
            ) : (
              <div className="bg-white rounded-2xl border border-neutral-100 overflow-hidden">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 p-5">
                  {paginatedCartLeads.map((lead) => {
                    const savedDate = lead.updatedAt
                      ? new Date(lead.updatedAt).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" })
                      : "N/A";

                    return (
                      <div key={lead._id || lead.sessionId} className="bg-white rounded-2xl border border-neutral-100 p-6 shadow-xs space-y-5">
                        <div className="flex items-start justify-between gap-4">
                          <div className="space-y-1">
                            <h5 className="font-serif text-lg font-bold text-neutral-950">{lead.customer?.name}</h5>
                            <div className="space-y-1 text-xs text-neutral-500">
                              <p className="flex items-center gap-2">
                                <Mail size={13} className="text-neutral-400" />
                                {lead.customer?.email}
                              </p>
                              <p className="flex items-center gap-2">
                                <Phone size={13} className="text-neutral-400" />
                                {lead.customer?.phone}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className={cn("rounded-full px-3 py-1 text-[9px] font-bold uppercase tracking-wider border", getCartLeadStatusClass(lead.status))}>
                              {lead.status || "Open"}
                            </span>
                            <button
                              onClick={() => handleDeleteCartLead(lead._id)}
                              className="p-2 rounded-lg bg-red-50 text-red-500 hover:bg-red-100 hover:text-red-700 transition-colors cursor-pointer"
                              title="Delete Cart Lead"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </div>

                        <div className="space-y-3">
                          {(lead.items || []).map((item: any) => (
                            <div key={`${lead.sessionId}-${item.id}`} className="flex items-center gap-3 rounded-xl bg-neutral-50 p-3">
                              <div className="h-12 w-10 shrink-0 overflow-hidden rounded bg-white border border-neutral-100">
                                <img src={item.image} alt={item.name} className="h-full w-full object-cover" />
                              </div>
                              <div className="min-w-0 flex-1">
                                <p className="truncate text-xs font-bold text-neutral-800">{item.name}</p>
                                <p className="text-[10px] text-neutral-400">Qty {item.quantity}</p>
                              </div>
                              <span className="text-xs font-bold text-neutral-900">Rs {Number(item.price || 0).toLocaleString()}</span>
                            </div>
                          ))}
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 border-t border-neutral-100 pt-4">
                          {(settings.cartLeadFollowUpTemplates || []).slice(0, 2).map((template) => (
                            <a
                              key={template.title}
                              href={buildCartLeadFollowUpUrl(lead, template.message)}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center justify-center gap-2 rounded-lg bg-green-50 border border-green-100 py-2.5 text-[10px] uppercase tracking-wider font-bold text-green-700 hover:bg-green-100"
                            >
                              <Phone size={12} />
                              {template.title}
                            </a>
                          ))}
                          <button
                            onClick={() => handleUpdateCartLeadStatus(lead._id, "Contacted")}
                            disabled={lead.status === "Contacted" || lead.status === "Converted"}
                            className="rounded-lg bg-blue-50 border border-blue-100 py-2.5 text-[10px] uppercase tracking-wider font-bold text-blue-700 hover:bg-blue-100 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                          >
                            Mark Contacted
                          </button>
                          <button
                            onClick={() => handleUpdateCartLeadStatus(lead._id, "Converted")}
                            disabled={lead.status === "Converted"}
                            className="rounded-lg bg-neutral-950 py-2.5 text-[10px] uppercase tracking-wider font-bold text-white hover:bg-neutral-800 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                          >
                            Mark Converted
                          </button>
                        </div>

                        <div className="flex items-center justify-between border-t border-neutral-100 pt-4 text-xs">
                          <span className="text-neutral-400">Saved {savedDate}</span>
                          <span className="font-bold text-neutral-950">Total Rs {Number(lead.total || 0).toLocaleString()}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
                {renderPagination(
                  cartLeads.length,
                  currentCartLeadPage,
                  cartLeadsPerPage,
                  setCurrentCartLeadPage,
                  setCartLeadsPerPage,
                  "cart leads"
                )}
              </div>
            )}
          </section>
        )}

        {activeTab === "leadCaptures" && (
          <section className="space-y-6">
            <div className="bg-white p-6 rounded-2xl border border-neutral-100 shadow-xs flex items-center justify-between">
              <div>
                <h4 className="font-serif text-base font-bold text-neutral-900">Lead Captures</h4>
                <p className="text-[10px] text-neutral-450 mt-0.5">Exit offers, product inquiries, price alerts, notify-me, checkout recovery, and WhatsApp help leads.</p>
              </div>
              <button onClick={fetchLeadCaptures} className="text-[9px] uppercase font-bold tracking-widest text-[#a2855b] hover:text-[#7a603c]">
                Refresh Data
              </button>
            </div>

            {loadingLeadCaptures ? (
              <div className="bg-white rounded-2xl border border-neutral-100 p-10 text-center text-xs uppercase tracking-widest text-neutral-400 font-bold">
                Loading leads...
              </div>
            ) : leadCaptures.length === 0 ? (
              <div className="bg-white rounded-2xl border border-neutral-100 p-12 text-center text-neutral-400">
                <MessageCircle size={40} className="mx-auto text-neutral-300 mb-4" />
                <h4 className="font-serif text-sm font-bold text-neutral-500">No Lead Captures Yet</h4>
                <p className="text-[10px] text-neutral-400 font-light mt-1">New captured leads will appear here.</p>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  {paginatedLeadCaptures.map((lead) => {
                    const phone = String(lead.customer?.phone || "").replace(/\D/g, "");
                    const leadDate = lead.createdAt
                      ? new Date(lead.createdAt).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" })
                      : "N/A";
                    const whatsappText = encodeURIComponent(`Hello ${lead.customer?.name || ""}, this is Saiksha following up on your ${lead.source}.`);
                    return (
                      <div key={lead._id} className="bg-white rounded-2xl border border-neutral-100 shadow-xs p-5 space-y-4">
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <p className="text-[10px] uppercase tracking-widest font-bold text-brand-rosegold">{lead.source}</p>
                            <p className="text-xs font-bold text-neutral-950 mt-1">{lead.customer?.name || "Unnamed lead"}</p>
                            <p className="text-[10px] text-neutral-400">{lead.customer?.email} · {lead.customer?.phone}</p>
                            <p className="text-[10px] text-neutral-400 mt-1">{leadDate}</p>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className={cn("rounded-full border px-2.5 py-1 text-[9px] uppercase tracking-wider font-bold", getCartLeadStatusClass(lead.status))}>
                              {lead.status || "Open"}
                            </span>
                            <button onClick={() => handleDeleteLeadCapture(lead._id)} className="p-2 rounded-lg text-red-400 hover:text-red-600 hover:bg-red-50 cursor-pointer" title="Delete">
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </div>

                        {lead.product?.name && (
                          <div className="rounded-xl bg-neutral-50 p-3 flex items-center gap-3">
                            {lead.product.image && <img src={lead.product.image} alt={lead.product.name} className="h-12 w-10 object-cover rounded bg-white" />}
                            <div className="min-w-0">
                              <p className="truncate text-xs font-bold text-neutral-800">{lead.product.name}</p>
                              <p className="text-[10px] text-neutral-400">Rs {Number(lead.product.price || 0).toLocaleString()}</p>
                            </div>
                          </div>
                        )}

                        {(lead.items || []).length > 0 && (
                          <div className="space-y-2">
                            {(lead.items || []).slice(0, 3).map((item: any) => (
                              <div key={`${lead._id}-${item.id}`} className="flex items-center justify-between rounded-lg bg-neutral-50 px-3 py-2 text-xs">
                                <span className="truncate font-bold text-neutral-700">{item.name}</span>
                                <span className="text-neutral-400">Qty {item.quantity || 1}</span>
                              </div>
                            ))}
                          </div>
                        )}

                        {lead.message && <p className="rounded-xl bg-brand-cream/25 p-3 text-xs text-neutral-500">{lead.message}</p>}

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 border-t border-neutral-100 pt-4">
                          {phone && (
                            <a href={`https://wa.me/91${phone}?text=${whatsappText}`} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-2 rounded-lg bg-green-50 border border-green-100 py-2.5 text-[10px] uppercase tracking-wider font-bold text-green-700 hover:bg-green-100">
                              <Phone size={12} />
                              WhatsApp
                            </a>
                          )}
                          <button onClick={() => handleUpdateLeadCaptureStatus(lead._id, "Contacted")} disabled={lead.status === "Contacted" || lead.status === "Converted"} className="rounded-lg bg-blue-50 border border-blue-100 py-2.5 text-[10px] uppercase tracking-wider font-bold text-blue-700 hover:bg-blue-100 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer">
                            Mark Contacted
                          </button>
                          <button onClick={() => handleUpdateLeadCaptureStatus(lead._id, "Converted")} disabled={lead.status === "Converted"} className="rounded-lg bg-neutral-950 py-2.5 text-[10px] uppercase tracking-wider font-bold text-white hover:bg-neutral-800 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer">
                            Mark Converted
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
                {renderPagination(
                  leadCaptures.length,
                  currentLeadCapturePage,
                  leadCapturesPerPage,
                  setCurrentLeadCapturePage,
                  setLeadCapturesPerPage,
                  "lead captures"
                )}
              </div>
            )}
          </section>
        )}

        {activeTab === "wishlistLeads" && (
          <section className="space-y-6">
            <div className="bg-white p-6 rounded-2xl border border-neutral-100 shadow-xs flex items-center justify-between">
              <div>
                <h4 className="font-serif text-base font-bold text-neutral-900">Wishlist Recovery Leads</h4>
                <p className="text-[10px] text-neutral-450 mt-0.5">Customers who saved favorites and shared contact details for follow-up.</p>
              </div>
              <button onClick={fetchWishlistLeads} className="text-[9px] uppercase font-bold tracking-widest text-[#a2855b] hover:text-[#7a603c]">
                Refresh Data
              </button>
            </div>

            {loadingWishlistLeads ? (
              <div className="bg-white rounded-2xl border border-neutral-100 p-10 text-center text-xs uppercase tracking-widest text-neutral-400 font-bold">
                Loading wishlist leads...
              </div>
            ) : wishlistLeads.length === 0 ? (
              <div className="bg-white rounded-2xl border border-neutral-100 p-12 text-center text-neutral-400">
                <Heart size={40} className="mx-auto text-neutral-300 mb-4" />
                <h4 className="font-serif text-sm font-bold text-neutral-500">No Wishlist Leads Yet</h4>
                <p className="text-[10px] text-neutral-400 font-light mt-1">Wishlist recovery submissions will appear here.</p>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  {paginatedWishlistLeads.map((lead) => {
                    const savedDate = lead.createdAt
                      ? new Date(lead.createdAt).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" })
                      : "N/A";
                    return (
                      <div key={lead._id} className="bg-white rounded-2xl border border-neutral-100 shadow-xs p-5 space-y-4">
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <p className="text-xs font-bold text-neutral-950">{lead.customer?.name}</p>
                            <p className="text-[10px] text-neutral-400">{lead.customer?.email} · {lead.customer?.phone}</p>
                            <p className="text-[10px] text-neutral-400 mt-1">Saved {savedDate}</p>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className={cn("rounded-full border px-2.5 py-1 text-[9px] uppercase tracking-wider font-bold", getCartLeadStatusClass(lead.status))}>
                              {lead.status || "Open"}
                            </span>
                            <button onClick={() => handleDeleteWishlistLead(lead._id)} className="p-2 rounded-lg text-red-400 hover:text-red-600 hover:bg-red-50 cursor-pointer" title="Delete">
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </div>

                        <div className="space-y-3">
                          {(lead.items || []).map((item: any) => (
                            <div key={`${lead.sessionId}-${item.id}`} className="flex items-center gap-3 rounded-xl bg-neutral-50 p-3">
                              <div className="h-12 w-10 shrink-0 overflow-hidden rounded bg-white border border-neutral-100">
                                <img src={item.image} alt={item.name} className="h-full w-full object-cover" />
                              </div>
                              <div className="min-w-0 flex-1">
                                <p className="truncate text-xs font-bold text-neutral-800">{item.name}</p>
                                <p className="text-[10px] text-neutral-400">Wishlist item</p>
                              </div>
                              <span className="text-xs font-bold text-neutral-900">Rs {Number(item.price || 0).toLocaleString()}</span>
                            </div>
                          ))}
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 border-t border-neutral-100 pt-4">
                          <a
                            href={`https://wa.me/91${String(lead.customer?.phone || "").replace(/\D/g, "")}?text=${encodeURIComponent(`Hello ${lead.customer?.name || ""}, you saved some Saiksha favorites. Would you like help choosing the right piece?`)}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center justify-center gap-2 rounded-lg bg-green-50 border border-green-100 py-2.5 text-[10px] uppercase tracking-wider font-bold text-green-700 hover:bg-green-100"
                          >
                            <Phone size={12} />
                            WhatsApp
                          </a>
                          <button
                            onClick={() => handleUpdateWishlistLeadStatus(lead._id, "Contacted")}
                            disabled={lead.status === "Contacted" || lead.status === "Converted"}
                            className="rounded-lg bg-blue-50 border border-blue-100 py-2.5 text-[10px] uppercase tracking-wider font-bold text-blue-700 hover:bg-blue-100 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                          >
                            Mark Contacted
                          </button>
                          <button
                            onClick={() => handleUpdateWishlistLeadStatus(lead._id, "Converted")}
                            disabled={lead.status === "Converted"}
                            className="rounded-lg bg-neutral-950 py-2.5 text-[10px] uppercase tracking-wider font-bold text-white hover:bg-neutral-800 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                          >
                            Mark Converted
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
                {renderPagination(
                  wishlistLeads.length,
                  currentWishlistLeadPage,
                  wishlistLeadsPerPage,
                  setCurrentWishlistLeadPage,
                  setWishlistLeadsPerPage,
                  "wishlist leads"
                )}
              </div>
            )}
          </section>
        )}

        {activeTab === "searchAnalytics" && (
          <section className="space-y-6">
            <div className="bg-white p-6 rounded-2xl border border-neutral-100 shadow-xs flex items-center justify-between">
              <div>
                <h4 className="font-serif text-base font-bold text-neutral-900">Search Analytics</h4>
                <p className="text-[10px] text-neutral-450 mt-0.5">See what customers search for, including zero-result demand.</p>
              </div>
              <button onClick={fetchSearchAnalytics} className="text-[9px] uppercase font-bold tracking-widest text-[#a2855b] hover:text-[#7a603c]">
                Refresh Data
              </button>
            </div>

            {loadingSearchAnalytics ? (
              <div className="bg-white rounded-2xl border border-neutral-100 p-10 text-center text-xs uppercase tracking-widest text-neutral-400 font-bold">
                Loading search analytics...
              </div>
            ) : searchAnalytics.length === 0 ? (
              <div className="bg-white rounded-2xl border border-neutral-100 p-12 text-center text-neutral-400">
                <Search size={40} className="mx-auto text-neutral-300 mb-4" />
                <h4 className="font-serif text-sm font-bold text-neutral-500">No Search Data Yet</h4>
                <p className="text-[10px] text-neutral-400 font-light mt-1">Customer searches from the collection page will appear here.</p>
              </div>
            ) : (
              <div className="bg-white rounded-2xl border border-neutral-100 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse text-left">
                    <thead>
                      <tr className="bg-neutral-50/70 border-b border-neutral-100 text-[9px] uppercase tracking-widest text-neutral-400 font-bold">
                        <th className="py-4 px-6">Search Query</th>
                        <th className="py-4 px-6">Hits</th>
                        <th className="py-4 px-6">Results</th>
                        <th className="py-4 px-6">Demand Signal</th>
                        <th className="py-4 px-6">Last Searched</th>
                        <th className="py-4 px-6 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-50 text-xs">
                      {searchAnalytics.map((entry) => (
                        <tr key={entry._id} className="hover:bg-neutral-50/30">
                          <td className="py-4 px-6 font-bold text-neutral-950">{entry.query}</td>
                          <td className="py-4 px-6 font-bold text-neutral-900">{entry.hits}</td>
                          <td className="py-4 px-6 text-neutral-600">{entry.resultCount}</td>
                          <td className="py-4 px-6">
                            <span className={cn(
                              "rounded-full border px-2.5 py-1 text-[9px] uppercase tracking-wider font-bold",
                              entry.resultCount === 0
                                ? "bg-red-50 text-red-600 border-red-100"
                                : entry.hits >= 3
                                  ? "bg-green-50 text-green-700 border-green-100"
                                  : "bg-neutral-50 text-neutral-500 border-neutral-100"
                            )}>
                              {entry.resultCount === 0 ? "No matching product" : entry.hits >= 3 ? "High interest" : "Tracked"}
                            </span>
                          </td>
                          <td className="py-4 px-6 text-neutral-400">
                            {entry.lastSearchedAt ? new Date(entry.lastSearchedAt).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" }) : "N/A"}
                          </td>
                          <td className="py-4 px-6 text-right">
                            <button onClick={() => handleDeleteSearchAnalytics(entry._id)} className="p-2 rounded-lg text-red-400 hover:text-red-600 hover:bg-red-50 cursor-pointer" title="Delete search entry">
                              <Trash2 size={14} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
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
              <div className="bg-white rounded-2xl border border-neutral-100 overflow-hidden">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-5">
                  {paginatedTestimonials.map((testimonial) => (
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
                {renderPagination(
                  testimonials.length,
                  currentTestimonialPage,
                  testimonialsPerPage,
                  setCurrentTestimonialPage,
                  setTestimonialsPerPage,
                  "testimonials",
                  [9, 18, 27, 45]
                )}
              </div>
            )}
          </section>
        )}

        {activeTab === "settings" && (
          <section className="space-y-6">
            <div className="bg-white p-6 rounded-2xl border border-neutral-100 shadow-xs flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              <div>
                <h4 className="font-serif text-base font-bold text-neutral-900">Store Settings</h4>
                <p className="text-[10px] text-neutral-450 mt-0.5">Control storefront messages, support contacts, WhatsApp, shipping, and offer details.</p>
              </div>
              <div className="rounded-xl bg-neutral-50 border border-neutral-100 px-4 py-3 text-xs text-neutral-500">
                Changes update the live storefront after save.
              </div>
            </div>

            <form onSubmit={handleSaveSettings} className="grid grid-cols-1 xl:grid-cols-3 gap-6">
              <div className="xl:col-span-2 space-y-6">
                <div className="bg-white rounded-2xl border border-neutral-100 shadow-xs p-6 space-y-5">
                  <div>
                    <h5 className="font-serif text-sm font-bold text-neutral-950">Store Identity</h5>
                    <p className="text-[10px] text-neutral-400 mt-1">Basic public-facing store and support information.</p>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <label className="space-y-1.5">
                      <span className="text-[10px] uppercase tracking-widest font-bold text-neutral-400">Store Name</span>
                      <input
                        name="storeName"
                        value={settingsForm.storeName}
                        onChange={handleSettingsChange}
                        className="w-full rounded-lg border border-neutral-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-brand-rosegold focus:ring-1 focus:ring-brand-rosegold/30"
                        placeholder="Saiksha"
                      />
                    </label>
                    <label className="space-y-1.5">
                      <span className="text-[10px] uppercase tracking-widest font-bold text-neutral-400">Support Email</span>
                      <input
                        type="email"
                        name="supportEmail"
                        value={settingsForm.supportEmail}
                        onChange={handleSettingsChange}
                        className="w-full rounded-lg border border-neutral-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-brand-rosegold focus:ring-1 focus:ring-brand-rosegold/30"
                        placeholder="support@saiksha.in"
                      />
                    </label>
                    <label className="space-y-1.5">
                      <span className="text-[10px] uppercase tracking-widest font-bold text-neutral-400">WhatsApp Number</span>
                      <input
                        name="whatsappNumber"
                        value={settingsForm.whatsappNumber}
                        onChange={handleSettingsChange}
                        className="w-full rounded-lg border border-neutral-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-brand-rosegold focus:ring-1 focus:ring-brand-rosegold/30"
                        placeholder="917383055032"
                      />
                    </label>
                    <label className="space-y-1.5">
                      <span className="text-[10px] uppercase tracking-widest font-bold text-neutral-400">Display Phone</span>
                      <input
                        name="supportPhone"
                        value={settingsForm.supportPhone}
                        onChange={handleSettingsChange}
                        className="w-full rounded-lg border border-neutral-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-brand-rosegold focus:ring-1 focus:ring-brand-rosegold/30"
                        placeholder="+91 73830 55032"
                      />
                    </label>
                    <label className="space-y-1.5 md:col-span-2">
                      <span className="text-[10px] uppercase tracking-widest font-bold text-neutral-400">Instagram URL</span>
                      <input
                        type="url"
                        name="instagramUrl"
                        value={settingsForm.instagramUrl}
                        onChange={handleSettingsChange}
                        className="w-full rounded-lg border border-neutral-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-brand-rosegold focus:ring-1 focus:ring-brand-rosegold/30"
                        placeholder="https://www.instagram.com/saiksha.jewels/"
                      />
                    </label>
                  </div>
                </div>

                <div className="bg-white rounded-2xl border border-neutral-100 shadow-xs p-6 space-y-5">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h5 className="font-serif text-sm font-bold text-neutral-950">Announcement Bar</h5>
                      <p className="text-[10px] text-neutral-400 mt-1">This is the moving message shown at the top of the website.</p>
                    </div>
                    <label className="flex items-center gap-2 text-xs font-bold text-neutral-600 cursor-pointer">
                      <input
                        type="checkbox"
                        name="announcementEnabled"
                        checked={settingsForm.announcementEnabled}
                        onChange={handleSettingsChange}
                        className="h-4 w-4 rounded border-neutral-300 text-brand-rosegold focus:ring-brand-rosegold"
                      />
                      Enabled
                    </label>
                  </div>
                  <textarea
                    name="announcementText"
                    value={settingsForm.announcementText}
                    onChange={handleSettingsChange}
                    rows={3}
                    className="w-full rounded-lg border border-neutral-200 bg-white px-3 py-2.5 text-sm leading-relaxed outline-none focus:border-brand-rosegold focus:ring-1 focus:ring-brand-rosegold/30"
                    placeholder="Free shipping on orders over Rs 5,000 - New Collection just launched - Use code SAIKSHA10 for 10% off"
                  />
                </div>

                <div className="bg-white rounded-2xl border border-neutral-100 shadow-xs p-6 space-y-5">
                  <div>
                    <h5 className="font-serif text-sm font-bold text-neutral-950">Offers and Policies</h5>
                    <p className="text-[10px] text-neutral-400 mt-1">Useful values for promotions, shipping, and customer-support copy.</p>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <label className="space-y-1.5">
                      <span className="text-[10px] uppercase tracking-widest font-bold text-neutral-400">Free Shipping Threshold</span>
                      <input
                        type="number"
                        min="0"
                        name="freeShippingThreshold"
                        value={settingsForm.freeShippingThreshold}
                        onChange={handleSettingsChange}
                        className="w-full rounded-lg border border-neutral-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-brand-rosegold focus:ring-1 focus:ring-brand-rosegold/30"
                      />
                    </label>
                    <label className="space-y-1.5">
                      <span className="text-[10px] uppercase tracking-widest font-bold text-neutral-400">Coupon Code</span>
                      <input
                        name="couponCode"
                        value={settingsForm.couponCode}
                        onChange={handleSettingsChange}
                        className="w-full rounded-lg border border-neutral-200 bg-white px-3 py-2.5 text-sm uppercase outline-none focus:border-brand-rosegold focus:ring-1 focus:ring-brand-rosegold/30"
                        placeholder="SAIKSHA10"
                      />
                    </label>
                    <label className="space-y-1.5">
                      <span className="text-[10px] uppercase tracking-widest font-bold text-neutral-400">Coupon Discount %</span>
                      <input
                        type="number"
                        min="0"
                        max="100"
                        name="couponDiscountPercent"
                        value={settingsForm.couponDiscountPercent}
                        onChange={handleSettingsChange}
                        className="w-full rounded-lg border border-neutral-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-brand-rosegold focus:ring-1 focus:ring-brand-rosegold/30"
                        placeholder="10"
                      />
                    </label>
                    <label className="space-y-1.5">
                      <span className="text-[10px] uppercase tracking-widest font-bold text-neutral-400">Minimum Order</span>
                      <input
                        type="number"
                        min="0"
                        name="couponMinOrder"
                        value={settingsForm.couponMinOrder}
                        onChange={handleSettingsChange}
                        className="w-full rounded-lg border border-neutral-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-brand-rosegold focus:ring-1 focus:ring-brand-rosegold/30"
                        placeholder="0"
                      />
                    </label>
                    <label className="space-y-1.5">
                      <span className="text-[10px] uppercase tracking-widest font-bold text-neutral-400">Usage Limit</span>
                      <input
                        type="number"
                        min="0"
                        name="couponUsageLimit"
                        value={settingsForm.couponUsageLimit}
                        onChange={handleSettingsChange}
                        className="w-full rounded-lg border border-neutral-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-brand-rosegold focus:ring-1 focus:ring-brand-rosegold/30"
                        placeholder="0 means unlimited"
                      />
                    </label>
                    <label className="space-y-1.5">
                      <span className="text-[10px] uppercase tracking-widest font-bold text-neutral-400">Expiry Date</span>
                      <input
                        type="date"
                        name="couponExpiresAt"
                        value={settingsForm.couponExpiresAt || ""}
                        onChange={handleSettingsChange}
                        className="w-full rounded-lg border border-neutral-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-brand-rosegold focus:ring-1 focus:ring-brand-rosegold/30"
                      />
                    </label>
                    <label className="space-y-1.5 md:col-span-2">
                      <span className="text-[10px] uppercase tracking-widest font-bold text-neutral-400">Coupon Text</span>
                      <input
                        name="couponText"
                        value={settingsForm.couponText}
                        onChange={handleSettingsChange}
                        className="w-full rounded-lg border border-neutral-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-brand-rosegold focus:ring-1 focus:ring-brand-rosegold/30"
                        placeholder="Use code SAIKSHA10 for 10% off"
                      />
                    </label>
                    <label className="space-y-1.5 md:col-span-2">
                      <span className="text-[10px] uppercase tracking-widest font-bold text-neutral-400">Shipping Note</span>
                      <textarea
                        name="shippingNote"
                        value={settingsForm.shippingNote}
                        onChange={handleSettingsChange}
                        rows={3}
                        className="w-full rounded-lg border border-neutral-200 bg-white px-3 py-2.5 text-sm leading-relaxed outline-none focus:border-brand-rosegold focus:ring-1 focus:ring-brand-rosegold/30"
                      />
                    </label>
                    <label className="space-y-1.5 md:col-span-2">
                      <span className="text-[10px] uppercase tracking-widest font-bold text-neutral-400">Return Policy Summary</span>
                      <textarea
                        name="returnPolicy"
                        value={settingsForm.returnPolicy}
                        onChange={handleSettingsChange}
                        rows={3}
                        className="w-full rounded-lg border border-neutral-200 bg-white px-3 py-2.5 text-sm leading-relaxed outline-none focus:border-brand-rosegold focus:ring-1 focus:ring-brand-rosegold/30"
                      />
                    </label>
                  </div>
                </div>

                <div className="bg-white rounded-2xl border border-neutral-100 shadow-xs p-6 space-y-5">
                  <div>
                    <h5 className="font-serif text-sm font-bold text-neutral-950">Cart Lead Follow-up Templates</h5>
                    <p className="text-[10px] text-neutral-400 mt-1">Used by the Cart Leads WhatsApp follow-up buttons. Variables: {"{{name}}"} and {"{{coupon}}"}.</p>
                  </div>
                  <div className="space-y-4">
                    {(settingsForm.cartLeadFollowUpTemplates || []).map((template, index) => (
                      <div key={index} className="rounded-xl border border-neutral-100 bg-neutral-50/60 p-4 space-y-3">
                        <input
                          value={template.title}
                          onChange={(e) => handleFollowUpTemplateChange(index, "title", e.target.value)}
                          className="w-full rounded-lg border border-neutral-200 bg-white px-3 py-2 text-xs font-bold outline-none focus:border-brand-rosegold"
                          placeholder="Template title"
                        />
                        <textarea
                          value={template.message}
                          onChange={(e) => handleFollowUpTemplateChange(index, "message", e.target.value)}
                          rows={3}
                          className="w-full rounded-lg border border-neutral-200 bg-white px-3 py-2 text-xs leading-relaxed outline-none focus:border-brand-rosegold"
                          placeholder="WhatsApp message"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <aside className="space-y-6">
                <div className="bg-neutral-950 text-white rounded-2xl p-6 shadow-xs space-y-5">
                  <div>
                    <p className="text-[10px] uppercase tracking-widest text-white/45 font-bold">Live Preview</p>
                    <h5 className="font-serif text-lg font-bold mt-1">{settingsForm.storeName || "Saiksha"}</h5>
                  </div>
                  <div className="rounded-xl bg-white/8 border border-white/10 p-4 space-y-2">
                    <p className="text-[9px] uppercase tracking-widest text-white/45 font-bold">Top Bar</p>
                    <p className="text-xs leading-relaxed text-white/85">{settingsForm.announcementEnabled ? settingsForm.announcementText : "Announcement hidden"}</p>
                  </div>
                  <div className="rounded-xl bg-white/8 border border-white/10 p-4 space-y-2">
                    <p className="text-[9px] uppercase tracking-widest text-white/45 font-bold">Support</p>
                    <p className="text-xs text-white/85">{settingsForm.supportPhone}</p>
                    <p className="text-xs text-white/55">{settingsForm.supportEmail}</p>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={savingSettings}
                  className="w-full rounded-xl bg-brand-ink px-5 py-4 text-[10px] uppercase tracking-widest font-bold text-white shadow-lg shadow-brand-ink/10 hover:bg-neutral-800 disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
                >
                  {savingSettings ? "Saving Settings..." : "Save Store Settings"}
                </button>
              </aside>
            </form>
          </section>
        )}
          </main>
        </div>
      </div>

      {/* Order Detail Drawer */}
      {selectedOrder && (
        <div className="fixed inset-0 z-[70] flex justify-end">
          <div className="absolute inset-0 bg-neutral-950/35 backdrop-blur-[1px]" onClick={() => setSelectedOrder(null)} />
          <aside className="relative h-full w-full max-w-xl bg-white shadow-2xl border-l border-neutral-100 flex flex-col">
            <div className="p-5 border-b border-neutral-100 flex items-start justify-between gap-4">
              <div>
                <p className="text-[10px] uppercase tracking-[2px] text-neutral-400 font-bold">Order Details</p>
                <h3 className="font-mono text-lg font-bold text-neutral-950">{selectedOrder.orderId}</h3>
                <p className="text-xs text-neutral-400 mt-1">
                  {selectedOrder.createdAt
                    ? new Date(selectedOrder.createdAt).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" })
                    : "Date unavailable"}
                </p>
              </div>
              <button
                onClick={() => setSelectedOrder(null)}
                className="p-2 rounded-lg text-neutral-400 hover:text-neutral-900 hover:bg-neutral-50 cursor-pointer"
                title="Close"
              >
                <X size={18} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-5 space-y-5">
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-xl border border-neutral-100 bg-neutral-50 p-4">
                  <p className="text-[9px] uppercase tracking-wider text-neutral-400 font-bold">Order Total</p>
                  <p className="text-xl font-serif font-bold text-neutral-950 mt-1">Rs {Number(selectedOrder.total || 0).toLocaleString()}</p>
                </div>
                <div className="rounded-xl border border-neutral-100 bg-neutral-50 p-4">
                  <p className="text-[9px] uppercase tracking-wider text-neutral-400 font-bold">Status</p>
                  <select
                    value={selectedOrder.status}
                    onChange={async (e) => {
                      await handleUpdateOrderStatus(selectedOrder.orderId, e.target.value);
                      setSelectedOrder((current: any) => current ? { ...current, status: e.target.value } : current);
                    }}
                    className="mt-2 w-full rounded-lg border border-neutral-200 bg-white px-3 py-2 text-[10px] font-bold uppercase tracking-wider outline-none cursor-pointer"
                  >
                    <option value="Pending">Pending</option>
                    <option value="Confirmed">Confirmed</option>
                    <option value="Shipped">Shipped</option>
                    <option value="Delivered">Delivered</option>
                    <option value="Cancelled">Cancelled</option>
                  </select>
                </div>
              </div>

              <section className="rounded-2xl border border-neutral-100 p-5 space-y-4">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <h4 className="font-serif font-bold text-neutral-950">Customer</h4>
                    <p className="text-sm font-bold text-neutral-800 mt-1">
                      {selectedOrder.customer?.firstName} {selectedOrder.customer?.lastName}
                    </p>
                  </div>
                  <span className="rounded-full bg-green-50 text-green-700 border border-green-100 px-3 py-1 text-[9px] uppercase tracking-wider font-bold">
                    {selectedOrder.paymentStatus || "Pending"}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-neutral-600">
                  <a href={`mailto:${selectedOrder.customer?.email}`} className="flex items-center gap-2 rounded-xl bg-neutral-50 p-3 hover:bg-neutral-100">
                    <Mail size={14} className="text-neutral-400" />
                    <span className="truncate">{selectedOrder.customer?.email}</span>
                  </a>
                  <a
                    href={`https://wa.me/91${String(selectedOrder.customer?.phone || "").replace(/\D/g, "")}?text=${encodeURIComponent(`Hello ${selectedOrder.customer?.firstName || ""}, regarding your Saiksha order ${selectedOrder.orderId}.`)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 rounded-xl bg-green-50 p-3 hover:bg-green-100 text-green-700"
                  >
                    <Phone size={14} />
                    <span>{selectedOrder.customer?.phone}</span>
                  </a>
                </div>

                {selectedOrder.customer?.secondaryPhone && (
                  <p className="text-xs text-neutral-500 flex items-center gap-2">
                    <Phone size={13} className="text-neutral-400" />
                    Secondary: {selectedOrder.customer.secondaryPhone}
                  </p>
                )}
              </section>

              <section className="rounded-2xl border border-neutral-100 p-5 space-y-3">
                <h4 className="font-serif font-bold text-neutral-950">Delivery Address</h4>
                <p className="text-xs text-neutral-500 leading-relaxed">
                  {selectedOrder.customer?.address}<br />
                  {selectedOrder.customer?.city} - {selectedOrder.customer?.postalCode}
                </p>
              </section>

              <section className="rounded-2xl border border-neutral-100 p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="font-serif font-bold text-neutral-950">Items</h4>
                  <span className="text-[10px] uppercase tracking-wider text-neutral-400 font-bold">
                    {selectedOrder.items?.length || 0} pieces
                  </span>
                </div>
                <div className="space-y-3">
                  {(selectedOrder.items || []).map((item: any) => (
                    <div key={`${selectedOrder.orderId}-${item.id}-${item.name}`} className="flex items-center gap-3 rounded-xl bg-neutral-50 p-3">
                      <div className="h-14 w-12 rounded-lg overflow-hidden bg-white border border-neutral-100 shrink-0">
                        <img src={item.image} alt={item.name} className="h-full w-full object-cover" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-bold text-neutral-900 truncate">{item.name}</p>
                        <p className="text-[10px] text-neutral-400">ID: {item.id} · Qty {item.quantity}</p>
                      </div>
                      <p className="text-xs font-bold text-neutral-950">Rs {Number(item.price || 0).toLocaleString()}</p>
                    </div>
                  ))}
                </div>
              </section>

              <section className="rounded-2xl border border-neutral-100 p-5 space-y-3">
                <h4 className="font-serif font-bold text-neutral-950">Payment & Totals</h4>
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between text-neutral-500">
                    <span>Payment Method</span>
                    <span className="font-bold text-neutral-900">{selectedOrder.paymentMethod}</span>
                  </div>
                  <div className="flex justify-between text-neutral-500">
                    <span>Subtotal</span>
                    <span className="font-bold text-neutral-900">Rs {Number(selectedOrder.subTotal || 0).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-neutral-500">
                    <span>Shipping</span>
                    <span className="font-bold text-green-600">{selectedOrder.shipping === 0 ? "FREE" : `Rs ${Number(selectedOrder.shipping || 0).toLocaleString()}`}</span>
                  </div>
                  <div className="flex justify-between border-t border-neutral-100 pt-3 text-sm">
                    <span className="font-bold text-neutral-950">Grand Total</span>
                    <span className="font-bold text-neutral-950">Rs {Number(selectedOrder.total || 0).toLocaleString()}</span>
                  </div>
                </div>
              </section>

              <section className="rounded-2xl border border-neutral-100 p-5 space-y-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <h4 className="font-serif font-bold text-neutral-950">Refunds & Returns</h4>
                    <p className="text-[10px] text-neutral-400">Track refund/return state for this order.</p>
                  </div>
                  <button
                    onClick={() => handleUpdateRefund(selectedOrder.orderId)}
                    className="rounded-lg bg-neutral-950 px-3 py-2 text-[9px] uppercase tracking-wider font-bold text-white cursor-pointer"
                  >
                    Update
                  </button>
                </div>
                <div className="rounded-xl bg-neutral-50 border border-neutral-100 p-4 text-xs space-y-1">
                  <p><span className="font-bold text-neutral-950">Status:</span> {selectedOrder.refund?.status || "None"}</p>
                  <p><span className="font-bold text-neutral-950">Amount:</span> Rs {Number(selectedOrder.refund?.amount || 0).toLocaleString()}</p>
                  {selectedOrder.refund?.reason && <p className="text-neutral-500">{selectedOrder.refund.reason}</p>}
                </div>
              </section>

              <section className="rounded-2xl border border-neutral-100 p-5 space-y-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <h4 className="font-serif font-bold text-neutral-950">Order Timeline</h4>
                    <p className="text-[10px] text-neutral-400">Private order activity and fulfillment notes.</p>
                  </div>
                  <button
                    onClick={() => handleAddOrderTimeline(selectedOrder.orderId)}
                    className="rounded-lg border border-neutral-200 px-3 py-2 text-[9px] uppercase tracking-wider font-bold text-neutral-600 cursor-pointer"
                  >
                    Add Note
                  </button>
                </div>
                <div className="space-y-3">
                  {(selectedOrder.timeline || []).length === 0 ? (
                    <p className="text-xs text-neutral-400">No timeline notes yet.</p>
                  ) : selectedOrder.timeline.map((entry: any, index: number) => (
                    <div key={`${entry.title}-${index}`} className="border-l-2 border-brand-rosegold/30 pl-3 text-xs">
                      <p className="font-bold text-neutral-900">{entry.title}</p>
                      {entry.note && <p className="text-neutral-500 mt-0.5">{entry.note}</p>}
                      <p className="text-[10px] text-neutral-400 mt-1">
                        {entry.createdAt ? new Date(entry.createdAt).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" }) : ""}
                      </p>
                    </div>
                  ))}
                </div>
              </section>
            </div>

            <div className="p-5 border-t border-neutral-100 flex gap-3">
              <button
                onClick={() => {
                  setSelectedOrder(null);
                  handleDeleteOrder(selectedOrder.orderId);
                }}
                className="flex-1 rounded-xl border border-red-100 bg-red-50 py-3 text-[10px] uppercase tracking-widest font-bold text-red-600 hover:bg-red-100 cursor-pointer"
              >
                Delete Order
              </button>
              <button
                onClick={() => setSelectedOrder(null)}
                className="flex-1 rounded-xl bg-brand-ink py-3 text-[10px] uppercase tracking-widest font-bold text-white hover:bg-neutral-800 cursor-pointer"
              >
                Done
              </button>
            </div>
          </aside>
        </div>
      )}

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

                <div className="space-y-1">
                  <label className="font-bold text-neutral-500">Product Variants (Name | Value | Price | Stock)</label>
                  <textarea
                    rows={3}
                    name="variantsText"
                    value={formData.variantsText}
                    onChange={handleFormChange}
                    placeholder={"Metal | Rose Gold | 1890 | 8\nMetal | Silver | 1790 | 10\nSize | Adjustable | | 5"}
                    className="w-full px-3 py-2.5 rounded-lg border border-neutral-200 focus:outline-none focus:ring-1 focus:ring-brand-rosegold font-mono"
                  />
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

