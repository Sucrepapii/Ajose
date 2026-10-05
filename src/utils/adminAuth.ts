import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";
import { getAdminByEmail, AdminRole } from "@/utils/adminStore";

export const ADMIN_SESSION_COOKIE = "ajose_admin_session";

// Default admin emails or configure via ADMIN_EMAILS environment variable
const DEFAULT_SUPER_ADMINS = [
  "samuel@paylodeservices.com",
  "kemi@ajose.ng",
  "superadmin@ajose.ng",
  "operations@ajose.ng",
  "compliance@ajose.ng"
];

export function isSuperAdminEmail(email?: string | null): boolean {
  if (!email) return false;
  const normalizedEmail = email.toLowerCase().trim();

  const envAdmins = (process.env.ADMIN_EMAILS || "")
    .split(",")
    .map(e => e.trim().toLowerCase())
    .filter(Boolean);

  const allowedAdmins = [...DEFAULT_SUPER_ADMINS, ...envAdmins];

  return allowedAdmins.includes(normalizedEmail);
}

export interface AdminSession {
  isAuthenticated: boolean;
  isSuperAdmin: boolean;
  user: {
    id: string;
    email: string;
  } | null;
  profile: {
    first_name: string;
    role: string;
    is_super_admin?: boolean;
  } | null;
  role?: AdminRole | string;
}

export async function getSuperAdminSession(): Promise<AdminSession> {
  // Check Supabase Auth User directly (secure, signed, revocable)
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (user && user.email) {
      const { data: profile } = await supabase
        .from("users")
        .select("*")
        .eq("id", user.id)
        .maybeSingle();

      const isSuper = isSuperAdminEmail(user.email) || Boolean(profile?.is_super_admin);

      if (isSuper) {
        return {
          isAuthenticated: true,
          isSuperAdmin: isSuper,
          user: {
            id: user.id,
            email: user.email
          },
          profile: {
            first_name: profile?.first_name || user.email.split("@")[0],
            role: "Super Admin",
            is_super_admin: isSuper
          },
          role: "Super Admin"
        };
      }
    }
  } catch (err: any) {
    if (err?.digest === 'DYNAMIC_SERVER_USAGE') {
      throw err;
    }
    console.warn("Supabase check error in getSuperAdminSession:", err);
  }

  return {
    isAuthenticated: false,
    isSuperAdmin: false,
    user: null,
    profile: null
  };
}
