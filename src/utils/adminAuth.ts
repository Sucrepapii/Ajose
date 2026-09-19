import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";
import { getAdminByEmail, AdminRole } from "@/utils/adminStore";

export const ADMIN_SESSION_COOKIE = "ajose_admin_session";

// Default admin emails or configure via ADMIN_EMAILS environment variable
const DEFAULT_SUPER_ADMINS = [
  "samuel@paylodeservices.com",
  "kemi@ajose.ng",
  "tunde@ajose.ng",
  "superadmin@ajose.ng",
  "operations@ajose.ng",
  "compliance@ajose.ng",
  "admin@test.com",
  "akinboroo@gmail.com",
  "s.akinboro@yahoo.com",
  "codepixelstech@gmail.com"
];

export function isSuperAdminEmail(email?: string | null): boolean {
  if (!email) return false;
  const normalizedEmail = email.toLowerCase().trim();

  // Any admin@, superadmin@ or official @ajose.ng email
  if (
    normalizedEmail.startsWith("admin@") || 
    normalizedEmail.startsWith("superadmin@") || 
    normalizedEmail.endsWith("@ajose.ng")
  ) {
    return true;
  }

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
  const cookieStore = await cookies();
  const adminCookie = cookieStore.get(ADMIN_SESSION_COOKIE)?.value;

  // 1. Check direct Admin Session Cookie
  if (adminCookie) {
    try {
      const sessionData = JSON.parse(
        Buffer.from(adminCookie, "base64").toString("utf-8")
      );

      if (sessionData && sessionData.email && (!sessionData.exp || sessionData.exp > Date.now())) {
        const admin = await getAdminByEmail(sessionData.email);
        const isSuper = Boolean(admin?.isSuperAdmin) || 
                        admin?.role === "Super Admin" || 
                        isSuperAdminEmail(sessionData.email) ||
                        Boolean(sessionData.isSuperAdmin);

        return {
          isAuthenticated: true,
          isSuperAdmin: isSuper,
          user: {
            id: admin?.id || sessionData.id || "admin-root",
            email: sessionData.email
          },
          profile: {
            first_name: admin?.fullName || sessionData.fullName || sessionData.email.split("@")[0],
            role: admin?.role || sessionData.role || "Super Admin",
            is_super_admin: isSuper
          },
          role: admin?.role || sessionData.role || "Super Admin"
        };
      }
    } catch (err) {
      console.warn("Failed to parse admin session cookie:", err);
    }
  }

  // 2. Check Supabase Auth User
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (user && user.email) {
      // Check if user is in admin store or has super admin privileges
      const adminInStore = await getAdminByEmail(user.email);
      
      const { data: profile } = await supabase
        .from("users")
        .select("*")
        .eq("id", user.id)
        .maybeSingle();

      const isSuper = isSuperAdminEmail(user.email) || 
                      Boolean(profile?.is_super_admin) || 
                      Boolean(user.user_metadata?.is_super_admin) ||
                      Boolean(adminInStore?.isSuperAdmin) ||
                      adminInStore?.role === "Super Admin";

      if (isSuper || adminInStore) {
        return {
          isAuthenticated: true,
          isSuperAdmin: isSuper || Boolean(adminInStore),
          user: {
            id: user.id,
            email: user.email
          },
          profile: {
            first_name: adminInStore?.fullName || profile?.first_name || user.email.split("@")[0],
            role: adminInStore?.role || (isSuper ? "Super Admin" : "Operations Lead"),
            is_super_admin: isSuper || Boolean(adminInStore)
          },
          role: adminInStore?.role || "Super Admin"
        };
      }
    }
  } catch (err) {
    console.warn("Supabase check error in getSuperAdminSession:", err);
  }

  return {
    isAuthenticated: false,
    isSuperAdmin: false,
    user: null,
    profile: null
  };
}
