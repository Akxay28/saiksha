import { Link } from "react-router-dom";
import { Clock, PackageCheck, RefreshCw, ShieldCheck, Truck } from "lucide-react";
import { useStoreSettings } from "../context/StoreSettingsContext";

const timeline = [
  {
    icon: PackageCheck,
    title: "Order review",
    text: "Your order details, product availability, and special notes are reviewed before packing.",
  },
  {
    icon: ShieldCheck,
    title: "Quality check",
    text: "The piece is checked for finish, clasp, setting, and packaging condition.",
  },
  {
    icon: Truck,
    title: "Dispatch",
    text: "Orders are packed securely and handed to a courier partner with tracking where available.",
  },
];

const policies = [
  {
    title: "Estimated dispatch",
    text: "Ready pieces usually dispatch within 2 to 5 business days. Custom, limited, or made-to-order pieces can take longer and should be confirmed before purchase.",
  },
  {
    title: "Shipping charges",
    text: "Shipping charges, free shipping thresholds, and delivery availability may vary by order value, location, and campaign offer.",
  },
  {
    title: "Returns and exchanges",
    text: "Exchange eligibility depends on product condition, hygiene rules, customization, and the time since delivery. Contact support quickly if there is a problem.",
  },
  {
    title: "Damaged parcel",
    text: "If your parcel arrives damaged, take clear photos of the outer package, inner package, and product before using it, then contact support immediately.",
  },
];

export default function Shipping() {
  const { settings } = useStoreSettings();
  const freeShippingThreshold = Math.max(0, Number(settings.freeShippingThreshold || 0));
  const policiesWithSettings = policies.map((policy) => {
    if (policy.title === "Shipping charges") {
      return {
        ...policy,
        text: freeShippingThreshold > 0
          ? `Free shipping is available on orders from Rs ${freeShippingThreshold.toLocaleString()}. ${settings.shippingNote}`
          : settings.shippingNote
      };
    }
    if (policy.title === "Returns and exchanges") {
      return { ...policy, text: settings.returnPolicy };
    }
    return policy;
  });

  return (
    <div className="bg-white">
      <section className="max-w-7xl mx-auto px-6 md:px-10 py-24 lg:py-32 grid lg:grid-cols-2 gap-14 items-center">
        <div className="space-y-7">
          <span className="text-[10px] uppercase tracking-[4px] text-brand-rosegold font-bold">Shipping & Returns</span>
          <h1 className="text-5xl md:text-7xl font-serif leading-tight text-brand-ink">Transparent delivery and exchange guidance.</h1>
          <p className="text-neutral-600 font-light leading-relaxed max-w-xl">
            Clear policies help customers buy with confidence. Use this page to understand dispatch timelines, parcel checks, and support steps.
          </p>
          <Link to="/contact" className="inline-flex bg-brand-ink text-white px-8 py-4 text-[11px] uppercase tracking-[2px] font-bold">
            Contact Support
          </Link>
        </div>
        <div className="bg-brand-cream/40 border border-black/5 p-8 md:p-10 rounded-sm space-y-5">
          <Clock className="text-brand-rosegold" size={34} strokeWidth={1.4} />
          <h2 className="text-3xl font-serif text-brand-ink">Before you order</h2>
          <p className="text-sm text-neutral-600 leading-relaxed font-light">
            For urgent gifts, wedding dates, or travel deadlines, message Saiksha before checkout so availability and delivery expectations can be confirmed.
          </p>
        </div>
      </section>

      <section className="bg-brand-ink text-white py-24">
        <div className="max-w-7xl mx-auto px-6 md:px-10 grid md:grid-cols-3 gap-8">
          {timeline.map((step) => (
            <div key={step.title} className="bg-white/[0.04] border border-white/10 p-8 rounded-sm space-y-5">
              <step.icon className="text-brand-rosegold" size={30} strokeWidth={1.4} />
              <h2 className="text-2xl font-serif">{step.title}</h2>
              <p className="text-sm text-white/60 font-light leading-relaxed">{step.text}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="max-w-5xl mx-auto px-6 md:px-10 py-24 space-y-6">
        <div className="flex items-center gap-3 text-brand-rosegold">
          <RefreshCw size={22} />
          <span className="text-[10px] uppercase tracking-[4px] font-bold">Policy Notes</span>
        </div>
        <div className="grid md:grid-cols-2 gap-6">
          {policiesWithSettings.map((policy) => (
            <div key={policy.title} className="border border-black/5 p-7 rounded-sm space-y-3">
              <h2 className="font-serif text-xl text-brand-ink">{policy.title}</h2>
              <p className="text-sm text-neutral-500 font-light leading-relaxed">{policy.text}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
