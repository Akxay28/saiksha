import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Mail, Lock, User, Instagram, ArrowRight, Eye, EyeOff } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { cn } from "../lib/utils";
import logoImg from "../assets/images/saiksha_logo_1780685763441.png";

interface AuthProps {
  mode: "login" | "register";
}

export default function Auth({ mode }: AuthProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [isForgotPassword, setIsForgotPassword] = useState(false);

  return (
    <div className="min-h-screen flex font-sans">
      {/* Visual Side */}
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
              <img 
                src={logoImg} 
                alt="Saiksha Logo" 
                className="h-10 w-10 object-contain rounded-full"
                referrerPolicy="no-referrer"
              />
            </div>
            <span className="text-3xl font-serif font-bold tracking-wider text-white group-hover:text-brand-rosegold transition-colors">SAIKSHA</span>
          </Link>
          <div className="space-y-6">
            <h2 className="text-6xl font-serif font-bold leading-tight italic">
              {mode === "login" ? "Welcome back to elegance." : "Start your journey into luxury."}
            </h2>
            <p className="text-xl opacity-80 max-w-sm">Join our exclusive community of women who value premium craftsmanship.</p>
          </div>
          <div className="flex items-center space-x-6 text-sm uppercase tracking-widest font-bold">
            <Link to="/shipping" className="hover:text-brand-rosegold transition-colors">Shipping Info</Link>
            <Link to="/returns" className="hover:text-brand-rosegold transition-colors">Returns</Link>
            <Link to="/contact" className="hover:text-brand-rosegold transition-colors">Contact</Link>
          </div>
        </div>
      </div>

      {/* Form Side */}
      <div className="w-full lg:w-1/2 bg-brand-cream flex items-center justify-center p-8 md:p-20 relative">
        <Link to="/" className="lg:hidden absolute top-8 left-8 flex items-center gap-2">
          <img 
            src={logoImg} 
            alt="Saiksha Logo" 
            className="h-9 w-9 object-contain"
            referrerPolicy="no-referrer"
          />
          <span className="text-xl font-serif font-bold text-neutral-900">SAIKSHA</span>
        </Link>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md space-y-12"
        >
          <div className="space-y-4">
            <h1 className="text-4xl md:text-5xl font-serif font-bold text-neutral-900">
               {isForgotPassword ? "Reset Password" : (mode === "login" ? "Welcome back" : "Create Account")}
            </h1>
            <p className="text-neutral-500">
               {isForgotPassword 
                 ? "We'll send you an email to reset your luxury access." 
                 : (mode === "login" ? "Please enter your details to access your account." : "Be part of something exquisite.")}
            </p>
          </div>

          <form className="space-y-8" onSubmit={(e) => e.preventDefault()}>
            {!isForgotPassword && mode === "register" && (
              <AuthInput label="Full Name" placeholder="Jane Doe" icon={<User size={18} />} />
            )}
            
            <AuthInput label="Email Address" placeholder="jane@example.com" type="email" icon={<Mail size={18} />} />
            
            {!isForgotPassword && (
              <div className="space-y-2 relative">
                <AuthInput 
                  label="Password" 
                  placeholder="••••••••" 
                  type={showPassword ? "text" : "password"} 
                  icon={<Lock size={18} />} 
                />
                <button 
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-10 text-neutral-400 hover:text-neutral-600 transition-colors"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            )}

            {mode === "login" && !isForgotPassword && (
              <div className="flex items-center justify-between">
                <label className="flex items-center space-x-2 cursor-pointer group">
                  <input type="checkbox" className="w-4 h-4 rounded border-brand-blush accent-neutral-900" />
                  <span className="text-xs font-bold uppercase tracking-widest text-neutral-500 group-hover:text-neutral-900 transition-colors">Remember Me</span>
                </label>
                <button 
                  type="button"
                  onClick={() => setIsForgotPassword(true)}
                  className="text-xs font-bold uppercase tracking-widest text-brand-rosegold hover:underline"
                >
                  Forgot Password?
                </button>
              </div>
            )}

            <div className="space-y-4">
              <button className="w-full bg-neutral-900 text-white py-5 rounded-md font-bold uppercase tracking-widest text-sm hover:bg-neutral-800 transition-all shadow-xl flex items-center justify-center space-x-3 group">
                <span>{isForgotPassword ? "Send Reset Link" : (mode === "login" ? "Login" : "Sign Up")}</span>
                <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
              </button>
              
              {isForgotPassword && (
                <button 
                  type="button"
                  onClick={() => setIsForgotPassword(false)}
                  className="w-full py-4 text-xs font-bold uppercase tracking-widest text-neutral-400 hover:text-neutral-900 transition-colors"
                >
                  Back to Login
                </button>
              )}
            </div>
          </form>

          {!isForgotPassword && (
            <div className="space-y-8">
              <div className="relative">
                <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-brand-blush" /></div>
                <div className="relative flex justify-center text-xs uppercase tracking-widest font-bold"><span className="bg-brand-cream px-4 text-neutral-400">Or continue with</span></div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <SocialButton icon={<Instagram size={18} />} label="Instagram" />
                <SocialButton icon={<Mail size={18} />} label="Google" />
              </div>

              <p className="text-center text-sm font-sans text-neutral-500">
                {mode === "login" ? "New to Saiksha?" : "Already have an account?"}
                <Link 
                  to={mode === "login" ? "/register" : "/login"} 
                  className="ml-2 font-bold text-neutral-900 hover:text-brand-rosegold transition-colors underline decoration-brand-rosegold decoration-2 underline-offset-4"
                >
                  {mode === "login" ? "Create Account" : "Login Instead"}
                </Link>
              </p>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}

function AuthInput({ label, placeholder, type = "text", icon }: { label: string, placeholder: string, type?: string, icon: React.ReactNode }) {
  return (
    <div className="space-y-2">
      <label className="text-[10px] uppercase tracking-widest font-bold text-neutral-400">{label}</label>
      <div className="relative">
        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400">{icon}</div>
        <input 
          type={type} 
          placeholder={placeholder}
          className="w-full bg-white border border-brand-blush rounded-md pl-12 pr-4 py-4 text-sm focus:border-neutral-900 outline-none transition-colors font-medium shadow-sm hover:border-brand-rosegold/50"
        />
      </div>
    </div>
  );
}

function SocialButton({ icon, label }: { icon: React.ReactNode, label: string }) {
  return (
    <button className="flex items-center justify-center space-x-3 py-3 border border-brand-blush rounded-md hover:bg-brand-sand transition-colors">
      {icon}
      <span className="text-[10px] uppercase tracking-widest font-bold text-neutral-600">{label}</span>
    </button>
  );
}
