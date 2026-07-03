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
      <div className="hidden lg:block lg:w-1/2 relative bg-neutral-950 overflow-hidden">
        <motion.div
          className="absolute inset-0 bg-[radial-gradient(circle_at_24%_18%,rgba(255,255,255,0.16),transparent_22%),radial-gradient(circle_at_74%_62%,rgba(214,112,148,0.28),transparent_24%),linear-gradient(135deg,#111_0%,#221317_48%,#0b0b0b_100%)]"
          animate={{ scale: [1, 1.08, 1], backgroundPosition: ["0% 0%", "100% 60%", "0% 0%"] }}
          transition={{ duration: 16, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute -left-1/3 top-0 h-full w-2/3 rotate-12 bg-gradient-to-r from-transparent via-white/14 to-transparent blur-sm"
          animate={{ x: ["-35%", "210%"] }}
          transition={{ duration: 6.5, repeat: Infinity, ease: "easeInOut", repeatDelay: 1.2 }}
        />
        <motion.div
          className="absolute inset-x-[-12%] top-[24%] h-px rotate-[-18deg] bg-gradient-to-r from-transparent via-white/35 to-transparent"
          animate={{ x: ["-8%", "8%", "-8%"], opacity: [0.25, 0.65, 0.25] }}
          transition={{ duration: 9, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute inset-x-[-12%] top-[34%] h-px rotate-[-18deg] bg-gradient-to-r from-transparent via-brand-rosegold/45 to-transparent"
          animate={{ x: ["7%", "-7%", "7%"], opacity: [0.2, 0.55, 0.2] }}
          transition={{ duration: 11, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute left-[12%] top-[18%] h-64 w-64 rounded-full border border-white/10"
          animate={{ scale: [1, 1.08, 1], rotate: [0, 8, 0] }}
          transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute left-[18%] top-[24%] h-40 w-40 rounded-full border border-brand-rosegold/20"
          animate={{ scale: [1.08, 1, 1.08], rotate: [0, -10, 0] }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute right-[12%] bottom-[18%] h-72 w-72 rounded-full border border-white/10"
          animate={{ scale: [1, 0.94, 1], rotate: [0, -6, 0] }}
          transition={{ duration: 13, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute right-[18%] bottom-[24%] h-44 w-44 rounded-full border border-brand-rosegold/25"
          animate={{ scale: [0.96, 1.06, 0.96], rotate: [0, 12, 0] }}
          transition={{ duration: 9, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute left-1/2 top-1/2 h-72 w-72 -translate-x-1/2 -translate-y-1/2 rounded-full bg-brand-rosegold/10 blur-3xl"
          animate={{ x: [-40, 35, -40], y: [20, -30, 20], opacity: [0.25, 0.45, 0.25] }}
          transition={{ duration: 14, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute left-[15%] bottom-[17%] h-3 w-3 rounded-full bg-white shadow-[0_0_22px_rgba(255,255,255,0.9)]"
          animate={{ y: [0, -70, 0], x: [0, 34, 0], opacity: [0.25, 1, 0.25], scale: [0.7, 1.25, 0.7] }}
          transition={{ duration: 5.8, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute right-[22%] top-[26%] h-2.5 w-2.5 rounded-full bg-brand-rosegold shadow-[0_0_24px_rgba(214,112,148,0.9)]"
          animate={{ y: [0, 82, 0], x: [0, -42, 0], opacity: [0.3, 1, 0.3], scale: [0.8, 1.4, 0.8] }}
          transition={{ duration: 6.4, repeat: Infinity, ease: "easeInOut", delay: 0.8 }}
        />
        <motion.div
          className="absolute left-[46%] top-[16%] h-2 w-2 rounded-full bg-white/90 shadow-[0_0_18px_rgba(255,255,255,0.8)]"
          animate={{ y: [0, 110, 0], opacity: [0.2, 0.9, 0.2], scale: [0.6, 1.2, 0.6] }}
          transition={{ duration: 7.2, repeat: Infinity, ease: "easeInOut", delay: 1.4 }}
        />
        <motion.div
          className="absolute right-[12%] top-[42%] h-36 w-36 rounded-full border border-brand-rosegold/35 border-t-white/70"
          animate={{ rotate: [0, 360], scale: [0.96, 1.08, 0.96], opacity: [0.35, 0.75, 0.35] }}
          transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
        />
        <div className="absolute inset-0 bg-black/35" />
        <div className="relative z-10 p-20 h-full flex flex-col justify-between text-white">
          <motion.div initial={{ opacity: 0, y: -14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="bg-white p-1 rounded-full border border-white/10 shadow shrink-0">
              <img src={logoImg} alt="Saiksha Logo" className="h-10 w-10 object-cover rounded-full" referrerPolicy="no-referrer" />
            </div>
            <span className="text-3xl font-serif font-bold tracking-wider text-white group-hover:text-brand-rosegold transition-colors">SAIKSHA</span>
          </Link>
          </motion.div>
          <motion.div
            className="space-y-6"
            initial={{ opacity: 0, y: 28 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.85, delay: 0.15 }}
          >
            <h2 className="text-6xl font-serif font-bold leading-tight italic">
              {mode === "login" ? "Welcome back to elegance." : "Start your journey into luxury."}
            </h2>
            <p className="text-xl opacity-80 max-w-sm">Accounts are optional. Guest checkout remains the fastest way to buy.</p>
          </motion.div>
          <motion.div
            className="flex items-center space-x-6 text-sm uppercase tracking-widest font-bold"
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.35 }}
          >
            <Link to="/shipping" className="hover:text-brand-rosegold transition-colors">Shipping Info</Link>
            <Link to="/contact" className="hover:text-brand-rosegold transition-colors">Contact</Link>
          </motion.div>
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
