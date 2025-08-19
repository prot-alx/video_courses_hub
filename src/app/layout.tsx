import type { Metadata } from "next";
import "../styles/globals.css";
import SessionProvider from "@/components/auth/SessionProvider";

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
        <SessionProvider>{children}</SessionProvider>
      </body>
    </html>
  );
}
