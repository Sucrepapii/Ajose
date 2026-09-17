import fs from "fs/promises";
import path from "path";

export type AdminRole = "Super Admin" | "Operations Lead" | "Risk & Compliance" | "Support Auditor";

export interface AdminUser {
  id: string;
  fullName: string;
  email: string;
  role: AdminRole;
  password?: string;
  passwordHash?: string;
  temporaryPassword?: string;
  requiresPasswordChange?: boolean;
  status: "active" | "suspended";
  createdAt: string;
  lastLogin?: string;
  createdBy?: string;
  isSuperAdmin: boolean;
}

const DATA_DIR = path.join(process.cwd(), "src", "data");
const ADMINS_FILE = path.join(DATA_DIR, "admins.json");

// Default initial seeded admins
const SEED_ADMINS: AdminUser[] = [
  {
    id: "admin-mu5lzg0j-7mn6",
    fullName: "Kemi Adeleke",
    email: "kemi@ajose.ng",
    role: "Super Admin",
    status: "active",
    createdAt: "2026-09-17T14:12:16.723Z",
    isSuperAdmin: true,
    createdBy: "System Seed",
    password: "KemiSecure2026!",
    requiresPasswordChange: false
  },
  {
    id: "admin-ops-02",
    fullName: "Operations Manager",
    email: "operations@ajose.ng",
    role: "Operations Lead",
    temporaryPassword: "AjoseOps2026!",
    requiresPasswordChange: true,
    status: "active",
    createdAt: "2026-08-10T09:30:00.000Z",
    isSuperAdmin: false,
    createdBy: "kemi@ajose.ng"
  },
  {
    id: "admin-risk-03",
    fullName: "Risk & Compliance Desk",
    email: "compliance@ajose.ng",
    role: "Risk & Compliance",
    temporaryPassword: "AjoseRisk2026!",
    requiresPasswordChange: true,
    status: "active",
    createdAt: "2026-08-15T14:15:00.000Z",
    isSuperAdmin: false,
    createdBy: "kemi@ajose.ng"
  }
];

// In-memory fallback in case filesystem is restricted
let memoryAdmins: AdminUser[] = [...SEED_ADMINS];

async function ensureDataFile(): Promise<void> {
  try {
    await fs.mkdir(DATA_DIR, { recursive: true });
    try {
      await fs.access(ADMINS_FILE);
    } catch {
      await fs.writeFile(ADMINS_FILE, JSON.stringify(SEED_ADMINS, null, 2), "utf-8");
    }
  } catch (err) {
    console.warn("Could not write admins.json file, using in-memory store:", err);
  }
}

export async function getAllAdmins(): Promise<AdminUser[]> {
  try {
    await ensureDataFile();
    const content = await fs.readFile(ADMINS_FILE, "utf-8");
    const parsed = JSON.parse(content);
    if (Array.isArray(parsed) && parsed.length > 0) {
      memoryAdmins = parsed;
      return parsed;
    }
  } catch (err) {
    console.warn("Failed to read admins.json, returning memory store:", err);
  }
  return memoryAdmins;
}

export async function getAdminByEmail(email: string): Promise<AdminUser | null> {
  if (!email) return null;
  const admins = await getAllAdmins();
  const normalized = email.trim().toLowerCase();
  return admins.find(a => a.email.toLowerCase() === normalized) || null;
}

export async function createAdminUser(params: {
  fullName: string;
  email: string;
  role: AdminRole;
  temporaryPassword?: string;
  createdBy?: string;
}): Promise<AdminUser> {
  const admins = await getAllAdmins();
  const normalizedEmail = params.email.trim().toLowerCase();

  const existing = admins.find(a => a.email.toLowerCase() === normalizedEmail);
  if (existing) {
    throw new Error(`An administrator with email "${params.email}" already exists.`);
  }

  const newAdmin: AdminUser = {
    id: `admin-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 6)}`,
    fullName: params.fullName.trim(),
    email: normalizedEmail,
    role: params.role,
    temporaryPassword: params.temporaryPassword || `Ajose${Math.floor(1000 + Math.random() * 9000)}!`,
    requiresPasswordChange: true, // Newly created staff MUST change password upon first sign-in
    status: "active",
    createdAt: new Date().toISOString(),
    isSuperAdmin: params.role === "Super Admin",
    createdBy: params.createdBy || "Super Admin"
  };

  const updatedList = [newAdmin, ...admins];
  memoryAdmins = updatedList;

  try {
    await ensureDataFile();
    await fs.writeFile(ADMINS_FILE, JSON.stringify(updatedList, null, 2), "utf-8");
  } catch (err) {
    console.warn("Could not persist new admin to admins.json, saved to memory:", err);
  }

  return newAdmin;
}

export async function updateAdminPassword(
  email: string,
  newPassword: string
): Promise<AdminUser> {
  if (!email || !newPassword) {
    throw new Error("Email and new password are required.");
  }
  if (newPassword.length < 8) {
    throw new Error("New password must be at least 8 characters long.");
  }

  const admins = await getAllAdmins();
  const normalized = email.trim().toLowerCase();
  const adminIndex = admins.findIndex(a => a.email.toLowerCase() === normalized);

  if (adminIndex === -1) {
    throw new Error(`Administrator with email "${email}" not found.`);
  }

  const updatedAdmin: AdminUser = {
    ...admins[adminIndex],
    password: newPassword.trim(),
    temporaryPassword: undefined, // Clear temporary password
    requiresPasswordChange: false, // Marked as changed to permanent
    lastLogin: new Date().toISOString()
  };

  admins[adminIndex] = updatedAdmin;
  memoryAdmins = [...admins];

  try {
    await ensureDataFile();
    await fs.writeFile(ADMINS_FILE, JSON.stringify(admins, null, 2), "utf-8");
  } catch (err) {
    console.warn("Could not persist updated password to admins.json:", err);
  }

  return updatedAdmin;
}

export async function deleteAdminUser(id: string): Promise<boolean> {
  const admins = await getAllAdmins();
  const adminToDelete = admins.find(a => a.id === id);

  if (!adminToDelete) return false;
  
  // Guard: Prevent deleting the last remaining Super Administrator
  const superAdmins = admins.filter(a => a.isSuperAdmin || a.role === "Super Admin");
  if (superAdmins.length <= 1 && (adminToDelete.isSuperAdmin || adminToDelete.role === "Super Admin")) {
    throw new Error("Cannot delete the last remaining Super Administrator.");
  }

  const updatedList = admins.filter(a => a.id !== id);
  memoryAdmins = updatedList;

  try {
    await ensureDataFile();
    await fs.writeFile(ADMINS_FILE, JSON.stringify(updatedList, null, 2), "utf-8");
  } catch (err) {
    console.warn("Could not persist delete to admins.json:", err);
  }

  return true;
}

export async function validateAdminCredentials(
  email: string, 
  password: string
): Promise<AdminUser | null> {
  if (!email || !password) return null;
  const admin = await getAdminByEmail(email);
  if (!admin) return null;
  if (admin.status !== "active") return null;

  const inputPassword = password.trim();

  // 1. Check permanent password if set
  if (admin.password && admin.password === inputPassword) {
    return admin;
  }

  // 2. Check temporary password
  if (admin.temporaryPassword && admin.temporaryPassword === inputPassword) {
    return admin;
  }

  return null;
}
