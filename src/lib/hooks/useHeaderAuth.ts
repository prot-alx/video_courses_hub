import { signIn, signOut } from "next-auth/react";
import { useAuth } from "@/lib/hooks/useAuth";

interface UseHeaderAuthReturn {
  user: {
    id: string;
    email: string;
    name: string | null;
    image: string | null;
    role: "USER" | "ADMIN";
  } | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isLoading: boolean;
  handleSignIn: () => Promise<void>;
  handleSignOut: () => Promise<void>;
}

export function useHeaderAuth(): UseHeaderAuthReturn {
  const { user, isAuthenticated, isAdmin, isLoading } = useAuth();

  const handleSignIn = async () => {
    await signIn("google", { callbackUrl: "/" });
  };

  const handleSignOut = async () => {
    await signOut({ callbackUrl: "/" });
  };

  return {
    user,
    isAuthenticated,
    isAdmin,
    isLoading,
    handleSignIn,
    handleSignOut,
  };
}
