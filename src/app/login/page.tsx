"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { 
  PiggyBank, 
  ArrowRight,
  Mail,
  Lock
} from "lucide-react";
import { toast } from "sonner";

export default function LoginPage() {
  const router = useRouter();
  const supabase = createClient();
  const [isSubmitting, setIsSubmitting] = useState(false);

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
      
      router.refresh(); // Refresh to ensure layout gets updated session

    } catch (err: any) {
      toast.error(err.message || "Failed to log in.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 flex flex-col">
      {/* Header */}
      <header className="p-6 flex items-center justify-between">
        <Link className="flex items-center gap-2" href="/">
          <div className="bg-emerald-500 p-1.5 rounded-lg">
            <PiggyBank className="h-5 w-5 text-zinc-950" />
          </div>
          <span className="font-bold text-lg">AjoCore</span>
        </Link>
        <div className="text-sm text-zinc-400">
          Don't have an account? 
          <button 
            onClick={() => {
              const urlParams = new URLSearchParams(window.location.search);
              const nextUrl = urlParams.get('next');
              router.push(nextUrl ? `/signup?next=${encodeURIComponent(nextUrl)}` : "/signup");
            }} 
            className="text-emerald-400 hover:underline ml-1"
          >
            Sign up
          </button>
        </div>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center p-4">
        <div className="w-full max-w-md">
          
          {/* Form Container */}
          <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-6 md:p-8 backdrop-blur-sm shadow-xl relative overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500">
            
            <div className="text-center space-y-2 mb-8">
              <h1 className="text-2xl font-bold text-white">Welcome back</h1>
              <p className="text-zinc-400 text-sm">Log in to manage your Ajo savings.</p>
            </div>
            
            <form onSubmit={handleLogin} className="space-y-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-zinc-300">Email Address</label>
                  <div className="relative">
                    <input 
                      name="email" 
                      value={formData.email} 
                      onChange={handleChange} 
                      type="email" 
                      placeholder="you@example.com" 
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-lg pl-10 pr-4 py-3 text-zinc-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all" 
                    />
                    <Mail className="absolute left-3 top-3.5 h-5 w-5 text-zinc-500" />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium text-zinc-300">Password</label>
                    <Link href="#" className="text-xs text-emerald-400 hover:underline">Forgot password?</Link>
                  </div>
                  <div className="relative">
                    <input 
                      name="password" 
                      value={formData.password} 
                      onChange={handleChange} 
                      type="password" 
                      placeholder="••••••••" 
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-lg pl-10 pr-4 py-3 text-zinc-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all" 
                    />
                    <Lock className="absolute left-3 top-3.5 h-5 w-5 text-zinc-500" />
                  </div>
                </div>
              </div>

              <button 
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold py-3 px-4 rounded-lg flex items-center justify-center gap-2 transition-all shadow-[0_0_15px_rgba(16,185,129,0.2)] hover:shadow-[0_0_25px_rgba(16,185,129,0.4)] disabled:opacity-70"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-zinc-950 border-t-transparent rounded-full animate-spin"></div>
                    Logging in...
                  </>
                ) : (
                  <>
                    Log In
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
}
