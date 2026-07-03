import { Link } from "react-router-dom";
import { ChevronRight, Instagram, Search } from "lucide-react";
import dbData from "../../data/db.json";

const quickFaqs = [
  {
    question: "Can I confirm details before ordering?",
    answer: "Yes. Message Saiksha with the product link, occasion, budget, and delivery date before checkout.",
  },
  {
    question: "How should I protect the jewelry?",
    answer: "Keep pieces away from water, perfume, lotions, sweat, and harsh cleaners. Store them separately after wiping dry.",
  },
  {
    question: "What if I need help after delivery?",
    answer: "Contact support quickly with order details and clear photos if there is a delivery or product concern.",
  },
];

export default function GlobalBottomSections() {
  return (
    <>
      <section className="py-24 px-6 md:px-10 bg-white border-t border-black/5">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-[0.8fr_1.2fr] gap-12 items-start">
          <div className="space-y-5">
            <span className="text-[10px] uppercase tracking-[4px] text-brand-rosegold font-bold">Quick Answers</span>
            <h2 className="text-4xl md:text-5xl font-serif text-brand-ink">Shop with fewer doubts.</h2>
            <p className="text-sm text-neutral-500 font-light leading-relaxed max-w-md">
              Clear answers about materials, dispatch, care, exchanges, and support make the buying decision easier.
            </p>
            <Link to="/faq" className="inline-flex items-center gap-2 text-[11px] uppercase tracking-[2px] font-bold text-brand-ink border-b border-brand-ink/20 pb-2">
              View All FAQs <ChevronRight size={14} />
            </Link>
          </div>

          <div className="divide-y divide-black/5 bg-white border border-black/5 rounded-sm">
            {quickFaqs.map((item) => (
              <details key={item.question} className="group p-6 open:bg-brand-cream/20">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-6">
                  <span className="text-sm font-bold text-brand-ink">{item.question}</span>
                  <ChevronRight className="shrink-0 text-neutral-300 transition-transform group-open:rotate-90 group-open:text-brand-rosegold" size={18} />
                </summary>
                <p className="mt-4 text-sm text-neutral-600 font-light leading-relaxed">{item.answer}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-brand-cream/10 py-24 border-t border-black/5">
        <div className="max-w-7xl mx-auto px-6 md:px-10 space-y-12">
          <div className="flex flex-col md:flex-row items-end justify-between gap-6">
            <div className="space-y-4">
              <span className="text-[10px] uppercase tracking-[4px] text-brand-rosegold font-bold block">Community</span>
              <h2 className="text-4xl font-serif text-brand-ink">In the <span className="text-brand-gradient font-serif tracking-normal italic">Wild</span></h2>
              <p className="text-neutral-500 font-light text-sm">
                Share your Saiksha look with us on Instagram.{" "}
                <a
                  href="https://www.instagram.com/saiksha.jewels/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-brand-rosegold font-bold hover:text-brand-hotpink"
                >
                  @saiksha.jewels
                </a>
              </p>
            </div>
            <a
              href="https://www.instagram.com/saiksha.jewels/"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center space-x-2 text-[11px] uppercase tracking-[2px] font-bold text-brand-ink group"
            >
              <Instagram size={18} />
              <span>Follow Along</span>
            </a>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {dbData.instagram_feed.map((item) => (
              <a
                key={item.id}
                href="https://www.instagram.com/saiksha.jewels/"
                target="_blank"
                rel="noopener noreferrer"
                className="aspect-square bg-brand-cream group relative overflow-hidden block rounded-sm shadow-sm hover:shadow-md transition-shadow duration-300"
              >
                <img
                  src={item.image_url}
                  alt={`Saiksha community jewelry post ${item.id}`}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-brand-ink/65 backdrop-blur-[1px] opacity-0 group-hover:opacity-100 transition-all duration-300 flex flex-col items-center justify-center p-4 text-center">
                  <Instagram size={24} className="text-white mb-2 transform translate-y-2 group-hover:translate-y-0 transition-transform duration-300" />
                  <span className="text-white font-mono text-xs font-medium tracking-wider transform translate-y-2 group-hover:translate-y-0 transition-transform duration-300 delay-75">
                    @saiksha.jewels
                  </span>
                  <span className="text-white/60 text-[9px] uppercase tracking-[2px] mt-1 transform translate-y-2 group-hover:translate-y-0 transition-transform duration-300 delay-100">
                    Open Instagram
                  </span>
                </div>
              </a>
            ))}
          </div>

          <div className="bg-white border border-black/5 rounded-sm p-6 md:p-8 flex flex-col md:flex-row md:items-center justify-between gap-5">
            <div className="space-y-1">
              <p className="text-[10px] uppercase tracking-[3px] text-brand-rosegold font-bold">Have a client photo?</p>
              <p className="text-sm text-neutral-500 font-light">
                Tag or message <span className="font-bold text-brand-ink">@saiksha.jewels</span> so shoppers can see real styling and reach the Instagram page directly.
              </p>
            </div>
            <Link to="/collection?search=earrings" className="inline-flex items-center justify-center gap-2 bg-brand-ink text-white px-7 py-4 text-[10px] uppercase tracking-[2px] font-bold">
              <Search size={14} />
              Browse Jewelry
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
