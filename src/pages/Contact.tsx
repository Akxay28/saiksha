import { Instagram, Mail, MapPin, MessageCircle, Phone } from "lucide-react";
import { useStoreSettings } from "../context/StoreSettingsContext";

const faqs = [
  {
    question: "How quickly do you reply?",
    answer: "Most WhatsApp and Instagram messages are answered within one business day. During collection launches, replies may take a little longer.",
  },
  {
    question: "Can I ask before placing an order?",
    answer: "Yes. Share the occasion, outfit, budget, and preferred style. The team can suggest suitable pieces before checkout.",
  },
  {
    question: "Do you help with gifting?",
    answer: "Yes. You can ask for gift-ready guidance, size suggestions, and care notes before placing the order.",
  },
];

export default function Contact() {
  const { settings } = useStoreSettings();
  const whatsappText = encodeURIComponent(`Hello ${settings.storeName}, I need help with your jewelry collection.`);
  const dialNumber = settings.whatsappNumber.replace(/\D/g, "");
  const contactOptions = [
    {
      icon: MessageCircle,
      title: "WhatsApp support",
      text: "Fastest for product questions, order help, styling, and gifting guidance.",
      action: "Chat on WhatsApp",
      href: `https://wa.me/${settings.whatsappNumber}?text=${whatsappText}`,
    },
    {
      icon: Instagram,
      title: "Instagram",
      text: "Follow launches, customer styling, and quick collection updates.",
      action: "@saiksha.jewels",
      href: settings.instagramUrl,
    },
    {
      icon: Phone,
      title: "Phone",
      text: "For urgent order support, call or message during business hours.",
      action: settings.supportPhone,
      href: `tel:+${dialNumber}`,
    },
  ];

  return (
    <div className="bg-white">
      <section className="bg-brand-cream/35">
        <div className="max-w-7xl mx-auto px-6 md:px-10 py-24 lg:py-32 grid lg:grid-cols-2 gap-14 items-center">
          <div className="space-y-7">
            <span className="text-[10px] uppercase tracking-[4px] text-brand-rosegold font-bold">Contact</span>
            <h1 className="text-5xl md:text-7xl font-serif leading-tight text-brand-ink">Real support before and after your order.</h1>
            <p className="text-neutral-600 font-light leading-relaxed max-w-xl">
              Questions about materials, delivery, returns, care, or gifting? Reach out directly and the Saiksha team will help you choose with confidence.
            </p>
          </div>
          <div className="bg-white border border-black/5 p-8 md:p-10 rounded-sm shadow-xl space-y-6">
            <div className="flex items-start gap-4">
              <Mail className="text-brand-rosegold mt-1" size={22} />
              <div>
                <h2 className="font-serif text-2xl text-brand-ink">Customer care</h2>
                <p className="text-sm text-neutral-500 leading-relaxed mt-2">Use WhatsApp for fastest support. For detailed requests, include your name, product link, order details if available, and the question.</p>
              </div>
            </div>
            <div className="flex items-start gap-4 border-t border-black/5 pt-6">
              <MapPin className="text-brand-rosegold mt-1" size={22} />
              <div>
                <h3 className="text-[10px] uppercase tracking-[3px] font-bold text-neutral-400">Service Area</h3>
                <p className="text-sm text-neutral-600 mt-1">{settings.shippingNote}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-6 md:px-10 py-24 grid md:grid-cols-3 gap-8">
        {contactOptions.map((option) => (
          <a key={option.title} href={option.href} target={option.href.startsWith("http") ? "_blank" : undefined} rel="noopener noreferrer" className="border border-black/5 rounded-sm p-8 space-y-5 hover:border-brand-rosegold/40 transition-colors">
            <option.icon className="text-brand-rosegold" size={28} strokeWidth={1.4} />
            <div className="space-y-2">
              <h2 className="font-serif text-xl text-brand-ink">{option.title}</h2>
              <p className="text-sm text-neutral-500 font-light leading-relaxed">{option.text}</p>
            </div>
            <p className="text-[10px] uppercase tracking-[2px] font-bold text-brand-ink">{option.action}</p>
          </a>
        ))}
      </section>

      <section className="bg-brand-ink text-white py-24">
        <div className="max-w-5xl mx-auto px-6 md:px-10">
          <div className="text-center space-y-4 mb-14">
            <span className="text-[10px] uppercase tracking-[4px] text-brand-rosegold font-bold">Quick Answers</span>
            <h2 className="text-4xl font-serif">Before you message us</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {faqs.map((faq) => (
              <div key={faq.question} className="bg-white/[0.04] border border-white/10 p-7 rounded-sm space-y-3">
                <h3 className="font-serif text-xl">{faq.question}</h3>
                <p className="text-sm text-white/60 font-light leading-relaxed">{faq.answer}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
