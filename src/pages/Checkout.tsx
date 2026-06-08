import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { 
  ChevronRight, 
  ShieldCheck, 
  Mail, 
  Phone, 
  MapPin, 
  CreditCard, 
  ArrowRight, 
  CheckCircle2, 
  Sparkles,
  Copy,
  Check
} from "lucide-react";
import { cn } from "../lib/utils";
import { useCart } from "../context/CartContext";
import { useProducts } from "../context/ProductContext";
import logoImg from "../assets/images/saiksha-logo-mark.png";
import { toast } from "sonner";

export default function Checkout() {
  const navigate = useNavigate();
  const { products } = useProducts();
  const { cart, cartTotal, clearCart } = useCart();
  const [step, setStep] = useState(1); // 1: Shipping, 2: Payment, 3: Review
  
  // Shipping Form State
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("6351357299");
  const [secondaryPhone, setSecondaryPhone] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [postalCode, setPostalCode] = useState("");

  // Payment State
  const [paymentMethod, setPaymentMethod] = useState<"cod" | "upi">("cod");
  const [copiedUpi, setCopiedUpi] = useState(false);

  // Submission State
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderId, setOrderId] = useState<string | null>(null);

  // Draw items from live cart or use top signature products as fallback (for preview/test safety)
  const checkoutItems = cart.length > 0
    ? cart
    : products.length >= 2 
      ? [
          { ...products[0], quantity: 1 },
          { ...products[1], quantity: 1 }
        ]
      : [];

  const subTotal = cart.length > 0 
    ? cartTotal 
    : checkoutItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  const discount = paymentMethod === "upi" ? Math.round(subTotal * 0.1) : 0;
  const shipping: number = paymentMethod === "cod" ? 40 : 0;
  const total = subTotal - discount + shipping;

  const handleCopyUpi = () => {
    navigator.clipboard.writeText("saiksha@upi");
    setCopiedUpi(true);
    toast.success("UPI ID copied to clipboard");
    setTimeout(() => setCopiedUpi(false), 2000);
  };

  const validateShippingForm = () => {
    if (!firstName.trim()) {
      toast.error("First Name is required");
      return false;
    }
    if (!lastName.trim()) {
      toast.error("Last Name is required");
      return false;
    }
    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      toast.error("A valid email address is required");
      return false;
    }
    if (!phone.trim() || phone.trim().length < 8) {
      toast.error("A valid primary phone number is required");
      return false;
    }
    if (!address.trim()) {
      toast.error("Shipping address is required");
      return false;
    }
    if (!city.trim()) {
      toast.error("City is required");
      return false;
    }
    if (!postalCode.trim() || postalCode.trim().length < 5) {
      toast.error("A valid postal code is required");
      return false;
    }
    return true;
  };

  const handleContinueToPayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateShippingForm()) {
      setStep(2);
    }
  };

  const handlePlaceOrder = async () => {
    setIsSubmitting(true);
    if (paymentMethod === "cod") {
      // 1. Cash on Delivery (COD) Flow
      try {
        const response = await fetch("/api/checkout", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            customer: {
              firstName,
              lastName,
              email,
              phone,
              secondaryPhone: secondaryPhone.trim() || undefined,
              address,
              city,
              postalCode
            },
            items: checkoutItems.map(item => ({
              id: item.id,
              name: item.name,
              price: item.price,
              quantity: item.quantity,
              image: item.images[0]
            })),
            subTotal,
            discount: 0,
            shipping,
            total,
            paymentMethod: "Cash on Delivery"
          })
        });

        const data = await response.json();
        if (response.ok && data.success) {
          setOrderId(data.orderId);
          clearCart();
          toast.success("Your luxury selection order has been placed successfully!");
        } else {
          toast.error(data.error || "Failed to place order. Please try again.");
        }
      } catch (err) {
        console.error("Error submitting COD order:", err);
        toast.error("Could not connect to the checkout API.");
      } finally {
        setIsSubmitting(false);
      }
    } else {
      // 2. Razorpay Online Payment Flow
      try {
        // Step A: Create order in backend
        const orderResponse = await fetch("/api/create-order", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            amount: total,
            receipt: `rcpt_${Date.now()}`
          })
        });

        const orderData = await orderResponse.json();
        if (!orderResponse.ok || !orderData.success) {
          throw new Error(orderData.error || "Failed to initialize payment order.");
        }

        // Step B: Configure Razorpay Options
        const options = {
          key: orderData.key_id,
          amount: orderData.order.amount,
          currency: orderData.order.currency,
          name: "Saiksha Jewelry",
          description: "Luxury Jewelry Purchase",
          image: logoImg,
          order_id: orderData.order.id,
          handler: async (paymentResult: any) => {
            // Step C: Verify payment on backend
            setIsSubmitting(true);
            try {
              const verifyResponse = await fetch("/api/verify-payment", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  razorpay_order_id: paymentResult.razorpay_order_id,
                  razorpay_payment_id: paymentResult.razorpay_payment_id,
                  razorpay_signature: paymentResult.razorpay_signature,
                  customer: {
                    firstName,
                    lastName,
                    email,
                    phone,
                    secondaryPhone: secondaryPhone.trim() || undefined,
                    address,
                    city,
                    postalCode
                  },
                  items: checkoutItems.map(item => ({
                    id: item.id,
                    name: item.name,
                    price: item.price,
                    quantity: item.quantity,
                    image: item.images[0]
                  })),
                  subTotal,
                  discount,
                  shipping,
                  total
                })
              });

              const verifyData = await verifyResponse.json();
              if (verifyResponse.ok && verifyData.success) {
                setOrderId(verifyData.orderId);
                clearCart();
                toast.success("Payment verified! Order placed successfully.");
              } else {
                toast.error(verifyData.error || "Payment verification failed.");
              }
            } catch (verifyErr) {
              console.error("Error verifying payment:", verifyErr);
              toast.error("Could not complete verification. Please contact support.");
            } finally {
              setIsSubmitting(false);
            }
          },
          prefill: {
            name: `${firstName} ${lastName}`,
            email: email,
            contact: phone
          },
          theme: {
            color: "#0a0a0a"
          },
          modal: {
            ondismiss: () => {
              setIsSubmitting(false);
              toast.info("Payment cancelled.");
            }
          }
        };

        const rzp = new (window as any).Razorpay(options);
        rzp.open();
      } catch (err: any) {
        console.error("Error initializing Razorpay:", err);
        toast.error(err.message || "Failed to initialize payment gateway.");
        setIsSubmitting(false);
      }
    }
  };

  // SUCCESS SCREEN RENDER
  if (orderId) {
    return (
      <div className="min-h-screen bg-brand-cream/40 flex items-center justify-center py-24 px-6 font-sans">
        <div className="bg-white max-w-xl w-full p-8 md:p-12 rounded-3xl border border-brand-blush shadow-2xl text-center space-y-8 relative overflow-hidden">
          {/* Top Gold Accent strip */}
          <div className="absolute top-0 inset-x-0 h-2 bg-gradient-to-r from-brand-rosegold via-[#ad854f] to-brand-rosegold" />
          
          <div className="relative inline-block">
            <div className="w-24 h-24 bg-green-50 rounded-full flex items-center justify-center mx-auto border border-green-100">
              <CheckCircle2 size={44} className="text-green-500" />
            </div>
            <div className="absolute -top-1 -right-1 text-brand-rosegold">
              <Sparkles size={20} className="animate-pulse" />
            </div>
          </div>

          <div className="space-y-3">
            <span className="text-[10px] uppercase tracking-[4px] text-brand-rosegold font-bold">Purchase Complete</span>
            <h1 className="text-3xl font-serif text-brand-ink font-bold leading-tight">Order Confirmed</h1>
            <p className="text-neutral-450 text-xs font-light max-w-sm mx-auto leading-relaxed">
              Thank you for choosing Saiksha. Your order request has been received silently by our sales artisans.
            </p>
          </div>

          <div className="bg-brand-sand/40 p-6 rounded-2xl border border-brand-blush/40 text-left space-y-4">
            <div className="flex justify-between items-center text-xs pb-3 border-b border-black/5">
              <span className="text-neutral-400 font-bold uppercase tracking-wider text-[9px]">Order ID</span>
              <span className="font-mono font-bold text-neutral-900">{orderId}</span>
            </div>
            
            <div className="flex justify-between items-center text-xs pb-3 border-b border-black/5">
              <span className="text-neutral-400 font-bold uppercase tracking-wider text-[9px]">Contact Phone</span>
              <span className="font-bold text-neutral-900">{phone}</span>
            </div>

            <div className="flex justify-between items-center text-xs">
              <span className="text-neutral-400 font-bold uppercase tracking-wider text-[9px]">Payment Status</span>
              <span className="font-bold uppercase text-brand-rosegold text-[9px] tracking-wider bg-brand-rosegold/10 px-2.5 py-1 rounded">
                {paymentMethod === "cod" ? "Pending COD" : "Pending UPI Verify"}
              </span>
            </div>
          </div>

          <div className="text-[11px] text-neutral-400 font-light leading-relaxed">
            {paymentMethod === "upi" ? (
              <p className="bg-[#bda88e]/10 text-[#7a603c] p-4 rounded-xl border border-[#bda88e]/20">
                ✨ **Action Required**: Please send your UPI transaction reference screenshot to our support desk on WhatsApp using the bubble button below to verify payment immediately.
              </p>
            ) : (
              <p>An artisan will contact you shortly via phone/SMS to confirm shipment scheduling details.</p>
            )}
          </div>

          <div className="flex flex-col sm:flex-row gap-4 pt-4">
            <Link 
              to="/collection" 
              className="flex-1 bg-brand-ink hover:bg-neutral-800 text-white py-4.5 rounded-xl text-[10px] uppercase tracking-[2px] font-bold shadow-md shadow-brand-ink/5 transition-all text-center"
            >
              Continue Shopping
            </Link>
            <a 
              href={`https://wa.me/916351357299?text=Hello%20Saiksha,%20I%20have%20placed%20order%20${orderId}.%20Please%20assist%20me.`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 bg-white hover:bg-neutral-50 text-brand-ink py-4.5 rounded-xl text-[10px] uppercase tracking-[2px] font-bold border border-black/5 shadow-sm transition-all text-center flex items-center justify-center space-x-2"
            >
              <span>Support Desk</span>
            </a>
          </div>
        </div>
      </div>
    );
  }

  // CHECKOUT SCREEN RENDER
  return (
    <div className="min-h-screen bg-brand-sand/20 py-20 px-4 md:px-8 font-sans">
      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16">
        
        {/* Checkout Forms (Col spans 7) */}
        <div className="lg:col-span-7 space-y-10">
          
          {/* Logo & Header */}
          <div className="space-y-6">
            <Link to="/" className="flex items-center gap-3 group">
              <img 
                src={logoImg} 
                alt="Saiksha Logo" 
                className="h-9 w-9 md:h-11 md:w-11 object-cover rounded-full ring-1 ring-brand-rosegold/20"
                referrerPolicy="no-referrer"
              />
              <span className="text-xl md:text-2xl font-serif font-bold tracking-wider text-neutral-900 group-hover:text-brand-rosegold transition-colors">SAIKSHA</span>
            </Link>
            
            {/* Step Navigation Indicator */}
            <nav className="flex items-center space-x-3 text-[9px] uppercase tracking-[2px] font-bold text-neutral-400">
               <span 
                 onClick={() => step > 1 && setStep(1)}
                 className={cn("transition-colors cursor-pointer", step === 1 ? "text-neutral-950 font-extrabold" : "hover:text-neutral-700")}
               >
                 Shipping
               </span>
               <ChevronRight size={10} className="text-neutral-300" />
               <span 
                 onClick={() => step > 2 && setStep(2)}
                 className={cn("transition-colors cursor-pointer", step === 2 ? "text-neutral-950 font-extrabold" : "hover:text-neutral-700")}
               >
                 Payment
               </span>
               <ChevronRight size={10} className="text-neutral-300" />
               <span className={cn(step === 3 ? "text-neutral-950 font-extrabold" : "")}>Review</span>
            </nav>
          </div>

          {/* STEP 1: SHIPPING INFORMATION */}
          {step === 1 && (
            <form onSubmit={handleContinueToPayment} className="space-y-8 bg-white p-6 md:p-8 rounded-3xl border border-black/5 shadow-xs">
              <div className="space-y-1">
                <h2 className="text-xl font-serif font-bold text-brand-ink">Delivery Information</h2>
                <p className="text-[10px] text-neutral-400">Enter your shipping details below to verify logistics availability.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input 
                  label="First Name *" 
                  placeholder="Aishwarya" 
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  required
                />
                <Input 
                  label="Last Name *" 
                  placeholder="R." 
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  required
                />
                
                <div className="md:col-span-2">
                  <Input 
                    label="Email Address *" 
                    placeholder="aishwarya@example.com" 
                    type="email" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>

                <Input 
                  label="Primary Mobile Number *" 
                  placeholder="e.g. +91 9876543210" 
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  required
                />

                <Input 
                  label="Secondary Mobile (Optional)" 
                  placeholder="e.g. +91 9998887776" 
                  type="tel"
                  value={secondaryPhone}
                  onChange={(e) => setSecondaryPhone(e.target.value)}
                />

                <div className="md:col-span-2">
                  <Input 
                    label="Delivery Address *" 
                    placeholder="Flat No, Wing, Building Name, Street Address *" 
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    required
                  />
                </div>
                
                <Input 
                  label="City / Town *" 
                  placeholder="Mumbai" 
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  required
                />
                
                <Input 
                  label="Postal Code / PIN *" 
                  placeholder="400001" 
                  value={postalCode}
                  onChange={(e) => setPostalCode(e.target.value)}
                  required
                />
              </div>

              <button 
                type="submit"
                className="w-full bg-brand-ink text-white py-4.5 rounded-xl font-bold uppercase tracking-widest text-[10px] hover:bg-neutral-800 transition-all shadow-md flex items-center justify-center space-x-2"
              >
                <span>Continue to Payment</span>
                <ArrowRight size={14} />
              </button>
            </form>
          )}

          {/* STEP 2: PAYMENT METHOD */}
          {step === 2 && (
            <div className="space-y-8 bg-white p-6 md:p-8 rounded-3xl border border-black/5 shadow-xs">
              <div className="space-y-1">
                <h2 className="text-xl font-serif font-bold text-brand-ink">Select Payment Method</h2>
                <p className="text-[10px] text-neutral-400">Choose how you would like to handle the purchase transaction.</p>
              </div>

              <div className="space-y-4">
                {/* Cash on Delivery option */}
                <label 
                  onClick={() => setPaymentMethod("cod")}
                  className={cn(
                    "flex items-center justify-between p-5 border-2 rounded-2xl bg-white cursor-pointer transition-all",
                    paymentMethod === "cod" 
                      ? "border-brand-ink ring-1 ring-brand-ink" 
                      : "border-neutral-100 hover:border-brand-rosegold/30"
                  )}
                >
                  <div className="flex items-center space-x-4">
                    <div className={cn(
                      "w-4 h-4 rounded-full border-4 flex items-center justify-center",
                      paymentMethod === "cod" ? "border-brand-ink" : "border-neutral-300"
                    )} />
                    <div>
                      <h4 className="font-bold text-xs text-neutral-800">Cash on Delivery (COD)</h4>
                      <p className="text-[10px] text-neutral-400 mt-0.5">Pay via Cash or UPI at your doorstep upon receipt.</p>
                    </div>
                  </div>
                  <span className="font-bold text-xs text-neutral-800">₹40</span>
                </label>

                {/* Online Payment option */}
                <label 
                  onClick={() => setPaymentMethod("upi")}
                  className={cn(
                    "flex items-center justify-between p-5 border-2 rounded-2xl bg-white cursor-pointer transition-all",
                    paymentMethod === "upi" 
                      ? "border-brand-ink ring-1 ring-brand-ink" 
                      : "border-neutral-100 hover:border-brand-rosegold/30"
                  )}
                >
                  <div className="flex items-center space-x-4">
                    <div className={cn(
                      "w-4 h-4 rounded-full border-4 flex items-center justify-center",
                      paymentMethod === "upi" ? "border-brand-ink" : "border-neutral-300"
                    )} />
                    <div>
                      <h4 className="font-bold text-xs text-neutral-800">Pay Online (UPI, Cards, Netbanking)</h4>
                      <p className="text-[10px] text-neutral-400 mt-0.5">Pay securely via Razorpay gateway.</p>
                    </div>
                  </div>
                  <span className="font-bold text-xs text-brand-rosegold bg-brand-rosegold/5 px-2 py-0.5 rounded uppercase tracking-wider text-[8px]">10% Off</span>
                </label>

                {/* Razorpay Online Payment Info */}
                {paymentMethod === "upi" && (
                  <div className="p-5 bg-brand-cream/30 rounded-2xl border border-brand-blush/40 space-y-2.5 animate-fadeIn text-xs">
                    <span className="text-[9px] uppercase tracking-wider text-brand-rosegold font-bold block">Secure Razorpay Gateway</span>
                    <p className="text-neutral-500 font-light leading-relaxed">
                      You can pay using **UPI (PhonePe, GPay, Paytm)**, **Credit/Debit Cards**, **Net Banking**, or **Wallets**. 
                    </p>
                    <p className="text-[10px] text-neutral-600 font-semibold flex items-center gap-1.5 pt-1">
                      ✨ A **10% discount** is applied to your order automatically.
                    </p>
                  </div>
                )}
              </div>

              <div className="flex gap-4">
                <button 
                  onClick={() => setStep(1)}
                  className="flex-1 bg-transparent hover:bg-neutral-50 text-neutral-500 hover:text-neutral-800 py-4.5 rounded-xl font-bold uppercase tracking-widest text-[10px] border border-black/5 transition-all"
                >
                  Back
                </button>
                <button 
                  onClick={() => setStep(3)}
                  className="flex-1 bg-brand-ink text-white py-4.5 rounded-xl font-bold uppercase tracking-widest text-[10px] hover:bg-neutral-800 transition-all shadow-md"
                >
                  Continue to Review
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: REVIEW & PLACE ORDER */}
          {step === 3 && (
            <div className="space-y-8 bg-white p-6 md:p-8 rounded-3xl border border-black/5 shadow-xs">
              <div className="space-y-1">
                <h2 className="text-xl font-serif font-bold text-brand-ink">Review Your Selection</h2>
                <p className="text-[10px] text-neutral-400">Verify all checkout information details before submitting.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs border-b border-black/5 pb-8">
                <div className="space-y-1.5">
                  <span className="text-[9px] uppercase tracking-wider text-neutral-400 font-bold">Delivery Address</span>
                  <p className="font-bold text-neutral-800">{firstName} {lastName}</p>
                  <p className="text-neutral-500 leading-relaxed font-light">
                    {address},<br />
                    {city} - {postalCode}
                  </p>
                </div>
                
                <div className="space-y-3">
                  <div className="space-y-1">
                    <span className="text-[9px] uppercase tracking-wider text-neutral-400 font-bold">Contact Details</span>
                    <p className="font-bold text-neutral-800 flex items-center gap-1.5">
                      <Mail size={12} className="text-neutral-400" /> {email}
                    </p>
                    <p className="font-bold text-neutral-800 flex items-center gap-1.5">
                      <Phone size={12} className="text-neutral-400" /> {phone} 
                      <span className="text-[8px] bg-neutral-100 text-neutral-500 font-normal px-1 rounded">Primary</span>
                    </p>
                    {secondaryPhone && (
                      <p className="font-bold text-neutral-800 flex items-center gap-1.5 ml-4.5">
                        {secondaryPhone} <span className="text-[8px] bg-neutral-100 text-neutral-500 font-normal px-1 rounded">Secondary</span>
                      </p>
                    )}
                  </div>

                  <div className="space-y-1">
                    <span className="text-[9px] uppercase tracking-wider text-neutral-400 font-bold">Payment Method</span>
                    <p className="font-bold text-brand-rosegold uppercase tracking-wide text-[10px]">
                      {paymentMethod === "cod" ? "Cash on Delivery" : "Direct UPI Transfer"}
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex gap-4 pt-4">
                <button 
                  onClick={() => setStep(2)}
                  className="flex-1 bg-transparent hover:bg-neutral-50 text-neutral-500 hover:text-neutral-800 py-4.5 rounded-xl font-bold uppercase tracking-widest text-[10px] border border-black/5 transition-all"
                >
                  Back
                </button>
                <button 
                  onClick={handlePlaceOrder}
                  disabled={isSubmitting}
                  className="flex-1 bg-brand-ink hover:bg-neutral-800 text-white py-4.5 rounded-xl font-bold uppercase tracking-widest text-[10px] shadow-xl flex items-center justify-center space-x-2 transition-all disabled:opacity-50"
                >
                  <span>{isSubmitting ? "Processing..." : "Place Order & Confirm"}</span>
                  {!isSubmitting && <ArrowRight size={14} />}
                </button>
              </div>
            </div>
          )}

        </div>

        {/* Sidebar Summary (Col spans 5) */}
        <aside className="lg:col-span-5 space-y-8">
           <div className="bg-white rounded-3xl p-6 md:p-8 border border-brand-blush shadow-sm space-y-8">
              <h3 className="text-lg font-serif font-bold text-brand-ink">Order Summary</h3>
              
              <div className="space-y-6">
                {checkoutItems.map((item) => (
                  <div key={item.id + item.name} className="flex items-center space-x-4">
                    <div className="w-14 h-16 rounded-lg overflow-hidden border border-brand-blush shrink-0 bg-brand-cream">
                      <img src={item.images[0]} alt={item.name} referrerPolicy="no-referrer" className="w-full h-full object-cover" />
                    </div>
                    {/* min-w-0 added to parent of truncate to resolve Flexbox overflow */}
                    <div className="flex-grow min-w-0">
                       <h4 className="text-xs font-bold text-neutral-800 leading-tight break-words">{item.name}</h4>
                       <p className="text-[10px] text-neutral-450 uppercase tracking-widest mt-1">Standard • Qty {item.quantity}</p>
                    </div>
                    <span className="text-xs font-bold shrink-0 text-neutral-900">₹{item.price.toLocaleString()}</span>
                  </div>
                ))}
              </div>

              <div className="pt-8 border-t border-brand-blush space-y-4">
                <div className="flex justify-between text-xs">
                  <span className="text-neutral-400 uppercase tracking-widest font-bold text-[9px]">Subtotal</span>
                  <span className="font-bold text-neutral-900">₹{subTotal.toLocaleString()}</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-xs animate-fadeIn">
                    <span className="text-neutral-400 uppercase tracking-widest font-bold text-[9px]">UPI Discount (10% Off)</span>
                    <span className="text-green-600 font-bold">-₹{discount.toLocaleString()}</span>
                  </div>
                )}
                <div className="flex justify-between text-xs">
                  <span className="text-neutral-400 uppercase tracking-widest font-bold text-[9px]">Shipping</span>
                  <span className="text-brand-rosegold font-bold uppercase text-[9px] tracking-wider">
                    {shipping === 0 ? "Free" : `₹${shipping.toLocaleString()}`}
                  </span>
                </div>
                <div className="flex justify-between text-lg font-bold font-serif pt-4 border-t border-black/5">
                  <span>Total</span>
                  <span>₹{total.toLocaleString()}</span>
                </div>
              </div>

              <div className="bg-brand-sand/30 p-4 rounded-xl flex items-center space-x-3 border border-brand-blush/30">
                 <ShieldCheck size={18} className="text-brand-rosegold shrink-0" />
                 <p className="text-[9px] uppercase tracking-widest font-bold text-neutral-500 leading-snug">Your connection is secure and your data is protected.</p>
              </div>
           </div>
        </aside>
      </div>
    </div>
  );
}

interface InputProps {
  label: string;
  placeholder?: string;
  type?: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  required?: boolean;
}

function Input({ label, placeholder, type = "text", value, onChange, required }: InputProps) {
  return (
    <div className="space-y-1.5 text-xs text-neutral-600">
      <label className="text-[9px] uppercase tracking-widest font-bold text-neutral-400">{label}</label>
      <input 
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        required={required}
        className="w-full bg-white border border-brand-blush rounded-xl px-4 py-3 text-xs focus:border-brand-ink outline-none transition-colors font-medium hover:border-brand-rosegold/50"
      />
    </div>
  );
}
