import { createClient } from "@/utils/supabase/server";
import { getSuperAdminSession } from "@/utils/adminAuth";
import { createAdminClient } from "@/utils/supabase/admin";

/**
 * Ensures the request is authenticated by a normal user.
 * Returns the Supabase Auth user object if authenticated, throws or returns null otherwise.
 */
export async function requireUser() {
  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.getUser();

  if (error || !user) {
    throw new Error("Unauthorized. Please log in.");
  }

  return user;
}

/**
 * Ensures the request is authenticated by the admin of a specific group.
 * @param groupId The UUID of the group to verify ownership.
 */
export async function requireGroupAdmin(groupId: string) {
  const user = await requireUser();
  const supabaseAdmin = createAdminClient();

  const { data: group, error } = await supabaseAdmin
    .from("groups")
    .select("admin_id")
    .eq("id", groupId)
    .single();

  if (error || !group) {
    throw new Error("Group not found.");
  }

  if (group.admin_id !== user.id) {
    throw new Error("Forbidden. You must be the group organiser to perform this action.");
  }

  return { user, group };
}

/**
 * Ensures the request is authenticated by a staff member (Super Admin or any admin role).
 */
export async function requireStaff() {
  const session = await getSuperAdminSession();
  
  if (!session.isAuthenticated) {
    throw new Error("Forbidden. Staff access required.");
  }

  return session;
}

/**
 * Look up a Supabase Auth user record by email using the service role admin client.
 * Returns the Auth user object (including `updated_at`, `id`, `email`) if found.
 */
export async function getAuthUserByEmail(email: string) {
  try {
    const cleanEmail = email.trim().toLowerCase();
    const supabaseAdmin = createAdminClient();

    // 1. Try public.users table lookup (fastest indexed query)
    const { data: dbUser } = await supabaseAdmin
      .from("users")
      .select("id")
      .ilike("email", cleanEmail)
      .maybeSingle();

    if (dbUser?.id) {
      const { data: authData } = await supabaseAdmin.auth.admin.getUserById(dbUser.id);
      if (authData?.user) {
        return authData.user;
      }
    }

    // 2. Fallback: listUsers scan if not present in public.users
    const { data: usersData } = await supabaseAdmin.auth.admin.listUsers({
      perPage: 50,
    });
    const matched = usersData?.users?.find(
      (u) => u.email?.toLowerCase() === cleanEmail
    );
    return matched || null;
  } catch (err) {
    console.warn("getAuthUserByEmail lookup notice:", err);
    return null;
  }
}

export interface ExtractedUserProfile {
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  nickname: string;
}

/**
 * Robustly extracts the user's name, phone, and email across all auth providers
 * (Email/Password, Google OAuth, Apple OAuth, etc.).
 */
export function extractUserProfileFromAuthUser(user: any): ExtractedUserProfile {
  const meta = user?.user_metadata || {};
  
  const email = (user?.email || meta.email || "").trim().toLowerCase();

  const fullName = (meta.full_name || meta.name || "").trim();
  const nameParts = fullName ? fullName.split(/\s+/) : [];

  const firstName = (
    meta.first_name ||
    meta.firstName ||
    meta.given_name ||
    nameParts[0] ||
    ""
  ).trim();

  const lastName = (
    meta.last_name ||
    meta.lastName ||
    meta.family_name ||
    (nameParts.length > 1 ? nameParts.slice(1).join(" ") : "") ||
    ""
  ).trim();

  const phone = (
    meta.phone ||
    meta.phone_number ||
    user?.phone ||
    ""
  ).trim();

  const nickname = (
    meta.nickname ||
    meta.alias ||
    meta.preferred_username ||
    (firstName ? firstName : "")
  ).trim();

  return { firstName, lastName, phone, email, nickname };
}

/**
 * Ensures a user record exists in the public.users database table.
 * If the record is missing or has empty names/phone, it automatically populates
 * them using Auth metadata via the service-role admin client (bypassing RLS).
 */
export async function syncUserDatabaseProfile(user: any, additionalPayload?: Record<string, any>) {
  if (!user || !user.id) return null;

  try {
    const supabaseAdmin = createAdminClient();
    const { firstName, lastName, phone, email, nickname } = extractUserProfileFromAuthUser(user);

    // 1. Fetch existing profile from public.users
    const { data: existingUser } = await supabaseAdmin
      .from("users")
      .select("*")
      .eq("id", user.id)
      .maybeSingle();

    const mergedFirstName = additionalPayload?.first_name || existingUser?.first_name || firstName;
    const mergedLastName = additionalPayload?.last_name || existingUser?.last_name || lastName;
    const mergedPhone = additionalPayload?.phone || existingUser?.phone || phone;
    const mergedEmail = additionalPayload?.email || existingUser?.email || email;
    const mergedNickname = additionalPayload?.nickname || existingUser?.nickname || (mergedFirstName ? mergedFirstName : nickname);

    const payloadToUpsert = {
      id: user.id,
      email: mergedEmail,
      first_name: mergedFirstName,
      last_name: mergedLastName,
      phone: mergedPhone,
      nickname: mergedNickname,
      bvn_verified: Boolean(additionalPayload?.bvn_verified ?? existingUser?.bvn_verified ?? user.user_metadata?.bvn_verified),
      nin_verified: Boolean(additionalPayload?.nin_verified ?? existingUser?.nin_verified ?? user.user_metadata?.nin_verified),
      credit_score: additionalPayload?.credit_score ?? existingUser?.credit_score ?? (additionalPayload?.bvn_verified || existingUser?.bvn_verified ? 30 : 0),
      auto_sweep_enabled: Boolean(additionalPayload?.auto_sweep_enabled ?? existingUser?.auto_sweep_enabled ?? true),
      ...(additionalPayload || {})
    };

    const { data: updatedProfile, error: upsertErr } = await supabaseAdmin
      .from("users")
      .upsert(payloadToUpsert)
      .select("*")
      .single();

    if (upsertErr) {
      console.warn("syncUserDatabaseProfile upsert notice:", upsertErr.message);
      return existingUser || null;
    }

    return updatedProfile;
  } catch (err) {
    console.warn("syncUserDatabaseProfile error:", err);
    return null;
  }
}
