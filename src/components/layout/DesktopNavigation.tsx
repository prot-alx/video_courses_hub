import Link from "next/link";
import { usePathname } from "next/navigation";

const navigationItems = [
  { href: "/", label: "Главная" },
  { href: "/courses", label: "Курсы" },
  { href: "/news", label: "Новости" },
  { href: "/teachers", label: "Педагоги" },
  // { href: "/about", label: "О школе" },
  // { href: "/contacts", label: "Контакты" },
];

export default function DesktopNavigation() {
  const pathname = usePathname();

  return (
    <nav className="hidden md:flex items-center gap-6">
      {navigationItems.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className={`text-sm font-medium hover:opacity-80 transition-opacity ${
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
