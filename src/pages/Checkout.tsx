import { useState } from "react";
import { Link } from "react-router-dom";
import { ChevronRight, ShieldCheck, Mail, Phone, MapPin, CreditCard, ArrowRight } from "lucide-react";
import { cn } from "../lib/utils";
import { useCart } from "../context/CartContext";
import { useProducts } from "../context/ProductContext";
import logoImg from "../assets/images/saiksha_logo_1780685763441.png";

export default function Checkout() {
  const { products } = useProducts();
  const [step, setStep] = useState(1); // 1: Shipping, 2: Payment, 3: Review
  const { cart, cartTotal } = useCart();

  // Draw items from live cart or use top signature products as fallback
  const checkoutItems = cart.length > 0
    ? cart
    : [
        { ...products[0], quantity: 1 },
        { ...products[1], quantity: 1 }
      ];

  const subTotal = cart.length > 0 
    ? cartTotal 
    : checkoutItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  return (
    <div className="min-h-screen bg-brand-sand/30 py-20 px-4">
      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-5 gap-16">
        
        {/* Checkout Form */}
        <div className="lg:col-span-3 space-y-12">
          {/* Logo & Header */}
          <div className="space-y-6">
            <Link to="/" className="flex items-center gap-3.5 group">
              <img 
                src={logoImg} 
                alt="Saiksha Logo" 
                className="h-10 w-10 md:h-12 md:w-12 object-contain"
                referrerPolicy="no-referrer"
              />
              <span className="text-2xl md:text-3xl font-serif font-bold tracking-wider text-neutral-900 group-hover:text-brand-rosegold transition-colors">SAIKSHA</span>
            </Link>
            <nav className="flex items-center space-x-3 text-[10px] uppercase tracking-widest font-bold">
               <span className={cn(step === 1 ? "text-neutral-900" : "text-neutral-400")}>Shipping</span>
               <ChevronRight size={12} className="text-neutral-300" />
               <span className={cn(step === 2 ? "text-neutral-900" : "text-neutral-400")}>Payment</span>
               <ChevronRight size={12} className="text-neutral-300" />
               <span className={cn(step === 3 ? "text-neutral-900" : "text-neutral-400")}>Review</span>
            </nav>
          </div>

          <form className="space-y-10" onSubmit={(e) => e.preventDefault()}>
            {/* Shipping Info */}
            <div className="space-y-6">
              <h2 className="text-2xl font-serif font-bold">Shipping Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input label="First Name" placeholder="Jane" />
                <Input label="Last Name" placeholder="Doe" />
                <div className="md:col-span-2">
                   <Input label="Email Address" placeholder="jane@example.com" type="email" />
                </div>
                <div className="md:col-span-2">
                   <Input label="Address" placeholder="123 Luxury Ave" />
                </div>
                <Input label="City" placeholder="New York" />
                <Input label="Postal Code" placeholder="10001" />
              </div>
            </div>

            {/* Shipping Methods */}
            <div className="space-y-6">
              <h2 className="text-2xl font-serif font-bold">Delivery Method</h2>
              <div className="space-y-4">
                <label className="flex items-center justify-between p-4 border-2 border-neutral-900 rounded-xl bg-white cursor-pointer ring-1 ring-neutral-900">
                  <div className="flex items-center space-x-4">
                    <div className="w-4 h-4 rounded-full border-4 border-neutral-900" />
                    <div>
                      <h4 className="font-bold text-sm">Express Shipping</h4>
                      <p className="text-xs text-neutral-500">Delivered within 2-3 business days</p>
                    </div>
                  </div>
                  <span className="font-bold text-sm">Free</span>
                </label>
                <label className="flex items-center justify-between p-4 border-2 border-brand-blush rounded-xl bg-white cursor-not-allowed opacity-50">
                  <div className="flex items-center space-x-4">
                    <div className="w-4 h-4 rounded-full border-2 border-brand-blush" />
                    <div>
                      <h4 className="font-bold text-sm">Next Day Delivery</h4>
                      <p className="text-xs text-neutral-500">Delivered by tomorrow</p>
                    </div>
                  </div>
                  <span className="font-bold text-sm">₹1,500</span>
                </label>
              </div>
            </div>

            <button 
              onClick={() => setStep(2)}
              className="w-full bg-neutral-900 text-white py-5 rounded-md font-bold uppercase tracking-widest text-sm hover:bg-neutral-800 transition-all shadow-xl flex items-center justify-center space-x-3"
            >
              <span>Continue to Payment</span>
              <ArrowRight size={18} />
            </button>
          </form>
        </div>

        {/* Sidebar Summary */}
        <aside className="lg:col-span-2 space-y-8">
           <div className="bg-white rounded-3xl p-8 border border-brand-blush shadow-sm space-y-8">
              <h3 className="text-xl font-serif font-bold">Order Summary</h3>
              
              <div className="space-y-6">
                {checkoutItems.map((item) => (
                  <div key={item.id + item.name} className="flex items-center space-x-4">
                    <div className="w-16 h-16 rounded-lg overflow-hidden border border-brand-blush shrink-0">
                      <img src={item.images[0]} alt={item.name} referrerPolicy="no-referrer" className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-grow">
                       <h4 className="text-sm font-bold text-neutral-800 truncate">{item.name}</h4>
                       <p className="text-xs text-neutral-400 uppercase tracking-widest">Standard • Qty {item.quantity}</p>
                    </div>
                    <span className="text-sm font-bold">₹{item.price.toLocaleString()}</span>
                  </div>
                ))}
              </div>

              <div className="pt-8 border-t border-brand-blush space-y-4">
                 <div className="flex justify-between text-sm">
                   <span className="text-neutral-500 uppercase tracking-widest font-bold text-[10px]">Subtotal</span>
                   <span className="font-bold">₹{subTotal.toLocaleString()}</span>
                 </div>
                 <div className="flex justify-between text-sm">
                   <span className="text-neutral-500 uppercase tracking-widest font-bold text-[10px]">Shipping</span>
                   <span className="text-brand-rosegold font-bold uppercase text-[10px]">Free</span>
                 </div>
                 <div className="flex justify-between text-xl font-bold font-serif pt-4">
                   <span>Total</span>
                   <span>₹{subTotal.toLocaleString()}</span>
                 </div>
              </div>

              <div className="bg-brand-sand p-4 rounded-xl flex items-center space-x-3">
                 <ShieldCheck size={20} className="text-brand-rosegold" />
                 <p className="text-[10px] uppercase tracking-widest font-bold text-neutral-600">Your connection is secure and your data is protected.</p>
              </div>
           </div>
        </aside>
      </div>
    </div>
  );
}

function Input({ label, placeholder, type = "text" }: { label: string, placeholder: string, type?: string }) {
  return (
    <div className="space-y-2">
      <label className="text-[10px] uppercase tracking-widest font-bold text-neutral-400">{label}</label>
      <input 
        type={type} 
        placeholder={placeholder}
        className="w-full bg-white border border-brand-blush rounded-md px-4 py-3 text-sm focus:border-neutral-900 outline-none transition-colors font-medium"
      />
    </div>
  );
}
