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
