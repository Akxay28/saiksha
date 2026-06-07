import { Link } from "react-router-dom";
import { ChevronRight, HelpCircle, MessageCircle, ShieldCheck } from "lucide-react";

const faqGroups = [
  {
    title: "Ordering",
    questions: [
      {
        question: "How do I know which piece is right for me?",
        answer: "Read the product description, dimensions, materials, and care notes. If you are buying for a gift or event, message Saiksha with the outfit, occasion, and budget for guidance before checkout.",
      },
      {
        question: "Can I ask questions before placing an order?",
        answer: "Yes. Use WhatsApp or the Contact page for product, gifting, sizing, material, or delivery questions. For urgent gifts, confirm availability and dispatch timing before ordering.",
      },
      {
        question: "Are prices inclusive of taxes?",
        answer: "Product pages show pricing clearly. If taxes, shipping, or promotional offers apply differently to your location or order, confirm before placing time-sensitive orders.",
      },
    ],
  },
  {
    title: "Quality & Materials",
    questions: [
      {
        question: "What materials are used?",
        answer: "Material details can vary by product. Check the product page for composition, stones, plating, certification notes, and care guidance where available.",
      },
      {
        question: "Is the jewelry safe for sensitive skin?",
        answer: "Many Saiksha pieces are designed with comfort in mind, but sensitivities differ from person to person. Review product materials and ask support before ordering if you have metal allergies.",
      },
      {
        question: "How should I care for the jewelry?",
        answer: "Keep pieces away from water, perfume, lotion, sweat, and harsh cleaners. Wipe with a soft dry cloth after wear and store each piece separately in its pouch or box.",
      },
    ],
  },
  {
    title: "Shipping & Returns",
    questions: [
      {
        question: "When will my order dispatch?",
        answer: "Ready pieces usually dispatch within 2 to 5 business days. Custom, limited, or made-to-order pieces may take longer and should be confirmed with support.",
      },
      {
        question: "What should I do if my parcel arrives damaged?",
        answer: "Take photos of the outer package, inner packaging, and product before use. Contact support immediately with those photos and your order details.",
      },
      {
        question: "Can I exchange a product?",
        answer: "Exchange eligibility depends on product condition, hygiene rules, customization, and the time since delivery. Contact support quickly if there is an issue.",
      },
    ],
  },
  {
    title: "Reviews & Support",
    questions: [
      {
        question: "Are testimonials real customer submissions?",
        answer: "Testimonials are submitted through the site or product review flow and saved to the database. Verified labels are used for entries marked as verified by the store flow.",
      },
      {
        question: "How fast does customer support reply?",
        answer: "Most WhatsApp and Instagram messages are answered within one business day. Launch periods and weekends may take longer.",
      },
      {
        question: "Where can I contact Saiksha?",
        answer: "Use the Contact page, WhatsApp, Instagram, or phone details shown on the website. Include the product link or order details for faster help.",
      },
    ],
  },
];

export default function FAQ() {
  return (
    <div className="bg-white">
      <section className="bg-brand-cream/35">
        <div className="max-w-5xl mx-auto px-6 md:px-10 py-20 lg:py-28 text-center space-y-6">
          <div className="flex items-center justify-center gap-2 text-[10px] uppercase tracking-[4px] text-brand-rosegold font-bold">
            <HelpCircle size={16} />
            <span>FAQs</span>
          </div>
          <h1 className="text-5xl md:text-7xl font-serif leading-tight text-brand-ink">Questions before you trust a piece.</h1>
          <p className="text-neutral-600 font-light leading-relaxed max-w-2xl mx-auto">
            Clear answers about orders, materials, shipping, care, exchanges, testimonials, and support so you can shop Saiksha with confidence.
          </p>
        </div>
      </section>

      <section className="max-w-5xl mx-auto px-6 md:px-10 py-20 space-y-14">
        {faqGroups.map((group) => (
          <div key={group.title} className="space-y-6">
            <div className="flex items-center gap-3">
              <ShieldCheck className="text-brand-rosegold" size={20} />
              <h2 className="text-3xl font-serif text-brand-ink">{group.title}</h2>
            </div>
            <div className="divide-y divide-black/5 border border-black/5 rounded-sm bg-white">
              {group.questions.map((item) => (
                <details key={item.question} className="group p-6 open:bg-brand-cream/20">
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-6 text-left">
                    <span className="text-sm font-bold text-brand-ink">{item.question}</span>
                    <ChevronRight className="shrink-0 text-neutral-300 transition-transform group-open:rotate-90 group-open:text-brand-rosegold" size={18} />
                  </summary>
                  <p className="mt-4 text-sm text-neutral-600 font-light leading-relaxed max-w-3xl">{item.answer}</p>
                </details>
              ))}
            </div>
          </div>
        ))}
      </section>

      <section className="max-w-5xl mx-auto px-6 md:px-10 pb-24">
        <div className="bg-brand-ink text-white p-8 md:p-10 rounded-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <h2 className="text-2xl font-serif">Still unsure?</h2>
            <p className="text-sm text-white/60 font-light">Ask before ordering. It is better to confirm fit, care, and delivery expectations first.</p>
          </div>
          <Link to="/contact" className="inline-flex items-center justify-center gap-3 bg-white text-brand-ink px-7 py-4 text-[10px] uppercase tracking-[2px] font-bold">
            <MessageCircle size={15} />
            Contact Support
          </Link>
        </div>
      </section>
    </div>
  );
}
