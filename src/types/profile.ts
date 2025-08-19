// types/profile.ts
export type PreferredContact = "email" | "phone" | "telegram";

export interface ProfileData {
  name: string;
  email: string;
  phone: string;
  telegram: string;
  preferredContact: PreferredContact;
}

export interface User extends ProfileData {
  id: string;
  googleId: string;
  role: "USER" | "ADMIN";
  createdAt: string;
}
