import React, { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import {
  Star,
  Heart,
  ShoppingBag,
  Truck,
  ShieldCheck,
  RefreshCw,
  ChevronRight,
  Plus,
  Minus,
  Share2,
  Trash2,
  ChevronDown,
  ChevronUp,
  Award,
  Gem,
  Gift,
  CheckCircle2,
  ChevronLeft,
  Eye
  , MessageCircle, Bell, BadgePercent
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { categorySpecifications } from "../data/categorySpecifications";
import { useProducts } from "../context/ProductContext";
import ProductCard from "../components/ui/ProductCard";
import { cn } from "../lib/utils";

import { useCart } from "../context/CartContext";
import { useWishlist } from "../context/WishlistContext";
import { toast } from "sonner";
import { useStoreSettings } from "../context/StoreSettingsContext";
import { applySeo, getSiteUrl, organizationJsonLd } from "../lib/seo";

import Testimonials from "../components/sections/Testimonials";
import TrustSection from "../components/sections/TrustSection";
import RecentlyViewedProducts from "../components/sections/RecentlyViewedProducts";
import { trackMetaEvent } from "../components/MetaPixel";

export default function ProductDetail() {
  const { products, recordProductView } = useProducts();
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();
  const { settings } = useStoreSettings();
  const [quantity, setQuantity] = useState(1);
  const [activeImage, setActiveImage] = useState(0);
  const [selectedSize, setSelectedSize] = useState("Standard");
  const [showRemoveModal, setShowRemoveModal] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [productViewCount, setProductViewCount] = useState<number | null>(null);
  const [leadModalType, setLeadModalType] = useState<"Product Inquiry" | "Notify Me" | "Price Drop Alert" | null>(null);
  const [leadName, setLeadName] = useState("");
  const [leadEmail, setLeadEmail] = useState("");
  const [leadPhone, setLeadPhone] = useState("");
  const [isSavingLead, setIsSavingLead] = useState(false);

  // Experience modal form states
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [reviewName, setReviewName] = useState("");
  const [reviewEmail, setReviewEmail] = useState("");
  const [reviewPhone, setReviewPhone] = useState("");
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState("");
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  const [testimonialsRefresh, setTestimonialsRefresh] = useState(0);

  // Accordion tabs
  const [openSection, setOpenSection] = useState<string | null>("details");

  const product = products.find(p => p.id === id);

  useEffect(() => {
    if (!id || !product) return;

    let isMounted = true;
    const viewedKey = `saiksha_product_viewed_${id}`;
    const initialViews = product.views || 0;
    setProductViewCount(initialViews);

    if (sessionStorage.getItem(viewedKey)) return;
    sessionStorage.setItem(viewedKey, "1");

    recordProductView(id).then((views) => {
      if (isMounted && views !== null) {
        setProductViewCount(views);
      }
    });

    return () => {
      isMounted = false;
    };
  }, [id, product?.id, product?.views, recordProductView]);

  useEffect(() => {
    if (!product || typeof window === "undefined") return;
    const key = "saiksha-recently-viewed";
    const current = JSON.parse(localStorage.getItem(key) || "[]") as string[];
    const next = [product.id, ...current.filter((itemId) => itemId !== product.id)].slice(0, 8);
    localStorage.setItem(key, JSON.stringify(next));
  }, [product?.id]);

  useEffect(() => {
    if (!product) return;
    const price = product.isSale && product.salePrice ? product.salePrice : product.price;
    const image = product.images[0]?.startsWith("http") ? product.images[0] : `${getSiteUrl()}${product.images[0] || ""}`;
    applySeo({
      title: `${product.name} | ${product.category} by Saiksha`,
      description: `${product.description.slice(0, 150)} Shop ${product.category.toLowerCase()} with secure checkout and WhatsApp support across India.`,
      path: `/product/${product.id}`,
      image,
      type: "product",
      structuredData: [
        organizationJsonLd(settings),
        {
          "@context": "https://schema.org",
          "@type": "Product",
          name: product.name,
          description: product.description,
          image: product.images,
          sku: `SAIKSHA-${product.id}`,
          brand: {
            "@type": "Brand",
            name: settings.storeName || "Saiksha"
          },
          category: product.category,
          aggregateRating: product.reviews > 0 ? {
            "@type": "AggregateRating",
            ratingValue: product.rating,
            reviewCount: product.reviews
          } : undefined,
          offers: {
            "@type": "Offer",
            priceCurrency: "INR",
            price,
            availability: product.stock > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
            url: `${getSiteUrl()}/product/${product.id}`
          }
        }
      ]
    });
  }, [product?.id, product?.views, settings.storeName, settings.supportEmail, settings.whatsappNumber, settings.instagramUrl]);

  useEffect(() => {
    if (!product) return;
    const price = product.isSale && product.salePrice ? product.salePrice : product.price;
    trackMetaEvent("ViewContent", {
      content_ids: [product.id],
      content_name: product.name,
      content_type: "product",
      value: price,
      currency: "INR"
    });
  }, [product?.id]);

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-brand-cream/10">
        <div className="text-center space-y-4 max-w-sm px-6">
          <h2 className="text-3xl font-serif text-brand-ink">Product Not Found</h2>
          <p className="text-neutral-500 font-light">The luxury piece you are looking for does not exist or has been archived.</p>
          <Link
            to="/collection"
            className="inline-block bg-brand-ink text-white px-8 py-3 text-[11px] uppercase tracking-widest font-bold hover:bg-neutral-800 transition-colors"
          >
            Back to Collection
          </Link>
        </div>
      </div>
    );
  }

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewName || !reviewEmail || !reviewPhone || !reviewComment) {
      toast.error("Please fill in all fields.");
      return;
    }
    setIsSubmittingReview(true);
    try {
      const response = await fetch("/api/experience", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: reviewName,
          email: reviewEmail,
          phone: reviewPhone,
          rating: reviewRating,
          comment: reviewComment,
          productName: product.name,
        }),
      });
      const data = await response.json();
      if (response.ok && data.success) {
        toast.success("Thank you! Your experience has been saved.");
        setIsReviewModalOpen(false);
        // Clear fields
        setReviewName("");
        setReviewEmail("");
        setReviewPhone("");
        setReviewRating(5);
        setReviewComment("");
        setTestimonialsRefresh((current) => current + 1);
      } else {
        toast.error("Failed to submit. Please try again.");
      }
    } catch (error) {
      console.error(error);
      toast.error("An error occurred. Please try again.");
    } finally {
      setIsSubmittingReview(false);
    }
  };

  const isLiked = isInWishlist(product.id);

  const handleWishlistClick = () => {
    if (isLiked) {
      setShowRemoveModal(true);
    } else {
      addToWishlist(product);
    }
  };

  const confirmRemove = () => {
    removeFromWishlist(product.id);
    setShowRemoveModal(false);
  };

  const handleBuyNow = () => {
    handleAddToBag();
    toast.success("Proceeding directly to premium checkout");
    navigate("/checkout");
  };

  const handleAddToBag = () => {
    addToCart(product, quantity);
    trackMetaEvent("AddToCart", {
      content_ids: [product.id],
      content_name: product.name,
      content_type: "product",
      value: (product.isSale && product.salePrice ? product.salePrice : product.price) * quantity,
      currency: "INR",
      contents: [{ id: product.id, quantity }]
    });
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopiedLink(true);
    toast.success("Product link copied to clipboard!");
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const saveProductLead = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!leadModalType) return;
    setIsSavingLead(true);
    try {
      const response = await fetch("/api/lead-captures", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          source: leadModalType,
          customer: { name: leadName, email: leadEmail, phone: leadPhone },
          product: {
            id: product.id,
            name: product.name,
            price: product.isSale && product.salePrice ? product.salePrice : product.price,
            image: product.images[0]
          },
          message: `${leadModalType} for ${product.name}`
        })
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.error || "Could not save lead");
      toast.success("Thanks. Saiksha will follow up with you.");
      setLeadModalType(null);
      setLeadName("");
      setLeadEmail("");
      setLeadPhone("");
    } catch (error: any) {
      toast.error(error.message || "Could not save your details.");
    } finally {
      setIsSavingLead(false);
    }
  };

  const productWhatsAppUrl = `https://wa.me/${settings.whatsappNumber}?text=${encodeURIComponent(`Hello ${settings.storeName}, I want to ask about ${product.name}: ${typeof window !== "undefined" ? window.location.href : ""}`)}`;

  const nextImage = () => {
    if (product.images && product.images.length > 0) {
      setActiveImage((prev) => (prev + 1) % product.images.length);
    }
  };

  const prevImage = () => {
    if (product.images && product.images.length > 0) {
      setActiveImage((prev) => (prev - 1 + product.images.length) % product.images.length);
    }
  };

  // Dynamic specifications: Check if product has custom overrides, otherwise fall back to category values
  const defaultCategorySpecs = categorySpecifications[product.category] || categorySpecifications["Earrings"];
  const currentSpecs = {
    materials: product.materials || defaultCategorySpecs.materials,
    stones: product.stones || defaultCategorySpecs.stones,
    craftingTime: product.craftingTime || defaultCategorySpecs.craftingTime,
    dimensions: product.dimensions || defaultCategorySpecs.dimensions,
    weight: product.weight || defaultCategorySpecs.weight,
    certification: product.certification || defaultCategorySpecs.certification,
    careInstructions: product.careInstructions || defaultCategorySpecs.careInstructions,
    packaging: product.packaging || defaultCategorySpecs.packaging,
    shippingRoute: product.shippingRoute || defaultCategorySpecs.shippingRoute,
    exchangePolicy: product.exchangePolicy || defaultCategorySpecs.exchangePolicy
  };

  const relatedProducts = products.filter(p => p.id !== id && p.category === product.category).slice(0, 4);
  const frequentlyBoughtTogether = products
    .filter((p) => p.id !== id && p.stock > 0 && p.category !== product.category)
    .slice(0, 2);

  return (
    <div className="pb-0 bg-white">
      {/* Breadcrumbs */}
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-8">
        <nav className="flex items-center space-x-2 text-[10px] uppercase tracking-[2px] text-neutral-400 font-bold">
          <Link to="/" className="hover:text-black transition-colors">Home</Link>
          <ChevronRight size={12} className="text-neutral-300" />
          <Link to="/collection" className="hover:text-black transition-colors">Collection</Link>
          <ChevronRight size={12} className="text-neutral-300" />
          <Link to={`/collection?category=${product.category}`} className="hover:text-black transition-colors">{product.category}</Link>
          <ChevronRight size={12} className="text-neutral-300" />
          <span className="text-neutral-900 truncate font-normal max-w-[200px]">{product.name}</span>
        </nav>
      </div>

      <div className="max-w-7xl mx-auto px-4 md:px-8 grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16">
        {/* Left Column: Image Gallery */}
        <div className="space-y-6">
          <div className="relative aspect-[4/5] bg-neutral-50 rounded-2xl overflow-hidden border border-neutral-100 group">
            {/* Badges on image for premium look */}
            <div className="absolute top-4 left-4 z-10 flex flex-col gap-2 items-start">
              {product.isNew && (
                <span className="bg-brand-rosegold text-white text-[8px] font-bold tracking-[2px] uppercase px-3 py-1.5 rounded-sm shadow-md">
                  New In
                </span>
              )}
              {product.isLimited && (
                <span className="bg-[#ad854f] text-white text-[8px] font-bold tracking-[2px] uppercase px-3 py-1.5 rounded-sm shadow-md">
                  Limited Edition
                </span>
              )}
              {product.isCustom && (
                <span className="bg-[#5a6e7f] text-white text-[8px] font-bold tracking-[2px] uppercase px-3 py-1.5 rounded-sm shadow-md">
                  {product.customText || "Custom"}
                </span>
              )}
              {product.isSale && (
                <span className="bg-brand-hotpink text-white text-[8px] font-bold tracking-[2px] uppercase px-3 py-1.5 rounded-sm shadow-md">
                  Sale
                </span>
              )}
            </div>

            {/* Main Interactive Image */}
            <motion.img
              key={activeImage}
              initial={{ opacity: 0.95 }}
              animate={{ opacity: 1 }}
              src={product.images[activeImage]}
              alt={product.name}
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover transition-transform duration-700 hover:scale-[1.04]"
            />

            {/* Left & Right navigation overlays */}
            {product.images && product.images.length > 1 && (
              <>
                <button
                  onClick={prevImage}
                  className="absolute left-4 top-1/2 -translate-y-1/2 z-10 bg-white/80 hover:bg-white text-neutral-800 p-2.5 rounded-full shadow-md transition-all opacity-0 group-hover:opacity-100"
                  aria-label="Previous view"
                >
                  <ChevronLeft size={18} />
                </button>
                <button
                  onClick={nextImage}
                  className="absolute right-4 top-1/2 -translate-y-1/2 z-10 bg-white/80 hover:bg-white text-neutral-800 p-2.5 rounded-full shadow-md transition-all opacity-0 group-hover:opacity-100"
                  aria-label="Next view"
                >
                  <ChevronRight size={18} />
                </button>
              </>
            )}

            {/* Utility overlay buttons */}
            <div className="absolute top-4 right-4 z-10 flex flex-col gap-2">
              <button
                onClick={handleShare}
                className="bg-white/90 hover:bg-white backdrop-blur-sm p-2.5 rounded-full text-neutral-600 hover:text-brand-rosegold shadow-md transition-colors"
                title="Share this product"
              >
                <Share2 size={16} />
              </button>
            </div>

            {/* Navigation Dots Overlay */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex space-x-1.5 z-10 bg-black/10 px-3 py-1.5 rounded-full backdrop-blur-[2px]">
              {product.images.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveImage(idx)}
                  className={cn(
                    "w-1.5 h-1.5 rounded-full transition-all",
                    activeImage === idx ? "bg-white w-3" : "bg-white/50"
                  )}
                />
              ))}
            </div>
          </div>

          {/* Carousel Thumbnail bar of 4 images */}
          <div className="flex gap-4 overflow-x-auto pb-2 no-scrollbar">
            {product.images.map((img, i) => (
              <button
                key={i}
                onClick={() => setActiveImage(i)}
                className={cn(
                  "relative w-24 aspect-[4/5] rounded-xl overflow-hidden border-2 transition-all shrink-0 bg-neutral-50",
                  activeImage === i ? "border-brand-rosegold ring-2 ring-brand-rosegold/15 scale-95 shadow-lg" : "border-transparent opacity-60 hover:opacity-100"
                )}
              >
                <img src={img} alt={`${product.name} view ${i + 1}`} referrerPolicy="no-referrer" className="w-full h-full object-cover" />
                <span className="absolute bottom-1 right-1 text-[8px] bg-black/60 text-white rounded px-1 scale-95">{i + 1}/4</span>
              </button>
            ))}
          </div>
        </div>

        {/* Right Column: Premium Product Info */}
        <div className="space-y-8">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-brand-rosegold uppercase tracking-[2px] font-bold text-xs">{product.category}</span>
              <div className="flex items-center space-x-2">
                <div className="flex text-yellow-400">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} size={13} className={i < Math.floor(product.rating) ? "fill-yellow-400 text-yellow-400" : "text-neutral-200"} />
                  ))}
                </div>
                <span className="text-[11px] font-bold text-neutral-400 uppercase tracking-widest">({product.reviews} Verification Reviews)</span>
              </div>
            </div>

            <h1 className="text-3xl md:text-4xl lg:text-5xl font-serif font-medium text-neutral-900 tracking-tight leading-tight">
              {product.name}
            </h1>

            <div className="flex items-baseline space-x-4 pt-1">
              {product.isSale && product.salePrice ? (
                <>
                  <span className="text-3xl font-sans font-bold text-neutral-900">
                    ₹{product.salePrice.toLocaleString()}
                  </span>
                  <span className="text-lg text-neutral-400 line-through font-serif">
                    ₹{product.price.toLocaleString()}
                  </span>
                </>
              ) : (
                <span className="text-3xl font-sans font-bold text-neutral-900">
                  ₹{product.price.toLocaleString()}
                </span>
              )}
              <span className="text-xs text-neutral-400 font-light tracking-wide">Inclusive of all local luxury taxes</span>
            </div>
          </div>

          <div className="h-px bg-neutral-100" />

          {/* Luxury Description */}
          <div className="space-y-4">
            <p className="text-neutral-600 leading-relaxed font-sans text-sm md:text-base">
              {product.description}
            </p>

            {(productViewCount || 0) > 0 && (
              <div className="inline-flex items-center space-x-2 bg-[#faf9f6] border border-[#bda88e]/25 text-neutral-650 px-3 py-2 rounded-lg text-xs font-medium">
                <Eye size={14} className="text-[#a2855b]" />
                <span>
                  {productViewCount?.toLocaleString()} {productViewCount === 1 ? "person has" : "people have"} viewed this piece
                </span>
              </div>
            )}

            {/* Dynamic Stock Indicator */}
            {product.stock === 0 ? (
              <div className="inline-flex items-center space-x-2 bg-red-50 text-red-700 px-4 py-2.5 rounded-lg text-xs font-medium border border-red-100">
                <span className="relative flex h-2 w-2">
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                </span>
                <span>This exclusive artisan piece is currently sold out.</span>
              </div>
            ) : product.stock <= 8 ? (
              <div className="inline-flex items-center space-x-2 bg-amber-50/70 border border-amber-100/50 text-amber-800 px-4 py-2.5 rounded-lg text-xs font-medium">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
                </span>
                <span>Only {product.stock} pieces remaining in this exclusive artisan edition batch.</span>
              </div>
            ) : (
              <div className="inline-flex items-center space-x-2 bg-green-50/50 text-green-700 px-3 py-1.5 rounded-lg text-xs font-medium">
                <CheckCircle2 size={14} className="text-green-600" />
                <span>Individually boxed and ready for prompt secure shipping</span>
              </div>
            )}
          </div>

          <div className="space-y-6 pt-2">
            {/* Quantity Selector */}
            <div className="space-y-3">
              <label className="text-[10px] uppercase tracking-[2px] font-bold text-neutral-400">Order Quantity</label>
              <div className="flex items-center space-x-8">
                <div className="flex items-center border border-neutral-200 rounded px-1 py-1 bg-neutral-50 shadow-inner">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="p-2 text-neutral-400 hover:text-brand-ink transition-colors"
                  >
                    <Minus size={14} />
                  </button>
                  <span className="w-12 text-center font-bold text-brand-ink text-sm">{quantity}</span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="p-2 text-neutral-400 hover:text-brand-ink transition-colors"
                  >
                    <Plus size={14} />
                  </button>
                </div>

                <div className="flex flex-col">
                  <span className="text-[9px] uppercase tracking-[1px] text-neutral-400 font-bold mb-0.5">Total Price</span>
                  <div className="text-2xl font-sans font-bold text-neutral-900">
                    ₹{((product.isSale && product.salePrice ? product.salePrice : product.price) * quantity).toLocaleString()}
                  </div>
                  <span className="text-[11px] text-[#ad854f] font-light mt-0.5 flex items-center gap-1">
                    <ShieldCheck size={11} className="inline" />
                    Free complementary insurance on all sizes.
                  </span>
                </div>
              </div>
            </div>

            {/* Dual Transactional Buttons: Add to Bag & Buy Now */}
            <div className="space-y-4 pt-2">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* 1. Add to Bag */}
                <button
                  onClick={handleAddToBag}
                  disabled={product.stock === 0}
                  className={cn(
                    "w-full py-4 px-6 text-[11px] uppercase tracking-[2px] font-bold transition-all flex items-center justify-center space-x-2.5 rounded-sm shadow-sm",
                    product.stock === 0
                      ? "bg-neutral-100 border-neutral-200 text-neutral-400 cursor-not-allowed"
                      : "bg-white border-brand-ink text-brand-ink hover:bg-neutral-50"
                  )}
                >
                  <ShoppingBag size={16} />
                  <span>{product.stock === 0 ? "Sold Out" : "Add to Bag"}</span>
                </button>

                {/* 2. Buy Now (Instant Checkout Redirect) */}
                <button
                  onClick={handleBuyNow}
                  disabled={product.stock === 0}
                  className={cn(
                    "w-full py-4 px-6 text-[11px] uppercase tracking-[2px] font-bold transition-all flex items-center justify-center space-x-2.5 rounded-sm shadow-md",
                    product.stock === 0
                      ? "bg-neutral-100 text-neutral-400 cursor-not-allowed"
                      : "bg-brand-ink text-white hover:bg-neutral-800"
                  )}
                >
                  <Award size={16} className={product.stock === 0 ? "text-neutral-400" : "text-brand-rosegold"} />
                  <span>{product.stock === 0 ? "Out of Stock" : "Buy Now"}</span>
                </button>
              </div>

              <div className="flex items-center gap-4 justify-between pt-1">
                {/* Wishlist toggle */}
                <button
                  onClick={handleWishlistClick}
                  className={cn(
                    "flex-1 py-3 px-5 border rounded-sm flex items-center justify-center space-x-2 text-xs uppercase tracking-widest font-bold transition-all",
                    isLiked
                      ? "bg-red-500 border-red-500 text-white shadow-md"
                      : "bg-white border-neutral-200 text-neutral-700 hover:border-brand-rosegold"
                  )}
                >
                  <Heart size={15} className={cn(isLiked && "fill-current scale-110")} />
                  <span>{isLiked ? "In Your Favorites" : "Add to Favorites Library"}</span>
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <a
                  href={productWhatsAppUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => setLeadModalType("Product Inquiry")}
                  className="flex items-center justify-center gap-2 rounded-sm border border-green-100 bg-green-50 px-3 py-3 text-[9px] uppercase tracking-widest font-bold text-green-700 hover:bg-green-100"
                >
                  <MessageCircle size={14} />
                  Ask on WhatsApp
                </a>
                {product.stock === 0 && (
                  <button
                    onClick={() => setLeadModalType("Notify Me")}
                    className="flex items-center justify-center gap-2 rounded-sm border border-neutral-200 bg-white px-3 py-3 text-[9px] uppercase tracking-widest font-bold text-neutral-700 hover:border-brand-rosegold"
                  >
                    <Bell size={14} />
                    Notify Me
                  </button>
                )}
                <button
                  onClick={() => setLeadModalType("Price Drop Alert")}
                  className="flex items-center justify-center gap-2 rounded-sm border border-brand-rosegold/20 bg-brand-cream/30 px-3 py-3 text-[9px] uppercase tracking-widest font-bold text-[#7a603c] hover:border-brand-rosegold"
                >
                  <BadgePercent size={14} />
                  Price Alert
                </button>
              </div>
            </div>
          </div>

          {/* Removal Confirmation Modal */}
          <AnimatePresence>
            {showRemoveModal && (
              <div className="fixed inset-0 z-[100] flex items-center justify-center px-6">
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onClick={() => setShowRemoveModal(false)}
                  className="absolute inset-0 bg-brand-ink/40 backdrop-blur-sm"
                />
                <motion.div
                  initial={{ opacity: 0, scale: 0.9, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9, y: 20 }}
                  className="relative w-full max-w-sm bg-white rounded-2xl p-8 shadow-2xl border border-black/5 text-center space-y-6"
                >
                  <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto">
                    <Trash2 size={24} />
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-xl font-serif text-brand-ink">Remove Favorite?</h3>
                    <p className="text-sm text-neutral-400 font-light">Are you sure you want to remove this piece from your wishlist?</p>
                  </div>
                  <div className="flex flex-col gap-3">
                    <button
                      onClick={confirmRemove}
                      className="w-full bg-red-500 text-white py-4 text-[10px] uppercase tracking-[2px] font-bold hover:bg-red-600 transition-all"
                    >
                      Yes, Remove
                    </button>
                    <button
                      onClick={() => setShowRemoveModal(false)}
                      className="w-full bg-white text-neutral-400 py-4 text-[10px] uppercase tracking-[2px] font-bold border border-black/5"
                    >
                      Keep It
                    </button>
                  </div>
                </motion.div>
              </div>
            )}
          </AnimatePresence>

          <AnimatePresence>
            {leadModalType && (
              <div className="fixed inset-0 z-[110] flex items-center justify-center px-6">
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onClick={() => setLeadModalType(null)}
                  className="absolute inset-0 bg-brand-ink/40 backdrop-blur-sm"
                />
                <motion.form
                  onSubmit={saveProductLead}
                  initial={{ opacity: 0, scale: 0.92, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.92, y: 20 }}
                  className="relative w-full max-w-sm bg-white rounded-2xl p-6 shadow-2xl border border-black/5 space-y-5"
                >
                  <div className="space-y-1">
                    <h3 className="text-xl font-serif text-brand-ink">{leadModalType}</h3>
                    <p className="text-xs text-neutral-500 leading-relaxed">
                      Share your details for {product.name}. Saiksha will help you personally.
                    </p>
                  </div>
                  <div className="space-y-3">
                    <input value={leadName} onChange={(e) => setLeadName(e.target.value)} placeholder="Full name" className="w-full rounded-lg border border-neutral-200 px-4 py-3 text-xs outline-none focus:border-brand-rosegold" />
                    <input type="email" value={leadEmail} onChange={(e) => setLeadEmail(e.target.value)} placeholder="Email address" className="w-full rounded-lg border border-neutral-200 px-4 py-3 text-xs outline-none focus:border-brand-rosegold" />
                    <input type="tel" value={leadPhone} onChange={(e) => setLeadPhone(e.target.value.replace(/\D/g, "").slice(0, 10))} placeholder="Mobile number" className="w-full rounded-lg border border-neutral-200 px-4 py-3 text-xs outline-none focus:border-brand-rosegold" />
                  </div>
                  <div className="flex gap-3">
                    <button type="button" onClick={() => setLeadModalType(null)} className="flex-1 rounded-lg border border-neutral-200 py-3 text-[10px] uppercase tracking-widest font-bold text-neutral-500">Cancel</button>
                    <button type="submit" disabled={isSavingLead} className="flex-1 rounded-lg bg-brand-ink py-3 text-[10px] uppercase tracking-widest font-bold text-white disabled:opacity-60">
                      {isSavingLead ? "Saving..." : "Submit"}
                    </button>
                  </div>
                </motion.form>
              </div>
            )}
          </AnimatePresence>

          {/* Deep Dive Luxury Tabs Accordion */}
          <div className="border-t border-neutral-100 pt-6 space-y-4">
            {/* Tab 1: Artisan Heritage & Specs */}
            <div className="border-b border-neutral-100 pb-4">
              <button
                onClick={() => setOpenSection(openSection === "details" ? null : "details")}
                className="w-full flex items-center justify-between text-left"
              >
                <div className="flex items-center space-x-3">
                  <Gem size={15} className="text-brand-rosegold" />
                  <span className="text-xs uppercase tracking-[2.5px] font-bold text-neutral-900 font-sans">Details & Materials</span>
                </div>
                {openSection === "details" ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              </button>

              <AnimatePresence initial={false}>
                {openSection === "details" && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                  >
                    <div className="pt-4 pl-8 space-y-3 text-xs leading-relaxed text-neutral-500 font-light font-sans">
                      <p><strong className="text-neutral-800 font-medium">Composition:</strong> {currentSpecs.materials}</p>
                      <p><strong className="text-neutral-800 font-medium">Stones & Luster:</strong> {currentSpecs.stones}</p>
                      <p><strong className="text-neutral-800 font-medium font-sans">Meticulous Handcrafting:</strong> {currentSpecs.craftingTime}</p>
                      <p><strong className="text-neutral-800 font-medium">Profile Dimensions:</strong> {currentSpecs.dimensions}</p>
                      <p><strong className="text-neutral-800 font-medium font-sans">Comfort Weight Aspect:</strong> {currentSpecs.weight}</p>
                      <p><strong className="text-neutral-800 font-medium">Certification:</strong> {currentSpecs.certification}</p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Tab 2: Preservation & Care */}
            <div className="border-b border-neutral-100 pb-4">
              <button
                onClick={() => setOpenSection(openSection === "care" ? null : "care")}
                className="w-full flex items-center justify-between text-left"
              >
                <div className="flex items-center space-x-3">
                  <Award size={15} className="text-brand-rosegold" />
                  <span className="text-xs uppercase tracking-[2.5px] font-bold text-neutral-900 font-sans">Preservation & Care</span>
                </div>
                {openSection === "care" ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              </button>

              <AnimatePresence initial={false}>
                {openSection === "care" && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                  >
                    <div className="pt-4 pl-8 space-y-2 text-xs leading-relaxed text-neutral-500 font-light font-sans">
                      <p>To sustain the brilliant gold luster and precious elements, follow these standard guidelines:</p>
                      <ul className="list-disc pl-4 space-y-1 pt-1">
                        {currentSpecs.careInstructions?.map((ins, i) => (
                          <li key={i}>{ins}</li>
                        ))}
                      </ul>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Tab 3: Insured Delivery & Present Luxury */}
            <div className="border-b border-neutral-100 pb-4">
              <button
                onClick={() => setOpenSection(openSection === "shipping" ? null : "shipping")}
                className="w-full flex items-center justify-between text-left"
              >
                <div className="flex items-center space-x-3">
                  <Gift size={15} className="text-brand-rosegold" />
                  <span className="text-xs uppercase tracking-[2.5px] font-bold text-neutral-900 font-sans">Heirloom Boxing & Delivery</span>
                </div>
                {openSection === "shipping" ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              </button>

              <AnimatePresence initial={false}>
                {openSection === "shipping" && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                  >
                    <div className="pt-4 pl-8 space-y-2 text-xs leading-relaxed text-neutral-500 font-light font-sans">
                      <p><strong className="text-neutral-800 font-medium">Signature Presentation Packaging:</strong> {currentSpecs.packaging}</p>
                      <p><strong className="text-neutral-800 font-medium">Express Courier Route:</strong> {currentSpecs.shippingRoute}</p>
                      <p><strong className="text-neutral-800 font-medium">Hassle-Free Exchange:</strong> {currentSpecs.exchangePolicy}</p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Quick trust metrics */}
          <div className="grid grid-cols-3 gap-2 pt-4">
            <div className="p-3 bg-[#faf9f6]/80 rounded-lg flex flex-col items-center text-center space-y-2 border border-neutral-100">
              <Truck size={16} strokeWidth={1.5} className="text-[#a2855b]" />
              <span className="text-[7.5px] uppercase font-bold tracking-[1.5px] leading-tight text-neutral-600">Free Express Delivery</span>
            </div>
            <div className="p-3 bg-[#faf9f6]/80 rounded-lg flex flex-col items-center text-center space-y-2 border border-neutral-100">
              <ShieldCheck size={16} strokeWidth={1.5} className="text-[#a2855b]" />
              <span className="text-[7.5px] uppercase font-bold tracking-[1.5px] leading-tight text-neutral-600">Secure Payments</span>
            </div>
            <div className="p-3 bg-[#faf9f6]/80 rounded-lg flex flex-col items-center text-center space-y-2 border border-neutral-100">
              <RefreshCw size={16} strokeWidth={1.5} className="text-[#a2855b]" />
              <span className="text-[7.5px] uppercase font-bold tracking-[1.5px] leading-tight text-neutral-600">Simple Exchange</span>
            </div>
          </div>
        </div>
      </div>

      {/* Customer Journals List Section */}
      <section className="mt-32">
        <Testimonials productName={product.name} reloadKey={testimonialsRefresh} className="py-0" />
        <div className="max-w-7xl mx-auto px-4 md:px-8 mt-16">
          <div className="bg-[#bda88e]/10 border border-[#bda88e]/20 p-10 lg:p-14 text-center space-y-6 rounded-2xl">
            <h3 className="text-2xl md:text-3xl font-serif">Have you experienced Saiksha?</h3>
            <p className="text-neutral-500 font-sans max-w-sm mx-auto text-xs leading-relaxed">
              Join over 2,000 discerning collectors who found their exquisite self-expression and treasured wedding designs in our jewelry.
            </p>
            <button
              onClick={() => setIsReviewModalOpen(true)}
              className="bg-brand-ink text-white px-10 py-4 text-[10px] uppercase tracking-[2px] font-bold hover:bg-neutral-800 transition-all rounded-sm shadow-md cursor-pointer"
            >
              Share Your Experience
            </button>
          </div>
        </div>
      </section>

      {/* Suggested Complete the Set Products Section */}
      <section className="max-w-7xl mx-auto px-4 md:px-8 mt-28 mb-24">
        <div className="flex items-end justify-between mb-12">
          <div className="space-y-1">
            <h2 className="text-2xl font-serif">Complete <span className="text-brand-gradient font-serif tracking-normal italic">The Set</span></h2>
            <div className="h-0.5 w-12 bg-brand-rosegold" />
          </div>
          <Link to="/collection" className="text-[10px] uppercase tracking-[2px] font-bold text-neutral-400 hover:text-brand-ink transition-colors border-b border-transparent hover:border-brand-ink pb-1">View All</Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {relatedProducts.length > 0 ? (
            relatedProducts.map(p => (
              <ProductCard key={p.id} product={p} />
            ))
          ) : (
            products.slice(0, 4).map(p => (
              <ProductCard key={p.id} product={p} />
            ))
          )}
        </div>
      </section>

      {frequentlyBoughtTogether.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 md:px-8 mt-28">
          <div className="rounded-2xl border border-brand-rosegold/20 bg-brand-cream/25 p-6 md:p-8">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
              <div>
                <p className="text-[10px] uppercase tracking-[3px] text-brand-rosegold font-bold">Frequently Bought Together</p>
                <h2 className="mt-2 text-2xl font-serif text-brand-ink">Complete the look in one tap</h2>
              </div>
              <button
                type="button"
                onClick={() => {
                  const bundle = [product, ...frequentlyBoughtTogether];
                  bundle.forEach((item) => addToCart(item));
                  trackMetaEvent("AddToCart", {
                    content_ids: bundle.map((item) => item.id),
                    content_type: "product",
                    value: bundle.reduce((sum, item) => sum + (item.isSale && item.salePrice ? item.salePrice : item.price), 0),
                    currency: "INR",
                    contents: bundle.map((item) => ({ id: item.id, quantity: 1 }))
                  });
                }}
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-brand-ink px-5 py-3 text-[10px] uppercase tracking-widest font-bold text-white hover:bg-neutral-800"
              >
                <ShoppingBag size={14} />
                Add Full Set
              </button>
            </div>
            <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-5">
              {[product, ...frequentlyBoughtTogether].map((item) => (
                <div key={item.id} className="flex items-center gap-4 rounded-xl bg-white p-4 border border-black/5">
                  <img src={item.images[0]} alt={item.name} referrerPolicy="no-referrer" className="h-20 w-16 rounded object-cover bg-brand-cream" />
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-brand-ink line-clamp-2">{item.name}</p>
                    <p className="mt-1 text-[10px] uppercase tracking-widest text-neutral-400">{item.category}</p>
                    <p className="mt-1 text-xs font-serif text-brand-ink">Rs {(item.isSale && item.salePrice ? item.salePrice : item.price).toLocaleString()}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      <TrustSection />
      <RecentlyViewedProducts />

      {/* Experience Feedback Modal */}
      <AnimatePresence>
        {isReviewModalOpen && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsReviewModalOpen(false)}
              className="absolute inset-0 bg-neutral-900/60 backdrop-blur-xs"
            />

            {/* Modal Box */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-md bg-white rounded-2xl p-6 md:p-8 shadow-2xl border border-neutral-100 z-10 overflow-hidden"
            >
              {/* Gold Accent Top Bar */}
              <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-brand-rosegold via-[#ad854f] to-brand-rosegold" />

              <h3 className="text-xl font-serif text-neutral-900 mb-1">Share Your Saiksha Experience</h3>
              <p className="text-xs text-neutral-500 font-light font-sans mb-5">
                Tell us about your custom heirloom piece. Your details will be received as an official email review.
              </p>

              <form onSubmit={handleReviewSubmit} className="space-y-4 font-sans text-neutral-800">
                {/* Product Info */}
                <div className="bg-neutral-50 p-3 rounded border border-neutral-100 flex items-center gap-3">
                  <img src={product.images[0]} alt={product.name} referrerPolicy="no-referrer" className="w-10 h-12 object-cover rounded-sm" />
                  <div>
                    <span className="text-[9px] uppercase tracking-[1px] text-[#ad854f] font-bold block">Reviewing Piece</span>
                    <span className="text-xs font-medium text-neutral-900 line-clamp-1">{product.name}</span>
                  </div>
                </div>

                {/* Rating */}
                <div className="space-y-1.5">
                  <span className="text-[9px] uppercase tracking-[1.5px] font-bold text-neutral-400 block">Your Rating</span>
                  <div className="flex items-center gap-1.5">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        type="button"
                        key={star}
                        onClick={() => setReviewRating(star)}
                        className="text-xl transition-transform hover:scale-110 cursor-pointer bg-transparent border-none p-0"
                      >
                        <Star
                          size={20}
                          className={cn(
                            "transition-colors",
                            star <= reviewRating
                              ? "fill-brand-rosegold text-brand-rosegold"
                              : "text-neutral-200"
                          )}
                        />
                      </button>
                    ))}
                  </div>
                </div>

                {/* Name */}
                <div className="space-y-1">
                  <label htmlFor="rev-name" className="text-[9px] uppercase tracking-[1.5px] font-bold text-neutral-400 block">Name</label>
                  <input
                    id="rev-name"
                    type="text"
                    required
                    value={reviewName}
                    onChange={(e) => setReviewName(e.target.value)}
                    placeholder="e.g. Swati Paul"
                    className="w-full text-xs px-3.5 py-2.5 rounded border border-neutral-200 bg-neutral-50/50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#ad854f] transition-all font-sans"
                  />
                </div>

                {/* Email */}
                <div className="space-y-1">
                  <label htmlFor="rev-email" className="text-[9px] uppercase tracking-[1.5px] font-bold text-neutral-400 block">Email Address</label>
                  <input
                    id="rev-email"
                    type="email"
                    required
                    value={reviewEmail}
                    onChange={(e) => setReviewEmail(e.target.value)}
                    placeholder="e.g. swatipaul285@gmail.com"
                    className="w-full text-xs px-3.5 py-2.5 rounded border border-neutral-200 bg-neutral-50/50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#ad854f] transition-all font-sans"
                  />
                </div>

                {/* Phone Number */}
                <div className="space-y-1">
                  <label htmlFor="rev-phone" className="text-[9px] uppercase tracking-[1.5px] font-bold text-neutral-400 block">Phone Number</label>
                  <input
                    id="rev-phone"
                    type="tel"
                    required
                    value={reviewPhone}
                    onChange={(e) => setReviewPhone(e.target.value)}
                    placeholder="e.g. +91 98765 43210"
                    className="w-full text-xs px-3.5 py-2.5 rounded border border-neutral-200 bg-neutral-50/50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#ad854f] transition-all font-sans"
                  />
                </div>

                {/* Experience details */}
                <div className="space-y-1">
                  <label htmlFor="rev-comment" className="text-[9px] uppercase tracking-[1.5px] font-bold text-neutral-400 block">Your Experience Details</label>
                  <textarea
                    id="rev-comment"
                    required
                    rows={3}
                    value={reviewComment}
                    onChange={(e) => setReviewComment(e.target.value)}
                    placeholder="Describe how the piece fits, its craftsmanship luster, and packaging details..."
                    className="w-full text-xs px-3.5 py-2.5 rounded border border-neutral-200 bg-neutral-50/50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#ad854f] resize-none font-sans leading-relaxed transition-all"
                  />
                </div>

                {/* Actions */}
                <div className="flex items-center justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsReviewModalOpen(false)}
                    className="px-4 py-2 rounded border border-neutral-200 text-neutral-500 font-bold text-[10px] uppercase tracking-[1px] hover:bg-neutral-50 transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmittingReview}
                    className="bg-brand-ink text-white px-5 py-2 rounded font-bold text-[10px] uppercase tracking-[1.5px] hover:bg-neutral-800 disabled:bg-neutral-300 transition-colors shadow-sm flex items-center justify-center gap-2 min-w-[120px] cursor-pointer"
                  >
                    {isSubmittingReview ? (
                      <span className="inline-block animate-pulse">Sending...</span>
                    ) : (
                      "Submit Review"
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
