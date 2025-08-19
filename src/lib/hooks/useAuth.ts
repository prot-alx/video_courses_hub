// lib/hooks/useAuth.ts (обновленная версия с централизованными типами)
import { useSession } from "next-auth/react";

export function useAuth() {
  const { data: session, status } = useSession();

  return {
    user: session?.user,
    isLoading: status === "loading",
    isAuthenticated: status === "authenticated",
    isAdmin: session?.user?.role === "ADMIN",
    session,
  };
}
