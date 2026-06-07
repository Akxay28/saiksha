import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Instagram, Mail, ArrowRight, ShieldCheck, Facebook } from "lucide-react";
import { toast } from "sonner";
import logoImg from "../../assets/images/saiksha_logo_1780685763441.png";

export default function Footer() {
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
    <footer className="bg-brand-ink text-white pt-24 pb-16 border-t border-white/5 relative overflow-hidden">
      {/* Soft overlay accent to match luxury motif */}
      <div className="absolute top-0 right-0 w-1/3 h-full bg-brand-rosegold/[0.02] blur-[100px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-8 md:px-12 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 lg:gap-24 items-start">

          {/* LEFT: Brands, Copy guidelines, navigational directory */}
          <div className="lg:col-span-7 space-y-12">
            <div className="space-y-6">
              <div className="flex items-center gap-3.5">
                <div className="bg-white p-1 rounded-full border border-white/10 shadow-lg shrink-0">
                  <img
                    src={logoImg}
                    alt="Saiksha Logo"
                    className="h-10 w-10 md:h-12 md:w-12 object-contain rounded-full"
                    referrerPolicy="no-referrer"
                  />
                </div>
                <h2 className="text-2xl md:text-3xl font-serif text-white tracking-[6px] uppercase font-bold">Saiksha</h2>
              </div>
              <p className="text-neutral-400 font-light text-sm max-w-md leading-relaxed tracking-wide">
                Saiksha is a testament to the enduring beauty of handcrafted luxury. From ethically sourced precious materials to our commitment to eternal design, our legacy transcends seasons.
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-8">
              <div className="space-y-4">
                <h4 className="text-[10px] uppercase tracking-[3px] text-brand-rosegold font-bold">Collections</h4>
                <ul className="space-y-2.5 text-xs text-neutral-400 font-light">
                  <li><Link to="/collection?category=Earrings" className="hover:text-white transition-colors">Fine Earrings</Link></li>
                  <li><Link to="/collection?category=Necklaces" className="hover:text-white transition-colors">Exquisite Necklaces</Link></li>
                  <li><Link to="/collection?category=Bestsellers" className="hover:text-white transition-colors">Our Bestsellers</Link></li>
                  <li><Link to="/collection?category=New%20Arrivals" className="hover:text-white transition-colors">New Arrivals</Link></li>
                </ul>
              </div>

              <div className="space-y-4">
                <h4 className="text-[10px] uppercase tracking-[3px] text-brand-rosegold font-bold">Journal & Help</h4>
                <ul className="space-y-2.5 text-xs text-neutral-400 font-light">
                  <li><Link to="/shipping" className="hover:text-white transition-colors">Shipping & Returns</Link></li>
                  <li><Link to="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link></li>
                  <li><a href="#" className="hover:text-white transition-colors">Care & Assembly</a></li>
                  <li><a href="#" className="hover:text-white transition-colors">Heritage Logbook</a></li>
                </ul>
              </div>

              <div className="space-y-4 col-span-2 sm:col-span-1">
                <h4 className="text-[10px] uppercase tracking-[3px] text-brand-rosegold font-bold">Social Connection</h4>
                <div className="flex flex-col space-y-3">
                  <a
                    href="https://www.instagram.com/saiksha.jewels/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center space-x-3 w-fit group"
                    aria-label="Instagram Profile"
                  >
                    <div className="w-9 h-9 rounded-full bg-white/5 hover:bg-brand-rosegold/30 hover:text-white flex items-center justify-center text-neutral-400 transition-all border border-white/10">
                      <Instagram size={16} />
                    </div>

                    <span className="text-xs text-neutral-400 font-light group-hover:text-white transition">
                      @saiksha_jewels
                    </span>
                  </a>

                  <a
                    href="https://www.facebook.com/profile.php?id=61590570004398"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center space-x-3 w-fit group"
                    aria-label="Facebook Profile"
                  >
                    <div className="w-9 h-9 rounded-full bg-white/5 hover:bg-brand-rosegold/30 hover:text-white flex items-center justify-center text-neutral-400 transition-all border border-white/10">
                      <Facebook size={16} />
                    </div>

                    <span className="text-xs text-neutral-400 font-light group-hover:text-white transition">
                      Saiksha Jewelry
                    </span>
                  </a>
                </div>
              </div>
            </div>



            <div className="pt-8 border-t border-white/5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 text-[11px] uppercase tracking-[1.5px] text-neutral-500 font-medium">
              <span>&copy; {new Date().getFullYear()} Saiksha Jewelry. All Rights Reserved.</span>
              <div className="flex gap-4">
                <Link to="/privacy" className="hover:text-white text-[10px]">Privacy</Link>
                <Link to="/shipping" className="hover:text-white text-[10px]">Shipping Policy</Link>
              </div>
            </div>
          </div>

          {/* RIGHT: Invitation / Newsletter input fields */}
          <div className="lg:col-span-5 bg-white/[0.02] border border-white/10 p-8 md:p-10 rounded-sm space-y-6">
            <div className="space-y-2">
              <span className="text-[10px] uppercase tracking-[4px] text-brand-rosegold font-bold block">The Inner Circle</span>
              <h3 className="text-2xl font-serif text-white">Secure Your Invitation</h3>
              <p className="text-xs text-neutral-400 font-light leading-relaxed tracking-wide">
                Join our exclusive registry to secure priority reservations for fresh collection releases, legacy drops, and a <span className="text-white font-medium">10% welcome invitation</span> gift.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-3">
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-500" size={14} />
                  <input
                    type="email"
                    placeholder="Email Address"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 pl-11 pr-4 py-3.5 text-xs font-light tracking-wider focus:outline-none focus:border-brand-hotpink focus:ring-1 focus:ring-brand-hotpink/30 focus:bg-white/10 transition-all text-white placeholder:text-neutral-500 rounded-sm"
                  />
                </div>

                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-500 text-xs font-light">+91</span>
                  <input
                    type="tel"
                    placeholder="Phone Number"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 pl-11 pr-4 py-3.5 text-xs font-light tracking-wider focus:outline-none focus:border-brand-hotpink focus:ring-1 focus:ring-brand-hotpink/30 focus:bg-white/10 transition-all text-white placeholder:text-neutral-500 rounded-sm"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-white text-brand-ink py-4 text-[10px] uppercase tracking-[3px] font-bold hover:bg-gradient-to-r hover:from-brand-rosegold hover:via-brand-hotpink hover:to-brand-purple hover:text-white transition-all rounded-sm flex items-center justify-center space-x-3 group disabled:opacity-50 shadow-sm hover:shadow-[0_10px_25px_rgba(233,30,140,0.25)]"
              >
                <span>{isSubmitting ? "Securing Reservation..." : "Secure My Invitation"}</span>
                {!isSubmitting && <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />}
              </button>
            </form>

            <div className="flex items-center space-x-2 text-[9px] uppercase tracking-[1.5px] text-neutral-500 justify-center">
              <ShieldCheck size={12} className="text-semibold text-neutral-500" />
              <span>Compliant & Encrypted Data Handler</span>
            </div>
          </div>

        </div>
      </div>
    </footer>
  );
}
