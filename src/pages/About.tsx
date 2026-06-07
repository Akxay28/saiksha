import { Link } from "react-router-dom";
import { ArrowRight, CheckCircle2, Gem, HeartHandshake, ShieldCheck, Sparkles } from "lucide-react";

const values = [
  {
    icon: Gem,
    title: "Material clarity",
    text: "Every product page lists materials, plating, stones, care guidance, packaging, and shipping notes where available.",
  },
  {
    icon: ShieldCheck,
    title: "Quality checks",
    text: "Pieces are inspected for finish, clasp strength, stone setting, polish consistency, and presentation before dispatch.",
  },
  {
    icon: HeartHandshake,
    title: "Human support",
    text: "Need styling help, gifting guidance, or order support? You can reach the Saiksha team directly before you buy.",
  },
];

const process = [
  "Design moodboard and wearability review",
  "Material selection and artisan finishing",
  "Polish, setting, and comfort inspection",
  "Protective packing with care guidance",
];

export default function About() {
  return (
    <div className="bg-white">
      <section className="relative overflow-hidden bg-brand-cream/40">
        <div className="max-w-7xl mx-auto px-6 md:px-10 py-24 lg:py-32 grid lg:grid-cols-2 gap-14 items-center">
          <div className="space-y-8">
            <span className="text-[10px] uppercase tracking-[4px] text-brand-rosegold font-bold">About Saiksha</span>
            <div className="space-y-5">
              <h1 className="text-5xl md:text-7xl font-serif leading-tight text-brand-ink">
                Jewelry made to feel personal, polished, and dependable.
              </h1>
              <p className="text-neutral-600 font-light leading-relaxed max-w-xl">
                Saiksha creates elegant jewelry for gifting, everyday styling, and special occasions. The goal is simple: beautiful pieces, clear product information, careful packing, and responsive support from browsing to delivery.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link to="/collection" className="inline-flex items-center justify-center gap-3 bg-brand-ink text-white px-8 py-4 text-[11px] uppercase tracking-[2px] font-bold">
                Explore Collection <ArrowRight size={15} />
              </Link>
              <Link to="/contact" className="inline-flex items-center justify-center gap-3 border border-brand-ink/15 px-8 py-4 text-[11px] uppercase tracking-[2px] font-bold text-brand-ink">
                Ask a Question
              </Link>
            </div>
          </div>
          <div className="relative">
            <img
              src="https://images.unsplash.com/photo-1606760227091-3dd870d97f1d?auto=format&fit=crop&q=80&w=1200"
              alt="Jewelry laid out for quality review"
              referrerPolicy="no-referrer"
              className="w-full aspect-[4/5] object-cover rounded-sm grayscale"
            />
            <div className="absolute -bottom-8 left-6 right-6 bg-white border border-black/5 shadow-2xl p-8 rounded-sm">
              <div className="flex items-center gap-3 text-brand-rosegold mb-3">
                <Sparkles size={18} />
                <span className="text-[10px] uppercase tracking-[3px] font-bold">Our Standard</span>
              </div>
              <p className="text-sm text-neutral-600 leading-relaxed">
                No rushed dispatches. Every order is reviewed for presentation, finish, and customer notes before it leaves us.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-6 md:px-10 py-28">
        <div className="grid md:grid-cols-3 gap-8">
          {values.map((item) => (
            <div key={item.title} className="border border-black/5 p-8 rounded-sm bg-white space-y-5">
              <item.icon className="text-brand-rosegold" size={28} strokeWidth={1.4} />
              <div className="space-y-2">
                <h2 className="text-xl font-serif text-brand-ink">{item.title}</h2>
                <p className="text-sm text-neutral-500 font-light leading-relaxed">{item.text}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-brand-ink text-white py-24">
        <div className="max-w-7xl mx-auto px-6 md:px-10 grid lg:grid-cols-2 gap-16 items-start">
          <div className="space-y-5">
            <span className="text-[10px] uppercase tracking-[4px] text-brand-rosegold font-bold">How We Work</span>
            <h2 className="text-4xl md:text-5xl font-serif">A slower, clearer path from selection to shipment.</h2>
            <p className="text-white/60 font-light leading-relaxed">
              Trust comes from knowing what happens after you place an order. We keep the buying journey direct, documented, and easy to follow.
            </p>
          </div>
          <div className="space-y-4">
            {process.map((step, index) => (
              <div key={step} className="flex gap-4 border-b border-white/10 pb-5">
                <span className="text-brand-rosegold font-serif text-3xl">{String(index + 1).padStart(2, "0")}</span>
                <div className="pt-1 flex items-start gap-3">
                  <CheckCircle2 className="text-brand-rosegold shrink-0 mt-0.5" size={18} />
                  <p className="text-sm text-white/75 font-light leading-relaxed">{step}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
