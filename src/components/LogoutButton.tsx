"use client";

import { LogOut } from "lucide-react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { useState } from "react";

import { toast } from "sonner";

export function LogoutButton() {
  const router = useRouter();
  const supabase = createClient();
  const [isLoading, setIsLoading] = useState(false);

  const handleLogout = async () => {
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      toast.success("Logged out successfully");
      router.push("/");
    } catch (err: any) {
      toast.error(err.message || "Failed to log out");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button 
      onClick={handleLogout}
      disabled={isLoading}
      className="flex items-center gap-3 px-4 py-3 rounded-xl text-white/60 hover:text-red-400 hover:bg-white/5 transition-colors w-full text-left disabled:opacity-50 font-medium"
    >
      {isLoading ? (
        <div className="h-5 w-5 border-2 border-red-400 border-t-transparent rounded-full animate-spin"></div>
      ) : (
        <LogOut className="h-5 w-5" />
      )}
      {isLoading ? "Logging out..." : "Log Out"}
    </button>
  );
}
