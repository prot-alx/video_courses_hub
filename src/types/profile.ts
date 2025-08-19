// types/profile.ts
import { PreferredContact } from "./user";

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
