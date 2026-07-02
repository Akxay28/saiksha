import React, { useEffect, useState } from "react";
import { Link, Navigate } from "react-router-dom";
import { LogOut, Package, Heart, MapPin, Save, ShoppingBag } from "lucide-react";
import { useCustomerAuth } from "../context/CustomerAuthContext";
import { useWishlist } from "../context/WishlistContext";
import ProductCard from "../components/ui/ProductCard";

export default function Account() {
  const { customer, loadingCustomer, logout, updateProfile } = useCustomerAuth();
  const { wishlist } = useWishlist();
  const [orders, setOrders] = useState<any[]>([]);
  const [form, setForm] = useState({
    name: "",
    phone: "",
    savedAddress: {
      firstName: "",
      lastName: "",
      phone: "",
      secondaryPhone: "",
      address: "",
      city: "",
      postalCode: ""
    }
  });

  useEffect(() => {
    if (!customer) return;
    setForm({
      name: customer.name || "",
      phone: customer.phone || "",
      savedAddress: {
        firstName: customer.savedAddress?.firstName || "",
        lastName: customer.savedAddress?.lastName || "",
        phone: customer.savedAddress?.phone || customer.phone || "",
        secondaryPhone: customer.savedAddress?.secondaryPhone || "",
        address: customer.savedAddress?.address || "",
        city: customer.savedAddress?.city || "",
        postalCode: customer.savedAddress?.postalCode || ""
      }
    });
    fetch("/api/customer/orders", { credentials: "include" })
      .then((response) => response.ok ? response.json() : [])
      .then(setOrders)
      .catch(() => setOrders([]));
  }, [customer?.id]);

  if (loadingCustomer) {
    return <div className="min-h-[70vh] flex items-center justify-center text-sm text-neutral-400">Loading account...</div>;
  }

  if (!customer) {
    return <Navigate to="/login" replace />;
  }

  const saveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    updateProfile(form);
  };

  return (
    <div className="max-w-7xl mx-auto px-6 md:px-10 py-20 space-y-10">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-5">
        <div>
          <p className="text-[10px] uppercase tracking-[4px] text-brand-rosegold font-bold">Customer Account</p>
          <h1 className="mt-2 text-4xl md:text-5xl font-serif text-brand-ink">Welcome, {customer.name}</h1>
          <p className="mt-2 text-sm text-neutral-400">{customer.email}</p>
        </div>
        <button onClick={logout} className="inline-flex items-center gap-2 rounded-lg border border-neutral-200 px-4 py-3 text-[10px] uppercase tracking-widest font-bold text-neutral-500 hover:bg-neutral-50">
          <LogOut size={14} />
          Logout
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Stat icon={<Package size={18} />} label="Orders" value={orders.length} />
        <Stat icon={<Heart size={18} />} label="Wishlist" value={wishlist.length} />
        <Stat icon={<ShoppingBag size={18} />} label="Lifetime Spend" value={`Rs ${orders.reduce((sum, order) => sum + Number(order.total || 0), 0).toLocaleString()}`} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <section className="lg:col-span-7 bg-white rounded-2xl border border-neutral-100 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-neutral-100">
            <h2 className="font-serif text-xl text-brand-ink">My Orders</h2>
            <p className="text-[10px] text-neutral-400 mt-1">Track order status from your account.</p>
          </div>
          <div className="divide-y divide-neutral-100">
            {orders.map((order) => (
              <div key={order.orderId} className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <p className="font-bold text-sm text-neutral-900">{order.orderId}</p>
                  <p className="text-[10px] text-neutral-400 mt-1">{new Date(order.createdAt).toLocaleDateString()} • {order.items?.length || 0} items</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="rounded-full border border-brand-rosegold/20 bg-brand-cream/40 px-3 py-1 text-[9px] uppercase tracking-wider text-[#7a603c] font-bold">{order.status}</span>
                  <span className="font-serif text-brand-ink">Rs {Number(order.total || 0).toLocaleString()}</span>
                </div>
              </div>
            ))}
            {orders.length === 0 && (
              <div className="p-8 text-center">
                <p className="text-sm text-neutral-400">No orders yet.</p>
                <Link to="/collection" className="mt-4 inline-flex rounded-lg bg-brand-ink px-5 py-3 text-[10px] uppercase tracking-widest font-bold text-white">Start Shopping</Link>
              </div>
            )}
          </div>
        </section>

        <form onSubmit={saveProfile} className="lg:col-span-5 bg-white rounded-2xl border border-neutral-100 shadow-sm p-6 space-y-4">
          <div className="flex items-center gap-2">
            <MapPin size={18} className="text-brand-rosegold" />
            <h2 className="font-serif text-xl text-brand-ink">Saved Address</h2>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Input label="First name" value={form.savedAddress.firstName} onChange={(value) => setForm((p) => ({ ...p, savedAddress: { ...p.savedAddress, firstName: value } }))} />
            <Input label="Last name" value={form.savedAddress.lastName} onChange={(value) => setForm((p) => ({ ...p, savedAddress: { ...p.savedAddress, lastName: value } }))} />
          </div>
          <Input label="Account name" value={form.name} onChange={(value) => setForm((p) => ({ ...p, name: value }))} />
          <Input label="Phone" value={form.savedAddress.phone} onChange={(value) => setForm((p) => ({ ...p, phone: value, savedAddress: { ...p.savedAddress, phone: value.replace(/\D/g, "").slice(0, 10) } }))} />
          <Input label="Address" value={form.savedAddress.address} onChange={(value) => setForm((p) => ({ ...p, savedAddress: { ...p.savedAddress, address: value } }))} />
          <div className="grid grid-cols-2 gap-3">
            <Input label="City" value={form.savedAddress.city} onChange={(value) => setForm((p) => ({ ...p, savedAddress: { ...p.savedAddress, city: value } }))} />
            <Input label="PIN" value={form.savedAddress.postalCode} onChange={(value) => setForm((p) => ({ ...p, savedAddress: { ...p.savedAddress, postalCode: value.replace(/\D/g, "").slice(0, 6) } }))} />
          </div>
          <button className="w-full inline-flex items-center justify-center gap-2 rounded-lg bg-brand-ink py-3 text-[10px] uppercase tracking-widest font-bold text-white">
            <Save size={14} />
            Save Account
          </button>
        </form>
      </div>

      <section className="space-y-6">
        <div>
          <p className="text-[10px] uppercase tracking-[4px] text-brand-rosegold font-bold">Synced Wishlist</p>
          <h2 className="mt-2 text-3xl font-serif text-brand-ink">Saved Favorites</h2>
        </div>
        {wishlist.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {wishlist.map((product) => <ProductCard key={product.id} product={product} />)}
          </div>
        ) : (
          <div className="rounded-2xl border border-neutral-100 bg-white p-8 text-center text-sm text-neutral-400">
            Your wishlist is empty.
          </div>
        )}
      </section>
    </div>
  );
}

function Stat({ icon, label, value }: { icon: React.ReactNode; label: string; value: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-neutral-100 bg-white p-5 shadow-sm">
      <div className="text-brand-rosegold">{icon}</div>
      <p className="mt-3 text-[9px] uppercase tracking-[2px] text-neutral-400 font-bold">{label}</p>
      <p className="mt-2 text-2xl font-serif text-brand-ink">{value}</p>
    </div>
  );
}

function Input({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  return (
    <label className="block">
      <span className="text-[9px] uppercase tracking-widest text-neutral-400 font-bold">{label}</span>
      <input value={value} onChange={(e) => onChange(e.target.value)} className="mt-1 w-full rounded-lg border border-neutral-200 px-4 py-3 text-xs outline-none focus:border-brand-rosegold" />
    </label>
  );
}
