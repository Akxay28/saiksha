import React from "react";
import { motion } from "motion/react";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { useProducts } from "../context/ProductContext";
import ProductCard from "../components/ui/ProductCard";

import TrustSection from "../components/sections/TrustSection";
import BrandPhilosophy from "../components/sections/BrandPhilosophy";
import Testimonials from "../components/sections/Testimonials";
import RecentlyViewedProducts from "../components/sections/RecentlyViewedProducts";

export default function Home() {
  const { products } = useProducts();
  const featuredProducts = products.slice(0, 4);

  return (
    <div className="min-h-screen bg-white">
      {/* Split Layout Section */}
      <section className="flex flex-col lg:flex-row min-h-[calc(100vh-80px)]">
        {/* Left Pane - Hero */}
        <div className="w-full lg:w-[450px] relative bg-brand-blush flex flex-col justify-end p-10 lg:p-14 overflow-hidden border-r border-black/5">
          <div className="absolute inset-0 z-0">
             <img 
               src="https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&q=80&w=2000" 
               alt="Saiksha Hero" 
               referrerPolicy="no-referrer"
               className="w-full h-full object-cover opacity-80"
             />
             <div className="absolute inset-0 bg-gradient-to-t from-brand-blush via-brand-blush/40 to-transparent" />
          </div>
          
          <div className="relative z-10 space-y-6">
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-4xl lg:text-6xl font-serif leading-[1.1] text-brand-ink"
            >
              Timeless <br />
              <span className="italic">Elegance</span>
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-sm text-neutral-500 max-w-xs font-light leading-relaxed tracking-wide"
            >
              Handcrafted jewelry for those who appreciate the finer details of modern luxury.
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Link
                to="/collection"
                className="inline-flex items-center space-x-3 bg-brand-ink text-white px-8 py-4 text-[11px] uppercase tracking-[2px] hover:bg-neutral-800 transition-colors font-medium shadow-xl shadow-brand-ink/10"
              >
                <span>Shop New Drops</span>
                <ArrowRight size={14} />
              </Link>
            </motion.div>
          </div>
        </div>

        {/* Right Pane - Content */}
        <div className="flex-1 bg-white p-6 lg:p-14 space-y-16">
          {/* Categories Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
             {[
               { name: "Earrings", count: "12+ Items", image: "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&q=80&w=600" },
               { name: "Necklaces", count: "8 Items", image: "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&q=80&w=600" },
               { name: "Bestsellers", count: "Top Rated", image: "https://images.unsplash.com/photo-1573408301185-9146fe634ad0?auto=format&fit=crop&q=80&w=600" },
               { name: "New Arrivals", count: "Just In", image: "https://images.unsplash.com/photo-1617038260897-41a1f14a8ca0?auto=format&fit=crop&q=80&w=600" }
             ].map((cat, i) => (
                 <Link
                  key={cat.name}
                  to={`/collection?category=${cat.name}`}
                  className="group relative aspect-[4/5] p-6 flex flex-col justify-between overflow-hidden border border-black/5 hover:border-brand-rosegold/30 transition-all rounded-sm shadow-sm"
                >
                  {/* Image Background with warm overlay */}
                  <div className="absolute inset-0 z-0 bg-brand-cream">
                    <img 
                      src={cat.image} 
                      alt={cat.name} 
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover grayscale opacity-25 group-hover:opacity-40 group-hover:scale-105 group-hover:grayscale-0 transition-all duration-700"
                    />
                    <div className="absolute inset-0 bg-gradient-to-b from-brand-cream/90 via-brand-cream/10 to-brand-cream/95 group-hover:from-brand-cream/80 group-hover:to-brand-cream/90 transition-all duration-700" />
                  </div>

                  <div className="relative z-10 text-[10px] uppercase tracking-[2px] font-bold text-neutral-500 group-hover:text-brand-ink transition-colors">
                    {cat.count}
                  </div>
                  <div className="relative z-10 space-y-1">
                    <h3 className="text-xl font-serif text-brand-ink font-medium tracking-wide">{cat.name}</h3>
                    <div className="w-6 h-[1px] bg-brand-ink group-hover:bg-brand-rosegold group-hover:w-full transition-all duration-500" />
                  </div>
                </Link>
             ))}
          </div>

          {/* Featured items */}
          <div className="space-y-10">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <h2 className="text-3xl font-serif text-brand-ink">Curated <span className="text-brand-gradient font-serif tracking-normal italic">Collections</span></h2>
                <div className="h-0.5 w-12 bg-gradient-to-r from-brand-rosegold to-brand-hotpink" />
              </div>
              <Link to="/collection" className="text-[11px] uppercase tracking-[2px] font-bold text-neutral-400 hover:text-brand-ink transition-colors">
                View Entire Collection
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
              {featuredProducts.slice(0, 3).map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </div>

          {/* Luxury Banner */}
          <div className="relative h-[400px] bg-brand-blush overflow-hidden rounded-sm group">
            <img 
              src="https://images.unsplash.com/photo-1599643477877-530eb83abc8e?auto=format&fit=crop&q=80&w=2000" 
              referrerPolicy="no-referrer"
              className="absolute inset-0 w-full h-full object-cover grayscale brightness-90 group-hover:scale-105 transition-transform duration-1000"
              alt="Promotion"
            />
            <div className="absolute inset-0 bg-black/10" />
            <div className="absolute inset-0 flex flex-col items-center justify-center text-white text-center p-6 space-y-4">
              <span className="text-[10px] uppercase tracking-[4px]">Summer 24</span>
              <h2 className="text-4xl md:text-5xl font-serif max-w-md text-white">The Rose Gold Edit</h2>
              <p className="text-sm font-light opacity-80 max-w-sm tracking-wide">Elegant statement pieces designed to catch the summer light.</p>
              <Link to="/collection" className="mt-4 border border-white px-8 py-3 text-[11px] uppercase tracking-[2px] hover:bg-white hover:text-brand-ink transition-all">Shop The Edit</Link>
            </div>
          </div>
        </div>
      </section>

      {/* New Brand Sections */}
      <BrandPhilosophy />
      
      {/* Featured Collection Highlight */}
      <section className="py-24 px-6 md:px-10">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center gap-12">
          <div className="flex-1 space-y-6">
            <span className="text-[10px] uppercase tracking-[4px] text-brand-rosegold font-bold">New Arrival</span>
            <h2 className="text-4xl md:text-6xl font-serif text-brand-ink leading-tight">Mastering the Art of <span className="text-brand-gradient font-serif tracking-normal italic">Gifting.</span></h2>
            <p className="text-neutral-500 font-light leading-relaxed max-w-lg">Make every moment unforgettable with our signature luxury packaging and personalized notes. We believe the unboxing should be as beautiful as the piece itself.</p>
            <div className="flex items-center space-x-6 pt-4">
               <Link to="/collection" className="bg-brand-ink text-white px-10 py-5 text-[11px] uppercase tracking-[3px] font-bold hover:bg-neutral-800 shadow-lg transition-all">Gift Services</Link>
               <Link to="/collection" className="text-[11px] uppercase tracking-[3px] font-bold text-brand-ink border-b border-black/10 pb-1">Shop Men's Edit</Link>
            </div>
          </div>
          <div className="flex-1 grid grid-cols-2 gap-4">
             <div className="aspect-[4/5] bg-brand-cream rounded-sm overflow-hidden">
                <img src="https://images.unsplash.com/photo-1512163143273-bde0e3cc7407?auto=format&fit=crop&q=80&w=800" alt="Gifting 1" referrerPolicy="no-referrer" className="w-full h-full object-cover grayscale" />
             </div>
             <div className="aspect-[4/5] bg-brand-blush rounded-sm overflow-hidden translate-y-8">
                <img src="https://images.unsplash.com/photo-1512909006721-3d6018887383?auto=format&fit=crop&q=80&w=800" alt="Gifting 2" referrerPolicy="no-referrer" className="w-full h-full object-cover grayscale" />
             </div>
          </div>
        </div>
      </section>

      {/* Trust Badges */}
      <TrustSection />

      <Testimonials />
      <RecentlyViewedProducts />

      {/* Final SEO Footer Copy */}
      <section className="py-16 text-center border-t border-black/5 bg-white">
        <div className="container mx-auto px-4 max-w-4xl space-y-6">
          <p className="text-[10px] uppercase tracking-[5px] text-neutral-300 font-bold">Saiksha Luxury Jewelry</p>
          <p className="text-sm text-neutral-400 leading-relaxed font-light italic">
            "Saiksha is more than a brand; it's a testament to the enduring beauty of handcrafted luxury. From our ethically sourced materials to our commitment to timeless design, we strive to create pieces that will be cherished for generations."
          </p>
        </div>
      </section>
    </div>
  );
}

