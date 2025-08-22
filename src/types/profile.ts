// Deprecated: Use types from ./user.ts instead
// This file exists for backward compatibility only

import type { PreferredContact } from "./common";

/**
 * @deprecated Use UserProfile from ./user.ts instead
 */
export interface ProfileData {
  name: string;
  email: string;
  phone: string | null;
  telegram: string | null;
  preferredContact: PreferredContact;
}

/**
 * @deprecated Use User from ./user.ts instead
 */
export interface User extends ProfileData {
  id: string;
  googleId: string;
  role: "USER" | "ADMIN";
  createdAt: string;
}

// Re-export newer types for migration
export type { UserProfile, User as ModernUser } from "./user";
