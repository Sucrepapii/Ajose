"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { toast } from "sonner";
import Image from "next/image";

import { Eye, EyeOff, ArrowLeft } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const supabase = createClient();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      if (!formData.email || !formData.password) {
        throw new Error("Please enter your email and password.");
      }

      const { error } = await supabase.auth.signInWithPassword({
        email: formData.email,
        password: formData.password,
      });

      if (error) throw error;
      
      toast.success("Logged in successfully!");
      
      const urlParams = new URLSearchParams(window.location.search);
      const nextUrl = urlParams.get('next');
      
      if (nextUrl && nextUrl.startsWith('/')) {
        router.push(nextUrl);
      } else {
        router.push("/dashboard");
      }
      
      router.refresh();

    } catch (err: any) {
      toast.error(err.message || "Failed to log in.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-white font-sans">
      
      {/* Left Pane - Image & Branding */}
      <div className="hidden lg:flex w-1/2 relative bg-[#1A362D] items-center justify-center overflow-hidden">
        {/* Abstract Gold Lines Pattern (Simulated with CSS/SVG) */}
        <div className="absolute inset-0 opacity-20 pointer-events-none">
          <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
            <path d="M0 100 L500 600 L1000 100 M-100 300 L400 800 L1100 300" stroke="#D4AF37" strokeWidth="2" fill="none" />
            <path d="M200 -100 L700 400 L1200 -100" stroke="#D4AF37" strokeWidth="1" fill="none" />
          </svg>
        </div>

        {/* Use the exact image the user provided */}
        <Image src="/custom-login-bg.jpg" alt="Login Background" fill className="object-cover opacity-60 mix-blend-overlay" priority />
        <div className="absolute inset-0 bg-[#122b22]/40"></div>

        <div className="relative z-10 max-w-lg px-12">
          <Link href="/" className="inline-flex items-center gap-4 mb-16 group hover:opacity-90 transition-opacity">
            <Image 
              src="/ajose-rings-logo.png" 
              alt="Àjọṣe Logo" 
              width={64} 
              height={64} 
              className="object-contain w-auto h-16 drop-shadow-md animate-spin-slow"
            />
            <span className="text-white font-bold text-3xl font-serif tracking-tight">Àjọ<span className="text-[#C5A059]">ṣe</span></span>
          </Link>
          
          <h1 className="text-5xl font-bold text-white leading-[1.1] tracking-tight">
            Secure your financial future, together.
          </h1>
        </div>
      </div>

      {/* Right Pane - Form */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center px-8 sm:px-16 md:px-24 xl:px-32 relative">
        
        {/* Back button and Mobile Header */}
        <div className="absolute top-8 left-8 flex items-center gap-4 z-10">
          <Link href="/" className="hidden lg:flex items-center gap-2 text-[#1F2937]/50 hover:text-[#0B3022] transition-colors font-medium text-sm">
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </Link>

          <Link href="/" className="lg:hidden flex items-center gap-2 group hover:opacity-90 transition-opacity">
            <Image 
              src="/ajose-rings-logo.png" 
              alt="Àjọṣe Logo" 
              width={28} 
              height={28} 
              className="object-contain w-auto h-7 drop-shadow-sm animate-spin-slow"
            />
            <span className="text-[#0B3022] font-bold text-xl font-serif tracking-tight">Àjọ<span className="text-[#C5A059]">ṣe</span></span>
          </Link>
        </div>

        <div className="w-full max-w-[420px] mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
          <h2 className="text-3xl font-bold text-[#111827] mb-2">Welcome Back</h2>
          <p className="text-gray-500 mb-8">Please enter your details to sign in.</p>

          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Phone or Email</label>
              <input 
                name="email" 
                value={formData.email} 
                onChange={handleChange} 
                type="email" 
                placeholder="Enter your phone or email" 
                className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-[#D4AF37] focus:border-[#D4AF37] transition-colors"
                required
              />
            </div>
            
            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="block text-sm font-medium text-gray-700">Password</label>
                <Link href="#" className="text-sm font-medium text-[#D4AF37] hover:text-[#b8952b]">Forgot Password?</Link>
              </div>
              <div className="relative">
                <input 
                  name="password" 
                  value={formData.password} 
                  onChange={handleChange} 
                  type={showPassword ? "text" : "password"} 
                  placeholder="••••••••" 
                  className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-[#D4AF37] focus:border-[#D4AF37] transition-colors pr-10"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            <button 
              type="submit"
              disabled={isSubmitting}
              className="w-full mt-2 py-3.5 px-4 bg-[#1A362D] hover:bg-[#12261f] text-white font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#1A362D] disabled:opacity-70 flex justify-center items-center"
            >
              {isSubmitting ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                "Log In"
              )}
            </button>
          </form>

          <div className="mt-8 text-center text-sm text-gray-500">
            New to Àjọṣe? <Link href="/signup" className="text-[#1A362D] font-medium hover:underline">Create an account.</Link>
          </div>
        </div>
      </div>
      
    </div>
  );
}
