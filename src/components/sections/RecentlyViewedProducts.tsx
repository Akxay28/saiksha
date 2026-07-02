import { Link } from "react-router-dom";
import { Clock } from "lucide-react";
import { useProducts } from "../../context/ProductContext";
import ProductCard from "../ui/ProductCard";

export default function RecentlyViewedProducts() {
  const { products } = useProducts();
  const ids = typeof window !== "undefined"
    ? JSON.parse(localStorage.getItem("saiksha-recently-viewed") || "[]") as string[]
    : [];
  const viewedProducts = ids
    .map((id) => products.find((product) => product.id === id))
    .filter(Boolean)
    .slice(0, 4);

  if (viewedProducts.length === 0) return null;

  return (
    <section className="max-w-7xl mx-auto px-6 md:px-10 py-16 border-t border-black/5">
      <div className="flex items-end justify-between gap-6 mb-8">
        <div className="space-y-2">
          <span className="inline-flex items-center gap-2 text-[10px] uppercase tracking-[3px] text-brand-rosegold font-bold">
            <Clock size={13} />
            Recently Viewed
          </span>
          <h2 className="text-3xl font-serif text-brand-ink">Pieces you considered</h2>
        </div>
        <Link to="/collection" className="hidden sm:inline-flex text-[10px] uppercase tracking-[2px] font-bold text-neutral-400 hover:text-brand-ink">
          Continue browsing
        </Link>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-12">
        {viewedProducts.map((product: any) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </section>
  );
}
