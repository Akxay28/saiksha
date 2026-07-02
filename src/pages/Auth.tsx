import React, { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { Mail, Lock, User, ArrowRight, Eye, EyeOff, Phone } from "lucide-react";
import { motion } from "motion/react";
import logoImg from "../assets/images/saiksha-logo-mark.png";
import { useCustomerAuth } from "../context/CustomerAuthContext";
import { useWishlist } from "../context/WishlistContext";
import { toast } from "sonner";

interface AuthProps {
  mode: "login" | "register";
}

export default function Auth({ mode }: AuthProps) {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { login, register } = useCustomerAuth();
  const { wishlist } = useWishlist();
  const [showPassword, setShowPassword] = useState(false);
  const [isForgotPassword, setIsForgotPassword] = useState(Boolean(searchParams.get("resetToken")));
  const [name, setName] = useState("");
  const [email, setEmail] = useState(searchParams.get("email") || "");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const resetToken = searchParams.get("resetToken") || "";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    const wishlistProductIds = wishlist.map((item) => item.id);
    let success = false;

    try {
      if (isForgotPassword && resetToken) {
        const response = await fetch("/api/customer/reset-password", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, token: resetToken, password })
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || "Could not reset password");
        toast.success("Password reset. Please log in.");
        navigate("/login");
        return;
      }

      if (isForgotPassword) {
        const response = await fetch("/api/customer/forgot-password", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email })
        });
        if (!response.ok) throw new Error("Could not send reset email");
        toast.success("If an account exists, a reset link has been sent.");
        setIsForgotPassword(false);
        return;
      }

      success = mode === "login"
        ? await login(email, password, wishlistProductIds)
        : await register({ name, email, phone, password, wishlistProductIds });

      if (success) navigate("/account");
    } catch (error: any) {
      toast.error(error.message || "Something went wrong.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex font-sans">
      <div className="hidden lg:block lg:w-1/2 relative bg-neutral-900">
        <img
          src={mode === "login"
            ? "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&q=80&w=1200"
            : "https://images.unsplash.com/photo-1611085583191-a3b1a308c021?auto=format&fit=crop&q=80&w=1200"
          }
          alt="Luxury Jewelry"
          referrerPolicy="no-referrer"
          className="absolute inset-0 w-full h-full object-cover opacity-60"
        />
        <div className="relative z-10 p-20 h-full flex flex-col justify-between text-white">
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="bg-white p-1 rounded-full border border-white/10 shadow shrink-0">
              <img src={logoImg} alt="Saiksha Logo" className="h-10 w-10 object-cover rounded-full" referrerPolicy="no-referrer" />
            </div>
            <span className="text-3xl font-serif font-bold tracking-wider text-white group-hover:text-brand-rosegold transition-colors">SAIKSHA</span>
          </Link>
          <div className="space-y-6">
            <h2 className="text-6xl font-serif font-bold leading-tight italic">
              {mode === "login" ? "Welcome back to elegance." : "Start your journey into luxury."}
            </h2>
            <p className="text-xl opacity-80 max-w-sm">Accounts are optional. Guest checkout remains the fastest way to buy.</p>
          </div>
          <div className="flex items-center space-x-6 text-sm uppercase tracking-widest font-bold">
            <Link to="/shipping" className="hover:text-brand-rosegold transition-colors">Shipping Info</Link>
            <Link to="/contact" className="hover:text-brand-rosegold transition-colors">Contact</Link>
          </div>
        </div>
      </div>

      <div className="w-full lg:w-1/2 bg-brand-cream flex items-center justify-center p-8 md:p-20 relative">
        <Link to="/" className="lg:hidden absolute top-8 left-8 flex items-center gap-2">
          <img src={logoImg} alt="Saiksha Logo" className="h-9 w-9 rounded-full object-cover" referrerPolicy="no-referrer" />
          <span className="text-xl font-serif font-bold text-neutral-900">SAIKSHA</span>
        </Link>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md space-y-10">
          <div className="space-y-4">
            <h1 className="text-4xl md:text-5xl font-serif font-bold text-neutral-900">
              {isForgotPassword ? (resetToken ? "Set New Password" : "Reset Password") : (mode === "login" ? "Welcome back" : "Create Account")}
            </h1>
            <p className="text-neutral-500">
              {isForgotPassword
                ? "Enter your email to continue with password recovery."
                : "Track orders, save your address, and keep your wishlist synced."}
            </p>
          </div>

          <form className="space-y-6" onSubmit={handleSubmit}>
            {!isForgotPassword && mode === "register" && (
              <>
                <AuthInput label="Full Name" value={name} onChange={setName} placeholder="Jane Doe" icon={<User size={18} />} />
                <AuthInput label="Mobile Number" value={phone} onChange={(value) => setPhone(value.replace(/\D/g, "").slice(0, 10))} placeholder="7383055032" icon={<Phone size={18} />} />
              </>
            )}

            <AuthInput label="Email Address" value={email} onChange={setEmail} placeholder="jane@example.com" type="email" icon={<Mail size={18} />} />

            {(!isForgotPassword || resetToken) && (
              <div className="space-y-2 relative">
                <AuthInput label="Password" value={password} onChange={setPassword} placeholder="8+ chars with letters and numbers" type={showPassword ? "text" : "password"} icon={<Lock size={18} />} />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-10 text-neutral-400 hover:text-neutral-600 transition-colors">
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            )}

            {mode === "login" && !isForgotPassword && (
              <div className="flex items-center justify-between">
                <span className="text-xs text-neutral-400">Guest checkout is still available.</span>
                <button type="button" onClick={() => setIsForgotPassword(true)} className="text-xs font-bold uppercase tracking-widest text-brand-rosegold hover:underline">
                  Forgot Password?
                </button>
              </div>
            )}

            <button disabled={isSubmitting} className="w-full bg-neutral-900 text-white py-5 rounded-md font-bold uppercase tracking-widest text-sm hover:bg-neutral-800 transition-all shadow-xl flex items-center justify-center space-x-3 group disabled:opacity-60">
              <span>{isSubmitting ? "Please wait..." : isForgotPassword ? (resetToken ? "Reset Password" : "Send Reset Link") : (mode === "login" ? "Login" : "Sign Up")}</span>
              <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
            </button>

            {isForgotPassword && (
              <button type="button" onClick={() => setIsForgotPassword(false)} className="w-full py-3 text-xs font-bold uppercase tracking-widest text-neutral-400 hover:text-neutral-900 transition-colors">
                Back to Login
              </button>
            )}
          </form>

          {!isForgotPassword && (
            <p className="text-center text-sm font-sans text-neutral-500">
              {mode === "login" ? "New to Saiksha?" : "Already have an account?"}
              <Link to={mode === "login" ? "/register" : "/login"} className="ml-2 font-bold text-neutral-900 hover:text-brand-rosegold transition-colors underline decoration-brand-rosegold decoration-2 underline-offset-4">
                {mode === "login" ? "Create Account" : "Login Instead"}
              </Link>
            </p>
          )}
        </motion.div>
      </div>
    </div>
  );
}

function AuthInput({ label, placeholder, type = "text", icon, value, onChange }: { label: string; placeholder: string; type?: string; icon: React.ReactNode; value: string; onChange: (value: string) => void }) {
  return (
    <div className="space-y-2">
      <label className="text-[10px] uppercase tracking-widest font-bold text-neutral-400">{label}</label>
      <div className="relative">
        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400">{icon}</div>
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full bg-white border border-brand-blush rounded-md pl-12 pr-4 py-4 text-sm focus:border-neutral-900 outline-none transition-colors font-medium shadow-sm hover:border-brand-rosegold/50"
        />
      </div>
    </div>
  );
}
