"use client";
import { SessionProvider as NextAuthSessionProvider } from "next-auth/react";
import { ReactNode } from "react";

interface SessionProviderProps {
  children: ReactNode;
}

export default function SessionProvider({
  children,
}: Readonly<SessionProviderProps>) {
  return <NextAuthSessionProvider>{children}</NextAuthSessionProvider>;
}
