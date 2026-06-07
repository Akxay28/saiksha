import { Link } from "react-router-dom";
import { Droplets, Gem, ShieldCheck, Sparkles, Sun, XCircle } from "lucide-react";

const careSteps = [
  {
    icon: Droplets,
    title: "Keep away from moisture",
    text: "Remove jewelry before bathing, swimming, exercising, or applying perfume and lotions.",
  },
  {
    icon: Sun,
    title: "Store gently",
    text: "Use the pouch or box provided. Store pieces separately to prevent scratches and chain tangles.",
  },
  {
    icon: Sparkles,
    title: "Wipe after wear",
    text: "Use a soft dry cloth after every wear to remove sweat, oils, and cosmetic residue.",
  },
  {
    icon: ShieldCheck,
    title: "Handle with care",
    text: "Open clasps gently, avoid pulling chains, and keep delicate pieces flat during travel.",
  },
];

const avoidItems = ["Perfume sprayed directly on jewelry", "Salt water and chlorinated pools", "Harsh cleaning liquids", "Sleeping with delicate chains", "Stacking sharp stones together"];

export default function CareGuide() {
  return (
    <div className="bg-white">
      <section className="max-w-7xl mx-auto px-6 md:px-10 py-24 lg:py-32 grid lg:grid-cols-2 gap-14 items-center">
        <div className="space-y-7">
          <span className="text-[10px] uppercase tracking-[4px] text-brand-rosegold font-bold">Care Guide</span>
          <h1 className="text-5xl md:text-7xl font-serif leading-tight text-brand-ink">Keep your Saiksha pieces glowing longer.</h1>
          <p className="text-neutral-600 font-light leading-relaxed max-w-xl">
            Jewelry keeps its finish best when it is cleaned gently, stored separately, and protected from chemicals. These simple habits help preserve shine and comfort.
          </p>
          <Link to="/contact" className="inline-flex bg-brand-ink text-white px-8 py-4 text-[11px] uppercase tracking-[2px] font-bold">
            Ask Care Support
          </Link>
        </div>
        <img
          src="https://images.unsplash.com/photo-1573408301185-9146fe634ad0?auto=format&fit=crop&q=80&w=1200"
          alt="Gold jewelry care and storage"
          referrerPolicy="no-referrer"
          className="w-full aspect-[4/5] object-cover rounded-sm grayscale"
        />
      </section>

      <section className="bg-brand-cream/30 py-24">
        <div className="max-w-7xl mx-auto px-6 md:px-10 grid md:grid-cols-4 gap-6">
          {careSteps.map((step) => (
            <div key={step.title} className="bg-white border border-black/5 p-7 rounded-sm space-y-4">
              <step.icon className="text-brand-rosegold" size={26} strokeWidth={1.4} />
              <h2 className="font-serif text-xl text-brand-ink">{step.title}</h2>
              <p className="text-sm text-neutral-500 font-light leading-relaxed">{step.text}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="max-w-5xl mx-auto px-6 md:px-10 py-24">
        <div className="grid md:grid-cols-2 gap-12">
          <div className="space-y-5">
            <Gem className="text-brand-rosegold" size={30} />
            <h2 className="text-3xl font-serif text-brand-ink">Cleaning routine</h2>
            <p className="text-sm text-neutral-500 leading-relaxed font-light">
              Wipe with a soft dry cloth. For stubborn residue, use a slightly damp cloth, then dry immediately. Do not soak plated, beaded, pearl, or stone-set pieces unless the product page specifically says it is safe.
            </p>
          </div>
          <div className="space-y-5">
            <div className="flex items-center gap-3 text-red-500">
              <XCircle size={24} />
              <span className="text-[10px] uppercase tracking-[3px] font-bold">Avoid</span>
            </div>
            <ul className="space-y-3">
              {avoidItems.map((item) => (
                <li key={item} className="text-sm text-neutral-600 border-b border-black/5 pb-3">{item}</li>
              ))}
            </ul>
          </div>
        </div>
      </section>
    </div>
  );
}
