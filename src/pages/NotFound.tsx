import { Link } from "react-router-dom";
import { ArrowRight, Gem, Home, Search, Sparkles } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-white">
      <section className="relative overflow-hidden bg-brand-cream/35">
        <div className="max-w-7xl mx-auto px-6 md:px-10 py-24 lg:py-32 grid lg:grid-cols-2 gap-14 items-center">
          <div className="space-y-8">
            <div className="inline-flex items-center gap-2 text-[10px] uppercase tracking-[4px] text-brand-rosegold font-bold">
              <Gem size={16} />
              <span>404</span>
            </div>
            <div className="space-y-5">
              <h1 className="text-5xl md:text-7xl font-serif leading-tight text-brand-ink">
                This piece slipped out of the showcase.
              </h1>
              <p className="text-neutral-600 font-light leading-relaxed max-w-xl">
                The page you are looking for may have moved, been renamed, or sold out of the collection. Let us guide you back to something beautiful.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link to="/collection" className="inline-flex items-center justify-center gap-3 bg-brand-ink text-white px-8 py-4 text-[11px] uppercase tracking-[2px] font-bold">
                Shop Collection <ArrowRight size={15} />
              </Link>
              <Link to="/" className="inline-flex items-center justify-center gap-3 border border-brand-ink/15 px-8 py-4 text-[11px] uppercase tracking-[2px] font-bold text-brand-ink">
                <Home size={15} />
                Return Home
              </Link>
            </div>
          </div>

          <div className="relative">
            <div className="relative aspect-[4/5] overflow-hidden rounded-sm bg-brand-ink">
              <img
                src="https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&q=80&w=1200"
                alt="Jewelry display case"
                referrerPolicy="no-referrer"
                className="h-full w-full object-cover grayscale opacity-75"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-brand-ink/80 via-transparent to-transparent" />
              <div className="absolute bottom-8 left-8 right-8 text-white space-y-3">
                <Sparkles className="text-brand-rosegold" size={26} />
                <p className="text-4xl md:text-5xl font-serif">404</p>
                <p className="text-sm text-white/70 font-light leading-relaxed">
                  A missing page, not a missing sparkle.
                </p>
              </div>
            </div>
            <div className="absolute -bottom-8 left-6 right-6 bg-white border border-black/5 shadow-2xl p-6 rounded-sm">
              <p className="text-[10px] uppercase tracking-[3px] text-neutral-400 font-bold mb-4">Try these instead</p>
              <div className="grid grid-cols-2 gap-3">
                <Link to="/collection?search=earrings" className="flex items-center justify-center gap-2 bg-brand-cream/40 px-4 py-3 text-[10px] uppercase tracking-[1.5px] font-bold text-brand-ink">
                  <Search size={13} />
                  Earrings
                </Link>
                <Link to="/collection?search=necklace" className="flex items-center justify-center gap-2 bg-brand-cream/40 px-4 py-3 text-[10px] uppercase tracking-[1.5px] font-bold text-brand-ink">
                  <Search size={13} />
                  Necklaces
                </Link>
                <Link to="/faq" className="flex items-center justify-center gap-2 bg-brand-cream/40 px-4 py-3 text-[10px] uppercase tracking-[1.5px] font-bold text-brand-ink">
                  FAQs
                </Link>
                <Link to="/contact" className="flex items-center justify-center gap-2 bg-brand-cream/40 px-4 py-3 text-[10px] uppercase tracking-[1.5px] font-bold text-brand-ink">
                  Support
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
