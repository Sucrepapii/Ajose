"use client";

import { LogOut } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

export function AdminLogoutButton() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const handleLogout = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/admin/logout", {
        method: "POST"
      });
      if (res.ok) {
        toast.success("Administrator session signed out");
        router.push("/login");
        router.refresh();
      } else {
        throw new Error("Failed to sign out");
      }
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
      className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-zinc-400 hover:text-red-400 hover:bg-red-500/10 transition-colors w-full text-left disabled:opacity-50 font-medium text-xs cursor-pointer border border-transparent hover:border-red-500/20"
    >
      {isLoading ? (
        <div className="h-4 w-4 border-2 border-red-400 border-t-transparent rounded-full animate-spin" />
      ) : (
        <LogOut className="h-4 w-4" />
      )}
      {isLoading ? "Signing out..." : "Sign Out of Backoffice"}
    </button>
  );
}
