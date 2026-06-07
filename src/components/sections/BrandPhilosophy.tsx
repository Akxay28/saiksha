import React from "react";
import { motion } from "motion/react";
import { Link } from "react-router-dom";
import { Sparkles, Heart, Star } from "lucide-react";

export default function BrandPhilosophy() {
  return (
    <section className="py-24 lg:py-36 bg-brand-cream/30">
      <div className="max-w-7xl mx-auto px-6 md:px-12">
        <div className="flex flex-col lg:flex-row items-center gap-16 lg:gap-28">
          <div className="w-full lg:w-[53%] relative">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="relative aspect-[4/5] rounded-sm overflow-hidden shadow-2xl"
            >
              <img 
                src="https://images.unsplash.com/photo-1601121141461-9d6647bca1ed?auto=format&fit=crop&q=80&w=1200" 
                alt="Jewelry Crafting" 
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-1000 scale-100 hover:scale-105"
              />
              <div className="absolute inset-0 bg-brand-ink/5" />
            </motion.div>
            
            {/* Floating Stats */}
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 }}
              className="absolute -bottom-10 -right-6 md:right-10 bg-white p-10 shadow-2xl max-w-[260px] space-y-4 rounded-sm border border-black/5"
            >
              <Heart className="text-brand-rosegold" size={28} />
              <p className="text-3xl font-serif text-brand-ink">5,000+</p>
              <p className="text-[11px] uppercase tracking-widest text-neutral-400 font-bold leading-normal">Happy Clients Worldwide Since 2021</p>
            </motion.div>
          </div>

          <div className="w-full lg:w-[47%] space-y-10">
            <div className="space-y-4">
              <span className="text-[11px] uppercase tracking-[5px] text-brand-rosegold font-bold block">Our Philosophy</span>
              <h2 className="text-4xl md:text-6xl font-serif text-brand-ink leading-[1.123]">
                Crafted with <span className="italic text-transparent bg-clip-text bg-gradient-to-r from-brand-rosegold via-brand-hotpink to-brand-purple pb-1">Soul</span>, <br />
                Worn with <span className="italic text-transparent bg-clip-text bg-gradient-to-r from-brand-hotpink via-brand-purple to-brand-lavender pb-1">Pride</span>.
              </h2>
            </div>
            
            <p className="text-neutral-500 font-light text-base md:text-lg leading-relaxed tracking-wide">
              At Saiksha, we believe that jewelry is more than just an accessory—it's a storytelling medium. Each piece in our collection is meticulously handcrafted by master artisans who pour decades of heritage, passion, and meticulous detail into every single setting.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4">
              <div className="space-y-3">
                <div className="flex items-center space-x-3 text-brand-ink">
                  <Star size={18} className="text-brand-rosegold" />
                  <h4 className="text-[11px] uppercase tracking-wider font-bold">Ethical Sourcing</h4>
                </div>
                <p className="text-xs text-neutral-400 font-light leading-relaxed">We partner exclusively with certified suppliers who share our commitment to fair trade, safe practices, and total sustainability.</p>
              </div>
              <div className="space-y-3">
                <div className="flex items-center space-x-3 text-brand-ink">
                  <Sparkles size={18} className="text-brand-rosegold" />
                  <h4 className="text-[11px] uppercase tracking-wider font-bold">Timeless Design</h4>
                </div>
                <p className="text-xs text-neutral-400 font-light leading-relaxed">Our aesthetic bridges the gap between heritage details and high modern minimalism, ensuring your heirloom pieces never rust or go out of trend.</p>
              </div>
            </div>

            <div className="pt-4">
              <Link to="/about" className="inline-flex text-[11px] uppercase tracking-[3px] font-bold text-brand-ink border-b border-brand-ink/20 pb-2 hover:border-brand-ink hover:text-brand-rosegold transition-all duration-300">
                Discover Our Story
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
