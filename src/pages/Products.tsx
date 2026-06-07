import React, { useState, useMemo } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { Filter, ChevronDown, Search, X, SlidersHorizontal, Sparkles, Star, Quote } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { useProducts } from "../context/ProductContext";
import ProductCard from "../components/ui/ProductCard";
import { cn } from "../lib/utils";

import TrustSection from "../components/sections/TrustSection";

export default function Products() {
  const { products } = useProducts();
  const [searchParams, setSearchParams] = useSearchParams();
  const [sortBy, setSortBy] = useState("featured");
  const [activeGuide, setActiveGuide] = useState<number | null>(null);

  const activeCategory = searchParams.get("category") || "ALL PRODUCTS";
  const searchQuery = searchParams.get("search")?.trim() || "";

  const categories = [
    "ALL PRODUCTS",
    "NEW ARRIVALS",
    "TRENDING",
    "HANDCRAFTED",
    "LIMITED EDITION",
    "UNDER ₹5,000",
    "GIFTING"
  ];

  const categoryContent = {
    "ALL PRODUCTS": {
      title: "The Full Collection",
      subtitle: "Discover every piece of our artisanal jewelry, crafted for modern luxury.",
      image: "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&q=80&w=2000"
    },
    "NEW ARRIVALS": {
      title: "New Arrivals",
      subtitle: "Freshly crafted designs radiating contemporary luxury and brilliance.",
      image: "https://images.unsplash.com/photo-1617038260897-41a1f14a8ca0?auto=format&fit=crop&q=80&w=2000"
    },
    "TRENDING": {
      title: "Trending Masterpieces",
      subtitle: "Our most coveted, highest-rated pieces of the season, loved by our community.",
      image: "https://images.unsplash.com/photo-1611591437281-460bfbe1220a?auto=format&fit=crop&q=80&w=2000"
    },
    "HANDCRAFTED": {
      title: "Handcrafted Heritage",
      subtitle: "Heirloom jewelry sculpted slowly with care, utilizing high-polish solid plating.",
      image: "https://images.unsplash.com/photo-1588444837495-c6cfaf5e3230?auto=format&fit=crop&q=80&w=2000"
    },
    "LIMITED EDITION": {
      title: "Limited Editions",
      subtitle: "Extremely rare capsule designs, produced in highly restricted numbers.",
      image: "https://images.unsplash.com/photo-1599643477877-530eb83abc8e?auto=format&fit=crop&q=80&w=2000"
    },
    "UNDER ₹5,000": {
      title: "Under ₹5,000 Collection",
      subtitle: "Elegant luxury under ₹5,000 — affordable sophistication without compromise.",
      image: "https://images.unsplash.com/photo-1535632787350-4e68ef0ac584?auto=format&fit=crop&q=80&w=2000"
    },
    "GIFTING": {
      title: "Curated Presents",
      subtitle: "Charming presentations, signature wrapping, and heirloom-quality surprises.",
      image: "https://images.unsplash.com/photo-1549417229-aa67d3263c09?auto=format&fit=crop&q=80&w=2000"
    },
    "Earrings": {
      title: "Signature Earrings",
      subtitle: "From minimal studs to dramatic drops, find the perfect frame for your face.",
      image: "https://images.unsplash.com/photo-1535632787350-4e68ef0ac584?auto=format&fit=crop&q=80&w=2000"
    },
    "Necklaces": {
      title: "Elegant Necklaces",
      subtitle: "Timeless chains and statement pendants designed to sit perfectly.",
      image: "https://images.unsplash.com/photo-1599643477877-530eb83abc8e?auto=format&fit=crop&q=80&w=2000"
    },
    "Bestsellers": {
      title: "The Bestsellers",
      subtitle: "Our most coveted, highest-rated pieces of the season, loved by our community.",
      image: "https://images.unsplash.com/photo-1611591437281-460bfbe1220a?auto=format&fit=crop&q=80&w=2000"
    },
    "Gifts": {
      title: "Curated Gifts",
      subtitle: "Charming presentations, signature wrapping, and heirloom-quality surprises.",
      image: "https://plus.unsplash.com/premium_photo-1661758284381-37eca4009fde?fm=jpg&q=60&w=3000&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MXx8b3BlbmluZyUyMGdpZnR8ZW58MHx8MHx8fDA%3D"
    }
  };

  const formatTitle = (title: string) => {
    const parts = title.split(" ");
    if (parts.length <= 1) return title;
    const lastWord = parts.pop();
    return (
      <>
        {parts.join(" ")}{" "}
        <span className="text-brand-gradient font-serif tracking-normal italic">{lastWord}</span>
      </>
    );
  };

  const currentContent = categoryContent[activeCategory as keyof typeof categoryContent] || categoryContent["ALL PRODUCTS"];
  const heroTitle = searchQuery ? `Search: ${searchQuery}` : currentContent.title;
  const heroSubtitle = searchQuery
    ? "Browse matching Saiksha pieces by product name, category, materials, stones, and description."
    : currentContent.subtitle;

  const filteredProducts = useMemo(() => {
    let result = [...products];

    if (activeCategory === "NEW ARRIVALS") {
      result = result.filter(p => p.isNew || p.category === "New Arrivals");
    } else if (activeCategory === "TRENDING") {
      result = result.filter(p => p.rating >= 4.8 || p.category === "Bestsellers");
    } else if (activeCategory === "HANDCRAFTED") {
      result = result.filter(p =>
        p.description.toLowerCase().includes("handcraft") ||
        p.description.toLowerCase().includes("artisan") ||
        p.description.toLowerCase().includes("intricate") ||
        p.description.toLowerCase().includes("delicate") ||
        p.description.toLowerCase().includes("custom")
      );
    } else if (activeCategory === "LIMITED EDITION") {
      result = result.filter(p => p.isLimited === true);
    } else if (activeCategory === "UNDER ₹5,000") {
      result = result.filter(p => p.price < 5000);
    } else if (activeCategory === "GIFTING") {
      result = result.filter(p => p.category === "Gifts" || p.name.toLowerCase().includes("gift") || p.name.toLowerCase().includes("set") || p.name.toLowerCase().includes("chest") || p.name.toLowerCase().includes("bundle") || p.name.toLowerCase().includes("box"));
    } else if (activeCategory === "Earrings") {
      result = result.filter(p => p.category === "Earrings");
    } else if (activeCategory === "Necklaces") {
      result = result.filter(p => p.category === "Necklaces");
    } else if (activeCategory === "Bestsellers" || activeCategory === "Best Sellers") {
      result = result.filter(p => p.category === "Bestsellers");
    } else if (activeCategory === "Gifts") {
      result = result.filter(p => p.category === "Gifts");
    }

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter((p) => {
        const searchableText = [
          p.name,
          p.category,
          p.description,
          p.materials,
          p.stones,
          p.customText,
          p.certification,
          p.packaging,
          ...(p.careInstructions || []),
        ].filter(Boolean).join(" ").toLowerCase();

        return searchableText.includes(query);
      });
    }

    if (sortBy === "price-low") {
      result.sort((a, b) => a.price - b.price);
    } else if (sortBy === "price-high") {
      result.sort((a, b) => b.price - a.price);
    } else if (sortBy === "rating") {
      result.sort((a, b) => b.rating - a.rating);
    }

    return result;
  }, [activeCategory, products, searchQuery, sortBy]);

  const toggleCategory = (cat: string) => {
    if (cat === "ALL PRODUCTS") {
      searchParams.delete("category");
    } else {
      searchParams.set("category", cat);
    }
    searchParams.delete("search");
    setSearchParams(searchParams);
  };

  return (
    <div className="min-h-screen bg-white pb-20">
      {/* Category Hero */}
      <section className="relative h-[450px] overflow-hidden">
        <motion.div
          key={activeCategory}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1 }}
          className="absolute inset-0"
        >
          <img
            src={currentContent.image}
            alt={activeCategory}
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover brightness-[0.85]"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/15 to-white" />
        </motion.div>

        <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-6 space-y-4">
          <motion.span
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="text-[10px] uppercase tracking-[4px] text-white font-bold"
          >
            Curated Series
          </motion.span>
          <motion.h1
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="text-5xl md:text-7xl font-serif text-white drop-shadow-md"
          >
            {formatTitle(heroTitle)}
          </motion.h1>
          <motion.p
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="max-w-lg text-white/90 text-sm font-light tracking-wide leading-relaxed"
          >
            {heroSubtitle}
          </motion.p>
        </div>
      </section>

      {/* Main Grid Section */}
      <div className="max-w-7xl mx-auto px-6 md:px-10 -mt-16 relative z-10">
        <div className="bg-white rounded-sm shadow-xl shadow-black/5 p-6 md:p-10">
          {/* Controls Bar */}
          <div className="flex flex-col gap-6 pb-8 border-b border-black/5 mb-10">
            {searchQuery && (
              <div className="w-full flex items-center justify-between gap-4 bg-brand-cream/40 border border-black/5 px-4 py-3 rounded-sm">
                <div className="flex items-center gap-2 text-sm text-neutral-600">
                  <Search size={15} className="text-brand-rosegold" />
                  <span>
                    Showing results for <strong className="text-brand-ink">"{searchQuery}"</strong>
                  </span>
                </div>
                <button
                  onClick={() => {
                    searchParams.delete("search");
                    setSearchParams(searchParams);
                  }}
                  className="p-1 text-neutral-400 hover:text-brand-ink"
                  aria-label="Clear search"
                >
                  <X size={16} />
                </button>
              </div>
            )}
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="flex items-center space-x-6 overflow-x-auto w-full no-scrollbar">
                {categories.map(cat => (
                  <button
                    key={cat}
                    onClick={() => toggleCategory(cat)}
                    className={cn(
                      "whitespace-nowrap text-[10px] md:text-[11px] uppercase tracking-[1.5px] font-bold transition-all border-b-2 pb-1",
                      activeCategory === cat
                        ? "text-brand-ink border-brand-rosegold"
                        : "text-neutral-400 border-transparent hover:text-brand-ink"
                    )}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              <div className="flex items-center space-x-4 shrink-0">
                <span className="text-[10px] uppercase tracking-widest text-neutral-400 font-bold">Sort By</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="bg-transparent text-[10px] uppercase tracking-[1.5px] font-bold border-none outline-none cursor-pointer text-brand-ink"
                >
                  <option value="featured">Featured</option>
                  <option value="price-low">Low To High</option>
                  <option value="price-high">High To Low</option>
                  <option value="rating">Best Rated</option>
                </select>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-12">
            {filteredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>

          {filteredProducts.length === 0 && (
            <div className="py-20 text-center space-y-4">
              <Sparkles className="mx-auto text-neutral-200" size={48} />
              <p className="text-neutral-500 font-serif text-xl">No pieces found in this category yet.</p>
              <button
                onClick={() => {
                  searchParams.delete("category");
                  searchParams.delete("search");
                  setSearchParams(searchParams);
                }}
                className="text-xs uppercase tracking-widest font-bold border-b border-black pb-1"
              >
                Clear Filters
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Style Guide Section - Engagement */}
      <section className="max-w-7xl mx-auto px-6 md:px-10 py-32 grid md:grid-cols-2 gap-16 items-center">
        <div className="space-y-8">
          <div className="space-y-3">
            <span className="text-[10px] uppercase tracking-[3px] text-brand-rosegold font-bold">Style Inspiration</span>
            <h2 className="text-4xl md:text-5xl font-serif">Curate Your <span className="text-brand-gradient font-serif tracking-normal italic">Personal Look</span></h2>
          </div>
          <p className="text-neutral-500 font-light leading-relaxed">
            Jewelry is more than an accessory—it's a narrative. Learn how to mix and match our 18k gold-plated pieces
            to create a signature aesthetic that transitions seamlessly from daylight to evening gala.
          </p>
          <div className="space-y-4">
            {[
              {
                title: "Layering Essentials for Necklaces",
                content: "Start with a delicate 14-inch choker as your base. Layer on a classic 16-inch pendant necklace like our signature marine pearls, and finish with a heavier 18-inch cable chain to anchor the framing. Keeping chains separated by at least 2 inches prevents tangling, while creating a mesmerizing collarbone contour."
              },
              {
                title: "How to Stack Your Earring Sets",
                content: "When styling multiple piercings, follow the 'heaviest to lightest' rule. Place your most prominent statement hoops or gold drop earrings in the first lobe piercing. As you move up the cartilage, transition into smaller studs and delicate ear cuffs. This draws the gaze upward with a refined, balanced silhouette."
              },
              {
                title: "The Art of Minimalist Statement",
                content: "Less is often the highest expression of elegance. Choose one focal piece—such as a bold solid silver band or a high-brilliance solitaire necklace. Keep other accent jewelry extremely dainty or wear none at all. Let the main piece breathe with clean, solid-colored tailoring like linen blouses or sharp backless silk gowns."
              }
            ].map((guide, i) => {
              const isOpen = activeGuide === i;
              return (
                <div key={i} className="border-b border-black/5">
                  <button
                    onClick={() => setActiveGuide(isOpen ? null : i)}
                    className="w-full text-left group flex items-center justify-between py-4 hover:bg-brand-cream/10 transition-colors px-2 cursor-pointer border-none bg-transparent"
                  >
                    <span className="text-sm font-medium text-neutral-900 group-hover:text-brand-ink transition-colors">{guide.title}</span>
                    <ChevronDown className={cn("text-neutral-400 transition-transform duration-300", isOpen ? "rotate-0 text-brand-rosegold" : "-rotate-90")} size={18} />
                  </button>
                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.25 }}
                        className="overflow-hidden"
                      >
                        <p className="pb-4 pt-1 px-2 text-xs leading-relaxed text-neutral-500 font-light font-sans">
                          {guide.content}
                        </p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-4">
            <img src="https://images.unsplash.com/photo-1598560917505-59a3ad559071?auto=format&fit=crop&q=80&w=800" referrerPolicy="no-referrer" className="w-full aspect-[3/4] object-cover rounded-sm" />
            <img src="https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&q=80&w=800" referrerPolicy="no-referrer" className="w-full aspect-square object-cover rounded-sm" />
          </div>
          <div className="pt-8 space-y-4">
            <img src="https://images.unsplash.com/photo-1573408301185-9146fe634ad0?auto=format&fit=crop&q=80&w=800" referrerPolicy="no-referrer" className="w-full aspect-square object-cover rounded-sm" />
            <img src="https://images.unsplash.com/photo-1543294001-f7cd5d7fb516?auto=format&fit=crop&q=80&w=800" referrerPolicy="no-referrer" className="w-full aspect-[3/4] object-cover rounded-sm" />
          </div>
        </div>
      </section>

      {/* Craftsmanship Section */}
      <section className="bg-brand-ink text-white py-24 overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 md:px-10 flex flex-col md:flex-row items-center gap-16">
          <div className="flex-1 space-y-6">
            <h2 className="text-4xl font-serif">Artesian <span className="text-brand-gradient font-serif tracking-normal italic">Integrity</span></h2>
            <p className="text-white/60 font-light leading-relaxed max-w-lg">
              Each Saiksha piece undergoes a rigorous five-stage quality check. We use only premium 18k gold plating
              over hypoallergenic surgical steel, ensuring each piece is as gentle on your skin as it is beautiful to behold.
            </p>
            <div className="grid grid-cols-2 gap-8 pt-6">
              <div className="space-y-2">
                <h4 className="text-brand-rosegold font-serif text-2xl font-bold">18k</h4>
                <p className="text-[10px] uppercase tracking-widest text-white/50">Solid Gold Plating</p>
              </div>
              <div className="space-y-2">
                <h4 className="text-brand-rosegold font-serif text-2xl font-bold">0%</h4>
                <p className="text-[10px] uppercase tracking-widest text-white/50">Nickel & Lead Free</p>
              </div>
            </div>
          </div>
          <div className="flex-1 relative">
            <img
              src="https://images.unsplash.com/photo-1601121141461-9d6647bca1ed?auto=format&fit=crop&q=80&w=800"
              referrerPolicy="no-referrer"
              className="relative z-10 w-full h-[400px] object-cover rounded-sm grayscale"
            />
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-32 px-6">
        <div className="max-w-4xl mx-auto space-y-16">
          <div className="text-center space-y-4">
            <h2 className="text-4xl font-serif">Jewels of <span className="text-brand-gradient font-serif tracking-normal italic">Joy</span></h2>
            <p className="text-neutral-400 text-sm uppercase tracking-[2px]">Real stories from the Saiksha community</p>
          </div>

          <div className="grid md:grid-cols-2 gap-12">
            {[
              {
                text: "The quality of the Pearl Drop earrings exceeded my expectations. They have this amazing weight and luster that makes them feel much more expensive.",
                author: "Sarah M.",
                role: "New York, NY"
              },
              {
                text: "I wore the Medallion necklace to my wedding and got so many compliments. It's delicate but has such a presence. Truly timeless.",
                author: "Elena R.",
                role: "London, UK"
              }
            ].map((review, i) => (
              <div key={i} className="space-y-6 p-10 bg-brand-cream/30 border border-black/5 rounded-sm relative">
                <Quote className="absolute top-6 right-6 text-brand-rosegold/20" size={40} />
                <div className="flex text-brand-rosegold">
                  {[...Array(5)].map((_, i) => <Star key={i} size={14} className="fill-brand-rosegold" />)}
                </div>
                <p className="text-lg font-serif leading-relaxed italic text-neutral-700">"{review.text}"</p>
                <div className="space-y-1">
                  <p className="text-sm font-bold uppercase tracking-widest">{review.author}</p>
                  <p className="text-[10px] text-neutral-400 uppercase tracking-widest">{review.role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <TrustSection />
    </div>
  );
}
