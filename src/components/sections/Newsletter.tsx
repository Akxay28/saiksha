import React, { useState } from "react";
import { motion } from "motion/react";
import { Mail, ArrowRight, Sparkles } from "lucide-react";
import { toast } from "sonner";

export default function Newsletter() {
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (email && phone) {
      setIsSubmitting(true);
      try {
        const response = await fetch("/api/newsletter", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, phone }),
        });

        if (response.ok) {
          toast.success("Welcome to the Saiksha community! Check your inbox for your welcome gift.");
          setEmail("");
          setPhone("");
        } else {
          toast.error("Something went wrong. Please try again later.");
        }
      } catch (error) {
        toast.error("Could not connect to the server.");
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  return (
    <section className="py-24 bg-brand-ink text-white overflow-hidden relative">
      {/* Decorative Blur */}
      <div className="absolute top-0 right-0 w-1/2 h-full bg-brand-rosegold/5 blur-[120px] pointer-events-none" />
      
      <div className="max-w-7xl mx-auto px-6 md:px-10 relative z-10">
        <div className="max-w-2xl mx-auto text-center space-y-8">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="flex justify-center mb-6"
          >
            <div className="w-16 h-16 rounded-full bg-white/5 border border-white/10 flex items-center justify-center">
              <Mail size={24} className="text-brand-rosegold" />
            </div>
          </motion.div>

          <div className="space-y-4">
            <h2 className="text-4xl md:text-5xl font-serif">The Saiksha <span className="text-brand-gradient font-serif tracking-normal italic">Inner Circle</span></h2>
            <p className="text-neutral-400 font-light tracking-wide leading-relaxed">
              Join our exclusive community to receive early access to new collections, <br />
              private events, and a <span className="text-white font-medium">10% welcome gift</span> on your first order.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4 mt-12 max-w-lg mx-auto">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="relative">
                <Mail className="absolute left-6 top-1/2 -translate-y-1/2 text-neutral-500" size={16} />
                <input
                  type="email"
                  placeholder="Email Address"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 pl-14 pr-6 py-4 text-xs font-light tracking-widest focus:outline-none focus:border-brand-rosegold focus:bg-white/10 transition-all text-white placeholder:text-neutral-500 rounded-sm"
                />
              </div>
              <div className="relative">
                <span className="absolute left-6 top-1/2 -translate-y-1/2 text-neutral-500 text-xs font-light">+91</span>
                <input
                  type="tel"
                  placeholder="Phone Number"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 pl-14 pr-6 py-4 text-xs font-light tracking-widest focus:outline-none focus:border-brand-rosegold focus:bg-white/10 transition-all text-white placeholder:text-neutral-500 rounded-sm"
                />
              </div>
            </div>
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-white text-brand-ink py-5 text-[10px] uppercase tracking-[4px] font-bold hover:bg-brand-rosegold hover:text-white transition-all rounded-sm flex items-center justify-center space-x-3 group disabled:opacity-50 shadow-2xl shadow-black/20"
            >
              <span>{isSubmitting ? "Processing..." : "Secure My Invitation"}</span>
              {!isSubmitting && <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />}
            </button>
            
            <div className="flex items-center justify-center space-x-2 text-[8px] uppercase tracking-[2px] text-neutral-500 mt-2">
              <div className="w-1 h-1 rounded-full bg-green-500 animate-pulse" />
              <span>Encrypted & Secured Data Handling</span>
            </div>
          </form>

          <p className="text-[10px] text-neutral-500 uppercase tracking-widest pt-4">
            By joining, you agree to receive our weekly journal. unsubscribe anytime.
          </p>
        </div>
      </div>
    </section>
  );
}
