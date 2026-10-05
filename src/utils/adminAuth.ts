import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";

export const ADMIN_SESSION_COOKIE = "ajose_admin_session";

export type AdminRole = "Super Admin" | "Operations Lead" | "Risk & Compliance" | "Support Auditor";

export interface AdminUser {
  id: string;
  fullName: string;
  email: string;
  role: AdminRole;
  status: "active" | "suspended";
  createdAt: string;
  isSuperAdmin: boolean;
  createdBy: string;
  temporaryPassword?: string;
  lastLogin?: string;
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
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (user && user.email) {
      const { data: profile } = await supabase
        .from("users")
        .select("*")
        .eq("id", user.id)
        .maybeSingle();

      const isSuper = Boolean(profile?.is_super_admin);
      const role = profile?.admin_role || (isSuper ? "Super Admin" : undefined);

      if (isSuper || role) {
        return {
          isAuthenticated: true,
          isSuperAdmin: isSuper,
          user: {
            id: user.id,
            email: user.email
          },
          profile: {
            first_name: profile?.first_name || user.email.split("@")[0],
            role: role || "Staff",
            is_super_admin: isSuper
          },
          role: role
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
