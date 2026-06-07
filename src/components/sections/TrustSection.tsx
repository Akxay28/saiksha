import React from "react";
import { motion } from "motion/react";
import { Gem, Gift, ShieldCheck, Globe, Sparkles } from "lucide-react";
import { cn } from "../../lib/utils";

const features = [
  {
    icon: Gem,
    title: "Premium Quality",
    description: "18k gold plated & authentic stones",
    color: "bg-brand-cream/40",
    iconColor: "text-brand-rosegold",
  },
  {
    icon: Gift,
    title: "Luxury Packaging",
    description: "Gift-ready velvet jewelry boxes",
    color: "bg-brand-softpink/20",
    iconColor: "text-brand-hotpink",
  },
  {
    icon: ShieldCheck,
    title: "Secure Checkout",
    description: "100% encrypted safe payments",
    color: "bg-brand-cream/40",
    iconColor: "text-brand-purple",
  },
  {
    icon: Globe,
    title: "Worldwide Shipping",
    description: "Fast express delivery globally",
    color: "bg-brand-softpink/15",
    iconColor: "text-brand-lavender",
  },
];

export default function TrustSection() {
  return (
    <section className="relative py-32 px-6 overflow-hidden bg-white">
      {/* Background Decorative Elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] rounded-full bg-brand-blush/20 blur-[120px]" />
        <div className="absolute -bottom-[10%] -right-[10%] w-[40%] h-[40%] rounded-full bg-brand-rosegold/10 blur-[120px]" />
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        <div className="text-center mb-20 space-y-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="inline-flex items-center space-x-2 px-4 py-1.5 rounded-full bg-brand-cream border border-black/5"
          >
            <Sparkles size={12} className="text-brand-rosegold" />
            <span className="text-[10px] uppercase tracking-[3px] font-bold text-brand-rosegold">The Saiksha Promise</span>
          </motion.div>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-4xl md:text-5xl font-serif text-brand-ink"
          >
            Excellence in <span className="text-brand-gradient font-serif tracking-normal italic">Every Detail</span>
          </motion.h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, i) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              whileHover={{ y: -10 }}
              className="group relative"
            >
              <div className="h-full bg-white border border-black/5 rounded-2xl p-10 flex flex-col items-center text-center space-y-6 transition-all duration-500 hover:shadow-[0_20px_50px_rgba(0,0,0,0.05)] hover:border-brand-rosegold/20 group">
                {/* Icon Container */}
                <div className={cn(
                  "relative w-20 h-20 rounded-2xl flex items-center justify-center transition-transform duration-500 group-hover:scale-110",
                  feature.color, "shadow-sm border border-brand-ink/5"
                )}>
                  <feature.icon size={32} strokeWidth={1.2} className={cn("transition-colors duration-500", feature.iconColor)} />
                  
                  {/* Decorative Sparkles */}
                  <motion.div
                    animate={{ 
                      scale: [1, 1.2, 1],
                      opacity: [0.3, 0.6, 0.3]
                    }}
                    transition={{ 
                      duration: 3,
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                    className="absolute -top-1 -right-1 text-brand-rosegold"
                  >
                    <Sparkles size={12} className="fill-brand-rosegold" />
                  </motion.div>
                </div>

                <div className="space-y-3">
                  <h3 className="text-lg font-serif font-medium text-brand-ink group-hover:text-brand-rosegold transition-colors duration-500">
                    {feature.title}
                  </h3>
                  <div className="w-8 h-[1px] bg-brand-rosegold/30 mx-auto group-hover:w-16 transition-all duration-500" />
                  <p className="text-sm text-neutral-400 font-light leading-relaxed tracking-wide">
                    {feature.description}
                  </p>
                </div>

                {/* Shimmer Effect */}
                <div className="absolute inset-0 rounded-2xl overflow-hidden pointer-events-none">
                  <div className="absolute inset-0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/40 to-transparent" />
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
