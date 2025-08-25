import Link from "next/link";
import { usePathname } from "next/navigation";

const navigationItems = [
  { href: "/", label: "🏠 Главная" },
  { href: "/courses", label: "📚 Курсы" },
  { href: "/news", label: "📰 Новости" },
  { href: "/about", label: "🏫 О школе" },
  { href: "/teachers", label: "👨‍🏫 Педагоги" },
  { href: "/contacts", label: "📞 Контакты" },
];

interface MobileNavigationProps {
  onMenuClose: () => void;
}

export default function MobileNavigation({
  onMenuClose,
}: Readonly<MobileNavigationProps>) {
  const pathname = usePathname();

  return (
    <nav className="flex flex-col gap-3 mt-4">
      {navigationItems.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          onClick={onMenuClose}
          className={`text-base font-medium hover:opacity-80 transition-opacity ${
            pathname === item.href ? "font-semibold" : ""
          }`}
          style={{
            color:
              pathname === item.href
                ? "var(--color-primary-400)"
                : "var(--color-text-primary)",
          }}
        >
          {item.label}
        </Link>
      ))}
    </nav>
  );
}
