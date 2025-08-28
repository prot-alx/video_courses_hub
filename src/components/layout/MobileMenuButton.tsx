interface MobileMenuButtonProps {
  isOpen: boolean;
  onToggle: () => void;
}

export default function MobileMenuButton({
  isOpen,
  onToggle,
}: Readonly<MobileMenuButtonProps>) {
  return (
    <button
      onClick={onToggle}
      className="block md:hidden p-2 rounded-md"
      style={{ color: "var(--color-text-primary)" }}
      aria-label="Открыть меню"
    >
      {isOpen ? (
        <span className="text-xl">✕</span>
      ) : (
        <span className="text-xl">☰</span>
      )}
    </button>
  );
}
