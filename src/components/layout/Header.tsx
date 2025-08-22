// components/layout/Header.tsx
"use client";
import { useHeaderAuth } from "@/lib/hooks/useHeaderAuth";
import { useMobileMenu } from "@/lib/hooks/useMobileMenu";
import LoadingHeader from "./LoadingHeader";
import Logo from "./Logo";
import DesktopNavigation from "./DesktopNavigation";
import MobileNavigation from "./MobileNavigation";
import AuthSection from "./AuthSection";
import MobileMenuButton from "./MobileMenuButton";

export default function Header() {
  const {
    user,
    isAuthenticated,
    isAdmin,
    isLoading,
    handleSignIn,
    handleSignOut,
  } = useHeaderAuth();
  const { isMobileMenuOpen, toggleMobileMenu, closeMobileMenu } =
    useMobileMenu();

  if (isLoading) {
    return <LoadingHeader />;
  }

  return (
    <header
      className="border-b px-6 py-4"
      style={{
        background: "var(--color-primary-300)",
        borderColor: "var(--color-primary-400)",
      }}
    >
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-8">
            <Logo />
            <DesktopNavigation />
          </div>

          <div className="flex items-center gap-4">
            <AuthSection
              user={user}
              isAuthenticated={isAuthenticated}
              isAdmin={isAdmin}
              onSignIn={handleSignIn}
              onSignOut={handleSignOut}
              variant="desktop"
            />

            <MobileMenuButton
              isOpen={isMobileMenuOpen}
              onToggle={toggleMobileMenu}
            />
          </div>
        </div>

        {isMobileMenuOpen && (
          <div
            className="md:hidden mt-4 pb-4 border-t"
            style={{ borderColor: "var(--color-primary-400)" }}
          >
            <MobileNavigation onMenuClose={closeMobileMenu} />

            <AuthSection
              user={user}
              isAuthenticated={isAuthenticated}
              isAdmin={isAdmin}
              onSignIn={handleSignIn}
              onSignOut={handleSignOut}
              variant="mobile"
              onMenuClose={closeMobileMenu}
            />
          </div>
        )}
      </div>
    </header>
  );
}
