import { useEffect } from "react";
import { useSession } from "next-auth/react";
import { useUserStore } from "@/stores/user";

interface UseAuthReturn {
  user: {
    id: string;
    email: string;
    name: string | null;
    image: string | null;
    role: "USER" | "ADMIN";
  } | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  isAdmin: boolean;
  login: () => void;
  logout: () => void;
}

export function useAuth(): UseAuthReturn {
  const { data: session, status } = useSession();
  const {
    user,
    isLoading,
    isAuthenticated,
    isAdmin,
    setUser,
    setLoading,
    logout: logoutStore,
  } = useUserStore();

  // Sync session with store
  useEffect(() => {
    if (status === "loading") {
      setLoading(true);
      return;
    }

    if (session?.user) {
      const userData = {
        id: session.user.id!,
        email: session.user.email!,
        name: session.user.name || null,
        image: session.user.image || null,
        role: (session.user.role as "USER" | "ADMIN") || "USER",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      setUser(userData);
    } else {
      setUser(null);
    }
  }, [session, status, setUser, setLoading]);

  const login = () => {
    // Redirect to sign in page or trigger auth flow
    window.location.href = "/auth/signin";
  };

  const logout = async () => {
    logoutStore();
    // Trigger NextAuth signOut
    const { signOut } = await import("next-auth/react");
    await signOut({ redirect: true, callbackUrl: "/" });
  };

  return {
    user,
    isLoading: status === "loading" || isLoading,
    isAuthenticated,
    isAdmin: isAdmin(),
    login,
    logout,
  };
}
