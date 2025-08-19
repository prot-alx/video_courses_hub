import type { Metadata } from "next";
import SessionProvider from "@/components/auth/SessionProvider";
import AdminContactButton from "@/components/layout/AdminContactButton";
import "../styles/globals.css";

export const metadata: Metadata = {
  title: "VideoCourses Platform",
  description: "Платформа видеокурсов",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru" className="h-full">
      <body
        className="antialiased scrollbar-thin flex flex-col min-h-screen"
        style={{
          background: "var(--color-primary-200)",
          color: "var(--color-text-primary)",
          fontFamily: "var(--font-display)",
        }}
      >
        <SessionProvider>
          {children}
          <AdminContactButton />
        </SessionProvider>
      </body>
    </html>
  );
}
