import React, { useEffect, useState } from "react";
import { X, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { useStoreSettings } from "../../context/StoreSettingsContext";

export default function LeadCaptureOffer() {
  const { settings } = useStoreSettings();
  const [isOpen, setIsOpen] = useState(false);
  const [source, setSource] = useState<"First Visit Offer" | "Exit Offer">("First Visit Offer");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const seenKey = "saiksha-lead-offer-seen";
    if (!localStorage.getItem(seenKey)) {
      const timer = window.setTimeout(() => {
        setSource("First Visit Offer");
        setIsOpen(true);
        localStorage.setItem(seenKey, "1");
      }, 9000);
      return () => window.clearTimeout(timer);
    }
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const exitKey = "saiksha-exit-offer-seen";
    const onMouseLeave = (event: MouseEvent) => {
      if (event.clientY > 8 || localStorage.getItem(exitKey)) return;
      setSource("Exit Offer");
      setIsOpen(true);
      localStorage.setItem(exitKey, "1");
    };
    document.addEventListener("mouseleave", onMouseLeave);
    return () => document.removeEventListener("mouseleave", onMouseLeave);
  }, []);

  const submitLead = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const response = await fetch("/api/lead-captures", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          source,
          customer: { name, email, phone },
          message: `${source}: ${settings.couponText || "Welcome offer requested"}`
        })
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.error || "Failed to save lead");
      toast.success(settings.couponCode ? `Offer saved. Use code ${settings.couponCode}.` : "Offer saved.");
      setIsOpen(false);
    } catch (error: any) {
      toast.error(error.message || "Could not save your details.");
    } finally {
      setIsSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[130] flex items-center justify-center px-4">
      <button className="absolute inset-0 bg-neutral-950/40 backdrop-blur-sm" onClick={() => setIsOpen(false)} aria-label="Close offer" />
      <form onSubmit={submitLead} className="relative w-full max-w-md rounded-2xl bg-white border border-black/5 shadow-2xl p-6 space-y-5">
        <button type="button" onClick={() => setIsOpen(false)} className="absolute right-4 top-4 p-2 text-neutral-400 hover:text-neutral-800">
          <X size={16} />
        </button>
        <div className="space-y-2 pr-8">
          <div className="h-11 w-11 rounded-full bg-brand-cream flex items-center justify-center text-brand-rosegold">
            <Sparkles size={18} />
          </div>
          <h3 className="font-serif text-2xl text-brand-ink">{source === "Exit Offer" ? "Before you go" : "Welcome to Saiksha"}</h3>
          <p className="text-sm text-neutral-500 leading-relaxed">
            {settings.couponText || "Share your details and unlock a private shopping offer."}
          </p>
        </div>
        <div className="space-y-3">
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Full name" className="w-full rounded-lg border border-neutral-200 px-4 py-3 text-xs outline-none focus:border-brand-rosegold" />
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email address" className="w-full rounded-lg border border-neutral-200 px-4 py-3 text-xs outline-none focus:border-brand-rosegold" />
          <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))} placeholder="Mobile number" className="w-full rounded-lg border border-neutral-200 px-4 py-3 text-xs outline-none focus:border-brand-rosegold" />
        </div>
        <button type="submit" disabled={isSaving} className="w-full rounded-lg bg-brand-ink py-3.5 text-[10px] uppercase tracking-widest font-bold text-white hover:bg-neutral-800 disabled:opacity-60">
          {isSaving ? "Saving..." : "Unlock Offer"}
        </button>
      </form>
    </div>
  );
}
