import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ChevronRight, ExternalLink, Instagram, X } from "lucide-react";

interface HappyCustomer {
  _id: string;
  imageUrl: string;
  description?: string;
  instagramHandle?: string;
  instagramUrl?: string;
}

export default function HappyCustomers() {
  const [customers, setCustomers] = useState<HappyCustomer[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<HappyCustomer | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const fetchCustomers = async () => {
      try {
        const response = await fetch("/api/happy-customers");
        if (response.ok) {
          const data = await response.json();
          if (isMounted) setCustomers(Array.isArray(data) ? data : []);
        }
      } catch (error) {
        console.error("Could not load happy customers:", error);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    fetchCustomers();

    return () => {
      isMounted = false;
    };
  }, []);

  const getInstagramUrl = (customer: HappyCustomer) => {
    if (customer.instagramUrl) return customer.instagramUrl;
    if (customer.instagramHandle) return `https://www.instagram.com/${customer.instagramHandle.replace(/^@/, "")}`;
    return "";
  };

  return (
    <div className="bg-[#faf9f6] min-h-screen pb-24">
      <div className="max-w-7xl mx-auto px-6 md:px-10 pt-8 pb-4">
        <nav className="flex items-center space-x-2 text-[10px] uppercase tracking-[2px] text-neutral-400 font-bold">
          <Link to="/" className="hover:text-black transition-colors">Home</Link>
          <ChevronRight size={12} className="text-neutral-300" />
          <span className="text-neutral-900 font-normal">Happy Customers</span>
        </nav>
      </div>

      <section className="max-w-7xl mx-auto px-6 md:px-10 pt-8 pb-14 text-center space-y-4">
        <span className="text-[10px] uppercase tracking-[4px] text-brand-rosegold font-bold block">
          Styled by Saiksha
        </span>
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif text-brand-ink">
          Happy <span className="text-brand-gradient font-serif tracking-normal italic">Customers</span>
        </h1>
        <div className="h-0.5 w-16 bg-brand-rosegold mx-auto mt-4" />
        <p className="text-neutral-500 font-light max-w-2xl mx-auto text-sm leading-relaxed pt-2">
          Real customer moments, styling details, and Saiksha pieces shared by people who made them part of their day.
        </p>
      </section>

      <section className="max-w-7xl mx-auto px-6 md:px-10">
        {isLoading ? (
          <div className="bg-white rounded-2xl border border-neutral-100 py-20 text-center text-xs uppercase tracking-widest text-neutral-400">
            Loading customer gallery...
          </div>
        ) : customers.length === 0 ? (
          <div className="bg-white rounded-2xl border border-neutral-100 py-20 text-center space-y-3">
            <Instagram size={42} className="mx-auto text-neutral-300" />
            <h2 className="font-serif text-xl text-neutral-900">Customer gallery coming soon</h2>
            <p className="text-sm text-neutral-500 font-light">New Saiksha styling moments will appear here.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {customers.map((customer) => {
              const instagramUrl = getInstagramUrl(customer);

              return (
                <article key={customer._id} className="bg-white rounded-2xl border border-neutral-100 overflow-hidden shadow-sm">
                  <button
                    type="button"
                    onClick={() => setSelectedCustomer(customer)}
                    className="group block w-full aspect-[4/5] bg-neutral-100 overflow-hidden cursor-pointer focus:outline-none focus:ring-2 focus:ring-brand-rosegold/60"
                    aria-label="View customer photo"
                  >
                    <img
                      src={customer.imageUrl}
                      alt={customer.description || "Happy Saiksha customer"}
                      className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                      loading="lazy"
                    />
                  </button>

                  <div className="p-5 space-y-4">
                    {customer.description && (
                      <p className="text-sm leading-relaxed text-neutral-600 font-light">
                        {customer.description}
                      </p>
                    )}
                    {instagramUrl && (
                      <a
                        href={instagramUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 text-[10px] uppercase tracking-[2px] font-bold text-brand-rosegold hover:text-brand-ink transition-colors"
                      >
                        <Instagram size={14} />
                        @{customer.instagramHandle?.replace(/^@/, "") || "Instagram"}
                        <ExternalLink size={12} />
                      </a>
                    )}
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>

      {selectedCustomer && (
        <div
          className="fixed inset-0 z-[120] bg-black/85 px-4 py-6 md:p-10 flex items-center justify-center"
          role="dialog"
          aria-modal="true"
          onClick={() => setSelectedCustomer(null)}
        >
          <div
            className="relative w-full max-w-5xl bg-white rounded-sm overflow-hidden shadow-2xl"
            onClick={(event) => event.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setSelectedCustomer(null)}
              className="absolute right-3 top-3 z-10 h-10 w-10 rounded-full bg-black/55 text-white border border-white/15 flex items-center justify-center hover:bg-white hover:text-brand-ink transition-colors cursor-pointer"
              aria-label="Close customer photo"
            >
              <X size={17} />
            </button>
            <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px]">
              <div className="bg-black flex items-center justify-center min-h-[360px] max-h-[82vh]">
                <img
                  src={selectedCustomer.imageUrl}
                  alt={selectedCustomer.description || "Happy Saiksha customer"}
                  className="max-h-[82vh] w-full object-contain"
                />
              </div>
              <aside className="p-6 md:p-8 space-y-5">
                <div>
                  <span className="text-[10px] uppercase tracking-[3px] text-brand-rosegold font-bold">Happy Customer</span>
                  <h2 className="mt-2 font-serif text-3xl text-brand-ink">Styled by Saiksha</h2>
                </div>
                {selectedCustomer.description && (
                  <p className="text-sm leading-relaxed text-neutral-600 font-light">
                    {selectedCustomer.description}
                  </p>
                )}
                {getInstagramUrl(selectedCustomer) && (
                  <a
                    href={getInstagramUrl(selectedCustomer)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 rounded-sm bg-brand-ink px-5 py-3 text-[10px] uppercase tracking-[2px] font-bold text-white hover:bg-brand-rosegold transition-colors"
                  >
                    <Instagram size={14} />
                    View Instagram
                    <ExternalLink size={12} />
                  </a>
                )}
              </aside>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
