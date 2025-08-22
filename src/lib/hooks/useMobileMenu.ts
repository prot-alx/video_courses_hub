import { useState } from "react";

interface UseMobileMenuReturn {
  isMobileMenuOpen: boolean;
  toggleMobileMenu: () => void;
  closeMobileMenu: () => void;
}

export function useMobileMenu(): UseMobileMenuReturn {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  return {
    isMobileMenuOpen,
    toggleMobileMenu,
    closeMobileMenu,
  };
}
